import User from "../models/user.model.js";
import ApiError from "./ApiError.js";

const generateTokens = async (id) => {
  try {
    const user = await User.findById(id).select("+refreshToken");

    if (!user) {
      throw new ApiError(404, "User not found when generating tokens");
    }

    // Use model instance methods that return strings
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Persist refresh token; await save to ensure it's written before returning
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    // If it's already an ApiError, rethrow it
    if (error instanceof ApiError) throw error;

    // Attach original error message for easier debugging
    throw new ApiError(
      500,
      "something went wrong while generating tokens: " +
        (error?.message || String(error))
    );
  }
};

export default generateTokens;
