const crypto = require("crypto");
const Enrollment = require("../models/Enrollment");
const LearningProgress = require("../models/LearningProgress");
const Certificate = require("../models/Certificate");
const Activity = require("../models/Activity");
const httpError = require("../utils/httpError");
const { ymd } = require("../utils/dates");
const { sumLessons } = require("../utils/modules");
const { safeNotify, emitAdmins } = require("./notificationService");

async function logActivity(studentId, hours) {
  const date = ymd();
  await Activity.updateOne(
    { student: studentId, date },
    { $inc: { hours } },
    { upsert: true }
  );
}

async function issueCertificate(studentId, courseId) {
  const existing = await Certificate.findOne({ student: studentId, course: courseId });
  if (existing) return existing;
  const code = `CM-${new Date().getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  return Certificate.create({ student: studentId, course: courseId, code });
}

// Records that a student read a module (kind "theory").
// A module is complete once it is marked as read; the course is complete when all modules are.
async function recordModuleProgress({ userId, course, moduleId, kind }) {
  const enrollment = await Enrollment.findOne({ student: userId, course: course._id });
  if (!enrollment || enrollment.status === "withdrawn") {
    throw httpError(403, "Enroll in this course first");
  }
  const mod = (course.modules || []).find((m) => m.moduleId === moduleId);
  if (!mod) throw httpError(400, "Unknown module for this course");

  const totalLessons = sumLessons(course.modules) || course.lessons;
  let progress =
    (await LearningProgress.findOne({ student: userId, course: course._id })) ||
    new LearningProgress({ student: userId, course: course._id });

  const moduleProgress = { ...(progress.moduleProgress || {}) };
  const completed = [...(progress.completedModules || [])];
  const current = { photo: false, video: false, theory: false, ...(moduleProgress[moduleId] || {}) };

  if (completed.includes(moduleId) || current[kind]) {
    return { progress, enrollment, moduleDone: false, courseDone: false, changed: false };
  }

  current[kind] = true;
  moduleProgress[moduleId] = current;
  const moduleDone = !!current.theory; // text-only modules: done once the student marks it as read
  if (moduleDone) completed.push(moduleId);

  const courseDone = completed.length >= course.modules.length;
  const completedLessons = course.modules
    .filter((m) => completed.includes(m.moduleId))
    .reduce((s, m) => s + m.lessons, 0);
  const percent = courseDone
    ? 100
    : totalLessons
    ? Math.min(99, Math.round((completedLessons / totalLessons) * 100))
    : 0;

  progress.set({
    moduleProgress,
    completedModules: completed,
    completedLessons,
    totalLessons,
    progressPercentage: percent,
    lastActiveAt: new Date()
  });
  progress.markModified("moduleProgress");
  await progress.save();
  await logActivity(userId, 0.5);

  let certificate = null;
  if (moduleDone) {
    await safeNotify(userId, `You completed ${mod.title} in ${course.title}.`);
    if (courseDone) {
      enrollment.status = "completed";
      await enrollment.save();
      certificate = await issueCertificate(userId, course._id);
      await safeNotify(userId, `Certificate issued for ${course.title}`);
    }
  }
  emitAdmins("data_changed", { type: "progress" });
  return { progress, enrollment, moduleDone, courseDone, certificate, changed: true };
}

module.exports = { recordModuleProgress, issueCertificate, logActivity };
