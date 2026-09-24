// Reusable authentication + session functions — ES6 module (Task 5).
import {
  USERS_KEY, SESSION_KEY, ADMIN_KEY, ADMIN_CREDS_KEY,
  readJSON, writeJSON,
} from './storageKeys';
import { DEFAULT_ADMIN } from '../data/courseData';

export function getUsers() { return readJSON(USERS_KEY, []); }
export function saveUsers(u) { writeJSON(USERS_KEY, u); }

export function getSession() { return readJSON(SESSION_KEY, null); }
export function setSession(u) { writeJSON(SESSION_KEY, u); localStorage.removeItem(ADMIN_KEY); }
export function clearSession() { localStorage.removeItem(SESSION_KEY); localStorage.removeItem(ADMIN_KEY); }

export function isAdminIn() { return localStorage.getItem(ADMIN_KEY) === 'true'; }
export function setAdminIn() { localStorage.setItem(ADMIN_KEY, 'true'); localStorage.removeItem(SESSION_KEY); }

export function getAdminCreds() { return readJSON(ADMIN_CREDS_KEY, DEFAULT_ADMIN); }
export function saveAdminCreds(c) { writeJSON(ADMIN_CREDS_KEY, c); }

/** Registers a new student. Returns { ok, error }. */
export function registerStudent({ fullName, email, rollNo, password }) {
  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return { ok: false, error: 'An account with this email already exists.' };
  }
  users.push({ fullName: fullName.trim(), email: email.trim(), rollNo: rollNo.trim(), password });
  saveUsers(users);
  return { ok: true };
}

/** Logs a student in. Returns the matched user or null. */
export function loginStudent(email, password) {
  const match = getUsers().find(
    u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );
  if (match) setSession(match);
  return match || null;
}

/** Logs an admin in against stored (or default) admin credentials. */
export function loginAdmin(adminId, password) {
  const creds = getAdminCreds();
  if (adminId.trim() === creds.id && password === creds.password) {
    setAdminIn();
    return true;
  }
  return false;
}

export function signOut() {
  clearSession();
}
