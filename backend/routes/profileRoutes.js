const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { getProfile, updateProfile } = require("../controllers/profileController");
const { profileValidation } = require("../validators/studentValidators");

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, profileValidation, validateRequest, updateProfile);

module.exports = router;
