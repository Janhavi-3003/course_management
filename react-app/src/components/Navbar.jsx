import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initialsFor } from '../utils/ui';

/**
 * Reusable navbar. `variant`:
 *  - 'home'   : shows the Sign In dropdown (student/admin) when logged out
 *  - 'simple' : just the logo (auth pages)
 *  - 'back'   : logo + a back link
 *  - 'app'    : logo + notifications bell + avatar (logged-in app pages)
 */
export default function Navbar({ variant = 'app', backTo, backLabel = '← Back' }) {
  const { session, admin, signOut, unreadCount } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const loggedIn = !!(session || admin);

  function handleAvatarClick() {
    signOut();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="logo"><span className="logo-badge">C</span>Course Management</Link>

      {variant === 'back' && backTo && (
        <Link to={backTo} className="back-link">{backLabel}</Link>
      )}

      {(variant === 'app' || variant === 'home') && (
        <div className="navbar-right">
          {variant === 'app' && (
            <Link to="/notifications" className="nav-icon-btn">
              🔔<span className={`badge${unreadCount > 0 ? ' show' : ''}`}></span>
            </Link>
          )}

          {!loggedIn && variant === 'home' && (
            <div style={{ position: 'relative' }} ref={wrapRef}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="nav-link"
                style={{ cursor: 'pointer', background: 'none', border: '1px solid var(--border)', borderRadius: 20, padding: '8px 18px', fontWeight: 600, fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                Sign In <span style={{ fontSize: 10 }}>▾</span>
              </button>
              {dropdownOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#fff', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', minWidth: 190, overflow: 'hidden', zIndex: 200 }}>
                  <Link to="/student-login" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', fontSize: 14, fontWeight: 500, color: 'var(--text)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 20 }}>🎓</span><span>Student Login</span>
                  </Link>
                  <Link to="/admin-login" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', fontSize: 14, fontWeight: 500, color: 'var(--text)', textDecoration: 'none' }}>
                    <span style={{ fontSize: 20 }}>🛡️</span><span>Admin Login</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {loggedIn ? (
            <div
              className="avatar"
              title="Click to sign out"
              onClick={handleAvatarClick}
              style={{ display: 'flex' }}
            >
              {session ? initialsFor(session.fullName) : 'AD'}
            </div>
          ) : (
            variant === 'app' && <div className="avatar" style={{ display: 'none' }}></div>
          )}
        </div>
      )}
    </nav>
  );
}
