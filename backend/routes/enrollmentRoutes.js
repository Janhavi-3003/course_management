const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const controller = require("../controllers/enrollmentController");
const { enrollValidation, enrollmentIdValidation } = require("../validators/learningValidators");

router.use(authMiddleware);
router.get("/", controller.getEnrollments);
router.post("/", authorizeRoles("student"), enrollValidation, validateRequest, controller.enroll);
router.delete("/:id", authorizeRoles("student"), enrollmentIdValidation, validateRequest, controller.withdraw);

module.exports = router;
