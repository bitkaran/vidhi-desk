const Case = require("../models/Case");
const PDFDocument = require("pdfkit");
const Expense = require("../models/Expense");
const { success, error } = require("../utils/response");

// 🔹 Ultra-safe string-to-number parser
const extractNumber = (val) => {
  if (val === null || val === undefined || val === "") return 0;
  // Strip everything except numbers and decimals (handles "₹ 50,000" -> 50000)
  const numStr = String(val).replace(/[^0-9.-]+/g, "");
  const parsed = parseFloat(numStr);
  return isNaN(parsed) ? 0 : parsed;
};

// @desc    Get Global Stats and List of All Cases for Accounts
// @route   GET /api/accounts/cases
exports.getCaseAccounts = async (req, res) => {
  try {
    const cases = await Case.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    let globalTotal = 0;
    let globalCollected = 0;

    const formattedCases = cases.map((c) => {
      const baseFee = extractNumber(c.caseAmount);

      // Safely handle arrays in case they are undefined on older records
      const duesArray = Array.isArray(c.feeDues) ? c.feeDues : [];
      const collectionsArray = Array.isArray(c.feeCollections)
        ? c.feeCollections
        : [];

      const extraDues = duesArray.reduce(
        (acc, curr) => acc + (Number(curr.amount) || 0),
        0,
      );
      const collected = collectionsArray.reduce(
        (acc, curr) => acc + (Number(curr.amount) || 0),
        0,
      );

      const totalCommitted = baseFee + extraDues;
      const due = totalCommitted - collected;

      globalTotal += totalCommitted;
      globalCollected += collected;

      return {
        _id: c._id,
        caseTitle: c.caseTitle,
        totalCommitted,
        collected,
        due,
      };
    });

    const globalDue = globalTotal - globalCollected;

    res.json({
      success: true,
      stats: { total: globalTotal, collected: globalCollected, due: globalDue },
      cases: formattedCases,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    
  }
};

// @desc    Get Specific Case Account Details
// @route   GET /api/accounts/cases/:id
exports.getCaseAccountById = async (req, res) => {
  try {
    const singleCase = await Case.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("feeCollections.receivedBy", "fullName")
      .populate("feeDues.updatedBy", "fullName");

    if (!singleCase)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });

    const baseFee = extractNumber(singleCase.caseAmount);

    const duesArray = Array.isArray(singleCase.feeDues)
      ? singleCase.feeDues
      : [];
    const collectionsArray = Array.isArray(singleCase.feeCollections)
      ? singleCase.feeCollections
      : [];

    const extraDues = duesArray.reduce(
      (acc, curr) => acc + (Number(curr.amount) || 0),
      0,
    );
    const collected = collectionsArray.reduce(
      (acc, curr) => acc + (Number(curr.amount) || 0),
      0,
    );

    const totalCommitted = baseFee + extraDues;
    const due = totalCommitted - collected;

    res.json({
      success: true,
      data: singleCase,
      financials: { baseFee, extraDues, totalCommitted, collected, due },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add Fee Collection
// @route   POST /api/accounts/cases/:id/collections
exports.addFeeCollection = async (req, res) => {
  try {
    const { date, mode, amount, remarks } = req.body;
    if (!date || !mode || !amount)
      return res
        .status(400)
        .json({ success: false, message: "Date, Mode, and Amount required" });

    const singleCase = await Case.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!singleCase)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });

    const attachment = req.file
      ? `/uploads/documents/${req.file.filename}`
      : null;

    singleCase.feeCollections.push({
      date,
      mode,
      amount: Number(amount),
      remarks,
      attachment,
      receivedBy: req.user._id,
    });
    singleCase.feeCollections.sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
    await singleCase.save();

    return success(res, {}, "Fee collected successfully", 201);
  } catch (error) {
    return error(res, error.message);
  }
};

// @desc    Add Due / Extra Fee
// @route   POST /api/accounts/cases/:id/dues
exports.addFeeDue = async (req, res) => {
  try {
    const { date, amount, remark } = req.body;
    if (!date || !amount) return error(res, "Date and Amount required", 400);

    const singleCase = await Case.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!singleCase) {
      return error(res, "Case not found", 404);
    }

    singleCase.feeDues.push({
      date,
      amount: Number(amount),
      remark,
      updatedBy: req.user._id,
    });
    singleCase.feeDues.sort((a, b) => new Date(b.date) - new Date(a.date));
    await singleCase.save();

    res.status(201).json({ success: true, message: "Due added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Collection
// @route   DELETE /api/accounts/cases/:id/collections/:colId
exports.deleteFeeCollection = async (req, res) => {
  try {
    const singleCase = await Case.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!singleCase)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });
    singleCase.feeCollections.pull({ _id: req.params.colId });
    await singleCase.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate Secure PDF Receipt
// @route   GET /api/accounts/cases/:id/collections/:colId/receipt
// @access  Private
exports.generateReceipt = async (req, res) => {
  try {
    const singleCase = await Case.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("clients", "name phone email");

    if (!singleCase)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });

    const collection = singleCase.feeCollections.id(req.params.colId);
    if (!collection)
      return res
        .status(404)
        .json({ success: false, message: "Collection not found" });

    // 🔹 SECURITY: Generate Unique Receipt Number
    const year = new Date(collection.date).getFullYear();
    const shortId = collection._id.toString().slice(-6).toUpperCase();
    const receiptNo = `RCPT/${year}/${shortId}`;

    // 🔹 Setup PDF Document
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // Stream directly to client
    res.setHeader(
      "Content-disposition",
      `attachment; filename=Receipt_${receiptNo}.pdf`,
    );
    res.setHeader("Content-type", "application/pdf");
    doc.pipe(res);

    // --- 🎨 PDF DESIGN & LAYOUT ---

    // 1. Header (Firm Branding)
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("LEGALITY LAW FIRM", { align: "center" });
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("123 Supreme Court Road, Legal Avenue, Delhi - 110001", {
        align: "center",
      });
    doc.text("Phone: +91-9876543210 | Email: accounts@legalityfirm.com", {
      align: "center",
    });

    doc.moveDown();
    doc.moveTo(50, 115).lineTo(545, 115).strokeColor("#cccccc").stroke();
    doc.moveDown();

    // 2. Receipt Title
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#1e293b")
      .text("FEE RECEIPT", { align: "center", underline: true });
    doc.moveDown(1.5);

    // 3. Receipt Metadata
    const topY = doc.y;
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`Receipt No: `, 50, topY, { continued: true })
      .font("Helvetica")
      .text(receiptNo);
    doc
      .font("Helvetica-Bold")
      .text(`Date: `, 400, topY, { continued: true })
      .font("Helvetica")
      .text(new Date(collection.date).toLocaleDateString());

    doc.moveDown(2);

    // 4. Case Details
    doc
      .font("Helvetica-Bold")
      .text("Case Title:", 50)
      .font("Helvetica")
      .text(singleCase.caseTitle, 160, doc.y - 14);
    doc.moveDown(0.5);
    doc
      .font("Helvetica-Bold")
      .text("Case Type:", 50)
      .font("Helvetica")
      .text(singleCase.caseType, 160, doc.y - 14);
    if (singleCase.cnr) {
      doc.moveDown(0.5);
      doc
        .font("Helvetica-Bold")
        .text("CNR Number:", 50)
        .font("Helvetica")
        .text(singleCase.cnr, 160, doc.y - 14);
    }

    doc.moveDown(1.5);

    // 5. Client & Payment Info
    const clientsStr =
      singleCase.clients && singleCase.clients.length > 0
        ? singleCase.clients.map((c) => c.name).join(", ")
        : singleCase.caseParty1;

    doc
      .font("Helvetica-Bold")
      .text("Received From:", 50)
      .font("Helvetica")
      .text(clientsStr, 160, doc.y - 14);
    doc.moveDown(0.5);
    doc
      .font("Helvetica-Bold")
      .text("Payment Mode:", 50)
      .font("Helvetica")
      .text(collection.mode, 160, doc.y - 14);

    if (collection.remarks) {
      doc.moveDown(0.5);
      doc
        .font("Helvetica-Bold")
        .text("Transaction Ref:", 50)
        .font("Helvetica")
        .text(collection.remarks, 160, doc.y - 14);
    }

    doc.moveDown(2.5);

    // 6. Highlighted Amount Box
    doc.rect(50, doc.y, 495, 45).fillAndStroke("#f8fafc", "#94a3b8");
    doc
      .fillColor("#0f172a")
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(
        `Amount Received: INR ${collection.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        50,
        doc.y - 32,
        { align: "center" },
      );

    doc.moveDown(5);

    // 7. Signatures
    doc.fontSize(11).font("Helvetica");
    doc.text("Authorized Signatory", 400);
    doc
      .moveTo(380, doc.y - 20)
      .lineTo(520, doc.y - 20)
      .strokeColor("#000000")
      .stroke();

    // 8. 🔹 SECURITY: Anti-Fraud Footer
    doc.moveDown(4);
    doc
      .fontSize(8)
      .fillColor("#64748b")
      .text(
        "This is a secure, system-generated receipt and does not require a physical signature for digital validation.",
        50,
        750,
        { align: "center" },
      );

    const timestamp = new Date().toISOString();
    doc.text(
      `Generated on: ${timestamp} | Security Ref: ${singleCase._id}`,
      50,
      765,
      { align: "center" },
    );

    // Finalize PDF
    doc.end();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// ==========================================
// 🔹 GLOBAL COLLECTIONS LEDGER
// ==========================================
// @desc    Get all collections across all cases
// @route   GET /api/accounts/collections
exports.getAllCollections = async (req, res) => {
  try {
    const cases = await Case.find({ user: req.user._id })
      .populate("lawyers.lawyerId", "fullName name")
      .populate("feeCollections.receivedBy", "fullName");

    let totalCollected = 0;
    let offlineCollected = 0;
    let onlineCollected = 0;
    let allCollections = [];

    const onlineModes = ["UPI", "Bank Transfer", "Online"];

    cases.forEach((c) => {
      c.feeCollections.forEach((col) => {
        const amount = Number(col.amount) || 0;
        totalCollected += amount;

        if (onlineModes.includes(col.mode)) {
          onlineCollected += amount;
        } else {
          offlineCollected += amount;
        }

        // Flatten the data for the frontend table
        allCollections.push({
          _id: col._id,
          caseId: c._id,
          caseTitle: c.caseTitle,
          date: col.date,
          mode: col.mode,
          amount: amount,
          remarks: col.remarks,
          attachment: col.attachment,
          receivedBy: col.receivedBy?.fullName || "Admin",
          team: c.lawyers
            .map((l) => l.lawyerId?.name || l.lawyerId?.fullName)
            .join(", "),
        });
      });
    });

    // Sort by most recent transaction date first
    allCollections.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      stats: {
        total: totalCollected,
        offline: offlineCollected,
        online: onlineCollected,
      },
      data: allCollections,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get aggregated statement (Collections & Expenses)
// @route   GET /api/accounts/statement
exports.getStatements = async (req, res) => {
  try {
    // 1. Fetch Collections (Credits)
    const cases = await Case.find({ user: req.user._id });
    let transactions = [];

    cases.forEach((c) => {
      c.feeCollections.forEach((col) => {
        transactions.push({
          id: col._id.toString(),
          type: "Credit",
          transactionDate: col.date,
          entryDate: col.createdAt,
          category: `Fee Collection - ${c.caseTitle}`,
          summary: col.remarks || `Mode: ${col.mode}`,
          amount: Number(col.amount) || 0,
        });
      });
    });

    // 2. Fetch Expenses (Debits)
    const expenses = await Expense.find({ user: req.user._id });
    expenses.forEach((exp) => {
      transactions.push({
        id: exp._id.toString(),
        type: "Debit",
        transactionDate: exp.transactionDate,
        entryDate: exp.createdAt,
        category: exp.category,
        summary: exp.summary || `Paid to: ${exp.teamMember}`,
        amount: Number(exp.amount) || 0,
      });
    });

    // 3. Sort Chronologically (Oldest first) to calculate running balance
    transactions.sort(
      (a, b) =>
        new Date(a.transactionDate) - new Date(b.transactionDate) ||
        new Date(a.entryDate) - new Date(b.entryDate),
    );

    let runningBalance = 0;
    let totalCredit = 0;
    let totalDebit = 0;

    transactions = transactions.map((txn) => {
      if (txn.type === "Credit") {
        runningBalance += txn.amount;
        totalCredit += txn.amount;
      } else {
        runningBalance -= txn.amount;
        totalDebit += txn.amount;
      }
      return { ...txn, balance: runningBalance };
    });

    // 4. Reverse to show newest first on the frontend table
    transactions.reverse();

    res.json({
      success: true,
      stats: {
        totalCollection: totalCredit,
        totalExpense: totalDebit,
        balance: runningBalance,
      },
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadStatementPDF = async (req, res) => {
  try {
    const Case = require("../models/Case");
    const Expense = require("../models/Expense");
    const PDFDocument = require("pdfkit");

    const cases = await Case.find({ user: req.user._id });
    const expenses = await Expense.find({ user: req.user._id });

    let transactions = [];

    cases.forEach((c) => {
      c.feeCollections.forEach((col) => {
        transactions.push({
          type: "Credit",
          date: col.date,
          desc: `Fee: ${c.caseTitle}`,
          amount: Number(col.amount) || 0,
        });
      });
    });

    expenses.forEach((exp) => {
      transactions.push({
        type: "Debit",
        date: exp.transactionDate,
        desc: exp.category,
        amount: Number(exp.amount) || 0,
      });
    });

    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    let balance = 0;
    let totalCredit = 0;
    let totalDebit = 0;

    transactions = transactions.map((t) => {
      if (t.type === "Credit") {
        balance += t.amount;
        totalCredit += t.amount;
      } else {
        balance -= t.amount;
        totalDebit += t.amount;
      }

      return { ...t, balance };
    });

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Statement_${Date.now()}.pdf`,
    );

    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    const pageWidth = doc.page.width;

    // ======================
    // HEADER
    // ======================

    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("LEGALITY LAW FIRM", { align: "center" });

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#64748b")
      .text("123 Supreme Court Road, Delhi - 110001", { align: "center" });

    doc.text("Phone: +91-9876543210 | Email: accounts@legalityfirm.com", {
      align: "center",
    });

    doc.moveDown();

    doc
      .strokeColor("#e2e8f0")
      .moveTo(40, doc.y)
      .lineTo(pageWidth - 40, doc.y)
      .stroke();

    doc.moveDown();

    doc
      .fontSize(15)
      .font("Helvetica-Bold")
      .fillColor("#0f172a")
      .text("ACCOUNT STATEMENT", { align: "center" });

    doc
      .fontSize(9)
      .font("Helvetica")
      .text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });

    doc.moveDown(2);

    // ======================
    // SUMMARY
    // ======================

    const summaryY = doc.y;

    const drawSummary = (x, title, value) => {
      doc.rect(x, summaryY, 160, 40).stroke("#e2e8f0");

      doc
        .fontSize(9)
        .fillColor("#64748b")
        .text(title, x + 10, summaryY + 8);

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#0f172a")
        .text(`INR ${value.toLocaleString("en-IN")}`, x + 10, summaryY + 20);
    };

    drawSummary(40, "Total Credits", totalCredit);
    drawSummary(220, "Total Debits", totalDebit);
    drawSummary(400, "Balance", balance);

    doc.moveDown(3);

    // ======================
    // TABLE
    // ======================

    const tableTop = doc.y;

    const col = {
      date: 40,
      desc: 120,
      debit: 350,
      credit: 420,
      balance: 490,
    };

    const rowHeight = 22;

    const drawHeader = (y) => {
      doc.rect(40, y, pageWidth - 80, rowHeight).fill("#1e293b");

      doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold");

      doc.text("Date", col.date + 5, y + 6);
      doc.text("Description", col.desc, y + 6);
      doc.text("Debit", col.debit, y + 6, { width: 60, align: "right" });
      doc.text("Credit", col.credit, y + 6, { width: 60, align: "right" });
      doc.text("Balance", col.balance, y + 6, { width: 60, align: "right" });
    };

    drawHeader(tableTop);

    let y = tableTop + rowHeight;
    let zebra = false;

    transactions.forEach((txn) => {
      if (y > 750) {
        doc.addPage();
        y = 40;
        drawHeader(y);
        y += rowHeight;
      }

      if (zebra) {
        doc.rect(40, y, pageWidth - 80, rowHeight).fill("#f8fafc");
      }

      zebra = !zebra;

      doc.font("Helvetica").fontSize(9).fillColor("#334155");

      doc.text(
        new Date(txn.date).toLocaleDateString("en-IN"),
        col.date + 5,
        y + 6,
      );

      doc.text(txn.desc.substring(0, 40), col.desc, y + 6, { width: 200 });

      doc.text(
        txn.type === "Debit" ? txn.amount.toLocaleString("en-IN") : "-",
        col.debit,
        y + 6,
        { width: 60, align: "right" },
      );

      doc.text(
        txn.type === "Credit" ? txn.amount.toLocaleString("en-IN") : "-",
        col.credit,
        y + 6,
        { width: 60, align: "right" },
      );

      doc
        .font("Helvetica-Bold")
        .text(txn.balance.toLocaleString("en-IN"), col.balance, y + 6, {
          width: 60,
          align: "right",
        });

      y += rowHeight;
    });

    // ======================
    // FOOTER
    // ======================

    doc.moveDown(2);

    doc
      .fontSize(8)
      .fillColor("#64748b")
      .text(
        "This is a system generated secure financial statement.",
        40,
        doc.y,
        { align: "center", width: pageWidth - 80 },
      );

    doc.text(
      `Reference: TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      40,
      doc.y + 10,
      { align: "center", width: pageWidth - 80 },
    );

    doc.end();
  } catch (error) {
    if (!res.headersSent)
      res.status(500).json({ success: false, message: error.message });
  }
};
