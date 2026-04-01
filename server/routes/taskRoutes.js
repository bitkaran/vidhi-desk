const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
  getTaskAssignees,
} = require("../controllers/taskController");

router.use(protect);

router.get("/stats", getTaskStats);
router.get("/assignees", getTaskAssignees);
router.route("/").post(createTask).get(getTasks);
router.route("/:id").get(getTaskById).put(updateTask).delete(deleteTask);

module.exports = router;
