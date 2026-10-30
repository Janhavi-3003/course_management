const { body } = require("express-validator");
const { mongoIdParam } = require("./common");

const enrollValidation = [body("courseId").isMongoId().withMessage("Invalid course ID")];
const enrollmentIdValidation = [mongoIdParam("id", "enrollment ID")];
const progressValidation = [
  mongoIdParam("courseId", "course ID"),
  body("moduleId").isString().isLength({ min: 1, max: 40 }).withMessage("moduleId is required"),
  body("kind").isIn(["photo", "video", "theory"]).withMessage("kind must be photo, video or theory")
];
const courseParamValidation = [mongoIdParam("courseId", "course ID")];
const userIdValidation = [mongoIdParam("userId", "user ID")];
const notificationIdValidation = [mongoIdParam("id", "notification ID")];

module.exports = {
  enrollValidation,
  enrollmentIdValidation,
  progressValidation,
  courseParamValidation,
  userIdValidation,
  notificationIdValidation
};
