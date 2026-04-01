const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    note: { type: String, required: true },
  },
  { timestamps: true },
);

const timelineSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    hearing: { type: String, required: true },
    court: { type: String, required: true },
    judgeName: { type: String },
    attachedOrder: { type: String },
  },
  { timestamps: true },
);

// 🔹 NEW: Financial Schemas
const feeCollectionSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    mode: {
      type: String,
      required: true,
      enum: ["Cash", "UPI", "Bank Transfer", "Cheque", "Online"],
    },
    amount: { type: Number, required: true },
    remarks: { type: String },
    attachment: { type: String },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

const feeDueSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    amount: { type: Number, required: true },
    remark: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

const caseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    caseParty1: { type: String, required: true },
    caseParty2: { type: String, required: true },
    caseTitle: { type: String },
    court: { type: String },
    caseType: { type: String, required: true },
    stage: { type: String },
    cnr: { type: String },
    firNo: { type: String },
    policeStation: { type: String },
    fileNo: { type: String },
    caseAmount: { type: String }, // User enters "50000" or "₹ 50,000"
    note: { type: String },

    lawyers: [
      {
        lawyerId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "lawyers.model",
        },
        model: { type: String, enum: ["User", "Team"], required: true },
      },
    ],

    clients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Client" }],
    documents: [{ type: String }],
    notes: [noteSchema],
    timeline: [timelineSchema],

    // 🔹 NEW: Ledger Arrays
    feeCollections: [feeCollectionSchema],
    feeDues: [feeDueSchema],

    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

caseSchema.pre("save", function () {
  if (!this.caseTitle)
    this.caseTitle = `${this.caseParty1} VS ${this.caseParty2}`;
});

module.exports = mongoose.model("Case", caseSchema);
