// for-lawyers/server/controllers/leadController.js
const Lead = require("../models/Lead");
const { success, error } = require("../utils/response");

exports.createLead = async (req, res) => {
  try {
    const {
      clientName,
      phone,
      court,
      caseType,
      leadType,
      status,
      nextFollowUpDate,
      remarks,
    } = req.body;

    const lead = await Lead.create({
      user: req.user._id, 
      clientName,
      phone,
      court,
      caseType,
      leadType,
      status,
      nextFollowUpDate,
      remarks,
    });

    return success(res, { data: lead }, "Lead created successfully", 201);
  } catch (err) {
    return error(res, err.message);
  }
};

// @desc    Get all leads for logged-in user
// @route   GET /api/leads
// @access  Private
exports.getLeads = async (req, res) => {
  try {
    // Only fetch leads belonging to the logged-in user
    // Sort by newest first
    const leads = await Lead.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    return success(res, { data: leads, count: leads.length }, "Leads fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

// @desc    Get single lead details
// @route   GET /api/leads/:id
// @access  Private
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, user: req.user._id });

    if (!lead) {
      return error(res, "Lead not found", 404);
    }

    return success(res, { data: lead }, "Lead fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Private
exports.updateLead = async (req, res) => {
  try {
    let lead = await Lead.findOne({ _id: req.params.id, user: req.user._id });

    if (!lead) return error(res, "Lead not found", 404);

    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return success(res, { data: lead }, "Lead updated");
  } catch (err) {
    return error(res, err.message);
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!lead) {
      return error(res, "Lead not found", 404);
    }

    return success(res, {}, "Lead deleted successfully");
  } catch (error) {
    return error(res, err.message);
  }
};

// @desc    Add a follow-up to a lead
// @route   POST /api/leads/:id/followup
// @access  Private
exports.addFollowUp = async (req, res) => {
  try {
    const { remark, nextDate } = req.body;

    const lead = await Lead.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!lead) return error(res, "Lead not found", 404);
    if (!remark) return error(res, "Remark is required", 400);

    if (nextDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newDate = new Date(nextDate);
      newDate.setHours(0, 0, 0, 0);

      // ❌ Past date block
      if (newDate < today) {
        return error(res, "Follow up date cannot be in past", 400);
      }

      // ❌ Previous followup se piche date block
      if (lead.nextFollowUpDate) {
        const lastDate = new Date(lead.nextFollowUpDate);
        lastDate.setHours(0, 0, 0, 0);

        if (newDate < lastDate) {
          return error(
            res,
            "Next follow up cannot be earlier than previous",
            400,
          );
        }
      }

      lead.nextFollowUpDate = newDate;
    }

    lead.followUps.push({
      remark,
      nextDate,
    });

    await lead.save();

    return success(res, { data: lead }, "Follow up added");
  } catch (error) {
    return error(res, err.message);
  }
};

// @desc    Update lead status
// @route   PUT /api/leads/:id/status
// @access  Private
exports.updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findOne({ _id: req.params.id, user: req.user._id });

    if (!lead) return error(res, "Lead not found", 404);

    lead.status = status;
    await lead.save();

    return success(res, { data: lead }, "Status updated");
  } catch (error) {
    return error(res, err.message);
  }
};
