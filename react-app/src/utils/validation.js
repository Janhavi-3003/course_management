// Client-side validation helpers — ES6 module (Task 5).

export function isValidPassword(v) {
  return !!v && v.length >= 6;
}

export function isValidEmailLike(v) {
  return !!v && v.trim().length >= 3;
}

/** Validates the student registration form. Returns { valid, errors }. */
export function validateRegisterForm({ fullName, email, rollNo, password, confirmPassword }) {
  const errors = {};
  if (!fullName || fullName.trim().length < 2) errors.fullName = true;
  if (!email || email.trim().length < 3) errors.email = true;
  if (!rollNo || rollNo.trim().length < 2) errors.rollNo = true;
  if (!isValidPassword(password)) errors.password = true;
  if (!confirmPassword || confirmPassword !== password) errors.confirmPassword = true;
  return { valid: Object.keys(errors).length === 0, errors };
}

/** Validates the student/admin login form. Returns { valid, errors }. */
export function validateLoginForm({ id, password }) {
  const errors = {};
  if (!id || id.trim().length < 3) errors.id = true;
  if (!password) errors.password = true;
  return { valid: Object.keys(errors).length === 0, errors };
}

/** Validates the add/edit course form. Returns { valid, errors }. */
export function validateCourseForm({ title, category, description, instructor, level }) {
  const errors = {};
  if (!title || !title.trim()) errors.title = true;
  if (!category) errors.category = true;
  if (!description || !description.trim()) errors.description = true;
  if (!instructor || !instructor.trim()) errors.instructor = true;
  if (!level) errors.level = true;
  return { valid: Object.keys(errors).length === 0, errors };
}

/** Validates a new-password / confirm-password pair. Returns { valid, errors }. */
export function validateResetForm({ password, confirmPassword }) {
  const errors = {};
  if (!isValidPassword(password)) errors.password = true;
  if (password !== confirmPassword) errors.confirmPassword = true;
  return { valid: Object.keys(errors).length === 0, errors };
}
