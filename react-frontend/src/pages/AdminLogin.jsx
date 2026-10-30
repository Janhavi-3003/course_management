import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Banner, FormField } from '../components/FormField.jsx';
import { errMsg } from '../utils/ui.js';

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [v, setV] = useState({ adminId: '', password: '' });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState({ type: 'bad', message: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (v.adminId.trim().length < 3) er.adminId = 'Enter your admin ID.';
    if (!v.password) er.password = 'Enter your password.';
    setErrors(er);
    if (Object.keys(er).length) { setBanner({ type: 'bad', message: 'Enter a valid admin ID and password.' }); return; }
    setBusy(true);
    setBanner({ type: 'bad', message: '' });
    try {
      await adminLogin(v.adminId.trim(), v.password);
      nav(loc.state?.from || '/admin-dashboard', { replace: true });
    } catch (err) {
      setBanner({ type: 'bad', message: errMsg(err) === 'Invalid credentials' ? 'Incorrect admin ID or password.' : errMsg(err) });
      setErrors({ password: 'Check your password.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-badge" style={{ margin: '0 auto 10px' }}>🛡️</div>
          <h2>Admin Login</h2>
          <p>Manage courses, enrollments & students</p>
        </div>
        <Banner type={banner.type} message={banner.message} />
        <form onSubmit={submit} noValidate>
          <FormField label="Admin ID" htmlFor="adminId" error={errors.adminId}>
            <input id="adminId" placeholder="e.g. ADM-1042" value={v.adminId} onChange={(e) => setV({ ...v, adminId: e.target.value })} className={errors.adminId ? 'invalid' : ''} />
          </FormField>
          <FormField label="Password" htmlFor="password" error={errors.password}>
            <input id="password" type="password" autoComplete="current-password" placeholder="Your password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} className={errors.password ? 'invalid' : ''} />
          </FormField>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign In as Admin'}</button>
        </form>
        <p className="form-foot">Don't have admin access? Contact your institution.</p>
      </div>
    </div>
  );
}
