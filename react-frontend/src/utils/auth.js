// Session storage helpers. sessionStorage is used for simplicity (per tab).
// Production designs should consider HttpOnly cookies + CSRF protection.
export function saveSession({ token, user }) {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('role', user.role);
  sessionStorage.setItem('user', JSON.stringify(user));
}

export function getSession() {
  const token = sessionStorage.getItem('token');
  if (!token) return null;
  try {
    return { token, role: sessionStorage.getItem('role'), user: JSON.parse(sessionStorage.getItem('user') || 'null') };
  } catch {
    return null;
  }
}

export function updateStoredUser(user) {
  sessionStorage.setItem('user', JSON.stringify(user));
}

export function clearSession() {
  ['token', 'role', 'user'].forEach((k) => sessionStorage.removeItem(k));
}

export const getToken = () => sessionStorage.getItem('token');
