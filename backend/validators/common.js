const { body, param } = require("express-validator");
const { clean } = require("../utils/sanitize");

const text = (field, { min = 1, max = 200, label, optional = false } = {}) => {
  let chain = body(field);
  if (optional) chain = chain.optional();
  const name = label || field;
  return chain
    .isString()
    .withMessage(`${name} must be text`)
    .bail()
    .customSanitizer(clean)
    .isLength({ min, max })
    .withMessage(`${name} must be ${min}-${max} characters`);
};

const email = (field = "email", optional = false) => {
  let chain = body(field);
  if (optional) chain = chain.optional();
  return chain
    .isString()
    .withMessage("Valid email is required")
    .bail()
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Valid email is required")
    .isLength({ max: 150 })
    .withMessage("Email is too long");
};

const password = (field = "password", optional = false) => {
  let chain = body(field);
  if (optional) chain = chain.optional();
  return chain
    .isString()
    .withMessage("Password must contain at least 12 characters")
    .bail()
    .isLength({ min: 12, max: 72 })
    .withMessage("Password must contain at least 12 characters (max 72)");
};

const mongoIdParam = (name = "id", label = "ID") =>
  param(name).isMongoId().withMessage(`Invalid ${label}`);

module.exports = { text, email, password, mongoIdParam, body, param };
