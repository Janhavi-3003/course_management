import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Banner, FormField } from '../components/FormField.jsx';
import { validateLogin } from '../utils/validation.js';
import { errMsg } from '../utils/ui.js';

export default function StudentLogin() {
  const { studentLogin } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [v, setV] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState({ type: 'bad', message: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const er = validateLogin(v);
    setErrors(er);
    if (Object.keys(er).length) { setBanner({ type: 'bad', message: 'Enter a valid email and password.' }); return; }
    setBusy(true);
    setBanner({ type: 'bad', message: '' });
    try {
      const user = await studentLogin(v.email, v.password);
      if (user.role !== 'student') throw new Error('Please use the Admin login for admin accounts.');
      setBanner({ type: 'ok', message: 'Signed in. Redirecting…' });
      nav(loc.state?.from || '/student-dashboard', { replace: true });
    } catch (err) {
      setBanner({ type: 'bad', message: errMsg(err) === 'Invalid credentials' ? 'Incorrect email or password.' : errMsg(err) });
      setErrors({ password: 'Check your password.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-badge" style={{ margin: '0 auto 10px' }}>C</div>
          <h2>Student Login</h2>
          <p>Welcome back — continue exploring your courses</p>
        </div>
        <Banner type={banner.type} message={banner.message} />
        <form onSubmit={submit} noValidate>
          <FormField label="Email Address" htmlFor="email" error={errors.email}>
            <input id="email" type="email" autoComplete="email" placeholder="you@school.edu" className={errors.email ? 'invalid' : ''}
              value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
          </FormField>
          <FormField label="Password" htmlFor="password" error={errors.password}>
            <input id="password" type="password" autoComplete="current-password" placeholder="Your password" className={errors.password ? 'invalid' : ''}
              value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} />
          </FormField>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button>
        </form>
        <p className="form-foot"><Link to="/forgot-password">Forgot password?</Link></p>
        <p className="form-foot">New here? <Link to="/student-register">Create an account</Link></p>
      </div>
    </div>
  );
}
