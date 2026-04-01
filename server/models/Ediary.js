const mongoose = require("mongoose");

const ediarySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["Appointment", "Event"],
      default: "Appointment",
    },
    title: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String }, // HH:mm
    location: { type: String },
    description: { type: String },

    // 🔹 ADVANCED: Link event to a specific case
    relatedCase: { type: mongoose.Schema.Types.ObjectId, ref: "Case" },

    // 🔹 ADVANCED: Status tracking
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },

    // 🔹 UPDATED: Multi-select Team Members (Polymorphic)
    teamMembers: [
      {
        memberId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "teamMembers.model",
        },
        model: { type: String, enum: ["User", "Team"], required: true },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Ediary", ediarySchema);
