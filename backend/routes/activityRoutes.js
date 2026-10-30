const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getMyActivity } = require("../controllers/activityController");

router.get("/", authMiddleware, authorizeRoles("student"), getMyActivity);

module.exports = router;
