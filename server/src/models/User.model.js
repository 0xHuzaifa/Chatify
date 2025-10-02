import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      lowercase: true,
      required: true,
      unique: true, // Enforces uniqueness; no need for separate index
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username must be less than 30 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Full name must be at least 2 characters long"],
      maxlength: [100, "Full name must be less than 100 characters"],
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Invalid email address",
      },
    },

    password: {
      type: String,
      required: true,
      select: false,
      minlength: [8, "Password must be at least 8 characters long"],
    },

    phoneSuffix: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      validate: {
        validator: function (value) {
          return !value || /^[0-9]{10}$/.test(value);
        },
        message: "Phone number must be exactly 10 digits",
      },
    },

    profilePicture: {
      type: String,
      default: null,
      validate: {
        validator: function (value) {
          return !value || /^https?:\/\/.+/.test(value);
        },
        message: "Profile picture must be a valid URL",
      },
    },

    bio: {
      type: String,
      default: null,
      maxlength: [500, "Bio must be less than 500 characters"],
      trim: true,
    },

    lastSeen: {
      type: Date,
      default: null,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
      select: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    userVerification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserVerification",
      select: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Define all indexes explicitly
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  }
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.pre("save", function (next) {
  if (this.isModified("fullName") && typeof this.fullName === "string") {
    this.fullName = this.fullName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  next();
});

userSchema.pre("validate", function (next) {
  if (!this.email && !this.phone) {
    return next(new Error("Either email or phone number must be provided."));
  }
  next();
});

userSchema.methods.generateAccessToken = function () {
  const accessToken = jwt.sign(
    { id: this._id, fullName: this.fullName, username: this.username },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY,
    }
  );
  return accessToken;
};

userSchema.methods.generateRefreshToken = function () {
  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY,
    }
  );

  return refreshToken;
};

const User = mongoose.model("User", userSchema);
export default User;
