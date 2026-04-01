const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  deleteCase,
  getAdvocatesList,
  linkClientToCase,
  unlinkClientFromCase,
  addCaseNote,
  updateCaseNote,
  deleteCaseNote,
  addTimelineEvent,
  deleteTimelineEvent,
  updateCaseStage,
  addCaseDocuments,
  deleteCaseDocument,
  updateCommittedFee
} = require("../controllers/caseController");

router.use(protect);

router.get("/advocates", getAdvocatesList);
router.route("/").post(upload.array("documents", 10), createCase).get(getCases);

router
  .route("/:id")
  .get(getCaseById)
  .put(upload.array("documents", 10), updateCase)
  .delete(deleteCase);

router.route("/:id/clients").post(linkClientToCase);
router.route("/:id/clients/:clientId").delete(unlinkClientFromCase);

router.put("/:id/stage", updateCaseStage);
router.put("/:id/fee", updateCommittedFee);
router.post("/:id/documents", upload.array("documents", 5), addCaseDocuments);
router.delete("/:id/documents/:filename", deleteCaseDocument); 

// 🔹 NOTES ROUTES
router.route("/:id/notes").post(addCaseNote);
router.route("/:id/notes/:noteId").put(updateCaseNote).delete(deleteCaseNote);

// 🔹 TIMELINE ROUTES (Upload single file for order)
router
  .route("/:id/timeline")
  .post(upload.single("attachedOrder"), addTimelineEvent);
router.route("/:id/timeline/:timelineId").delete(deleteTimelineEvent);

module.exports = router;
