import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Banner } from '../components/FormField';
import { validateResetForm } from '../utils/validation';
import { getResetTarget, clearResetTarget } from '../utils/api';
import { saveAdminCreds, getUsers, saveUsers } from '../utils/auth';

export default function ResetPassword() {
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const target = getResetTarget();

  function handleSubmit(e) {
    e.preventDefault();
    const { valid, errors: errs } = validateResetForm({ password: newPw, confirmPassword: confirmPw });
    setErrors(errs);
    if (!valid) return;

    if (target.role === 'admin') {
      saveAdminCreds({ id: target.id, password: newPw });
    } else {
      saveUsers(getUsers().map(u => (u.email === target.id ? { ...u, password: newPw } : u)));
    }
    clearResetTarget();
    setBanner({ type: 'ok', text: '✅ Password reset! Redirecting to sign in…' });
    setDone(true);
    setTimeout(() => navigate(target.role === 'admin' ? '/admin-login' : '/student-login'), 1400);
  }

  return (
    <>
      <Navbar variant="simple" />
      <div className="page-center">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-badge" style={{ fontSize: 18 }}>🔒</div>
            <h2>Reset Password</h2>
            <p>Create a strong new password for your account</p>
          </div>

          {!target ? (
            <Banner message="No password reset request found. Please start from Forgot Password." type="bad" />
          ) : (
            <>
              <Banner message={banner?.text} type={banner?.type} />
              {!done && (
                <form onSubmit={handleSubmit} noValidate>
                  <div className={`field${errors.password ? ' has-error' : ''}`} id="field-pw">
                    <label>New Password</label>
                    <input type="password" className={errors.password ? 'invalid' : ''} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="At least 6 characters" />
                    <p className="hint">Use 6+ characters.</p>
                    <p className="error-msg">Password must be at least 6 characters.</p>
                  </div>
                  <div className={`field${errors.confirmPassword ? ' has-error' : ''}`} id="field-cpw">
                    <label>Confirm New Password</label>
                    <input type="password" className={errors.confirmPassword ? 'invalid' : ''} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter your new password" />
                    <p className="error-msg">Passwords don't match.</p>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">Reset Password</button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
