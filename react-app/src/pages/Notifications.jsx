import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { getMyNotifications } from '../utils/api';
import { timeAgo } from '../utils/ui';

export default function Notifications() {
  const { session } = useAuth();
  const notifications = getMyNotifications(session.email);

  return (
    <>
      <Navbar variant="app" />
      <div className="layout">
        <Sidebar role="student" />
        <main className="main-content">
          <div className="section-head"><h1 style={{ fontSize: 22 }}>Notifications</h1></div>

          {!notifications.length ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>No notifications yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Enroll in courses and complete modules — updates will show up here.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {notifications.map((n, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '16px 20px', borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 14 }}>{n.text}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{timeAgo(n.time)}</span>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
