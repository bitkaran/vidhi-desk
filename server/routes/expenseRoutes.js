const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  getExpenses,
  createExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getCategories,
  createCategory,
  deleteCategory,
} = require("../controllers/expenseController");

router.use(protect);

// IMPORTANT: Put /categories ABOVE /:id so it routes correctly!
router.route("/categories").get(getCategories).post(createCategory);
router.route("/categories/:id").delete(deleteCategory);

router
  .route("/")
  .get(getExpenses)
  .post(upload.single("attachment"), createExpense);
router
  .route("/:id")
  .get(getExpenseById)
  .put(upload.single("attachment"), updateExpense)
  .delete(deleteExpense);

module.exports = router;
