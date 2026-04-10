// for-lawyers/server/controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const sendError = require("../utils/sendError");

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("Minimum 8 characters required");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("At least one uppercase letter required");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("At least one lowercase letter required");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("At least one number required");
  }

  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
    errors.push("At least one special character required");
  }

  return errors;
};

exports.registerUser = async (req, res) => {
  const { fullName, bciRegNum, email, password } = req.body;

  if (!fullName || !email || !password) {
    return sendError(res, 400, "All fields are required");
  }

  const lowerEmail = email.toLowerCase();

  try {
    const userExists = await User.findOne({ email: lowerEmail });
    if (userExists) {
      return sendError(res, 400, "User already exists");
    }

    const otp = generateOTP();

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return sendError(
        res,
        400,
        `Password must contain: ${passwordErrors.join(", ")}`,
      );
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const hashedOTP = await bcrypt.hash(otp, salt);

    const user = await User.create({
      fullName,
      bciRegNum,
      email: lowerEmail,
      password: hashedPassword,
      otp: hashedOTP,
      otpExpires: Date.now() + 10 * 60 * 1000,
      isVerified: false,
    });

    // console.log(`🔐 DEV OTP for ${lowerEmail}: ${otp}`);
www
    try {
      await sendEmail({
        email: user.email,
        subject: "Verify your Legality Account",
        otp: otp,
      });
    } catch (emailError) {
      console.error("Email sending failed", emailError);
    }

    if (user) {
      res.status(201).json({
        success: true,
        message: "OTP sent to email",
        email: user.email,
      });
    }
  } catch (error) {
    return sendError(res, 500, "Server error. Please try again.");
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Agar already verified hai
    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: "Account already verified. Please login.",
      });
    }

    // OTP expiry check
    if (user.otpExpires < Date.now()) {
      return sendError(res, 400, "OTP expired. Please resend.");
    }

    // OTP compare (hash compare)
    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return sendError(res, 400, "Invalid OTP");
    }

    // Account activate
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Login token generate kar rahe verification ke baad
    res.json({
      success: true,
      message: "Account verified successfully",
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        bciRegNum: user.bciRegNum,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Account already verified" });
    }

    const otp = generateOTP();

    const salt = await bcrypt.genSalt(10);
    user.otp = await bcrypt.hash(otp, salt);

    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // console.log(`🔐 RESEND DEV OTP for ${email}: ${otp}`);

    await sendEmail({
      email: user.email,
      subject: "Resend Verification Code",
      otp: otp,
    });

    res.json({ success: true, message: "New OTP sent to email" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide both email and password",
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    // Password compare
    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.isVerified) {
        return res.status(401).json({
          success: false,
          message: "Account not verified. Please verify your email.",
          isNotVerified: true,
          email: user.email,
        });
      }

      // Login success -> JWT token generate
      res.json({
        success: true,
        data: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          bciRegNum: user.bciRegNum,
        },
        token: generateToken(user._id),
      });
    } else {
      return sendError(res, 401, "Invalid email or password");
    }
  } catch (error) {
    return sendError(res, 500, "Server error. Please try again.");
  }
};

// Forgot password flow start
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Reset OTP generate
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const salt = await bcrypt.genSalt(10);
    user.resetPasswordToken = await bcrypt.hash(otp, salt);
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    // console.log(`🔐 RESET OTP for ${email}: ${otp}`);

    try {
      await sendEmail({
        email: user.email,
        subject: "Reset your Password - Legality",
        otp: otp,
      });
      res.json({ success: true, message: "Reset code sent to email" });
    } catch (err) {
      // Email fail hone par reset fields remove
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return sendError(res, 500, "Failed to send reset email. Try again.");
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset password logic
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordExpires: { $gt: Date.now() },
      // Expiry check
    });

    if (!user) {
      return sendError(res, 400, "Invalid or expired reset code");
    }

    // OTP compare
    const isMatch = await bcrypt.compare(otp, user.resetPasswordToken);
    if (!isMatch) {
      return sendError(res, 400, "Invalid reset code");
    }

    // Password validation
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return sendError(
        res,
        400,
        `Password must contain: ${passwordErrors.join(", ")}`,
      );
    }

    // New password hash
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Reset fields clear
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change password (login ke baad)
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // req.user middleware se aata hai (token verify hone ke baad)
    const user = await User.findById(req.user._id);

    // Current password verify
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return sendError(res, 401, "Incorrect current password");
    }

    // New password validation
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return sendError(
        res,
        400,
        `Password must contain: ${passwordErrors.join(", ")}`,
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
