// Real API: Express + MongoDB backend (see backend/).
import apiClient from '../api/apiClient.js';

const d = (p) => p.then((r) => r.data);

// ---- auth ----
export const login = (email, password) =>
  d(apiClient.post('/auth/login', { email, password })).then((r) => ({ token: r.token, user: r.student }));
export const adminLogin = (adminId, password) =>
  d(apiClient.post('/auth/admin-login', { adminId, password })).then((r) => ({ token: r.token, user: r.student }));
export const register = (body) => d(apiClient.post('/auth/register', body));
export const forgotPassword = (email) => d(apiClient.post('/auth/forgot-password', { email }));
export const resetPassword = (token, password) => d(apiClient.post('/auth/reset-password', { token, password }));
export const getProfile = () => d(apiClient.get('/profile')).then((r) => r.user);
export const updateProfile = (body) => d(apiClient.put('/profile', body)).then((r) => r.user);

// ---- courses ----
export const getCourses = () => d(apiClient.get('/courses')).then((r) => r.courses);
export const getCourse = (id) => d(apiClient.get(`/courses/${id}`)).then((r) => r.course);
export const addCourse = (body) => d(apiClient.post('/courses', body)).then((r) => r.course);
export const updateCourse = (id, body) => d(apiClient.put(`/courses/${id}`, body)).then((r) => r.course);
export const deleteCourse = (id) => d(apiClient.delete(`/courses/${id}`));

// ---- students (admin) ----
export const getStudents = () => d(apiClient.get('/students')).then((r) => r.students);
export const deleteStudent = (id) => d(apiClient.delete(`/students/${id}`));

// ---- enrollments & progress ----
export const getEnrollments = () => d(apiClient.get('/enrollments')).then((r) => r.enrollments);
export const enroll = (courseId) => d(apiClient.post('/enrollments', { courseId })).then((r) => r.enrollment);
export const withdraw = (enrollmentId) => d(apiClient.delete(`/enrollments/${enrollmentId}`));
export const recordProgress = (courseId, { moduleId, kind }) =>
  d(apiClient.patch(`/progress/${courseId}/module`, { moduleId, kind }));

// ---- certificates / activity / stats ----
export const getCertificates = () => d(apiClient.get('/certificates')).then((r) => r.certificates);
export const getCertificate = (courseId) => d(apiClient.get(`/certificates/course/${courseId}`)).then((r) => r.certificate);
export const getActivity = () => d(apiClient.get('/activity', { params: { days: 30 } })).then((r) => r.activity);
export const getAdminStats = () => d(apiClient.get('/admin/stats')).then((r) => r.stats);

// ---- notifications ----
export const getNotifications = () => d(apiClient.get('/notifications')).then((r) => r.notifications);
export const markRead = (id) => d(apiClient.patch(`/notifications/${id}/read`));
export const markAllRead = () => d(apiClient.patch('/notifications/read-all'));

// ---- chat ----
export const getContacts = () => d(apiClient.get('/messages/contacts')).then((r) => r.contacts);
export const getMessages = (userId) => d(apiClient.get(`/messages/${userId}`)).then((r) => r.messages);
