// for-lawyers/server/controllers/teamController.js
const Team = require("../models/Team");

const { success, error } = require("../utils/response");

exports.createTeamMember = async (req, res) => {
  try {
    const { title, name, phone, email, designation, bciRegistration } =
      req.body;

    // Basic Validation
    if (!title || !name || !phone) {
      return error(res, "Title, Name, and Phone are required", 400);
    }

    const existing = await Team.findOne({
      user: req.user._id,
      $or: [
        { phone },
        { email: email || null },
        { bciRegistration: bciRegistration || null },
      ],
    });

    if (existing) {
      return error(res, "Phone, Email or BCI already exists", 400);
    }

    const teamMember = await Team.create({
      user: req.user._id, // Attached via authMiddleware
      title,
      name,
      phone,
      email,
      designation,
      bciRegistration,
    });

    return success(res, { data: teamMember }, "Team member created", 201);
  } catch (err) {
    return error(res, err.message);
  }
};

// @desc    Get all team members for logged-in user
// @route   GET /api/team
// @access  Private
exports.getTeamMembers = async (req, res) => {
  try {
    const teamMembers = await Team.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    return success(res, {
      count: teamMembers.length,
      data: teamMembers,
    });
  } catch (err) {
    return error(res, err.message);
  }
};

// @desc    Get single team member details
// @route   GET /api/team/:id
// @access  Private
exports.getTeamMemberById = async (req, res) => {
  try {
    const teamMember = await Team.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!teamMember) {
      return error(res, "Team member not found", 404);
    }

    return success(res, { data: teamMember });
  } catch (err) {
    return error(res, err.message);
  }
};

// @desc    Update a team member
// @route   PUT /api/team/:id
// @access  Private
exports.updateTeamMember = async (req, res) => {
  try {
    let teamMember = await Team.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!teamMember) {
      return error(res, "Team member not found", 404);
    }

    teamMember = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return success(res, { data: teamMember }, "Team member updated");
  } catch (err) {
    return error(res, err.message);
  }
};

// @desc    Delete a team member
// @route   DELETE /api/team/:id
// @access  Private
exports.deleteTeamMember = async (req, res) => {
  try {
    const teamMember = await Team.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!teamMember) {
      return error(res, "Team member not found", 404);
    }

    return success(res, {}, "Team member removed");
  } catch (err) {
    return error(res, err.message);
  }
};
