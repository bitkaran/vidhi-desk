const User = require("../models/User");
const sendError = require("../utils/sendError");

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -otp -resetPasswordToken",
    );
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (req.body.fullName) user.fullName = req.body.fullName;
      if (req.body.phone !== undefined) user.phone = req.body.phone;
      if (req.body.specialization !== undefined)
        user.specialization = req.body.specialization;
      if (req.body.officeAddress !== undefined)
        user.officeAddress = req.body.officeAddress;
      if (req.body.bio !== undefined) user.bio = req.body.bio;

      // 🔹 Save Two-Factor Toggle
      if (req.body.twoFactorEnabled !== undefined) {
        user.twoFactorEnabled =
          req.body.twoFactorEnabled === "true" ||
          req.body.twoFactorEnabled === true;
      }

      if (req.body.preferences) {
        try {
          const parsedPrefs = JSON.parse(req.body.preferences);
          user.preferences = { ...user.preferences, ...parsedPrefs };
        } catch (e) {
          console.error("Pref parse error");
        }
      }

      if (req.file) {
        user.profilePicture = `/uploads/documents/${req.file.filename}`;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Account Deactivation
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.accountStatus = "Deactivated";
    await user.save();

    res.json({ success: true, message: "Account deactivated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Account Deletion
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Note: In a production app, you would also wipe out associated Cases, Leads, Events, etc. here.

    res.json({ success: true, message: "Account deleted permanently" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
