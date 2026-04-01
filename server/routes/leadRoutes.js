// for-lawyers/server/routes/leadRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addFollowUp,
  updateLeadStatus,
} = require("../controllers/leadController");

router.use(protect);
router.route("/").post(createLead).get(getLeads);
router.route("/:id").get(getLeadById).put(updateLead).delete(deleteLead);
router.post("/:id/followup", addFollowUp);
router.put("/:id/status", updateLeadStatus);

module.exports = router;
