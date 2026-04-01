const Case = require("../models/Case");
const User = require("../models/User");
const Team = require("../models/Team");
const { success, error } = require("../utils/response");

const STAGES = { 
  Criminal: [
    "FIR",
    "Chargesheet",
    "Framing of Charges",
    "Prosecution Evidence",
    "Defense Evidence",
    "Judgment",
  ],
  Civil: [
    "Filing",
    "Written Statement",
    "Issues",
    "Plaintiff Evidence",
    "Defendant Evidence",
    "Judgment",
  ],
  Matrimonial: [
    "Pleadings",
    "Issues",
    "Plaintiff Evidence",
    "Defendant Evidence",
    "Final Arguments",
    "Judgments",
  ],
  Corporate: [],
};

// 🔹 HELPER: Formats the lawyers array according to your exact logic
const formatLawyersArray = (
  selectedLawyerId,
  teamMembersArray,
  mainUserIdStr,
) => {
  let finalLawyers = [];

  // 1. Add Main Case Lawyer (Must be index 0)
  if (selectedLawyerId) {
    finalLawyers.push({
      lawyerId: selectedLawyerId,
      model: selectedLawyerId === mainUserIdStr ? "User" : "Team",
    });
  }

  // 2. Add Team Members
  if (Array.isArray(teamMembersArray)) {
    teamMembersArray.forEach((id) => {
      if (id !== selectedLawyerId) {
        // Prevent duplicate with main lawyer
        finalLawyers.push({
          lawyerId: id,
          model: id === mainUserIdStr ? "User" : "Team",
        });
      }
    });
  }

  // 3. Auto-add User: If User is not selected anywhere, force them into the team
  if (!finalLawyers.some((l) => l.lawyerId.toString() === mainUserIdStr)) {
    finalLawyers.push({ lawyerId: mainUserIdStr, model: "User" });
  }

  return finalLawyers;
};

exports.createCase = async (req, res) => {
  try {
    const {
      caseParty1,
      caseParty2,
      court,
      caseType,
      stage,
      cnr,
      object,
      target,
      firNo,
      policeStation,
      fileNo,
      caseAmount,
      note,
      selectedLawyer,
      teamMembers,
      clients, // 👈 ADD clients HERE
    } = req.body;

    if (!caseParty1 || !caseParty2 || !caseType) {
      return error(res, "Party 1, Party 2, and Case Type are required", 400);
    }

    if (stage && STAGES[caseType] && !STAGES[caseType].includes(stage)) {
      return res.status(400).json({
        success: false,
        message: `Invalid stage for Case Type: ${caseType}`,
      });
    }

    const finalLawyers = formatLawyersArray(
      selectedLawyer,
      teamMembers,
      req.user._id.toString(),
    );

    // 🔹 NEW: Parse Clients Array
    let parsedClients = [];
    if (clients) {
      parsedClients = Array.isArray(clients) ? clients : [clients];
    }

    const documentPaths = req.files
      ? req.files.map((file) => `/uploads/documents/${file.filename}`)
      : [];

    const newCase = await Case.create({
      user: req.user._id,
      caseParty1,
      caseParty2,
      court,
      caseType,
      stage,
      cnr,
      object,
      target,
      firNo,
      policeStation,
      fileNo,
      caseAmount,
      note,
      lawyers: finalLawyers,
      clients: parsedClients, // 👈 ADD parsed clients to DB
      documents: documentPaths,
    });

    return success(res, { data: newCase }, "Case created successfully", 201);
  } catch (error) {
    return error(res, error.message);
  }
};

exports.getCases = async (req, res) => {
  try {
    const cases = await Case.find({ user: req.user._id })
      .populate("lawyers.lawyerId", "fullName name title") // Fetch names for the table
      .sort({ createdAt: -1 });
    res.json({ success: true, count: cases.length, data: cases });
  } catch (error) {
    return error(res, error.message);
  }
};

exports.getCaseById = async (req, res) => {
  try {
    const singleCase = await Case.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("lawyers.lawyerId", "fullName name title designation")
      .populate("clients"); // 👈 Added this line

    if (!singleCase)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });
    res.json({ success: true, data: singleCase });
  } catch (error) {
    return error(res, error.message);
  }
};

exports.linkClientToCase = async (req, res) => {
  try {
    const { clientId } = req.body;
    const singleCase = await Case.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!singleCase)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });

    // Prevent duplicates
    if (!singleCase.clients.includes(clientId)) {
      singleCase.clients.push(clientId);
      await singleCase.save();
    }

    // Return the newly updated case with populated data
    const updatedCase = await Case.findById(req.params.id)
      .populate("lawyers.lawyerId", "fullName name title designation")
      .populate("clients");

    res.json({ success: true, data: updatedCase });
  } catch (error) {
    return error(res, error.message);
  }
};

exports.unlinkClientFromCase = async (req, res) => {
  try {
    const { clientId } = req.params;
    const singleCase = await Case.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!singleCase)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });

    // Filter out the specific client
    singleCase.clients = singleCase.clients.filter(
      (id) => id.toString() !== clientId,
    );
    await singleCase.save();

    const updatedCase = await Case.findById(req.params.id)
      .populate("lawyers.lawyerId", "fullName name title designation")
      .populate("clients");

    res.json({ success: true, data: updatedCase });
  } catch (error) {
    return error(res, error.message);
  }
};

exports.updateCase = async (req, res) => {
  try {
    let singleCase = await Case.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!singleCase)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });

    // 🔹 Extract caseParty1 and caseParty2 to manually regenerate the title
    const {
      caseType,
      stage,
      selectedLawyer,
      teamMembers,
      clients,
      existingDocs,
      caseParty1,
      caseParty2,
      ...rest
    } = req.body;

    if (
      caseType &&
      stage &&
      STAGES[caseType] &&
      !STAGES[caseType].includes(stage)
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid stage for Case Type: ${caseType}`,
      });
    }

    const finalLawyers = formatLawyersArray(
      selectedLawyer,
      teamMembers,
      req.user._id.toString(),
    );

    let parsedClients = [];
    if (clients) {
      parsedClients = Array.isArray(clients) ? clients : [clients];
    }

    let parsedExistingDocs = [];
    if (existingDocs) {
      parsedExistingDocs = Array.isArray(existingDocs)
        ? existingDocs
        : [existingDocs];
    }

    const newDocPaths = req.files
      ? req.files.map((file) => `/uploads/documents/${file.filename}`)
      : [];
    const updatedDocuments = [...parsedExistingDocs, ...newDocPaths];

    // 🔹 FIX: Re-generate the Case Title dynamically if parties were changed
    const p1 = caseParty1 || singleCase.caseParty1;
    const p2 = caseParty2 || singleCase.caseParty2;
    const updatedCaseTitle = `${p1} VS ${p2}`;

    singleCase = await Case.findByIdAndUpdate(
      req.params.id,
      {
        caseType: caseType || singleCase.caseType,
        stage: stage || singleCase.stage,
        caseParty1: p1, // 👈 Save updated Party 1
        caseParty2: p2, // 👈 Save updated Party 2
        caseTitle: updatedCaseTitle, // 👈 Save the newly merged Title!
        ...rest,
        lawyers: finalLawyers,
        clients: parsedClients,
        documents: updatedDocuments,
      },
      { new: true, runValidators: true },
    );

    res.json({ success: true, data: singleCase });
  } catch (error) {
    return error(res, error.message);
  }
};

exports.deleteCase = async (req, res) => {
  try {
    const singleCase = await Case.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!singleCase)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });
    res.json({ success: true, message: "Case deleted successfully" });
  } catch (error) {
    return error(res, error.message);
  }
};

exports.getAdvocatesList = async (req, res) => {
  try {
    const mainUser = await User.findById(req.user._id).select(
      "_id fullName role",
    );
    const teamAdvocates = await Team.find({
      user: req.user._id,
      title: { $regex: "^adv", $options: "i" },
    }).select("_id title name designation");

    const formattedList = [];
    formattedList.push({
      _id: mainUser._id,
      name: `${mainUser.fullName} (You)`,
      isMainUser: true,
    });
    teamAdvocates.forEach((adv) => {
      formattedList.push({
        _id: adv._id,
        name: `${adv.title} ${adv.name}`,
        isMainUser: false,
      });
    });

    res.json({ success: true, data: formattedList });
  } catch (error) {
    return error(res, error.message);
  }
};

exports.addCaseNote = async (req, res) => {
  try {
    const { title, note } = req.body;
    if (!title || !note)
      return res
        .status(400)
        .json({ success: false, message: "Title and Note are required" });

    const singleCase = await Case.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!singleCase)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });

    singleCase.notes.push({ title, note });
    await singleCase.save();

    const updatedCase = await Case.findById(req.params.id)
      .populate("lawyers.lawyerId")
      .populate("clients");
    res.status(201).json({ success: true, data: updatedCase });
  } catch (error) {
    return error(res, error.message);
  }
};

exports.updateCaseNote = async (req, res) => {
  try {
    const { title, note } = req.body;
    const singleCase = await Case.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!singleCase)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });

    const targetNote = singleCase.notes.id(req.params.noteId);
    if (!targetNote)
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });

    if (title) targetNote.title = title;
    if (note) targetNote.note = note;

    await singleCase.save();
    const updatedCase = await Case.findById(req.params.id)
      .populate("lawyers.lawyerId")
      .populate("clients");
    res.json({ success: true, data: updatedCase });
  } catch (error) {
    return error(res, error.message);
  }
};

exports.deleteCaseNote = async (req, res) => {
  try {
    const singleCase = await Case.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!singleCase)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });

    singleCase.notes.pull({ _id: req.params.noteId });
    await singleCase.save();

    const updatedCase = await Case.findById(req.params.id)
      .populate("lawyers.lawyerId")
      .populate("clients");
    res.json({ success: true, data: updatedCase });
  } catch (error) {
    return error(res, error.message);
  }
};

// ==========================================
// 🔹 TIMELINE MANAGEMENT LOGIC
// ==========================================
exports.addTimelineEvent = async (req, res) => {
  try {
    const { date, hearing, court, judgeName } = req.body;
    if (!date || !hearing || !court)
      return res.status(400).json({
        success: false,
        message: "Date, Hearing, and Court are required",
      });

    // Validate Past Date
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Cannot select a past date for a hearing.",
      });
    }

    const singleCase = await Case.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!singleCase)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });

    const attachedOrder = req.file
      ? `/uploads/documents/${req.file.filename}`
      : null;

    singleCase.timeline.push({
      date,
      hearing,
      court,
      judgeName,
      attachedOrder,
    });
    singleCase.timeline.sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort ascending by date

    await singleCase.save();
    const updatedCase = await Case.findById(req.params.id)
      .populate("lawyers.lawyerId")
      .populate("clients");
    res.status(201).json({ success: true, data: updatedCase });
  } catch (error) {
    return error(res, error.message);
  }
};

exports.deleteTimelineEvent = async (req, res) => {
  try {
    const singleCase = await Case.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!singleCase)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });

    singleCase.timeline.pull({ _id: req.params.timelineId });
    await singleCase.save();

    const updatedCase = await Case.findById(req.params.id)
      .populate("lawyers.lawyerId")
      .populate("clients");
    res.json({ success: true, data: updatedCase });
  } catch (error) {
    return error(res, error.message);
  }
};

exports.updateCaseStage = async (req, res) => {
  try {
    const { stage } = req.body;
    if (!stage)
      return res
        .status(400)
        .json({ success: false, message: "Stage is required" });

    const singleCase = await Case.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { stage },
      { new: true },
    )
      .populate("lawyers.lawyerId", "fullName name title designation")
      .populate("clients");

    if (!singleCase)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });

    res.json({ success: true, data: singleCase });
  } catch (error) {
    return error(res, error.message);
  }
};

exports.addCaseDocuments = async (req, res) => {
  try {
    const singleCase = await Case.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!singleCase)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    const newDocPaths = req.files.map(
      (file) => `/uploads/documents/${file.filename}`,
    );

    // Check limit
    if (singleCase.documents.length + newDocPaths.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 documents allowed per case",
      });
    }

    singleCase.documents.push(...newDocPaths);
    await singleCase.save();

    const updatedCase = await Case.findById(req.params.id)
      .populate("lawyers.lawyerId", "fullName name title designation")
      .populate("clients");

    res.json({ success: true, data: updatedCase });
  } catch (error) {
    return error(res, error.message);
  }
};

exports.deleteCaseDocument = async (req, res) => {
  try {
    // The filename might contain slashes, so we encode it in the frontend and decode it here
    const docPath = decodeURIComponent(req.params.filename);

    const singleCase = await Case.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!singleCase)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });

    singleCase.documents = singleCase.documents.filter(
      (doc) => doc !== docPath,
    );
    await singleCase.save();

    const updatedCase = await Case.findById(req.params.id)
      .populate("lawyers.lawyerId", "fullName name title designation")
      .populate("clients");

    res.json({ success: true, data: updatedCase });
  } catch (error) {
    return error(res, error.message);
  }
};

// ==========================================
// 🔹 COMMITTED FEE MANAGEMENT
// ==========================================
exports.updateCommittedFee = async (req, res) => {
  try {
    const { caseAmount } = req.body;

    if (caseAmount === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Case amount is required" });
    }

    const singleCase = await Case.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { caseAmount: String(caseAmount) },
      { new: true },
    )
      .populate("lawyers.lawyerId", "fullName name title designation")
      .populate("clients");

    if (!singleCase)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });

    res.json({ success: true, data: singleCase });
  } catch (error) {
    return error(res, error.message);
  }
};
