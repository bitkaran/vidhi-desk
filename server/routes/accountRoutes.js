const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  getCaseAccounts,
  getCaseAccountById,
  addFeeCollection,
  addFeeDue,
  deleteFeeCollection,
  generateReceipt,
  getAllCollections,
  getStatements,
  downloadStatementPDF,
} = require("../controllers/accountController");

router.use(protect);

router.get("/cases", getCaseAccounts);
router.get("/collections", getAllCollections);

router.get("/statement", getStatements);
router.get("/statement/pdf", downloadStatementPDF);

router.get("/cases/:id", getCaseAccountById);
router.post(
  "/cases/:id/collections",
  upload.single("attachment"),
  addFeeCollection,
);
router.delete("/cases/:id/collections/:colId", deleteFeeCollection);

// ROUTE: PDF Download
router.get("/cases/:id/collections/:colId/receipt", generateReceipt);

router.post("/cases/:id/dues", addFeeDue);

module.exports = router;
