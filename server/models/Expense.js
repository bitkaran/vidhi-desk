const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    transactionDate: { type: String, required: true },

    teamMembers: [{ type: String }],

    paymentMode: { type: String, required: true },
    amount: { type: Number, required: true },
    summary: { type: String },
    attachment: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Expense", expenseSchema);
