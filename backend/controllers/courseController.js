const Course = require("../models/Course");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const LearningProgress = require("../models/LearningProgress");
const Certificate = require("../models/Certificate");
const ser = require("../utils/serialize");
const { escapeRegex } = require("../utils/sanitize");
const { generateModules, rescaleModules, sumLessons } = require("../utils/modules");
const { notifyMany, emitAdmins } = require("../services/notificationService");

const FIELDS = ["title", "description", "duration", "category", "level", "instructor", "price", "lessons", "rating", "emoji", "modules"];
const pick = (obj) => Object.fromEntries(FIELDS.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

async function getAllCourses(req, res, next) {
  try {
    const { q, category, level, free } = req.query;
    const filter = {};
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ title: rx }, { instructor: rx }, { description: rx }];
    }
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (free === "true") filter.price = 0;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 100));
    const [courses, total] = await Promise.all([
      Course.find(filter).sort({ createdAt: 1, _id: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Course.countDocuments(filter)
    ]);
    res.json({ courses: ser(courses), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
}

async function getCourseById(req, res, next) {
  try {
    const course = await Course.findById(req.params.id).lean();
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ course: ser(course) });
  } catch (error) {
    next(error);
  }
}

async function createCourse(req, res, next) {
  try {
    const data = pick(req.body);
    if (!data.modules || !data.modules.length) {
      data.modules = generateModules(data.title, data.lessons || 10);
    }
    data.lessons = sumLessons(data.modules);
    const course = await Course.create(data);
    const students = await User.find({ role: "student" }).select("_id").lean();
    await notifyMany(students.map((s) => s._id), `New course available: ${course.title}`).catch(() => {});
    emitAdmins("data_changed", { type: "course" });
    res.status(201).json({ message: "Course created", course: ser(course) });
  } catch (error) {
    next(error);
  }
}

async function updateCourse(req, res, next) {
  try {
    const updates = pick(req.body);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields supplied" });
    }
    const existing = await Course.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Course not found" });
    if (updates.modules && updates.modules.length) {
      updates.lessons = sumLessons(updates.modules);
    } else if (updates.lessons !== undefined && updates.lessons !== sumLessons(existing.modules)) {
      updates.modules = rescaleModules(existing.modules, updates.lessons); // keeps module ids
    }
    const course = await Course.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    emitAdmins("data_changed", { type: "course" });
    res.json({ message: "Course updated", course: ser(course) });
  } catch (error) {
    next(error);
  }
}

async function deleteCourse(req, res, next) {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    await Promise.all([
      Enrollment.deleteMany({ course: course._id }),
      LearningProgress.deleteMany({ course: course._id }),
      Certificate.deleteMany({ course: course._id })
    ]);
    emitAdmins("data_changed", { type: "course" });
    res.json({ message: "Course deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };
