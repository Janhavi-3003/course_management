const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getStats } = require("../controllers/adminController");

router.get("/stats", authMiddleware, authorizeRoles("admin"), getStats);

module.exports = router;
