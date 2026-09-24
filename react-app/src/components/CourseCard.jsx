import { Link } from 'react-router-dom';
import { TAG_MAP } from '../data/courseData';
import { formatPrice, TAG_MAP_FALLBACK } from '../utils/ui';

/**
 * A single course card.
 * - isAdmin: shows Edit/Delete actions instead of "View Course"
 * - onDelete(id, title): called when the admin clicks delete
 * - progress: optional { percent, done, statusLabel, ctaLabel, ctaTo } for enrolled views
 */
export default function CourseCard({ course: c, isAdmin, onDelete, progress }) {
  const tag = TAG_MAP[c.category] || TAG_MAP_FALLBACK;

  return (
    <div className="course-card" data-cat={c.category} data-level={c.level} data-id={c.id}>
      <div className="course-thumb" style={{ background: c.bg || '#EEF2FF' }}>{c.emoji || '📚'}</div>
      <div className="course-body">
        <span className={`course-tag ${tag}`}>{c.category}</span>
        <h3>{c.title}</h3>
        <div className="course-meta">👤 {c.instructor} &nbsp;·&nbsp; {c.lessons} lessons &nbsp;·&nbsp; ⭐ {c.rating}</div>
        <div className="course-meta">🕒 {c.duration}h &nbsp;·&nbsp; {c.level}</div>

        {progress && (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>
              <span>Progress</span><span>{progress.percent}%</span>
            </div>
            <div className="progress-bar">
              <div className={`progress-fill${progress.percent >= 100 ? ' green' : ''}`} style={{ width: `${progress.percent}%` }}></div>
            </div>
          </div>
        )}
      </div>
      <div className="course-footer">
        {!progress && (c.price === 0 ? <span className="course-price free">FREE</span> : <span className="course-price">{formatPrice(c.price)}</span>)}
        {isAdmin ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <Link to={`/edit-course/${c.id}`} className="btn btn-ghost btn-sm">✏️ Edit</Link>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete && onDelete(c.id, c.title)}>🗑️</button>
          </div>
        ) : progress ? (
          <>
            <span className={`pill ${progress.percent >= 100 ? 'pill-success' : 'pill-primary'}`}>{progress.statusLabel}</span>
            <Link to={progress.ctaTo} className="btn btn-primary btn-sm">{progress.ctaLabel}</Link>
          </>
        ) : (
          <Link to={`/course/${c.id}`} className="btn btn-primary btn-sm">View Course</Link>
        )}
      </div>
    </div>
  );
}
