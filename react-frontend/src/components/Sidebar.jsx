import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Item = ({ to, icon, children }) => (
  <NavLink to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
    <span className="s-icon">{icon}</span> {children}
  </NavLink>
);

export default function Sidebar({ role }) {
  const { logout } = useAuth();
  const nav = useNavigate();
  const signOut = () => { logout(); nav('/'); };
  return (
    <aside className="sidebar">
      {role === 'admin' ? (
        <>
          <div className="sidebar-label">Admin</div>
          <Item to="/admin-dashboard" icon="🏠">Dashboard</Item>
          <Item to="/add-course" icon="➕">Add Course</Item>
          <Item to="/browse-courses" icon="📚">Course Catalog</Item>
          <Item to="/chat" icon="💬">Chat</Item>
        </>
      ) : (
        <>
          <div className="sidebar-label">Main</div>
          <Item to="/student-dashboard" icon="🏠">Dashboard</Item>
          <Item to="/browse-courses" icon="📚">Browse Courses</Item>
          <Item to="/my-courses" icon="📖">My Courses</Item>
          <Item to="/progress" icon="📊">Progress</Item>
          <div className="sidebar-label">Account</div>
          <Item to="/notifications" icon="🔔">Notifications</Item>
          <Item to="/chat" icon="💬">Chat</Item>
        </>
      )}
      <div className="sidebar-label">Account</div>
      <Item to="/profile" icon="👤">Profile</Item>
      <a onClick={signOut} style={{ cursor: 'pointer' }}><span className="s-icon">🚪</span> Sign Out</a>
    </aside>
  );
}
