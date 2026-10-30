import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import PageLayout from '../components/PageLayout.jsx';
import { Empty } from '../components/Async.jsx';
import { notifIcon, timeAgo } from '../utils/ui.js';

export default function Notifications() {
  const { role } = useAuth();
  const { notifications, unread, markRead, markAllRead } = useData();
  return (
    <PageLayout role={role}>
      <div style={{ maxWidth: 720 }}>
        <div className="section-head">
          <h1 style={{ fontSize: 22 }}>Notifications {unread > 0 && <span className="pill pill-primary" style={{ marginLeft: 8 }}>{unread} new</span>}</h1>
          <button className="btn btn-ghost btn-sm" onClick={markAllRead} disabled={unread === 0}>Mark all read</button>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {notifications.length === 0 ? <Empty icon="🔔" title="No notifications yet">We'll let you know when something happens.</Empty> : notifications.map((n) => (
            <div key={n.id} className={`notif-item${n.isRead ? '' : ' unread'}`} style={{ cursor: n.isRead ? 'default' : 'pointer' }} onClick={() => !n.isRead && markRead(n.id)} data-testid="notification">
              <div className={`notif-dot${n.isRead ? ' read' : ''}`} />
              <div>
                <div className="notif-text">{notifIcon(n.message)} {n.message}</div>
                <div className="notif-time">{timeAgo(n.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
