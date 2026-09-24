import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Banner } from '../components/FormField';
import { validateLoginForm } from '../utils/validation';
import { loginAdmin } from '../utils/auth';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { refresh } = useAuth();

  function handleSubmit(e) {
    e.preventDefault();
    const { valid, errors: errs } = validateLoginForm({ id: adminId, password });
    setErrors({ adminId: errs.id, password: errs.password });
    if (!valid) { setBanner({ type: 'bad', text: 'Enter your admin ID and password.' }); return; }

    const ok = loginAdmin(adminId, password);
    if (!ok) {
      setBanner({ type: 'bad', text: 'Incorrect admin ID or password.' });
      setErrors(e => ({ ...e, password: true }));
      return;
    }
    refresh();
    setBanner({ type: 'ok', text: 'Signed in as Admin. Redirecting…' });
    setSubmitted(true);
    setTimeout(() => navigate('/admin-dashboard'), 900);
  }

  return (
    <>
      <Navbar variant="back" backTo="/role" backLabel="← Back" />
      <div className="page-center">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-badge">🛡️</div>
            <h2>Admin Login</h2>
            <p>Manage courses, enrollments &amp; students</p>
          </div>

          <Banner message={banner?.text} type={banner?.type} />

          <form onSubmit={handleSubmit} noValidate>
            <div className={`field${errors.adminId ? ' has-error' : ''}`} id="field-adminId">
              <label htmlFor="adminId">Admin ID</label>
              <input type="text" id="adminId" className={errors.adminId ? 'invalid' : ''} value={adminId} onChange={e => setAdminId(e.target.value)} placeholder="e.g. jan@admin3003" />
              <p className="error-msg">Enter your admin ID.</p>
            </div>

            <div className={`field${errors.password ? ' has-error' : ''}`} id="field-password">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" className={errors.password ? 'invalid' : ''} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" placeholder="Your admin password" />
              <p className="error-msg">Enter your password.</p>
            </div>

            <div style={{ textAlign: 'right', marginTop: -10, marginBottom: 16 }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--primary)' }}>Forgot password?</Link>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitted}>
              {submitted ? 'Signed in ✓' : 'Sign In as Admin'}
            </button>
          </form>

          <p className="form-foot">Not an admin? <Link to="/student-login">Student login</Link></p>
        </div>
      </div>
      <Footer />
    </>
  );
}
