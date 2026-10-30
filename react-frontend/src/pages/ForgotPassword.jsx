import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api.js';
import { Banner, FormField } from '../components/FormField.jsx';
import { isValidEmail } from '../utils/validation.js';
import { errMsg } from '../utils/ui.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [banner, setBanner] = useState({ type: 'ok', message: '' });
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email.trim())) { setError('Enter a valid email address.'); return; }
    setError(''); setBusy(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setBanner({ type: 'ok', message: res.message });
      setToken(res.resetToken || '');
    } catch (err) {
      setBanner({ type: 'bad', message: errMsg(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-badge" style={{ margin: '0 auto 10px' }}>🔑</div>
          <h2>Forgot Password?</h2>
          <p>Enter your email to generate a password reset link</p>
        </div>
        <Banner type={banner.type} message={banner.message} />
        {token && (
          <div className="card" style={{ marginBottom: 18, fontSize: 13 }}>
            <p style={{ marginBottom: 10 }}>No email service is configured in this demo, so your reset link is shown here (valid for 15 minutes):</p>
            <Link className="btn btn-success btn-block" to={`/reset-password?token=${encodeURIComponent(token)}`}>Open reset page</Link>
          </div>
        )}
        <form onSubmit={submit} noValidate>
          <FormField label="Email Address" htmlFor="email" error={error}>
            <input id="email" type="email" placeholder="you@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormField>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Please wait…' : 'Generate Reset Link'}</button>
        </form>
        <p className="form-foot"><Link to="/student-login">Back to Sign In</Link></p>
      </div>
    </div>
  );
}
