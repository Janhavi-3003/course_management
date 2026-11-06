// Mock API (Task 7): json-server in ../mockapi. Same interface as realApi.js.
// Passwords are stored in plain text here — this is ONLY a development mock.
import axios from 'axios';
import { getSession, updateStoredUser } from '../utils/auth.js';
import { generateModules, ymd } from '../utils/ui.js';

const m = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001', timeout: 15000 });
const d = (p) => p.then((r) => r.data);
const err = (status, message) => Object.assign(new Error(message), { response: { status, data: { message } } });
const me = () => getSession()?.user;
const pub = ({ password, ...u }) => u;
const statusOf = (p) => (p >= 100 ? 'Completed' : p >= 80 ? 'Almost Done' : p <= 0 ? 'Not Started' : p <= 25 ? 'Just Started' : 'In Progress');
const norm = (x) => (x ? { ...x, id: String(x.id), _id: String(x.id) } : x);

// ---- auth ----
export const login = async (email, password) => {
  const rows = await d(m.get('/students', { params: { email: email.trim().toLowerCase() } }));
  const u = rows.find((s) => s.password === password);
  if (!u) throw err(401, 'Invalid credentials');
  return { token: `mock.${u.id}`, user: { ...pub(u), id: String(u.id), role: 'student' } };
};
export const adminLogin = async (adminId, password) => {
  const rows = await d(m.get('/admins', { params: { adminId: adminId.trim().toUpperCase() } }));
  const u = rows.find((s) => s.password === password);
  if (!u) throw err(401, 'Invalid credentials');
  return { token: `mock.${u.id}`, user: { ...pub(u), id: String(u.id), role: 'admin' } };
};
export const register = async (body) => {
  const email = body.email.trim().toLowerCase();
  if ((await d(m.get('/students', { params: { email } }))).length) throw err(409, 'Email already registered');
  await d(m.post('/students', { name: body.name, email, rollNo: body.rollNo, password: body.password }));
  return { message: 'Registration successful' };
};
export const forgotPassword = async (email) => {
  const rows = await d(m.get('/students', { params: { email: email.trim().toLowerCase() } }));
  return { message: 'If an account exists for that email, a password reset link has been generated.', ...(rows.length ? { resetToken: `mockreset.${rows[0].id}` } : {}) };
};
export const resetPassword = async (token, password) => {
  const id = String(token).split('.')[1];
  if (!String(token).startsWith('mockreset.') || !id) throw err(400, 'Reset link is invalid or has expired');
  await d(m.patch(`/students/${id}`, { password }));
  return { message: 'Password reset successful. You can sign in now.' };
};
export const getProfile = async () => pub(norm(await d(m.get(`/${me().role === 'admin' ? 'admins' : 'students'}/${me().id}`))));
export const updateProfile = async (body) => {
  const u = pub(norm(await d(m.patch(`/students/${me().id}`, body))));
  updateStoredUser({ ...me(), ...u });
  return u;
};

// ---- courses ----
export const getCourses = async () => (await d(m.get('/courses'))).map(norm);
export const getCourse = async (id) => {
  try { return norm(await d(m.get(`/courses/${id}`))); } catch (e) { throw err(404, 'Course not found'); }
};
export const addCourse = async (b) => {
  const modules = b.modules?.length ? b.modules : generateModules(b.title, b.lessons || 10);
  return norm(await d(m.post('/courses', { rating: 4.5, ...b, modules, lessons: modules.reduce((s, x) => s + x.lessons, 0) })));
};
export const updateCourse = async (id, b) => norm(await d(m.patch(`/courses/${id}`, b)));
export const deleteCourse = async (id) => {
  const enr = await d(m.get('/enrollments', { params: { courseId: String(id) } }));
  await Promise.all(enr.map((e) => m.delete(`/enrollments/${e.id}`)));
  await m.delete(`/courses/${id}`);
  return { message: 'Course deleted' };
};

// ---- students ----
export const getStudents = async () => (await d(m.get('/students'))).map((s) => norm(pub(s)));
export const deleteStudent = async (id) => {
  const enr = await d(m.get('/enrollments', { params: { studentId: String(id) } }));
  await Promise.all(enr.map((e) => m.delete(`/enrollments/${e.id}`)));
  await m.delete(`/students/${id}`);
  return { message: 'Student deleted' };
};

// ---- enrollments ----
export const getEnrollments = async () => {
  const u = me();
  if (u.role === 'admin') {
    const [enr, students, courses] = await Promise.all([d(m.get('/enrollments')), getStudents(), getCourses()]);
    return enr.filter((e) => e.enrollmentStatus !== 'withdrawn').map(norm).map((e) => ({
      ...e,
      student: students.find((s) => s.id === String(e.studentId)),
      course: courses.find((c) => c.id === String(e.courseId)),
    })).filter((e) => e.student && e.course);
  }
  const enr = await d(m.get('/enrollments', { params: { studentId: String(u.id) } }));
  return enr.filter((e) => e.enrollmentStatus !== 'withdrawn').map(norm);
};
export const enroll = async (courseId) => {
  const u = me();
  const found = (await d(m.get('/enrollments', { params: { studentId: String(u.id), courseId: String(courseId) } })))[0];
  if (found && found.enrollmentStatus !== 'withdrawn') throw err(409, 'You are already enrolled in this course');
  if (found) return norm(await d(m.patch(`/enrollments/${found.id}`, { enrollmentStatus: 'active' })));
  return norm(await d(m.post('/enrollments', {
    studentId: String(u.id), courseId: String(courseId), enrollmentStatus: 'active', progress: 0, status: 'Not Started',
    completedModules: [], moduleProgress: {}, completedLessons: 0, enrolledAt: new Date().toISOString(), lastActive: new Date().toISOString(),
  })));
};
export const withdraw = async (id) => { await d(m.patch(`/enrollments/${id}`, { enrollmentStatus: 'withdrawn' })); return { message: 'Enrollment withdrawn' }; };

const addNote = (recipient, message) => m.post('/notifications', { recipient: String(recipient), message, isRead: false, createdAt: new Date().toISOString() });

export const recordProgress = async (courseId, { moduleId, kind }) => {
  const u = me();
  const [course, enr] = await Promise.all([getCourse(courseId), d(m.get('/enrollments', { params: { studentId: String(u.id), courseId: String(courseId) } }))]);
  const e = enr[0];
  if (!e || e.enrollmentStatus === 'withdrawn') throw err(403, 'Enroll in this course first');
  const mod = course.modules.find((x) => x.moduleId === moduleId);
  if (!mod) throw err(400, 'Unknown module for this course');
  const mp = { ...(e.moduleProgress || {}) };
  const done = [...(e.completedModules || [])];
  const cur = { photo: false, video: false, theory: false, ...(mp[moduleId] || {}) };
  if (done.includes(moduleId) || cur[kind]) return { enrollment: norm(e), moduleDone: false, courseDone: false, certificate: null };
  cur[kind] = true; mp[moduleId] = cur;
  const moduleDone = !!cur.theory;
  if (moduleDone) done.push(moduleId);
  const courseDone = done.length >= course.modules.length;
  const total = course.modules.reduce((s, x) => s + x.lessons, 0);
  const lessonsDone = course.modules.filter((x) => done.includes(x.moduleId)).reduce((s, x) => s + x.lessons, 0);
  const progress = courseDone ? 100 : Math.min(99, Math.round((lessonsDone / total) * 100));
  const enrollment = norm(await d(m.patch(`/enrollments/${e.id}`, {
    moduleProgress: mp, completedModules: done, completedLessons: lessonsDone, totalLessons: total,
    progress, status: statusOf(progress), enrollmentStatus: courseDone ? 'completed' : 'active', lastActive: new Date().toISOString(),
  })));
  // daily activity
  const date = ymd();
  const act = (await d(m.get('/activity', { params: { studentId: String(u.id), date } })))[0];
  if (act) await m.patch(`/activity/${act.id}`, { hours: +(act.hours + 0.5).toFixed(1) });
  else await m.post('/activity', { studentId: String(u.id), date, hours: 0.5 });
  let certificate = null;
  if (moduleDone) {
    await addNote(u.id, `You completed ${mod.title} in ${course.title}.`);
    if (courseDone) {
      const ex = (await d(m.get('/certificates', { params: { studentId: String(u.id), courseId: String(courseId) } })))[0];
      certificate = ex || (await d(m.post('/certificates', { studentId: String(u.id), courseId: String(courseId), code: `CM-${new Date().getFullYear()}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`, issuedAt: new Date().toISOString() })));
      await addNote(u.id, `Certificate issued for ${course.title}`);
    }
  }
  return { enrollment, moduleDone, courseDone, certificate };
};

// ---- certificates / activity / stats ----
export const getCertificates = async () => (await d(m.get('/certificates', { params: { studentId: String(me().id) } }))).map(norm);
export const getCertificate = async (courseId) => {
  const c = (await d(m.get('/certificates', { params: { studentId: String(me().id), courseId: String(courseId) } })))[0];
  if (!c) throw err(404, 'Certificate not found. Complete the course to earn it.');
  const course = await getCourse(courseId);
  return { ...norm(c), student: { name: me().name }, course: { id: course.id, title: course.title, instructor: course.instructor, duration: course.duration } };
};
export const getActivity = async () => (await d(m.get('/activity', { params: { studentId: String(me().id) } }))).map(({ date, hours }) => ({ date, hours }));
export const getAdminStats = async () => {
  const [courses, students, enr, certs] = await Promise.all([getCourses(), getStudents(), d(m.get('/enrollments')), d(m.get('/certificates'))]);
  const active = enr.filter((e) => e.enrollmentStatus !== 'withdrawn');
  return { courses: courses.length, students: students.length, enrollments: active.length, completed: active.filter((e) => e.progress >= 100).length, certificates: certs.length };
};

// ---- notifications ----
export const getNotifications = async () =>
  (await d(m.get('/notifications', { params: { recipient: String(me().id) } }))).map(norm).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50);
export const markRead = async (id) => d(m.patch(`/notifications/${id}`, { isRead: true }));
export const markAllRead = async () => {
  const list = await getNotifications();
  await Promise.all(list.filter((n) => !n.isRead).map((n) => m.patch(`/notifications/${n.id}`, { isRead: true })));
  return { message: 'All notifications marked as read' };
};

// ---- chat (read-only history in mock mode; live chat needs the real backend) ----
export const getContacts = async () => {
  const [students, admins] = await Promise.all([d(m.get('/students')), d(m.get('/admins'))]);
  return [...students.map((s) => ({ id: String(s.id), name: s.name, role: 'student' })), ...admins.map((a) => ({ id: String(a.id), name: a.name, role: 'admin' }))].filter((c) => c.id !== String(me().id));
};
export const getMessages = async (userId) => {
  const all = await d(m.get('/messages'));
  const mine = String(me().id);
  return all.filter((x) => (x.sender === mine && x.recipient === String(userId)) || (x.sender === String(userId) && x.recipient === mine)).map(norm);
};
