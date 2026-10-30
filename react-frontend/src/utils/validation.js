export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isValidPassword = (v) => v.length >= 12;
export const PASSWORD_HINT = 'Use at least 12 characters.';

export function validateRegister({ name, email, rollNo, password, confirm }) {
  const e = {};
  if (name.trim().length < 2) e.name = 'Enter your full name.';
  if (!isValidEmail(email.trim())) e.email = 'Enter a valid email address.';
  if (rollNo.trim().length < 2) e.rollNo = 'Enter your roll number or student ID.';
  if (!isValidPassword(password)) e.password = 'Password must be at least 12 characters.';
  if (confirm !== password || confirm === '') e.confirm = "Passwords don't match.";
  return e;
}

export function validateLogin({ email, password }) {
  const e = {};
  if (!isValidEmail(email.trim())) e.email = 'Enter the email you registered with.';
  if (!password) e.password = 'Enter your password.';
  return e;
}
