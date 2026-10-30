const { body, query } = require("express-validator");
const { text, mongoIdParam } = require("./common");

const CATEGORIES = ["Web Development", "Data Science", "Design", "Cloud", "Mobile", "Database"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const fields = (optional) => {
  const opt = (c) => (optional ? c.optional() : c);
  return [
    text("title", { min: 3, max: 150, label: "Title", optional }),
    text("description", { min: 10, max: 2000, label: "Description", optional }),
    opt(body("duration"))
      .isFloat({ min: 1, max: 1000 })
      .withMessage("Duration must be a number between 1 and 1000 (hours)")
      .toFloat(),
    body("category").optional().isIn(CATEGORIES).withMessage("Invalid category"),
    body("level").optional().isIn(LEVELS).withMessage("Invalid level"),
    text("instructor", { min: 2, max: 100, label: "Instructor", optional: true }),
    body("price").optional().isFloat({ min: 0, max: 1000000 }).withMessage("Price must be 0 or more").toFloat(),
    body("lessons").optional().isInt({ min: 1, max: 1000 }).withMessage("Lessons must be 1-1000").toInt(),
    body("rating").optional().isFloat({ min: 0, max: 5 }).withMessage("Rating must be 0-5").toFloat(),
    body("emoji").optional().isString().isLength({ max: 10 }).withMessage("Emoji is too long"),
    body("modules").optional().isArray({ max: 50 }).withMessage("Modules must be an array")
  ];
};

const createCourseValidation = fields(false);
const updateCourseValidation = [mongoIdParam("id", "course ID"), ...fields(true)];
const courseIdValidation = [mongoIdParam("id", "course ID")];

const listCoursesValidation = [
  query("q").optional().isString().isLength({ max: 100 }),
  query("category").optional().isString().isIn(CATEGORIES).withMessage("Invalid category"),
  query("level").optional().isString().isIn(LEVELS).withMessage("Invalid level"),
  query("free").optional().isIn(["true", "false"]),
  query("page").optional().isInt({ min: 1, max: 100000 }),
  query("limit").optional().isInt({ min: 1, max: 100 })
];

module.exports = {
  CATEGORIES,
  LEVELS,
  createCourseValidation,
  updateCourseValidation,
  courseIdValidation,
  listCoursesValidation
};
