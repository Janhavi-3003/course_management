// Data-access layer — courses, enrollments, notifications, certificates.
// All data is real and persisted in localStorage (ES6 module — Task 5).
import {
  COURSES_KEY, ENROLL_KEY, NOTIF_KEY, RESET_TARGET_KEY,
  COURSES_SCHEMA_KEY, COURSES_SCHEMA_VERSION,
  readJSON, writeJSON,
} from './storageKeys';
import { DEFAULT_STUDENT, DEFAULT_ADMIN, DEFAULT_COURSES, COURSE_MODULES } from '../data/courseData';
import { getUsers, saveUsers, saveAdminCreds } from './auth';
import { ADMIN_CREDS_KEY } from './storageKeys';

/* ───────────────────────── Seeding (runs once per schema version) ───────────────────────── */
export function seedDefaults() {
  const savedSchema = localStorage.getItem(COURSES_SCHEMA_KEY);
  if (!localStorage.getItem(ADMIN_CREDS_KEY) || savedSchema !== String(COURSES_SCHEMA_VERSION)) {
    saveAdminCreds(DEFAULT_ADMIN);
  }

  const users = getUsers();
  if (!users.some(u => u.email.toLowerCase() === DEFAULT_STUDENT.email)) {
    users.push(DEFAULT_STUDENT);
    saveUsers(users);
  }

  if (!localStorage.getItem(COURSES_KEY)) {
    const withIds = DEFAULT_COURSES.map((c, i) => ({ ...c, id: 'c' + (i + 1), modules: COURSE_MODULES[i] || [] }));
    saveCourses(withIds);
  } else if (savedSchema !== String(COURSES_SCHEMA_VERSION)) {
    const existing = getCourses();
    const refreshed = existing.map(c => {
      const m = /^c(\d+)$/.exec(c.id || '');
      const idx = m ? parseInt(m[1], 10) - 1 : -1;
      if (idx >= 0 && idx < COURSE_MODULES.length) return { ...c, modules: COURSE_MODULES[idx] };
      return c;
    });
    const existingTitles = new Set(refreshed.map(c => c.title));
    DEFAULT_COURSES.forEach((dc, i) => {
      if (!existingTitles.has(dc.title)) {
        refreshed.push({ ...dc, id: 'c' + (i + 1), modules: COURSE_MODULES[i] || [] });
      }
    });
    saveCourses(refreshed);
  }

  localStorage.setItem(COURSES_SCHEMA_KEY, String(COURSES_SCHEMA_VERSION));

  if (!localStorage.getItem(ENROLL_KEY)) writeJSON(ENROLL_KEY, {});
  if (!localStorage.getItem(NOTIF_KEY)) writeJSON(NOTIF_KEY, {});
}

/* ───────────────────────── Course CRUD ───────────────────────── */
export function getCourses() { return readJSON(COURSES_KEY, []); }
export function saveCourses(c) { writeJSON(COURSES_KEY, c); }
export function addCourse(course) {
  const c = getCourses();
  course.id = 'c' + Date.now();
  c.push(course);
  saveCourses(c);
  return course.id;
}
export function updateCourse(id, data) {
  saveCourses(getCourses().map(x => (x.id === id ? { ...x, ...data } : x)));
}
export function deleteCourse(id) {
  saveCourses(getCourses().filter(x => x.id !== id));
}
export function getCourseById(id) { return getCourses().find(x => x.id === id) || null; }

/* ───────────────────────── Enrollments ───────────────────────── */
export function getAllEnrollments() { return readJSON(ENROLL_KEY, {}); }
export function saveAllEnrollments(o) { writeJSON(ENROLL_KEY, o); }
export function getMyEnrollments(email) { return getAllEnrollments()[email] || []; }
export function getEnrollment(email, courseId) {
  return getMyEnrollments(email).find(e => e.courseId === courseId) || null;
}
export function isEnrolled(email, courseId) { return !!getEnrollment(email, courseId); }

export function enrollInCourse(email, courseId) {
  const all = getAllEnrollments();
  if (!all[email]) all[email] = [];
  if (all[email].some(e => e.courseId === courseId)) return;
  all[email].push({ courseId, progress: 0, enrolledAt: Date.now(), completedAt: null, completedModules: [], moduleState: {} });
  saveAllEnrollments(all);
  const course = getCourseById(courseId);
  addNotification(email, `✅ You enrolled in "${course ? course.title : 'a course'}"`);
}

/** Each module has 3 parts: viewed (photo), watched (video), read (theory).
 *  A module counts complete once all 3 are done. flag is 'viewed' | 'watched' | 'read'. */
export function setModulePartDone(email, courseId, moduleId, flag) {
  const all = getAllEnrollments();
  const list = all[email] || [];
  const rec = list.find(e => e.courseId === courseId);
  if (!rec) return;
  if (!rec.moduleState) rec.moduleState = {};
  if (!rec.completedModules) rec.completedModules = [];
  const state = rec.moduleState[moduleId] || { read: false, watched: false, viewed: false };
  state[flag] = true;
  rec.moduleState[moduleId] = state;

  const course = getCourseById(courseId);
  const totalModules = (course && course.modules ? course.modules.length : 0) || 1;
  const fullyDone = state.read && state.watched && state.viewed;
  if (fullyDone && !rec.completedModules.includes(moduleId)) {
    rec.completedModules.push(moduleId);
  }
  const wasComplete = rec.progress >= 100;
  rec.progress = Math.min(100, Math.round((rec.completedModules.length / totalModules) * 100));
  if (rec.progress >= 100 && !wasComplete) {
    rec.completedAt = Date.now();
    addNotification(email, `🏆 Congrats! You completed "${course ? course.title : 'a course'}"`);
  }
  saveAllEnrollments(all);
}

export function getModuleState(email, courseId, moduleId) {
  const rec = getEnrollment(email, courseId);
  return (rec && rec.moduleState && rec.moduleState[moduleId]) || { read: false, watched: false, viewed: false };
}

/** All students' progress across all courses — used by the admin dashboard. */
export function getAllProgressRecords() {
  const enrollments = getAllEnrollments();
  const users = getUsers();
  const records = [];
  Object.keys(enrollments).forEach(email => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    (enrollments[email] || []).forEach(e => {
      const course = getCourseById(e.courseId);
      if (!course) return;
      const totalModules = (course.modules || []).length;
      const doneModules = (e.completedModules || []).length;
      records.push({
        studentName: user ? user.fullName : email,
        studentEmail: email,
        courseTitle: course.title,
        progress: e.progress,
        doneModules, totalModules,
        completed: e.progress >= 100,
        enrolledAt: e.enrolledAt,
      });
    });
  });
  return records.sort((a, b) => b.enrolledAt - a.enrolledAt);
}

export function bumpProgress(email, courseId, amount) {
  const all = getAllEnrollments();
  const list = all[email] || [];
  const rec = list.find(e => e.courseId === courseId);
  if (!rec) return;
  const wasComplete = rec.progress >= 100;
  rec.progress = Math.min(100, rec.progress + amount);
  if (rec.progress >= 100 && !wasComplete) {
    rec.completedAt = Date.now();
    const course = getCourseById(courseId);
    addNotification(email, `🏆 Congrats! You completed "${course ? course.title : 'a course'}"`);
  }
  saveAllEnrollments(all);
}

/* ───────────────────────── Notifications ───────────────────────── */
export function getAllNotifications() { return readJSON(NOTIF_KEY, {}); }
export function saveAllNotifications(o) { writeJSON(NOTIF_KEY, o); }
export function getMyNotifications(email) {
  return (getAllNotifications()[email] || []).slice().sort((a, b) => b.time - a.time);
}
export function addNotification(email, text) {
  const all = getAllNotifications();
  if (!all[email]) all[email] = [];
  all[email].unshift({ text, time: Date.now() });
  saveAllNotifications(all);
}

/* ───────────────────────── Password reset target ───────────────────────── */
export function getResetTarget() { return readJSON(RESET_TARGET_KEY, null); }
export function setResetTarget(t) { writeJSON(RESET_TARGET_KEY, t); }
export function clearResetTarget() { localStorage.removeItem(RESET_TARGET_KEY); }
