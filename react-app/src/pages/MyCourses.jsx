import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';
import { getMyEnrollments, getCourseById } from '../utils/api';

export default function MyCourses() {
  const { session } = useAuth();
  const my = getMyEnrollments(session.email);
  const completed = my.filter(e => e.completedAt).length;

  return (
    <>
      <Navbar variant="app" />
      <div className="layout">
        <Sidebar role="student" />
        <main className="main-content">
          <div className="section-head"><h1 style={{ fontSize: 22 }}>My Courses</h1><Link to="/browse-courses" className="btn btn-primary btn-sm">+ Browse More</Link></div>

          {!my.length ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📖</div>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>You haven't enrolled in any courses yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Browse the catalog and enroll to start learning.</p>
              <Link to="/browse-courses" className="btn btn-primary">Browse Courses</Link>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
                <span className="pill pill-primary">All ({my.length})</span>
                <span className="pill pill-muted">In Progress ({my.length - completed})</span>
                <span className="pill pill-success">Completed ({completed})</span>
              </div>
              <div className="courses-grid">
                {my.map(e => {
                  const c = getCourseById(e.courseId);
                  if (!c) return null;
                  const done = e.progress >= 100;
                  return (
                    <CourseCard
                      key={e.courseId}
                      course={c}
                      progress={{
                        percent: e.progress,
                        statusLabel: done ? 'Completed ✓' : 'In Progress',
                        ctaLabel: done ? '🏆 Certificate' : 'Continue Learning',
                        ctaTo: done ? `/certificate/${c.id}` : `/course/${c.id}`,
                      }}
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
