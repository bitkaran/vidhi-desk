const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent, 
  updateEventStatus,
  deleteEvent,
} = require("../controllers/ediaryController");

router.use(protect);

router.route("/").post(createEvent).get(getEvents);

// 👈 Add .put(updateEvent) here
router.route("/:id").get(getEventById).put(updateEvent).delete(deleteEvent);

router.put("/:id/status", updateEventStatus);

module.exports = router;
