const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["Case", "Account", "Task", "Lead", "System"],
      default: "System",
    },
    isRead: { type: Boolean, default: false },
    link: { type: String }, // e.g., "/cases/details/123" to click and navigate
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
