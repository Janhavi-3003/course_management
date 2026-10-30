import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Banner, FormField } from '../components/FormField.jsx';
import { PASSWORD_HINT, validateRegister } from '../utils/validation.js';
import { errMsg } from '../utils/ui.js';

export default function StudentRegister() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [v, setV] = useState({ name: '', email: '', rollNo: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState({ type: 'bad', message: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const er = validateRegister(v);
    setErrors(er);
    if (Object.keys(er).length) { setBanner({ type: 'bad', message: 'Please fix the highlighted fields.' }); return; }
    setBusy(true);
    setBanner({ type: 'bad', message: '' });
    try {
      await register({ name: v.name.trim(), email: v.email.trim(), rollNo: v.rollNo.trim(), password: v.password });
      setBanner({ type: 'ok', message: 'Account created. Redirecting to sign in…' });
      setTimeout(() => nav('/student-login'), 1100);
    } catch (err) {
      const msg = errMsg(err);
      if (/already registered/i.test(msg)) setErrors({ email: 'This email is already registered.' });
      setBanner({ type: 'bad', message: msg });
      setBusy(false);
    }
  };

  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-badge" style={{ margin: '0 auto 10px' }}>C</div>
          <h2>Create Student Account</h2>
          <p>Sign up to start enrolling in courses</p>
        </div>
        <Banner type={banner.type} message={banner.message} />
        <form onSubmit={submit} noValidate>
          <FormField label="Full Name" htmlFor="name" error={errors.name}>
            <input id="name" autoComplete="name" placeholder="e.g. Asha Mehta" value={v.name} onChange={set('name')} className={errors.name ? 'invalid' : ''} />
          </FormField>
          <FormField label="Email Address" htmlFor="email" error={errors.email}>
            <input id="email" type="email" autoComplete="email" placeholder="you@school.edu" value={v.email} onChange={set('email')} className={errors.email ? 'invalid' : ''} />
          </FormField>
          <FormField label="Roll Number / Student ID" htmlFor="rollNo" error={errors.rollNo}>
            <input id="rollNo" placeholder="e.g. CS21B045" value={v.rollNo} onChange={set('rollNo')} className={errors.rollNo ? 'invalid' : ''} />
          </FormField>
          <FormField label="Password" htmlFor="password" error={errors.password} hint={PASSWORD_HINT}>
            <input id="password" type="password" autoComplete="new-password" placeholder="At least 12 characters" value={v.password} onChange={set('password')} className={errors.password ? 'invalid' : ''} />
          </FormField>
          <FormField label="Confirm Password" htmlFor="confirm" error={errors.confirm}>
            <input id="confirm" type="password" autoComplete="new-password" placeholder="Re-enter your password" value={v.confirm} onChange={set('confirm')} className={errors.confirm ? 'invalid' : ''} />
          </FormField>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating…' : 'Create Account'}</button>
        </form>
        <p className="form-foot">Already registered? <Link to="/student-login">Sign in</Link></p>
      </div>
    </div>
  );
}
