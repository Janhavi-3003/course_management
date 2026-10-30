import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useRealtime } from '../context/RealtimeContext.jsx';
import { initials } from '../utils/ui.js';

const AUTH_PAGES = ['/student-login', '/student-register', '/admin-login', '/forgot-password', '/reset-password', '/role'];

// Dynamic navigation: what you see depends on login status and role (Task 4)
export default function Navbar() {
  const { user, isStudent, isAdmin, logout } = useAuth();
  const { unread } = useData();
  const { connected, enabled } = useRealtime();
  const { pathname } = useLocation();
  const nav = useNavigate();
  const loggedIn = isStudent || isAdmin;

  const signOut = () => { logout(); nav('/'); };

  return (
    <nav className="navbar">
      <Link to="/" className="logo"><span className="logo-badge">C</span>Course Management</Link>
      <div className="navbar-right">
        {!loggedIn && AUTH_PAGES.includes(pathname) && <Link to="/" className="back-link">← Home</Link>}
        {loggedIn && enabled && (
          <span className={`live${connected ? ' on' : ''}`} title={connected ? 'Real-time connected' : 'Real-time offline'}>
            <i /> {connected ? 'Live' : 'Offline'}
          </span>
        )}
        {isStudent && (
          <>
            <Link to="/notifications" className="nav-icon-btn" title="Notifications" aria-label="Notifications">
              🔔{unread > 0 && <span className="badge" data-testid="unread-badge" />}
            </Link>
            <Link to="/my-courses" className="nav-link">My Courses</Link>
          </>
        )}
        {loggedIn && <Link to="/chat" className="nav-icon-btn" title="Chat" aria-label="Chat">💬</Link>}
        {loggedIn && (
          <>
            <Link to="/profile" className="avatar" title={user?.name}>{initials(user?.name)}</Link>
            <button className="btn btn-ghost btn-sm" onClick={signOut}>Sign Out</button>
          </>
        )}
        {!loggedIn && !AUTH_PAGES.includes(pathname) && (
          <>
            <Link to="/student-register" className="nav-link">Register</Link>
            <Link to="/role" className="nav-link">Sign In</Link>
          </>
        )}
      </div>
    </nav>
  );
}
