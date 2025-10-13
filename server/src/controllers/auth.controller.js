import jwt from "jsonwebtoken";

// Models
import User from "../models/User.model.js";
import UserVerification from "../models/UserVerification.model.js";

// Utils
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import generateTokens from "../utils/GenerateTokens.js";

// Services
import sendEmail from "../services/email.service.js";
import createMessage from "../services/twillo.service.js";

// Helpers
import generateCookieOptions from "../helpers/cookiesOption.helper.js";
import verificationEmailTemplate from "../helpers/template/verificationEmail.template.js";

const validateInput = (req) => {
  const errors = [];
  const { fullName, email, phone, countryCode, password } = req.body;

  if (!fullName || fullName.trim().length < 2) {
    errors.push("Full name must be at least 2 characters long");
  }

  if (!email && !phone) {
    errors.push("Either email or phone number is required");
  }

  // If phone is provided, countryCode is required
  if (phone && !countryCode) {
    errors.push("countryCode is required when phone is provided");
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid email format");
  }

  if (phone && !/^[0-9]{10}$/.test(phone)) {
    errors.push("Phone number must be exactly 10 digits");
  }

  if (countryCode && !/^\+?[0-9]{1,4}$/.test(countryCode)) {
    errors.push(
      "country code must be a valid country calling code (e.g. +1, +44, or 1)"
    );
  }

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  // Check password strength
  if (
    password &&
    !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
      password
    )
  ) {
    errors.push(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    );
  }

  return errors;
};

// Register user
export const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, countryCode, password } = req.body;

  // Validate input
  const validationErrors = validateInput(req);
  if (validationErrors.length > 0) {
    throw new ApiError(400, "Validation failed", validationErrors);
  }

  // Check if user already exists
  const phoneQuery = phone && countryCode ? { phone, countryCode } : null;

  const orQueries = [
    ...(email ? [{ email: email.toLowerCase() }] : []),
    ...(phoneQuery ? [phoneQuery] : []),
  ];

  const existingUser = await User.findOne({ $or: orQueries });

  if (existingUser) {
    throw new ApiError(409, "User with this email or phone already exists");
  }

  // Create user
  const user = new User({
    fullName,
    email: email?.toLowerCase(),
    phone,
    countryCode: countryCode || null,
    password,
  });

  await user.save();

  // Create verification record
  const userVerification = new UserVerification({
    userId: user._id,
  });

  let verificationMessage = "";

  if (email) {
    // Generate verification link for email (ensure we await generation and save)
    const verificationLink = await userVerification.generateVerificationLink();

    // Save verification record and attach to user
    await userVerification.save();
    user.userVerification = userVerification._id;
    await user.save();

    const url = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/verify?token=${verificationLink}&userId=${user._id}`;

    const emailContent = verificationEmailTemplate(user.fullName, url);
    const subject = "Verify your Chatify account";

    // Send verification email
    try {
      await sendEmail(email, subject, emailContent);
      verificationMessage = "Verification link sent to your email";
    } catch (error) {
      console.error("Email sending failed:", error);
      try {
        // Cleanup: delete user and verification record if email fails
        await UserVerification.findByIdAndDelete(userVerification._id);
        user.userVerification = undefined;
      } catch (cleanupError) {
        console.error("Cleanup failed:", cleanupError);
      }
      verificationMessage =
        "User registered but email sending failed. Please request verification again by logging in.";
    }
  } else {
    // Generate OTP for phone
    const otp = generateOTP();
    verificationData.OTP = otp;

    // include countryCode in verification data for SMS flows
    if (countryCode) verificationData.countryCode = countryCode;

    const userVerification = new UserVerification(verificationData);
    await userVerification.save();

    // Update user with verification reference
    user.userVerification = userVerification._id;
    await user.save();

    // Send OTP via SMS (include countryCode when sending)
    try {
      await createMessage(countryCode ? `${countryCode}${phone}` : phone, otp);
      verificationMessage = "OTP sent to your phone number";
    } catch (error) {
      console.error("SMS sending failed:", error);
      verificationMessage =
        "User registered but SMS sending failed. Please request verification again.";
    }
  }

  // Remove sensitive data from response
  const userResponse = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    countryCode: user.countryCode,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        `User registered successfully. ${verificationMessage}`,
        userResponse
      )
    );
});

// Verify user (email link or phone OTP)
export const verifyUser = asyncHandler(async (req, res) => {
  const { token, otp, userId } = req.body;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await User.findById(userId).populate("userVerification");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "User is already verified");
  }

  const verification = user.userVerification;
  if (!verification) {
    throw new ApiError(404, "Verification record not found");
  }

  let isValid = false;

  if (token && verification.link) {
    // Email verification
    await verification.verifyLink(token).then((valid) => {
      isValid = valid;
    });
  } else if (otp && verification.OTP) {
    // Phone verification
    await verification.verifyOTP(otp).then((valid) => {
      isValid = valid;
    });
  } else {
    throw new ApiError(400, "Invalid verification method");
  }

  if (!isValid) {
    throw new ApiError(400, "Invalid verification token/OTP");
  }

  // Update user as verified
  user.isVerified = true;
  await user.save();

  // Delete verification record
  await UserVerification.findByIdAndDelete(verification._id);

  res
    .status(200)
    .json(
      new ApiResponse(200, "User verified successfully", { isVerified: true })
    );
});

// Resend verification
export const resendVerification = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await User.findById(userId).populate("userVerification");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "User is already verified");
  }

  // Delete existing verification if any
  if (user.userVerification) {
    await UserVerification.findByIdAndDelete(user.userVerification._id);
  }

  // Create new verification
  const verificationData = {
    userId: user._id,
    Expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };

  let verificationMessage = "";

  if (user.email) {
    const verificationLink = generateVerificationLink();
    verificationData.link = verificationLink;

    const userVerification = new UserVerification(verificationData);
    await userVerification.save();

    user.userVerification = userVerification._id;
    await user.save();

    await sendVerificationEmail(user.email, verificationLink, user.fullName);
    verificationMessage = "New verification link sent to your email";
  } else {
    const otp = generateOTP();
    verificationData.OTP = otp;

    const userVerification = new UserVerification(verificationData);
    await userVerification.save();

    user.userVerification = userVerification._id;
    await user.save();

    await sendOTPSMS(user.phone, otp);
    verificationMessage = "New OTP sent to your phone number";
  }

  res.status(200).json(new ApiResponse(200, verificationMessage));
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or phone

  if (!identifier || !password) {
    throw new ApiError(400, "Email/phone and password are required");
  }

  // Find user by email or phone
  let user;
  // If identifier looks like a 10-digit phone, prefer phone lookup
  if (/^[0-9]{10}$/.test(identifier)) {
    user = await User.findOne({ phone: identifier }).select(
      "+password +refreshToken"
    );
  } else {
    user = await User.findOne({ email: identifier.toLowerCase() }).select(
      "+password +refreshToken"
    );
  }

  if (!user) {
    throw new ApiError(401, "Invalid email or phone");
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  // Check if user is verified (optional - you might want to allow unverified users to login)
  if (!user.isVerified) {
    let verificationMessage = "";

    // Create a new verification record for this user (or reuse existing one)
    // Remove any previous verification for this user to avoid duplicates
    await UserVerification.deleteMany({ userId: user._id });

    const verificationData = {
      userId: user._id,
    };

    // If the user has an email, send email verification
    if (user.email) {
      const userVerification = new UserVerification(verificationData);

      // generateVerificationLink is defined on the model instance and saves the hashed link
      const verificationLink =
        await userVerification.generateVerificationLink();

      // Attach verification record to user
      user.userVerification = userVerification._id;
      await user.save();

      const url = `${req.protocol}://${req.get(
        "host"
      )}/api/auth/verify?token=${verificationLink}&userId=${user._id}`;

      const emailContent = verificationEmailTemplate(user.fullName, url);
      const subject = "Verify your Chatify account";

      try {
        await sendEmail(user.email, subject, emailContent);
        verificationMessage = "Verification link sent to your email";
      } catch (error) {
        console.error("Email sending failed:", error);
        try {
          await UserVerification.findByIdAndDelete(userVerification._id);
          user.userVerification = undefined;
          await user.save();
        } catch (cleanupError) {
          console.error("Cleanup failed:", cleanupError);
        }
        verificationMessage =
          "Verification link could not be sent. Please request verification again.";
      }
    } else if (user.phone) {
      // Send OTP to phone
      const userVerification = new UserVerification(verificationData);
      const otp = await userVerification.generateOTP();

      // include countryCode if available
      if (user.countryCode) userVerification.countryCode = user.countryCode;
      await userVerification.save();

      user.userVerification = userVerification._id;
      await user.save();

      try {
        await createMessage(
          user.countryCode ? `${user.countryCode}${user.phone}` : user.phone,
          otp
        );
        verificationMessage = "OTP sent to your phone number";
      } catch (error) {
        console.error("SMS sending failed:", error);
        verificationMessage =
          "OTP could not be sent. Please request verification again.";
      }
    }

    return new ApiError("403", `User is not verified. ${verificationMessage}`);
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user._id);

  // Save refresh token to database
  user.refreshToken = refreshToken;
  user.isOnline = true;
  user.lastSeen = new Date();
  await user.save();

  // Remove sensitive data from response
  const userResponse = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    countryCode: user.countryCode,
    avatar: user.avatar,
    bio: user.bio,
    isVerified: user.isVerified,
    isOnline: user.isOnline,
    lastSeen: user.lastSeen,
  };

  const cookieOptions = generateCookieOptions();

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: userResponse,
        accessToken,
      })
    );
});

// Logout user
export const logout = asyncHandler(async (req, res) => {
  const user = req.user; // Assuming you have auth middleware that sets req.user

  if (!user) {
    throw new ApiError(401, "User not authenticated");
  }

  // Update user status
  await User.findByIdAndUpdate(
    user._id,
    {
      $unset: { refreshToken: 1 },
      isOnline: false,
      lastSeen: new Date(),
    },
    { new: true }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, "User logged out successfully"));
});

// Refresh access token
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token not found");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken.userId).select(
      "+refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    // Generate new tokens
    const accessToken = user.accessToken();
    const newRefreshToken = user.refreshToken();

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    const cookieOptions = generateCookieOptions();

    res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(200, "Access token refreshed successfully", {
          accessToken,
          refreshToken: newRefreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

// Forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { identifier } = req.body; // email or phone

  if (!identifier) {
    throw new ApiError(400, "Email or phone number is required");
  }

  // Find user
  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
  });

  if (!user) {
    // Don't reveal if user exists or not for security
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "If an account with this email/phone exists, you will receive reset instructions"
        )
      );
  }

  // Delete any existing verification records
  await UserVerification.deleteMany({ userId: user._id });

  // Create password reset verification
  const verificationData = {
    userId: user._id,
    Expiry: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
  };

  let resetMessage = "";

  if (user.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
    // Email reset
    const resetLink = generateVerificationLink();
    verificationData.link = resetLink;

    const userVerification = new UserVerification(verificationData);
    await userVerification.save();

    try {
      await sendPasswordResetEmail(user.email, resetLink, user.fullName);
      resetMessage = "Password reset link sent to your email";
    } catch (error) {
      console.error("Email sending failed:", error);
      throw new ApiError(500, "Failed to send reset email");
    }
  } else if (user.phone && /^[0-9]{10}$/.test(identifier)) {
    // Phone reset
    const otp = generateOTP();
    verificationData.OTP = otp;

    const userVerification = new UserVerification(verificationData);
    await userVerification.save();

    try {
      await sendOTPSMS(user.phone, otp);
      resetMessage = "Password reset OTP sent to your phone";
    } catch (error) {
      console.error("SMS sending failed:", error);
      throw new ApiError(500, "Failed to send reset OTP");
    }
  }

  res
    .status(200)
    .json(new ApiResponse(200, resetMessage, { userId: user._id }));
});

// Reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const { userId, newPassword, token, otp } = req.body;

  if (!userId || !newPassword) {
    throw new ApiError(400, "User ID and new password are required");
  }

  if (!token && !otp) {
    throw new ApiError(400, "Reset token or OTP is required");
  }

  // Validate password strength
  if (
    newPassword.length < 8 ||
    !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
      newPassword
    )
  ) {
    throw new ApiError(
      400,
      "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"
    );
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Find verification record
  const verification = await UserVerification.findOne({ userId });
  if (!verification) {
    throw new ApiError(400, "Invalid or expired reset token/OTP");
  }

  if (new Date() > verification.Expiry) {
    await UserVerification.findByIdAndDelete(verification._id);
    throw new ApiError(400, "Reset token/OTP has expired");
  }

  // Verify token or OTP
  let isValid = false;
  if (token && verification.link) {
    isValid = token === verification.link;
  } else if (otp && verification.OTP) {
    isValid = otp.toUpperCase() === verification.OTP;
  }

  if (!isValid) {
    throw new ApiError(400, "Invalid reset token/OTP");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Delete verification record
  await UserVerification.findByIdAndDelete(verification._id);

  // Invalidate all refresh tokens for security
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Password reset successfully. Please login with your new password."
      )
    );
});

// Update profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = req.user; // From auth middleware
  const { fullName, bio, email, phone, countryCode, avatar } = req.body;

  if (!user) {
    throw new ApiError(401, "User not authenticated");
  }

  const updates = {};

  if (fullName !== undefined) {
    if (fullName.trim().length < 2) {
      throw new ApiError(400, "Full name must be at least 2 characters long");
    }
    updates.fullName = fullName.trim();
  }

  if (bio !== undefined) {
    if (bio.length > 500) {
      throw new ApiError(400, "Bio must be less than 500 characters");
    }
    updates.bio = bio;
  }

  // Handle email update
  if (email !== undefined) {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(400, "Invalid email format");
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      });
      if (existingUser) {
        throw new ApiError(409, "Email is already taken");
      }
    }

    updates.email = email?.toLowerCase();

    // If email is being updated, unverify the user
    if (email && email.toLowerCase() !== user.email) {
      updates.isVerified = false;
    }
  }

  // Handle phone update
  if (phone !== undefined) {
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      throw new ApiError(400, "Phone number must be exactly 10 digits");
    }
    if (phone && !countryCode && !user.countryCode) {
      throw new ApiError(400, "countryCode is required when updating phone");
    }

    // Validate countryCode format if provided
    if (countryCode && !/^\+?[0-9]{1,4}$/.test(countryCode)) {
      throw new ApiError(
        400,
        "countryCode must be a valid country calling code (e.g. +1, +44, or 1)"
      );
    }

    // Check if phone with suffix is already taken by another user
    if (phone) {
      const searchCountryCode = countryCode || user.countryCode || null;
      const existingUser = await User.findOne({
        phone,
        countryCode: searchCountryCode,
        _id: { $ne: user._id },
      });
      if (existingUser) {
        throw new ApiError(409, "Phone number is already taken");
      }
    }

    updates.phone = phone;
    if (countryCode !== undefined) updates.countryCode = countryCode || null;

    // If phone or suffix is being updated, unverify the user
    if (
      (phone && phone !== user.phone) ||
      (countryCode !== undefined && countryCode !== user.countryCode)
    ) {
      updates.isVerified = false;
    }
  }

  // Check if at least one of email or phone will remain
  const finalEmail = updates.email !== undefined ? updates.email : user.email;
  const finalPhone = updates.phone !== undefined ? updates.phone : user.phone;
  const finalCountryCode =
    updates.countryCode !== undefined ? updates.countryCode : user.countryCode;

  if (!finalEmail && !finalPhone) {
    throw new ApiError(400, "At least one of email or phone must be provided");
  }

  const updatedUser = await User.findByIdAndUpdate(user._id, updates, {
    new: true,
    runValidators: true,
  });

  // Remove sensitive data from response
  const userResponse = {
    _id: updatedUser._id,
    fullName: updatedUser.fullName,
    email: updatedUser.email,
    phone: updatedUser.phone,
    countryCode: updatedUser.countryCode,
    avatar: updatedUser.avatar,
    bio: updatedUser.bio,
    isVerified: updatedUser.isVerified,
    isOnline: updatedUser.isOnline,
    lastSeen: updatedUser.lastSeen,
    updatedAt: updatedUser.updatedAt,
  };

  let message = "Profile updated successfully";
  if (
    (email && email.toLowerCase() !== user.email) ||
    (phone && phone !== user.phone)
  ) {
    message += ". Please verify your new email/phone number.";
  }

  res.status(200).json(new ApiResponse(200, message, userResponse));
});

// Change password (for authenticated users)
export const changePassword = asyncHandler(async (req, res) => {
  const user = req.user;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  // Get user with password
  const userWithPassword = await User.findById(user._id).select("+password");

  // Verify current password
  const isCurrentPasswordValid = await userWithPassword.comparePassword(
    currentPassword
  );
  if (!isCurrentPasswordValid) {
    throw new ApiError(400, "Current password is incorrect");
  }

  // Validate new password
  if (
    newPassword.length < 8 ||
    !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
      newPassword
    )
  ) {
    throw new ApiError(
      400,
      "New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"
    );
  }

  // Check if new password is different from current
  const isSamePassword = await userWithPassword.comparePassword(newPassword);
  if (isSamePassword) {
    throw new ApiError(
      400,
      "New password must be different from current password"
    );
  }

  // Update password
  userWithPassword.password = newPassword;
  await userWithPassword.save();

  // Invalidate all refresh tokens for security
  await User.findByIdAndUpdate(user._id, { $unset: { refreshToken: 1 } });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Password changed successfully. Please login again with your new password."
      )
    );
});

// Get current user profile
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not authenticated");
  }

  const userResponse = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    countryCode: user.countryCode,
    avatar: user.avatar,
    bio: user.bio,
    isVerified: user.isVerified,
    isOnline: user.isOnline,
    lastSeen: user.lastSeen,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  res
    .status(200)
    .json(
      new ApiResponse(200, "User profile retrieved successfully", userResponse)
    );
});

// Get all users
export const searchUsers = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;
  const search = req.query.search || " ";

  if (!loggedInUser) {
    throw new ApiError(401, "User not authenticated");
  }

  const searchQuery = search
    ? {
        $or: [
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find({
    _id: { $ne: loggedInUser._id },
    ...searchQuery,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "users retrieved successfully", users));
});
