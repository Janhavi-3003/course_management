const ser = require("./serialize");
const { statusFromPercent } = require("./progressStatus");

// Combines an Enrollment with its LearningProgress into the shape the frontend uses.
function enrollmentView(enrollment, progress) {
  const e = ser(enrollment);
  const p = progress ? ser(progress) : null;
  const pct = p ? p.progressPercentage : 0;
  const courseObj = e.course && typeof e.course === "object" ? e.course : null;
  const studentObj = e.student && typeof e.student === "object" ? e.student : null;
  return {
    id: e.id,
    studentId: studentObj ? studentObj.id : e.student,
    courseId: courseObj ? courseObj.id : e.course,
    enrollmentStatus: e.status,
    progress: pct,
    status: statusFromPercent(pct),
    completedModules: p ? p.completedModules : [],
    moduleProgress: p ? p.moduleProgress : {},
    completedLessons: p ? p.completedLessons : 0,
    totalLessons: p ? p.totalLessons : 0,
    enrolledAt: e.enrolledAt,
    lastActive: (p && p.lastActiveAt) || e.updatedAt,
    ...(studentObj ? { student: { id: studentObj.id, name: studentObj.name, email: studentObj.email, rollNo: studentObj.rollNo } } : {}),
    ...(courseObj ? { course: { id: courseObj.id, title: courseObj.title } } : {})
  };
}
module.exports = enrollmentView;
