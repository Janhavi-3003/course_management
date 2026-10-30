const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createCourseValidation, updateCourseValidation, courseIdValidation, listCoursesValidation
} = require("../validators/courseValidators");

router.get("/", listCoursesValidation, validateRequest, courseController.getAllCourses);
router.get("/:id", courseIdValidation, validateRequest, courseController.getCourseById);
router.post("/", authMiddleware, authorizeRoles("admin"), createCourseValidation, validateRequest, courseController.createCourse);
router.put("/:id", authMiddleware, authorizeRoles("admin"), updateCourseValidation, validateRequest, courseController.updateCourse);
router.delete("/:id", authMiddleware, authorizeRoles("admin"), courseIdValidation, validateRequest, courseController.deleteCourse);

module.exports = router;
