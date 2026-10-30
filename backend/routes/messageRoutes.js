const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { getContacts, getHistory } = require("../controllers/messageController");
const { userIdValidation } = require("../validators/learningValidators");

router.get("/contacts", authMiddleware, getContacts);
router.get("/:userId", authMiddleware, userIdValidation, validateRequest, getHistory);

module.exports = router;
