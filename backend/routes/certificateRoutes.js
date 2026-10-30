const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const controller = require("../controllers/certificateController");
const { courseParamValidation } = require("../validators/learningValidators");

router.use(authMiddleware, authorizeRoles("student"));
router.get("/", controller.getMyCertificates);
router.get("/course/:courseId", courseParamValidation, validateRequest, controller.getCertificateForCourse);

module.exports = router;
