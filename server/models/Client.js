// for-lawyers/server/models/Client.js
const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    // Link client to the specific logged-in user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: { type: String, default: "Primary" },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Client", clientSchema);
