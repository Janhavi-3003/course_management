import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const studentLinks = [
  { to: '/student-dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/browse-courses', icon: '📚', label: 'Browse Courses' },
  { to: '/my-courses', icon: '📖', label: 'My Courses' },
  { to: '/progress', icon: '📊', label: 'Progress' },
];
const adminLinks = [
  { to: '/admin-dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/browse-courses', icon: '📚', label: 'Manage Courses' },
  { to: '/add-course', icon: '➕', label: 'Add Course' },
];

export default function Sidebar({ role = 'student' }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const links = role === 'admin' ? adminLinks : studentLinks;

  function handleSignOut() {
    signOut();
    navigate('/');
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-label">{role === 'admin' ? 'Admin' : 'Main'}</div>
      {links.map(l => (
        <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
          <span className="s-icon">{l.icon}</span> {l.label}
        </NavLink>
      ))}
      {role === 'student' && (
        <>
          <div className="sidebar-label">Account</div>
          <NavLink to="/notifications"><span className="s-icon">🔔</span> Notifications</NavLink>
        </>
      )}
      {role === 'admin' && <div className="sidebar-label">Account</div>}
      <a onClick={handleSignOut} style={{ cursor: 'pointer' }}><span className="s-icon">🚪</span> Sign Out</a>
    </aside>
  );
}
