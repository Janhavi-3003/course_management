import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';
import { getCourses, getCourseById, getMyEnrollments } from '../utils/api';

export default function Home() {
  const { session, admin } = useAuth();

  return (
    <>
      <Navbar variant="home" />

      <section className="hero">
        <h1>Learn new skills. Track every step.</h1>
        <p>Course Management connects students with courses across every subject — browse, enroll, and track your progress.</p>
        <div className="hero-actions">
          <Link to="/browse-courses" className="btn btn-hero-primary">Browse Courses</Link>
          <Link to="/student-login" className="btn btn-hero-outline">Student Login</Link>
        </div>
      </section>

      <section className="dash-section" id="dashboard-section">
        <DashboardPreview session={session} admin={admin} />
      </section>

      <section className="features-wrap">
        <div className="features-head">
          <h2>Everything you need to learn</h2>
          <p>Built for students and admins to manage courses with ease.</p>
        </div>
        <div className="features">
          <div className="feature-card"><div className="icon">📚</div><h3>Browse Courses</h3><p>Explore courses by subject, level, and instructor — find the right fit fast.</p></div>
          <div className="feature-card"><div className="icon">✅</div><h3>Easy Enrollment</h3><p>Enroll in a course in just a few clicks and start learning right away.</p></div>
          <div className="feature-card"><div className="icon">📊</div><h3>Track Progress</h3><p>Your dashboard shows exactly how far you've come and what's next.</p></div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function DashboardPreview({ session, admin }) {
  if (!session && !admin) {
    return (
      <div style={{ textAlign: 'center', padding: '70px 20px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>📊</div>
        <h2 style={{ fontSize: 22, marginBottom: 10 }}>Track Your Progress</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.65, marginBottom: 26 }}>
          Sign in to see your enrolled courses, completion stats and learning progress.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/student-login" className="btn btn-primary">Student Login</Link>
          <Link to="/admin-login" className="btn btn-outline">Admin Login</Link>
        </div>
      </div>
    );
  }

  if (admin) {
    const total = getCourses().length;
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: 500, margin: '0 auto' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🛡️</div>
        <h2 style={{ fontSize: 22, marginBottom: 10 }}>Welcome, Admin</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 24 }}>{total} course{total === 1 ? '' : 's'} currently published on the platform.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/admin-dashboard" className="btn btn-primary">Go to Admin Dashboard</Link>
          <Link to="/browse-courses" className="btn btn-outline">Manage Courses</Link>
        </div>
      </div>
    );
  }

  const firstName = session.fullName.split(' ')[0];
  const my = getMyEnrollments(session.email);
  const completed = my.filter(e => e.completedAt).length;
  const inProgress = my.filter(e => !e.completedAt);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22 }}>Welcome, {firstName} 👋</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>{my.length ? "Here's your learning overview." : 'Start enrolling in courses to track your progress here.'}</p>
        </div>
        <Link to="/student-dashboard" className="btn btn-ghost btn-sm">Full Dashboard →</Link>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><span className="stat-icon">📚</span><span className="stat-label">Enrolled Courses</span><span className="stat-val">{my.length}</span><span className="stat-sub" style={{ color: 'var(--text-muted)' }}>{my.length ? 'Keep going!' : 'No courses yet'}</span></div>
        <div className="stat-card"><span className="stat-icon">✅</span><span className="stat-label">Completed</span><span className="stat-val">{completed}</span><span className="stat-sub" style={{ color: 'var(--text-muted)' }}>—</span></div>
        <div className="stat-card"><span className="stat-icon">📖</span><span className="stat-label">In Progress</span><span className="stat-val">{inProgress.length}</span><span className="stat-sub" style={{ color: 'var(--text-muted)' }}>—</span></div>
        <div className="stat-card"><span className="stat-icon">🏆</span><span className="stat-label">Certificates</span><span className="stat-val">{completed}</span><span className="stat-sub" style={{ color: 'var(--text-muted)' }}>—</span></div>
      </div>
      {my.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px', marginTop: 8 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>No courses enrolled yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Browse our course library and enroll to get started.</p>
          <Link to="/browse-courses" className="btn btn-primary">Browse Courses</Link>
        </div>
      ) : inProgress.length > 0 && (
        <>
          <div className="section-head" style={{ marginTop: 8 }}><h2>Continue Learning</h2><Link to="/my-courses" className="btn btn-ghost btn-sm">View All →</Link></div>
          <div className="courses-grid">
            {inProgress.slice(0, 3).map(e => {
              const c = getCourseById(e.courseId);
              if (!c) return null;
              return (
                <CourseCard
                  key={e.courseId}
                  course={c}
                  progress={{ percent: e.progress, statusLabel: 'In Progress', ctaLabel: 'Resume', ctaTo: '/my-courses' }}
                />
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
