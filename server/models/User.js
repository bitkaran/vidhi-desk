const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    bciRegNum: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    profilePicture: { type: String, default: "" },
    phone: { type: String, default: "" },
    role: { type: String, default: "Advocate" },
    specialization: { type: String, default: "" },
    experience: { type: Number, default: 0 },
    officeAddress: { type: String, default: "" },
    bio: { type: String, default: "" },
    
    // 🔹 Added Security Parameters
    twoFactorEnabled: { type: Boolean, default: false },
    accountStatus: { type: String, enum: ["Active", "Deactivated"], default: "Active" },
    
    preferences: {
      emailAlerts: { type: Boolean, default: true },
      caseUpdates: { type: Boolean, default: true },
      teamActivities: { type: Boolean, default: true },
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);