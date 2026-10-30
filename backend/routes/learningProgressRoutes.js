const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const controller = require("../controllers/learningProgressController");
const { progressValidation } = require("../validators/learningValidators");

router.use(authMiddleware, authorizeRoles("student"));
router.get("/", controller.getMyProgress);
router.patch("/:courseId/module", progressValidation, validateRequest, controller.updateModuleProgress);

module.exports = router;
