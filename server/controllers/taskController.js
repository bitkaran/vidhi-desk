const Task = require("../models/Task");
const User = require("../models/User");
const Team = require("../models/Team");

// @desc    Create a new task
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { title, assignedTo, ...rest } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Task title is required" });
    }

    // Format Assignees array
    let formattedAssignees = [];
    const mainUserIdStr = req.user._id.toString();

    if (assignedTo && Array.isArray(assignedTo)) {
      assignedTo.forEach((id) => {
        formattedAssignees.push({
          assigneeId: id,
          model: id === mainUserIdStr ? "User" : "Team",
        });
      });
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      ...rest,
      assignedTo: formattedAssignees,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id })
      .populate("assignedTo.assigneeId", "fullName name title")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("assignedTo.assigneeId", "fullName name title designation");

    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });

    const { assignedTo, ...rest } = req.body;

    let formattedAssignees = [];
    const mainUserIdStr = req.user._id.toString();

    if (assignedTo && Array.isArray(assignedTo)) {
      assignedTo.forEach((id) => {
        formattedAssignees.push({
          assigneeId: id,
          model: id === mainUserIdStr ? "User" : "Team",
        });
      });
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { ...rest, assignedTo: formattedAssignees },
      { new: true, runValidators: true },
    );

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Task Stats for Grid
// @route   GET /api/tasks/stats
exports.getTaskStats = async (req, res) => {
  try {
    const total = await Task.countDocuments({ user: req.user._id });
    const pending = await Task.countDocuments({
      user: req.user._id,
      status: "Pending",
    });
    const inProgress = await Task.countDocuments({
      user: req.user._id,
      status: "In Progress",
    });
    const completed = await Task.countDocuments({
      user: req.user._id,
      status: "Completed",
    });

    res.json({
      success: true,
      data: { total, pending, inProgress, completed },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Assignees List
// @route   GET /api/tasks/assignees
exports.getTaskAssignees = async (req, res) => {
  try {
    const mainUser = await User.findById(req.user._id).select("_id fullName");
    const teamMembers = await Team.find({ user: req.user._id }).select(
      "_id title name designation",
    );

    const formattedList = [
      { _id: mainUser._id, name: `${mainUser.fullName} (You)` },
      ...teamMembers.map((t) => ({
        _id: t._id,
        name: `${t.title || ""} ${t.name}`,
      })),
    ];

    res.json({ success: true, data: formattedList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
