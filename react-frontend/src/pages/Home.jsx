import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import CourseCard from '../components/CourseCard.jsx';
import { ErrorBox, Loading } from '../components/Async.jsx';

export default function Home() {
  const { isStudent, isAdmin } = useAuth();
  const { courses, coursesStatus, coursesError, loadCourses } = useData();
  const free = courses.filter((c) => !c.price).length;
  const categories = new Set(courses.map((c) => c.category)).size;
  const dash = isAdmin ? '/admin-dashboard' : '/student-dashboard';

  return (
    <>
      <section className="hero">
        <p className="eyebrow">LEARN NEW SKILLS, ANYTIME</p>
        <h1>Discover courses. Enroll in minutes.</h1>
        <p>Course Management connects students with courses across every subject — browse, enroll, and track your progress.</p>
        <div className="hero-actions">
          <Link to="/browse-courses" className="btn btn-hero-primary">Browse Courses</Link>
          {isStudent || isAdmin
            ? <Link to={dash} className="btn btn-hero-outline">Go to Dashboard</Link>
            : <Link to="/role" className="btn btn-hero-outline">Sign In</Link>}
        </div>
      </section>

      <section className="dash-section">
        <div className="stats-grid">
          <div className="stat-card"><span className="stat-icon">📚</span><span className="stat-label">Courses</span><span className="stat-val">{courses.length}</span><span className="stat-sub">Across {categories} categories</span></div>
          <div className="stat-card"><span className="stat-icon">🎁</span><span className="stat-label">Free courses</span><span className="stat-val">{free}</span><span className="stat-sub">Start learning today</span></div>
          <div className="stat-card"><span className="stat-icon">🏆</span><span className="stat-label">Certificates</span><span className="stat-val">✓</span><span className="stat-sub">Earned on completion</span></div>
          <div className="stat-card"><span className="stat-icon">💬</span><span className="stat-label">Live chat</span><span className="stat-val">✓</span><span className="stat-sub">Talk to other learners</span></div>
        </div>

        <div className="section-head">
          <h2>Featured Courses</h2>
          <Link to="/browse-courses" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        {coursesStatus === 'loading' && <Loading text="Loading courses…" />}
        {coursesStatus === 'error' && <ErrorBox message={coursesError} onRetry={loadCourses} />}
        {coursesStatus === 'ready' && (
          <div className="courses-grid">
            {courses.slice(0, 3).map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </section>

      <section className="features-wrap">
        <div className="features-head">
          <h2>Everything you need to learn</h2>
          <p>Built for students and admins to manage courses with ease.</p>
        </div>
        <div className="features">
          <div className="feature-card"><div className="icon">📚</div><h3>Browse Courses</h3><p>Explore courses by subject, level, and instructor — find the right fit fast.</p></div>
          <div className="feature-card"><div className="icon">✅</div><h3>Easy Enrollment</h3><p>Enroll in a course in a click, finish each module's photo, video and theory, and earn a certificate.</p></div>
          <div className="feature-card"><div className="icon">📊</div><h3>Track Progress</h3><p>Live dashboards, notifications and chat show exactly how far you've come.</p></div>
        </div>
      </section>
    </>
  );
}
