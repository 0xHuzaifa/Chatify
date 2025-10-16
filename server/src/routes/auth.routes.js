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
  searchUsers,
} from "../controllers/auth.controller.js";
import authentication from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify", verifyUser);
router.post("/login", login);
router.post("/resend-verification", resendVerification);
router.get("/refresh-token", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.use(authentication);
router.post("/logout", logout);
router.post("/change-password", changePassword);
router.put("/profile", updateProfile);
router.get("/me", getCurrentUser);
router.get("/users", searchUsers);

export default router;
