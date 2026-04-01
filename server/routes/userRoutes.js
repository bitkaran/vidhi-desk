const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  getUserProfile,
  updateUserProfile,
  deactivateUser,
  deleteUser
} = require("../controllers/userController");

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, upload.single("profilePicture"), updateUserProfile);

// 🔹 New Security Routes
router.put("/deactivate", protect, deactivateUser);
router.delete("/delete", protect, deleteUser);

module.exports = router;