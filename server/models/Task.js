const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    // Link task to the logged-in admin user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectName: { type: String },
    title: { type: String, required: true },
    clientName: { type: String },
    dueDate: { type: Date },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "In Progress", "Completed"],
    },
    priority: {
      type: String,
      default: "Medium",
      enum: ["Low", "Medium", "High"],
    },
    // Polymorphic array to assign tasks to Main User or Team Members
    assignedTo: [
      {
        assigneeId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "assignedTo.model",
        },
        model: {
          type: String,
          enum: ["User", "Team"],
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);