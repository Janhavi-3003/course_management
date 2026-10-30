const Course = require("../models/Course");
const LearningProgress = require("../models/LearningProgress");
const enrollmentView = require("../utils/enrollmentView");
const ser = require("../utils/serialize");
const { recordModuleProgress } = require("../services/progressService");

async function getMyProgress(req, res, next) {
  try {
    const progress = await LearningProgress.find({ student: req.user.sub }).lean();
    res.json({ progress: ser(progress) });
  } catch (error) {
    next(error);
  }
}

async function updateModuleProgress(req, res, next) {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    const result = await recordModuleProgress({
      userId: req.user.sub,
      course,
      moduleId: req.body.moduleId,
      kind: req.body.kind
    });
    res.json({
      message: result.changed ? "Progress saved" : "Already recorded",
      enrollment: enrollmentView(result.enrollment, result.progress),
      moduleDone: result.moduleDone,
      courseDone: result.courseDone,
      certificate: result.certificate ? ser(result.certificate) : null
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getMyProgress, updateModuleProgress };
