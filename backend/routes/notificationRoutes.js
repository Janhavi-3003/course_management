const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { getNotifications, markRead, markAllRead } = require("../controllers/notificationController");
const { notificationIdValidation } = require("../validators/learningValidators");

router.get("/", authMiddleware, getNotifications);
router.patch("/read-all", authMiddleware, markAllRead);
router.patch("/:id/read", authMiddleware, notificationIdValidation, validateRequest, markRead);

module.exports = router;
