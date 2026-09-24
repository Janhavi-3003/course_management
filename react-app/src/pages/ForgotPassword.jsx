import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Banner } from '../components/FormField';
import { getAdminCreds, getUsers } from '../utils/auth';
import { setResetTarget } from '../utils/api';

export default function ForgotPassword() {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [banner, setBanner] = useState(null);
  const [verified, setVerified] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError(false);
    const val = value.trim();
    if (val.length < 3) { setError(true); return; }

    const creds = getAdminCreds();
    let target = null;
    if (val.toLowerCase() === creds.id.toLowerCase()) target = { role: 'admin', id: creds.id };
    else {
      const u = getUsers().find(u => u.email.toLowerCase() === val.toLowerCase());
      if (u) target = { role: 'student', id: u.email };
    }

    if (!target) {
      setBanner({ type: 'bad', text: 'No account found with that ID. Please check and try again.' });
      return;
    }

    setResetTarget(target);
    setBanner({ type: 'ok', text: '✅ Verified! Click below to set a new password.' });
    setVerified(true);
  }

  return (
    <>
      <Navbar variant="back" backTo="/student-login" backLabel="← Sign In" />
      <div className="page-center">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-badge" style={{ fontSize: 18 }}>🔑</div>
            <h2>Forgot Password?</h2>
            <p>Enter your Student ID or Admin ID to continue</p>
          </div>

          <Banner message={banner?.text} type={banner?.type} />

          {!verified && (
            <form onSubmit={handleSubmit} noValidate>
              <div className={`field${error ? ' has-error' : ''}`} id="field-fp-email">
                <label htmlFor="fp-email">Email / Student ID / Admin ID</label>
                <input type="text" id="fp-email" className={error ? 'invalid' : ''} value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. jan2027@stu or jan@admin3003" />
                <p className="error-msg">Enter your registered email, student ID or admin ID.</p>
              </div>
              <button type="submit" className="btn btn-primary btn-block">Verify &amp; Continue</button>
            </form>
          )}

          {verified && (
            <Link to="/reset-password" className="btn btn-primary btn-block" style={{ marginTop: 4 }}>Set New Password →</Link>
          )}

          <p className="form-foot" style={{ marginTop: 16 }}>
            Remembered it? <Link to="/student-login">Back to Sign In</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
