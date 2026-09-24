import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Banner } from '../components/FormField';
import { validateLoginForm } from '../utils/validation';
import { loginStudent } from '../utils/auth';
import { useAuth } from '../context/AuthContext';

export default function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { refresh } = useAuth();

  function handleSubmit(e) {
    e.preventDefault();
    const { valid, errors: errs } = validateLoginForm({ id: email, password });
    setErrors(errs);
    if (!valid) { setBanner({ type: 'bad', text: 'Enter your email/ID and password.' }); return; }

    const match = loginStudent(email, password);
    if (!match) {
      setBanner({ type: 'bad', text: 'Incorrect email/ID or password.' });
      setErrors({ password: true });
      return;
    }
    refresh();
    setBanner({ type: 'ok', text: `Welcome, ${match.fullName}! Redirecting…` });
    setSubmitted(true);
    setTimeout(() => navigate('/'), 900);
  }

  return (
    <>
      <Navbar variant="back" backTo="/role" backLabel="← Back" />
      <div className="page-center">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-badge">🎓</div>
            <h2>Student Login</h2>
            <p>Welcome back — continue your courses</p>
          </div>

          <Banner message={banner?.text} type={banner?.type} />

          <form onSubmit={handleSubmit} noValidate>
            <div className={`field${errors.id ? ' has-error' : ''}`} id="field-email">
              <label htmlFor="email">Email / Student ID</label>
              <input type="text" id="email" className={errors.id ? 'invalid' : ''} value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" placeholder="e.g. jan2027@stu" />
              <p className="error-msg">Enter your email or student ID.</p>
            </div>

            <div className={`field${errors.password ? ' has-error' : ''}`} id="field-password">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" className={errors.password ? 'invalid' : ''} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" placeholder="Your password" />
              <p className="error-msg">Enter your password.</p>
            </div>

            <div style={{ textAlign: 'right', marginTop: -10, marginBottom: 16 }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--primary)' }}>Forgot password?</Link>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitted}>
              {submitted ? 'Signed in ✓' : 'Sign In'}
            </button>
          </form>

          <p className="form-foot">New here? <Link to="/student-register">Create an account</Link></p>
        </div>
      </div>
      <Footer />
    </>
  );
}
