import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';
import { getCourses, deleteCourse } from '../utils/api';

export default function BrowseCourses() {
  const { session, admin } = useAuth();
  const [courses, setCourses] = useState(() => getCourses());
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');
  const [level, setLevel] = useState('');

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return courses.filter(c =>
      (!s || c.title.toLowerCase().includes(s) || c.instructor.toLowerCase().includes(s) || c.category.toLowerCase().includes(s)) &&
      (!cat || c.category === cat) &&
      (!level || c.level === level)
    );
  }, [courses, search, cat, level]);

  function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteCourse(id);
    setCourses(getCourses());
  }

  return (
    <>
      <Navbar variant="app" />
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '30px 24px 70px' }}>
        <div className="section-head">
          <div>
            <h1 style={{ fontSize: 22 }}>Browse Courses</h1>
            {!admin && !session && (
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Sign in as a student to enroll in a course.</p>
            )}
          </div>
        </div>

        {admin && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--primary-light)', border: '1px solid #BBD6F2', borderRadius: 8, padding: '14px 18px', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>🛡️ Admin mode — you can add, edit or delete courses.</span>
            <Link to="/add-course" className="btn btn-primary btn-sm">+ Add New Course</Link>
          </div>
        )}

        <div className="card" style={{ marginBottom: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
            <input
              type="text" placeholder="🔍 Search by title, instructor or category…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ fontFamily: 'var(--font)', fontSize: 14, border: '1px solid var(--border)', borderRadius: 6, padding: '11px 14px', outline: 'none' }}
            />
            <select value={cat} onChange={e => setCat(e.target.value)} style={{ fontFamily: 'var(--font)', fontSize: 14, border: '1px solid var(--border)', borderRadius: 6, padding: '11px 14px' }}>
              <option value="">All Categories</option>
              <option>Web Development</option><option>Data Science</option><option>Design</option>
              <option>Cloud</option><option>Mobile</option><option>Database</option><option>Other</option>
            </select>
            <select value={level} onChange={e => setLevel(e.target.value)} style={{ fontFamily: 'var(--font)', fontSize: 14, border: '1px solid var(--border)', borderRadius: 6, padding: '11px 14px' }}>
              <option value="">All Levels</option>
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
          Showing {filtered.length} of {courses.length} courses
        </p>

        <div className="courses-grid">
          {filtered.length ? filtered.map(c => (
            <CourseCard key={c.id} course={c} isAdmin={admin} onDelete={handleDelete} />
          )) : (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="e-icon">🔍</div><h3>No courses found</h3><p>Try a different search or filter.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
