// for-lawyers/server/routes/teamRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createTeamMember,
  getTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
} = require("../controllers/teamController");

router.use(protect);

router.route("/").post(createTeamMember).get(getTeamMembers);
router
  .route("/:id")
  .get(getTeamMemberById)
  .put(updateTeamMember)
  .delete(deleteTeamMember);

module.exports = router;
