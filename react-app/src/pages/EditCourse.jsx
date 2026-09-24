import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Banner } from '../components/FormField';
import { getCourseById, updateCourse, deleteCourse } from '../utils/api';

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(() => getCourseById(id));
  const [form, setForm] = useState(() => course ? {
    title: course.title || '', category: course.category || '', description: course.description || '',
    instructor: course.instructor || '', level: course.level || '',
    price: course.price ?? 0, duration: course.duration ?? 0, lessons: course.lessons ?? 0,
  } : null);
  const [banner, setBanner] = useState(course ? null : { type: 'bad', text: 'Course not found.' });

  function update(field, value) { setForm(f => ({ ...f, [field]: value })); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!id) { setBanner({ type: 'bad', text: 'No course ID found.' }); return; }
    updateCourse(id, {
      title: form.title.trim(), category: form.category, description: form.description.trim(),
      instructor: form.instructor.trim(), level: form.level,
      price: Number(form.price), duration: Number(form.duration), lessons: Number(form.lessons),
    });
    setBanner({ type: 'ok', text: '✅ Course updated! Redirecting…' });
    setTimeout(() => navigate('/browse-courses'), 1000);
  }

  function handleDelete() {
    if (confirm('Delete this course? This cannot be undone.')) {
      deleteCourse(id);
      navigate('/browse-courses');
    }
  }

  return (
    <>
      <Navbar variant="back" backTo="/browse-courses" backLabel="← Back to Courses" />
      <div style={{ maxWidth: 720, margin: '32px auto', padding: '0 24px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 10 }}>
          <h1 style={{ fontSize: 22 }}>Edit Course</h1>
          {course && <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑️ Delete Course</button>}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 22 }}>Update the course details below.</p>

        <div className="card">
          <Banner message={banner?.text} type={banner?.type} />
          {course && form && (
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="courseTitle">Course Title *</label>
                <input type="text" id="courseTitle" value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Full Stack Web Development" />
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="courseCategory">Category *</label>
                  <select id="courseCategory" value={form.category} onChange={e => update('category', e.target.value)}>
                    <option value="">Select category</option>
                    <option>Web Development</option><option>Data Science</option><option>Design</option>
                    <option>Cloud</option><option>Mobile</option><option>Database</option><option>Other</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="courseLevel">Level *</label>
                  <select id="courseLevel" value={form.level} onChange={e => update('level', e.target.value)}>
                    <option value="">Select level</option>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="courseDesc">Short Description</label>
                <textarea id="courseDesc" value={form.description} onChange={e => update('description', e.target.value)} placeholder="Briefly describe what students will learn..."></textarea>
              </div>

              <div className="field">
                <label htmlFor="instructor">Instructor Name *</label>
                <input type="text" id="instructor" value={form.instructor} onChange={e => update('instructor', e.target.value)} placeholder="e.g. Arjun Kumar" />
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="coursePrice">Price (₹) — 0 for free</label>
                  <input type="number" id="coursePrice" min="0" value={form.price} onChange={e => update('price', e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="courseDuration">Duration (hours)</label>
                  <input type="number" id="courseDuration" min="1" value={form.duration} onChange={e => update('duration', e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label htmlFor="courseLessons">Number of Lessons</label>
                <input type="number" id="courseLessons" min="1" value={form.lessons} onChange={e => update('lessons', e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <Link to="/browse-courses" className="btn btn-ghost">Cancel</Link>
                <button type="submit" className="btn btn-primary">💾 Save Changes</button>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
