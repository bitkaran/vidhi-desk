const Expense = require("../models/Expense");
const ExpenseCategory = require("../models/ExpenseCategory");

// ==============================
// 🔹 EXPENSE CRUD & STATS
// ==============================
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({
      transactionDate: -1,
    });

    let total = 0,
      offline = 0,
      online = 0;
    const onlineModes = ["UPI", "Bank Transfer", "Online"];

    // We add a 'teamMemberFormatted' string so your frontend table doesn't break
    const formattedExpenses = expenses.map((exp) => {
      total += exp.amount;
      if (onlineModes.includes(exp.paymentMode)) online += exp.amount;
      else offline += exp.amount;

      return {
        ...exp.toObject(),
        teamMember:
          exp.teamMembers && exp.teamMembers.length > 0
            ? exp.teamMembers.join(", ")
            : "None",
      };
    });

    res.json({
      success: true,
      stats: { total, offline, online },
      data: formattedExpenses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!expense)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const {
      category,
      transactionDate,
      teamMembers,
      paymentMode,
      amount,
      summary,
    } = req.body;

    if (!category || !transactionDate || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields missing" });
    }

    // Safely parse the teamMembers array
    let parsedTeam = [];
    if (teamMembers) {
      parsedTeam = Array.isArray(teamMembers) ? teamMembers : [teamMembers];
    }

    const attachment = req.file
      ? `/uploads/documents/${req.file.filename}`
      : null;

    const expense = await Expense.create({
      user: req.user._id,
      category,
      transactionDate,
      teamMembers: parsedTeam, // 👈 Saved as Array
      paymentMode,
      amount: Number(amount),
      summary,
      attachment,
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    let expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!expense)
      return res.status(404).json({ success: false, message: "Not found" });

    // Safely parse the teamMembers array
    let parsedTeam = [];
    if (req.body.teamMembers) {
      parsedTeam = Array.isArray(req.body.teamMembers)
        ? req.body.teamMembers
        : [req.body.teamMembers];
    }

    const attachment = req.file
      ? `/uploads/documents/${req.file.filename}`
      : expense.attachment;

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        teamMembers: parsedTeam, // 👈 Updated as Array
        amount: Number(req.body.amount),
        attachment,
      },
      { new: true },
    );
    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!expense)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// 🔹 CATEGORIES CRUD
// ==============================
exports.getCategories = async (req, res) => {
  try {
    const categories = await ExpenseCategory.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    if (!req.body.name)
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    const category = await ExpenseCategory.create({
      user: req.user._id,
      name: req.body.name,
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await ExpenseCategory.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
