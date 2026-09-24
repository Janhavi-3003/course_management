import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { getMyEnrollments, getCourseById } from '../utils/api';

export default function ProgressPage() {
  const { session } = useAuth();
  const my = getMyEnrollments(session.email);

  return (
    <>
      <Navbar variant="app" />
      <div className="layout">
        <Sidebar role="student" />
        <main className="main-content">
          <div className="section-head"><h1 style={{ fontSize: 22 }}>My Progress</h1></div>

          {!my.length ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>Nothing to show yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Enroll in a course to see your progress breakdown here.</p>
              <Link to="/browse-courses" className="btn btn-primary">Browse Courses</Link>
            </div>
          ) : (
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 18 }}>📈 Progress by Course</h3>
              {my.map(e => {
                const c = getCourseById(e.courseId);
                if (!c) return null;
                const done = e.progress >= 100;
                return (
                  <div key={e.courseId} style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 6, gap: 10 }}>
                      <span>{c.emoji} {c.title}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{e.progress}%</span>
                        {done && <Link to={`/certificate/${c.id}`} className="btn btn-ghost btn-sm">🏆 Certificate</Link>}
                      </span>
                    </div>
                    <div className="progress-bar"><div className={`progress-fill${done ? ' green' : ''}`} style={{ width: `${e.progress}%` }}></div></div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
