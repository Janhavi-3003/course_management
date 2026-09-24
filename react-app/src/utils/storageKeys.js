// Centralised localStorage keys — ported 1:1 from the original script.js.
export const USERS_KEY = 'cm_users';
export const SESSION_KEY = 'cm_session';
export const ADMIN_KEY = 'cm_admin';
export const ADMIN_CREDS_KEY = 'cm_admin_creds';
export const COURSES_KEY = 'cm_courses';
export const ENROLL_KEY = 'cm_enrollments';
export const NOTIF_KEY = 'cm_notifications';
export const RESET_TARGET_KEY = 'cm_reset_target';
export const COURSES_SCHEMA_KEY = 'cm_courses_schema_v';
export const COURSES_SCHEMA_VERSION = 4;

export function readJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v === null || v === undefined ? fallback : v;
  } catch (e) {
    return fallback;
  }
}

export function writeJSON(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}
