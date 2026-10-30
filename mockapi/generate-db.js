// Builds db.json from the same course catalogue the real backend seeds.
const fs = require("fs");
const path = require("path");
const out = path.join(__dirname, "db.json");
if (process.argv.includes("--if-missing") && fs.existsSync(out)) process.exit(0);

const courses = require("../backend/scripts/courseData.js").map((c, i) => ({
  id: String(i + 1),
  ...c,
  lessons: c.modules.reduce((s, m) => s + m.lessons, 0)
}));

const db = {
  students: [
    { id: "1", name: "Asha Verma", email: "asha@school.edu", rollNo: "STU-001", password: "asha-learn-2026" },
    { id: "2", name: "Ravi Kumar", email: "ravi@school.edu", rollNo: "STU-002", password: "ravi-learn-2026" }
  ],
  admins: [
    { id: "100", name: "Course Admin", email: "admin@coursemanagement.com", adminId: "ADM-1042", password: "Admin@Course2026" }
  ],
  courses,
  enrollments: [],
  certificates: [],
  notifications: [],
  messages: [],
  activity: []
};
fs.writeFileSync(out, JSON.stringify(db, null, 2));
console.log(`db.json written (${courses.length} courses)`);
