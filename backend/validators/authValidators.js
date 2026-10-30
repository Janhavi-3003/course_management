const { body, text, email, password } = require("./common");

const registerValidation = [
  text("name", { min: 2, max: 100, label: "Name" }),
  email("email"),
  password("password"),
  text("rollNo", { min: 2, max: 40, label: "Roll number", optional: true })
];

const loginValidation = [
  email("email"),
  body("password").isString().notEmpty().withMessage("Password is required")
];

const adminLoginValidation = [
  text("adminId", { min: 3, max: 40, label: "Admin ID" }),
  body("password").isString().notEmpty().withMessage("Password is required")
];

const forgotValidation = [email("email")];

const resetValidation = [
  body("token").isString().isLength({ min: 20, max: 2000 }).withMessage("Reset token is required"),
  password("password")
];

module.exports = {
  registerValidation,
  loginValidation,
  adminLoginValidation,
  forgotValidation,
  resetValidation
};
