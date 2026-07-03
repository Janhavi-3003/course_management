/* =========================================================
   StudySync — form logic
   Mock auth using localStorage so the flow is fully testable
   without a backend. Swap the storage calls for real API
   requests when you wire this up to a server.
   ========================================================= */

const STORAGE_KEY = 'studysync_users';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function showBanner(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.className = 'banner show ' + type;
}

function setFieldError(fieldEl, isError) {
  if (!fieldEl) return;
  fieldEl.classList.toggle('has-error', isError);
  const input = fieldEl.querySelector('input');
  if (input) input.classList.toggle('invalid', isError);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPassword(value) {
  return value.length >= 8 && /\d/.test(value);
}

/* ---------------------------------------------------------
   Student registration
   --------------------------------------------------------- */
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const rollNo = document.getElementById('rollNo');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const banner = document.getElementById('reg-banner');

    let valid = true;

    setFieldError(document.getElementById('field-name'), false);
    setFieldError(document.getElementById('field-email'), false);
    setFieldError(document.getElementById('field-roll'), false);
    setFieldError(document.getElementById('field-password'), false);
    setFieldError(document.getElementById('field-confirm'), false);
    banner.classList.remove('show');

    if (fullName.value.trim().length < 2) {
      setFieldError(document.getElementById('field-name'), true);
      valid = false;
    }
    if (!isValidEmail(email.value.trim())) {
      setFieldError(document.getElementById('field-email'), true);
      valid = false;
    }
    if (rollNo.value.trim().length < 2) {
      setFieldError(document.getElementById('field-roll'), true);
      valid = false;
    }
    if (!isValidPassword(password.value)) {
      setFieldError(document.getElementById('field-password'), true);
      valid = false;
    }
    if (confirmPassword.value !== password.value || confirmPassword.value === '') {
      setFieldError(document.getElementById('field-confirm'), true);
      valid = false;
    }

    if (!valid) {
      showBanner(banner, 'Please fix the highlighted fields.', 'bad');
      return;
    }

    const users = getUsers();
    const exists = users.some(u => u.email.toLowerCase() === email.value.trim().toLowerCase());
    if (exists) {
      setFieldError(document.getElementById('field-email'), true);
      showBanner(banner, 'An account with this email already exists.', 'bad');
      return;
    }

    users.push({
      fullName: fullName.value.trim(),
      email: email.value.trim(),
      rollNo: rollNo.value.trim(),
      password: password.value, // demo only — never store plaintext passwords in production
    });
    saveUsers(users);

    showBanner(banner, 'Account created. Redirecting to sign in…', 'ok');
    const submitBtn = document.getElementById('reg-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Account created ✓';

    setTimeout(() => {
      window.location.href = 'student-login.html';
    }, 1100);
  });
}

/* ---------------------------------------------------------
   Student login
   --------------------------------------------------------- */
const studentLoginForm = document.getElementById('student-login-form');
if (studentLoginForm) {
  studentLoginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const banner = document.getElementById('login-banner');

    setFieldError(document.getElementById('field-email'), false);
    setFieldError(document.getElementById('field-password'), false);
    banner.classList.remove('show');

    let valid = true;
    if (!isValidEmail(email.value.trim())) {
      setFieldError(document.getElementById('field-email'), true);
      valid = false;
    }
    if (password.value.length === 0) {
      setFieldError(document.getElementById('field-password'), true);
      valid = false;
    }
    if (!valid) {
      showBanner(banner, 'Enter a valid email and password.', 'bad');
      return;
    }

    const users = getUsers();
    const match = users.find(
      u => u.email.toLowerCase() === email.value.trim().toLowerCase() && u.password === password.value
    );

    if (!match) {
      showBanner(banner, 'Incorrect email or password.', 'bad');
      setFieldError(document.getElementById('field-password'), true);
      return;
    }

    showBanner(banner, 'Signed in. Redirecting…', 'ok');
    const submitBtn = document.getElementById('login-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signed in ✓';

    // Replace this with a real redirect to the student dashboard
    setTimeout(() => {
      alert('Welcome back, ' + match.fullName + '! (Connect this to your student dashboard.)');
    }, 600);
  });
}

/* ---------------------------------------------------------
   Admin login (demo credential check)
   --------------------------------------------------------- */
const adminLoginForm = document.getElementById('admin-login-form');
if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const adminId = document.getElementById('adminId');
    const password = document.getElementById('password');
    const banner = document.getElementById('login-banner');

    setFieldError(document.getElementById('field-adminId'), false);
    setFieldError(document.getElementById('field-password'), false);
    banner.classList.remove('show');

    let valid = true;
    if (adminId.value.trim().length < 3) {
      setFieldError(document.getElementById('field-adminId'), true);
      valid = false;
    }
    if (password.value.length === 0) {
      setFieldError(document.getElementById('field-password'), true);
      valid = false;
    }
    if (!valid) {
      showBanner(banner, 'Enter a valid admin ID and password.', 'bad');
      return;
    }

    // Demo-only check. Replace with a real server-side auth call.
    const DEMO_ADMIN = { id: 'ADM-1042', password: 'admin1234' };
    if (adminId.value.trim() !== DEMO_ADMIN.id || password.value !== DEMO_ADMIN.password) {
      showBanner(banner, 'Incorrect admin ID or password.', 'bad');
      setFieldError(document.getElementById('field-password'), true);
      return;
    }

    showBanner(banner, 'Signed in. Redirecting…', 'ok');
    const submitBtn = document.getElementById('login-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signed in ✓';

    setTimeout(() => {
      alert('Welcome, admin. (Connect this to your admin dashboard.)');
    }, 600);
  });
}
