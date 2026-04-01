// for-lawyers/server/routes/clientRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} = require("../controllers/clientController");

router.use(protect);

router.route("/").post(createClient).get(getClients);
router.route("/:id").get(getClientById).put(updateClient).delete(deleteClient);

module.exports = router;
