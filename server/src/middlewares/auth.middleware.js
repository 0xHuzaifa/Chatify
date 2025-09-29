import jwt from "jsonwebtoken";
import asyncHandler from "../utils/AsyncHandler.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

const authentication = asyncHandler(async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Access token not found");
    }

    // Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);

    // Get user from database
    const user = await User.findById(decodedToken.id);

    if (!user) {
      throw new ApiError(401, "Invalid access token - user not found");
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(498, "Invalid access token");
    } else if (error.name === "TokenExpiredError") {
      throw new ApiError(498, "Access token expired");
    }
    throw error;
  }
});

export default authentication;
