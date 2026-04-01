// for-lawyers/server/models/Lead.js
const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    // Link lead to the specific logged-in user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientName: { type: String, required: true },
    phone: { type: String, required: true },
    court: { type: String },
    caseType: { type: String },
    leadType: { type: String },
    status: {
      type: String,
      default: "Open",
      enum: ["Open", "File Received", "Declined"],
    },
    nextFollowUpDate: { type: Date },
    remarks: { type: String },

    // Embedded array for Follow-up History
    followUps: [
      {
        remark: { type: String, required: true },
        nextDate: { type: Date },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Lead", leadSchema);
