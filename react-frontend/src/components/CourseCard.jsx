import { Link } from 'react-router-dom';
import { catStyle, formatPrice, statusPill } from '../utils/ui.js';

export default function CourseCard({ course, enrollment, children }) {
  const cs = catStyle(course.category);
  const p = enrollment?.progress ?? 0;
  const done = p >= 100;
  const doneLessons = enrollment ? (enrollment.completedLessons ?? Math.round((course.lessons * p) / 100)) : 0;
  const pill = enrollment ? statusPill(enrollment.status) : '';
  return (
    <div className="course-card" data-testid="course-card">
      <div className="course-thumb" style={{ background: cs.bg }}>{course.emoji}</div>
      <div className="course-body">
        <span className={`course-tag ${cs.tag}`}>{course.category}</span>
        <h3>{course.title}</h3>
        <div className="course-meta">👤 {course.instructor} · {course.lessons} lessons · ⭐ {course.rating}</div>
        <div className="course-meta">🕒 {course.duration}h · {course.level}</div>
        {enrollment && (
          <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>
              <span>{p}%</span><span>{doneLessons}/{course.lessons} lessons</span>
            </div>
            <div className="progress-bar">
              <div className={`progress-fill ${done ? 'green' : cs.fill}`} style={{ width: `${p}%` }} />
            </div>
          </div>
        )}
      </div>
      <div className="course-footer">
        {enrollment
          ? <span className={`pill ${pill}`} style={!pill ? { background: 'var(--border)', color: 'var(--text-muted)' } : undefined}>{enrollment.status}{done ? ' ✓' : ''}</span>
          : <span className={`course-price${course.price ? '' : ' free'}`}>{formatPrice(course.price)}</span>}
        {children || <Link to={`/course/${course.id}`} className="btn btn-primary btn-sm">{enrollment ? (done ? 'Review' : 'Resume') : 'View Course'}</Link>}
      </div>
    </div>
  );
}
