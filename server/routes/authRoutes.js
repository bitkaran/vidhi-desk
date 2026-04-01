// for-lawyers/server/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const {
  loginUser,
  registerUser,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 5,

  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes",
  },
});

router.post("/login", loginLimiter, loginUser);
router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/change-password", protect, changePassword);

module.exports = router;