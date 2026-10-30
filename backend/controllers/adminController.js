const Course = require("../models/Course");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const Certificate = require("../models/Certificate");

async function getStats(req, res, next) {
  try {
    const [courses, students, enrollments, completed, certificates] = await Promise.all([
      Course.countDocuments(),
      User.countDocuments({ role: "student" }),
      Enrollment.countDocuments({ status: { $ne: "withdrawn" } }),
      Enrollment.countDocuments({ status: "completed" }),
      Certificate.countDocuments()
    ]);
    res.json({ stats: { courses, students, enrollments, completed, certificates } });
  } catch (error) {
    next(error);
  }
}

module.exports = { getStats };
