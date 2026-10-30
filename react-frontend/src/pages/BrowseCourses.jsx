import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import CourseCard from '../components/CourseCard.jsx';
import { Empty, ErrorBox, Loading } from '../components/Async.jsx';
import { CATEGORIES, LEVELS } from '../utils/ui.js';

const sel = { padding: '11px 14px', borderRadius: 6, border: 'none', fontSize: 14, background: '#fff', outline: 'none', cursor: 'pointer' };

export default function BrowseCourses() {
  const { isAdmin } = useAuth();
  const { courses, coursesStatus, coursesError, loadCourses } = useData();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [level, setLevel] = useState('');
  const [mode, setMode] = useState('all'); // all | free | top

  const shown = useMemo(() => courses.filter((c) => {
    const text = `${c.title} ${c.instructor} ${c.category} ${c.description}`.toLowerCase();
    return (!q || text.includes(q.toLowerCase()))
      && (!cat || c.category === cat)
      && (!level || c.level === level)
      && (mode !== 'free' || !c.price)
      && (mode !== 'top' || c.rating >= 4.8);
  }), [courses, q, cat, level, mode]);

  const pill = (key, label, cls) => (
    <span key={key} className={`pill ${mode === key ? cls : ''}`} style={{ cursor: 'pointer', ...(mode === key ? {} : { background: 'var(--border)' }) }} onClick={() => setMode(key)}>{label}</span>
  );

  return (
    <>
      <div style={{ background: 'var(--navy)', padding: '36px 48px 32px' }}>
        <p style={{ color: '#BBD6F2', fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>EXPLORE</p>
        <h1 style={{ color: '#fff', fontSize: 28, marginBottom: 16 }}>Browse All Courses</h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input aria-label="Search courses" placeholder="🔍  Search courses, topics, instructors..." value={q} onChange={(e) => setQ(e.target.value)}
            style={{ flex: 1, minWidth: 260, padding: '11px 16px', borderRadius: 6, border: 'none', fontSize: 14, outline: 'none' }} />
          <select aria-label="Category" style={sel} value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All Categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select aria-label="Level" style={sel} value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">All Levels</option>{LEVELS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="page-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }} data-testid="count">Showing {shown.length} course{shown.length === 1 ? '' : 's'}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {pill('all', 'All', 'pill-primary')}{pill('free', 'Free', 'pill-success')}{pill('top', 'Top rated ⭐', 'pill-warn')}
            {isAdmin && <Link to="/add-course" className="btn btn-primary btn-sm">+ Add Course</Link>}
          </div>
        </div>

        {coursesStatus === 'loading' && <Loading text="Loading courses…" />}
        {coursesStatus === 'error' && <ErrorBox message={coursesError} onRetry={loadCourses} />}
        {coursesStatus === 'ready' && (shown.length === 0
          ? <Empty icon="🔍" title="No courses match your search">Try a different keyword or clear the filters.</Empty>
          : (
            <div className="courses-grid">
              {shown.map((c) => (
                <CourseCard key={c.id} course={c}>
                  <div className="row-actions">
                    {isAdmin && <Link to={`/edit-course/${c.id}`} className="btn btn-ghost btn-sm">Edit</Link>}
                    <Link to={`/course/${c.id}`} className="btn btn-primary btn-sm">View Course</Link>
                  </div>
                </CourseCard>
              ))}
            </div>
          ))}
      </div>
    </>
  );
}
