import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as api from '../services/api.js';
import { Banner, FormField } from '../components/FormField.jsx';
import { PASSWORD_HINT, isValidPassword } from '../utils/validation.js';
import { errMsg } from '../utils/ui.js';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const nav = useNavigate();
  const [pw, setPw] = useState('');
  const [cpw, setCpw] = useState('');
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState({ type: 'ok', message: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!isValidPassword(pw)) er.pw = 'Password must be at least 12 characters.';
    if (pw !== cpw) er.cpw = "Passwords don't match.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      await api.resetPassword(token, pw);
      setBanner({ type: 'ok', message: 'Password reset! Redirecting to sign in…' });
      setTimeout(() => nav('/student-login'), 1400);
    } catch (err) {
      setBanner({ type: 'bad', message: errMsg(err) });
      setBusy(false);
    }
  };

  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-badge" style={{ margin: '0 auto 10px' }}>🔒</div>
          <h2>Reset Password</h2>
          <p>Enter your new password below</p>
        </div>
        {!token ? (
          <>
            <Banner type="bad" message="This reset link is missing its token. Request a new one." />
            <Link to="/forgot-password" className="btn btn-primary btn-block">Request a reset link</Link>
          </>
        ) : (
          <>
            <Banner type={banner.type} message={banner.message} />
            <form onSubmit={submit} noValidate>
              <FormField label="New Password" htmlFor="pw" error={errors.pw} hint={PASSWORD_HINT}>
                <input id="pw" type="password" autoComplete="new-password" placeholder="At least 12 characters" value={pw} onChange={(e) => setPw(e.target.value)} />
              </FormField>
              <FormField label="Confirm New Password" htmlFor="cpw" error={errors.cpw}>
                <input id="cpw" type="password" autoComplete="new-password" placeholder="Re-enter password" value={cpw} onChange={(e) => setCpw(e.target.value)} />
              </FormField>
              <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Saving…' : 'Reset Password'}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
