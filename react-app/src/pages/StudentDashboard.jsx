import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';
import { getMyEnrollments, getCourseById } from '../utils/api';

export default function StudentDashboard() {
  const { session } = useAuth();
  const firstName = session.fullName.split(' ')[0];
  const my = getMyEnrollments(session.email);
  const completed = my.filter(e => e.completedAt).length;
  const hours = my.reduce((sum, e) => { const c = getCourseById(e.courseId); return sum + (c ? c.duration * e.progress / 100 : 0); }, 0);

  return (
    <>
      <Navbar variant="app" />
      <div className="layout">
        <Sidebar role="student" />
        <main className="main-content">
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22 }}>Good day, {firstName} 👋</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
              {my.length ? "Here's your learning overview." : "Here's your learning overview — it fills up once you enroll."}
            </p>
          </div>
          <div className="stats-grid">
            <div className="stat-card"><span className="stat-icon">📚</span><span className="stat-label">Enrolled Courses</span><span className="stat-val">{my.length}</span><span className="stat-sub" style={{ color: 'var(--text-muted)' }}>{my.length ? '' : 'No courses yet'}</span></div>
            <div className="stat-card"><span className="stat-icon">✅</span><span className="stat-label">Completed</span><span className="stat-val">{completed}</span><span className="stat-sub" style={{ color: 'var(--text-muted)' }}>—</span></div>
            <div className="stat-card"><span className="stat-icon">⏱️</span><span className="stat-label">Hours Learned</span><span className="stat-val">{hours.toFixed(1)}</span><span className="stat-sub" style={{ color: 'var(--text-muted)' }}>—</span></div>
            <div className="stat-card"><span className="stat-icon">🏆</span><span className="stat-label">Certificates</span><span className="stat-val">{completed}</span><span className="stat-sub" style={{ color: 'var(--text-muted)' }}>—</span></div>
          </div>

          {!my.length ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', marginBottom: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 14 }}>🎯</div>
              <h2 style={{ fontSize: 20, marginBottom: 8 }}>No courses enrolled yet</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 22 }}>Enroll in a course to start tracking your progress and completion rate here.</p>
              <Link to="/browse-courses" className="btn btn-primary">Browse Courses</Link>
            </div>
          ) : (
            <>
              <div className="section-head"><h2 style={{ fontSize: 18 }}>My Courses</h2><Link to="/my-courses" className="btn btn-ghost btn-sm">View All →</Link></div>
              <div className="courses-grid">
                {my.slice(0, 6).map(e => {
                  const c = getCourseById(e.courseId);
                  if (!c) return null;
                  const done = e.progress >= 100;
                  return (
                    <CourseCard
                      key={e.courseId}
                      course={c}
                      progress={{ percent: e.progress, statusLabel: done ? 'Completed ✓' : 'In Progress', ctaLabel: done ? 'View' : 'Resume', ctaTo: '/my-courses' }}
                    />
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
