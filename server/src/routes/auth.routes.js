import express from "express";
import {
  register,
  verifyUser,
  login,
  logout,
  resendVerification,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  getCurrentUser,
  getAllUsers,
} from "../controllers/auth.controller.js";
import authentication from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify", verifyUser);
router.post("/login", login);
router.post("/logout", logout);
router.post("/resend-verification", resendVerification);
router.post("/refresh-token", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/profile", updateProfile);
router.post("/change-password", changePassword);
router.get("/me", getCurrentUser);
router.get("/users", authentication, getAllUsers);

export default router;
