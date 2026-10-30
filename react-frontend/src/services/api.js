// One interface, two back-ends:
//   VITE_API_MODE=real -> Express + MongoDB (default)
//   VITE_API_MODE=mock -> json-server mock API (npm run dev:mock)
import { API_MODE } from '../api/apiClient.js';
import * as real from './realApi.js';
import * as mock from './mockApi.js';

const impl = API_MODE === 'mock' ? mock : real;

export const isMock = API_MODE === 'mock';

export const login = (...a) => impl.login(...a);
export const adminLogin = (...a) => impl.adminLogin(...a);
export const register = (...a) => impl.register(...a);
export const forgotPassword = (...a) => impl.forgotPassword(...a);
export const resetPassword = (...a) => impl.resetPassword(...a);
export const getProfile = (...a) => impl.getProfile(...a);
export const updateProfile = (...a) => impl.updateProfile(...a);
export const getCourses = (...a) => impl.getCourses(...a);
export const getCourse = (...a) => impl.getCourse(...a);
export const addCourse = (...a) => impl.addCourse(...a);
export const updateCourse = (...a) => impl.updateCourse(...a);
export const deleteCourse = (...a) => impl.deleteCourse(...a);
export const getStudents = (...a) => impl.getStudents(...a);
export const deleteStudent = (...a) => impl.deleteStudent(...a);
export const getEnrollments = (...a) => impl.getEnrollments(...a);
export const enroll = (...a) => impl.enroll(...a);
export const withdraw = (...a) => impl.withdraw(...a);
export const recordProgress = (...a) => impl.recordProgress(...a);
export const getCertificates = (...a) => impl.getCertificates(...a);
export const getCertificate = (...a) => impl.getCertificate(...a);
export const getActivity = (...a) => impl.getActivity(...a);
export const getAdminStats = (...a) => impl.getAdminStats(...a);
export const getNotifications = (...a) => impl.getNotifications(...a);
export const markRead = (...a) => impl.markRead(...a);
export const markAllRead = (...a) => impl.markAllRead(...a);
export const getContacts = (...a) => impl.getContacts(...a);
export const getMessages = (...a) => impl.getMessages(...a);
