const Ediary = require("../models/Ediary");

// Helper to check if a date is in the past
const isPastDate = (dateString) => {
  const eventDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  return eventDate < today;
};

exports.createEvent = async (req, res) => {
  try {
    const {
      type,
      title,
      date,
      time,
      location,
      description,
      relatedCase,
      teamMembers,
    } = req.body;

    if (!title || !date) {
      return res
        .status(400)
        .json({ success: false, message: "Event Name and Date are required" });
    }

    // 🔹 LOGICAL FIX: Prevent past dates
    if (isPastDate(date)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Cannot schedule an event in the past",
        });
    }

    let formattedMembers = [];
    const mainUserIdStr = req.user._id.toString();

    if (teamMembers && Array.isArray(teamMembers)) {
      teamMembers.forEach((id) => {
        formattedMembers.push({
          memberId: id,
          model: id === mainUserIdStr ? "User" : "Team",
        });
      });
    }

    const newEvent = await Ediary.create({
      user: req.user._id,
      type,
      title,
      date,
      time,
      location,
      description,
      relatedCase: relatedCase || null,
      teamMembers: formattedMembers,
    });

    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Ediary.find({ user: req.user._id })
      .populate("teamMembers.memberId", "fullName name title")
      .populate("relatedCase", "caseTitle cnr")
      .sort({ date: 1, time: 1 });
    res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Ediary.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("teamMembers.memberId", "fullName name title designation phone")
      .populate("relatedCase", "caseTitle cnr court");

    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 MISSING LOGIC ADDED: Update Event
exports.updateEvent = async (req, res) => {
  try {
    const {
      type,
      title,
      date,
      time,
      location,
      description,
      relatedCase,
      teamMembers,
    } = req.body;

    if (!title || !date) {
      return res
        .status(400)
        .json({ success: false, message: "Event Name and Date are required" });
    }

    let event = await Ediary.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    // 🔹 LOGICAL FIX: Prevent changing to a past date
    if (date !== event.date && isPastDate(date)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Cannot reschedule an event to the past",
        });
    }

    let formattedMembers = [];
    const mainUserIdStr = req.user._id.toString();

    if (teamMembers && Array.isArray(teamMembers)) {
      teamMembers.forEach((id) => {
        formattedMembers.push({
          memberId: id,
          model: id === mainUserIdStr ? "User" : "Team",
        });
      });
    }

    event = await Ediary.findByIdAndUpdate(
      req.params.id,
      {
        type,
        title,
        date,
        time,
        location,
        description,
        relatedCase: relatedCase || null,
        teamMembers: formattedMembers,
      },
      { new: true },
    );

    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEventStatus = async (req, res) => {
  try {
    const event = await Ediary.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: req.body.status },
      { new: true },
    )
      .populate("teamMembers.memberId", "fullName name title")
      .populate("relatedCase", "caseTitle");

    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Ediary.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    res.json({ success: true, message: "Event removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
