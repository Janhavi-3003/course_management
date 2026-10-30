const { text, email, password, mongoIdParam } = require("./common");

const createStudentValidation = [
  text("name", { min: 2, max: 100, label: "Name" }),
  email("email"),
  password("password"),
  text("rollNo", { min: 2, max: 40, label: "Roll number", optional: true })
];

const updateStudentValidation = [
  mongoIdParam("id", "student ID"),
  text("name", { min: 2, max: 100, label: "Name", optional: true }),
  email("email", true),
  text("rollNo", { min: 2, max: 40, label: "Roll number", optional: true })
];

const studentIdValidation = [mongoIdParam("id", "student ID")];

const profileValidation = [
  text("name", { min: 2, max: 100, label: "Name" }),
  text("rollNo", { min: 2, max: 40, label: "Roll number", optional: true })
];

module.exports = {
  createStudentValidation,
  updateStudentValidation,
  studentIdValidation,
  profileValidation
};
