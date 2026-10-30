// Seeds sample courses (when empty), the admin account and optional demo data.
//   npm run seed          -> idempotent
//   npm run seed:reset    -> wipes all collections first (never in production)
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const LearningProgress = require("../models/LearningProgress");
const Certificate = require("../models/Certificate");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
const Activity = require("../models/Activity");
const courseData = require("./courseData");
const ensureAdmin = require("./createAdmin");
const { ymd } = require("../utils/dates");

const DEMO_STUDENTS = [
  { name: "Asha Mehta", email: "asha@school.edu", rollNo: "CS21B045", password: "asha-learn-2026" },
  { name: "Ravi Kumar", email: "ravi@school.edu", rollNo: "CS21B052", password: "ravi-learn-2026" }
];

async function seedCourses() {
  if ((await Course.countDocuments()) > 0) return 0;
  await Course.insertMany(courseData);
  console.log(`Seeded ${courseData.length} sample courses`);
  return courseData.length;
}

const daysAgo = (n, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d;
};

async function enrollDemo(student, course, doneCount, daysBack, partialExtra) {
  const mods = course.modules;
  const done = mods.slice(0, doneCount).map((m) => m.moduleId);
  const moduleProgress = {};
  done.forEach((id) => { moduleProgress[id] = { photo: true, video: true, theory: true }; });
  if (partialExtra) Object.assign(moduleProgress, partialExtra);
  const completedLessons = mods.filter((m) => done.includes(m.moduleId)).reduce((s, m) => s + m.lessons, 0);
  const totalLessons = mods.reduce((s, m) => s + m.lessons, 0);
  const complete = doneCount >= mods.length;
  await Enrollment.create({
    student: student._id, course: course._id,
    status: complete ? "completed" : "active",
    enrolledAt: daysAgo(daysBack)
  });
  await LearningProgress.create({
    student: student._id, course: course._id, completedLessons, totalLessons,
    progressPercentage: complete ? 100 : Math.min(99, Math.round((completedLessons / totalLessons) * 100)),
    completedModules: done, moduleProgress,
    lastActiveAt: daysAgo(Math.max(0, daysBack - 40))
  });
  if (complete) {
    await Certificate.create({
      student: student._id, course: course._id,
      code: `CM-2026-${course.title.replace(/[^A-Z]/g, "").slice(0, 4).padEnd(4, "X")}-${String(student._id).slice(-4).toUpperCase()}`,
      issuedAt: daysAgo(7)
    });
  }
}

async function seedDemo() {
  if (await User.exists({ email: DEMO_STUDENTS[0].email })) return false;
  const courses = await Course.find().sort({ createdAt: 1, _id: 1 });
  if (courses.length < 6) return false;

  const created = [];
  for (const s of DEMO_STUDENTS) {
    created.push(await User.create({ ...s, password: await bcrypt.hash(s.password, 12), role: "student" }));
  }
  const [ashaDoc, raviDoc] = created;

  // Asha: 6 enrollments with different progress
  const plan = [[0, 4, 60, { m5: { photo: true, video: false, theory: false } }], [1, 2, 50], [2, 4, 45], [3, 5, 80], [4, 5, 75], [5, 1, 3]];
  for (const [idx, done, back, extra] of plan) {
    await enrollDemo(ashaDoc, courses[idx], done, back, extra);
  }
  // Ravi: 2 enrollments
  await enrollDemo(raviDoc, courses[1], 3, 20);
  await enrollDemo(raviDoc, courses[3], 1, 8);

  // Daily learning hours (last 30 days, a few rest days)
  const rows = [];
  for (let i = 0; i < 30; i++) {
    if (i % 7 === 3) continue;
    const d = new Date(); d.setDate(d.getDate() - i);
    const hours = Math.round((0.6 + ((i * 37) % 28) / 10) * 10) / 10;
    rows.push({ student: ashaDoc._id, date: ymd(d), hours, createdAt: d, updatedAt: d });
  }
  await Activity.collection.insertMany(rows);

  const n = (msg, days, hour, read) => ({
    recipient: ashaDoc._id, message: msg, isRead: read, createdAt: daysAgo(days, hour), updatedAt: daysAgo(days, hour)
  });
  await Notification.collection.insertMany([
    n("You completed Module 4: React.js in Full Stack Web Development.", 0, 8, false),
    n("New course available: Machine Learning with Python", 0, 5, false),
    n("You're on a 5-day learning streak! Keep it going.", 0, 2, false),
    n("Certificate issued for React JS — From Zero to Hero", 1, 10, true),
    n("You enrolled in AWS Cloud Practitioner", 2, 10, true),
    n("Reminder: Complete UI/UX Design — you're 80% done!", 3, 10, true)
  ]);

  const m = (from, to, text, days, hour) => ({
    sender: from._id, recipient: to._id, text, createdAt: daysAgo(days, hour), updatedAt: daysAgo(days, hour)
  });
  await Message.collection.insertMany([
    m(raviDoc, ashaDoc, "Hi Asha! Did you finish the React module?", 1, 9),
    m(ashaDoc, raviDoc, "Yes! The hooks section was great. Are you on the Python course?", 1, 10),
    m(raviDoc, ashaDoc, "Yes, just started Pandas. Let's study together this week.", 1, 11)
  ]);
  console.log("Seeded demo students: asha@school.edu / asha-learn-2026 , ravi@school.edu / ravi-learn-2026");
  return true;
}

async function seedOnStartup() {
  await ensureAdmin();
  await seedCourses();
  if (process.env.SEED_DEMO === "true") await seedDemo();
}

module.exports = { seedOnStartup, seedCourses, seedDemo, DEMO_STUDENTS };

if (require.main === module) {
  require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
  const connectDB = require("../config/db");
  (async () => {
    try {
      await connectDB();
      if (process.argv.includes("--reset")) {
        if (process.env.NODE_ENV === "production") throw new Error("Refusing to reset a production database");
        await mongoose.connection.db.dropDatabase();
        console.log("Database cleared");
      }
      process.env.SEED_DEMO = process.env.SEED_DEMO || "true";
      await seedOnStartup();
      await connectDB.disconnectDB();
      process.exit(0);
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  })();
}
