const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const LearningProgress = require("../models/LearningProgress");
const enrollmentView = require("../utils/enrollmentView");
const { sumLessons } = require("../utils/modules");
const { safeNotify, emitAdmins } = require("../services/notificationService");

// Students see their own enrollments; admins see everyone's (with student + course info).
async function getEnrollments(req, res, next) {
  try {
    const isAdmin = req.user.role === "admin";
    const filter = isAdmin ? {} : { student: req.user.sub };
    filter.status = { $ne: "withdrawn" };
    let query = Enrollment.find(filter).sort({ createdAt: 1 }).populate("course", "title");
    if (isAdmin) query = query.populate("student", "name email rollNo");
    const enrollments = await query.lean();
    const progress = await LearningProgress.find(isAdmin ? {} : { student: req.user.sub }).lean();
    const byKey = new Map(progress.map((p) => [`${p.student}:${p.course}`, p]));
    const items = enrollments
      .filter((e) => e.course && (!isAdmin || e.student))
      .map((e) => {
        const sid = e.student && e.student._id ? e.student._id : e.student;
        return enrollmentView(e, byKey.get(`${sid}:${e.course._id}`));
      });
    res.json({ enrollments: items });
  } catch (error) {
    next(error);
  }
}

async function enroll(req, res, next) {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    const studentId = req.user.sub;
    let enrollment = await Enrollment.findOne({ student: studentId, course: course._id });
    if (enrollment && enrollment.status !== "withdrawn") {
      return res.status(409).json({ message: "You are already enrolled in this course" });
    }
    if (enrollment) {
      // re-enrolment reactivates the old record (keeps history + progress)
      enrollment.status = "active";
      enrollment.enrolledAt = new Date();
      await enrollment.save();
    } else {
      enrollment = await Enrollment.create({ student: studentId, course: course._id });
    }
    const progress = await LearningProgress.findOneAndUpdate(
      { student: studentId, course: course._id },
      { $setOnInsert: { totalLessons: sumLessons(course.modules) || course.lessons } },
      { upsert: true, new: true }
    );
    await safeNotify(studentId, `You enrolled in ${course.title}`);
    emitAdmins("data_changed", { type: "enrollment" });
    res.status(201).json({ message: "Enrolled successfully", enrollment: enrollmentView(enrollment, progress) });
  } catch (error) {
    next(error);
  }
}

// Unenrol = status "withdrawn" (history is preserved, nothing is deleted)
async function withdraw(req, res, next) {
  try {
    const enrollment = await Enrollment.findOne({ _id: req.params.id, student: req.user.sub });
    if (!enrollment || enrollment.status === "withdrawn") {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    enrollment.status = "withdrawn";
    await enrollment.save();
    emitAdmins("data_changed", { type: "enrollment" });
    res.json({ message: "Enrollment withdrawn" });
  } catch (error) {
    next(error);
  }
}

module.exports = { getEnrollments, enroll, withdraw };
