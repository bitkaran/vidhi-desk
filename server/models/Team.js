// for-lawyers/server/models/Team.js
const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    // Link team member to the specific logged-in user (admin of the firm)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true }, // Mr., Mrs., Adv., etc.
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    designation: { type: String },
    bciRegistration: { type: String, unique: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Team", teamSchema);
