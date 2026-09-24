import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Banner } from '../components/FormField';
import { validateRegisterForm } from '../utils/validation';
import { registerStudent } from '../utils/auth';

export default function StudentRegister() {
  const [form, setForm] = useState({ fullName: '', email: '', rollNo: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  function update(field, value) { setForm(f => ({ ...f, [field]: value })); }

  function handleSubmit(e) {
    e.preventDefault();
    const { valid, errors: errs } = validateRegisterForm(form);
    setErrors(errs);
    if (!valid) { setBanner({ type: 'bad', text: 'Please fix the highlighted fields.' }); return; }

    const result = registerStudent(form);
    if (!result.ok) {
      setErrors(e => ({ ...e, email: true }));
      setBanner({ type: 'bad', text: result.error });
      return;
    }
    setBanner({ type: 'ok', text: 'Account created! Redirecting to sign in…' });
    setSubmitted(true);
    setTimeout(() => navigate('/student-login'), 1100);
  }

  return (
    <>
      <Navbar variant="back" backTo="/role" backLabel="← Back" />
      <div className="page-center">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-badge">C</div>
            <h2>Create Student Account</h2>
            <p>Sign up to start enrolling in courses</p>
          </div>

          <Banner message={banner?.text} type={banner?.type} />

          <form onSubmit={handleSubmit} noValidate>
            <div className={`field${errors.fullName ? ' has-error' : ''}`} id="field-name">
              <label htmlFor="fullName">Full Name</label>
              <input type="text" id="fullName" className={errors.fullName ? 'invalid' : ''} value={form.fullName} onChange={e => update('fullName', e.target.value)} autoComplete="name" placeholder="e.g. Asha Mehta" />
              <p className="error-msg">Enter your full name.</p>
            </div>

            <div className={`field${errors.email ? ' has-error' : ''}`} id="field-email">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" className={errors.email ? 'invalid' : ''} value={form.email} onChange={e => update('email', e.target.value)} autoComplete="email" placeholder="you@school.edu" />
              <p className="error-msg">Enter a valid email address.</p>
            </div>

            <div className={`field${errors.rollNo ? ' has-error' : ''}`} id="field-roll">
              <label htmlFor="rollNo">Roll Number / Student ID</label>
              <input type="text" id="rollNo" className={errors.rollNo ? 'invalid' : ''} value={form.rollNo} onChange={e => update('rollNo', e.target.value)} placeholder="e.g. CS21B045" />
              <p className="error-msg">Enter your roll number or student ID.</p>
            </div>

            <div className={`field${errors.password ? ' has-error' : ''}`} id="field-password">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" className={errors.password ? 'invalid' : ''} value={form.password} onChange={e => update('password', e.target.value)} autoComplete="new-password" placeholder="At least 6 characters" />
              <p className="hint">Use 6+ characters.</p>
              <p className="error-msg">Password must be at least 6 characters.</p>
            </div>

            <div className={`field${errors.confirmPassword ? ' has-error' : ''}`} id="field-confirm">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword" className={errors.confirmPassword ? 'invalid' : ''} value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} autoComplete="new-password" placeholder="Re-enter your password" />
              <p className="error-msg">Passwords don't match.</p>
            </div>

            <button type="submit" className="btn btn-solid btn-block" disabled={submitted}>
              {submitted ? 'Account created ✓' : 'Create Account'}
            </button>
          </form>

          <p className="form-foot">Already registered? <Link to="/student-login">Sign in</Link></p>
        </div>
      </div>
      <Footer />
    </>
  );
}
