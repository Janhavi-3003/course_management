import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Banner } from '../components/FormField';
import { validateCourseForm } from '../utils/validation';
import { addCourse } from '../utils/api';
import { generateModulesForCourse } from '../data/courseData';

const EMOJI_MAP = { 'Web Development': '💻', 'Data Science': '📊', 'Design': '🎨', 'Cloud': '☁️', 'Mobile': '📲', 'Database': '🗄️', 'Other': '📚' };
const BG_MAP = { 'Web Development': '#EEF2FF', 'Data Science': '#F0FDF4', 'Design': '#FFF7ED', 'Cloud': '#E8F1FB', 'Mobile': '#FFF0F0', 'Database': '#FEF7E0', 'Other': '#F3F0FF' };

export default function AddCourse() {
  const [form, setForm] = useState({ title: '', category: '', description: '', instructor: '', level: '', price: '', duration: '', lessons: '' });
  const [banner, setBanner] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  function update(field, value) { setForm(f => ({ ...f, [field]: value })); }

  function handleSubmit(e) {
    e.preventDefault();
    const { valid } = validateCourseForm(form);
    if (!valid) { setBanner({ type: 'bad', text: 'Please fill in all required fields.' }); return; }

    const newCourseData = {
      title: form.title.trim(), category: form.category, description: form.description.trim(),
      instructor: form.instructor.trim(), level: form.level,
      price: Number(form.price || 0), duration: Number(form.duration || 0),
      lessons: Number(form.lessons) || 4, rating: 4.5,
      emoji: EMOJI_MAP[form.category] || '📚', bg: BG_MAP[form.category] || '#EEF2FF',
    };
    newCourseData.modules = generateModulesForCourse(newCourseData);
    addCourse(newCourseData);

    setBanner({ type: 'ok', text: '✅ Course added — content generated automatically! Redirecting…' });
    setSubmitted(true);
    setTimeout(() => navigate('/browse-courses'), 1000);
  }

  return (
    <>
      <Navbar variant="back" backTo="/browse-courses" backLabel="← Back to Courses" />
      <div style={{ maxWidth: 720, margin: '32px auto', padding: '0 24px 60px' }}>
        <h1 style={{ fontSize: 22, marginBottom: 6 }}>Add New Course</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 22 }}>Fill in the details below and publish the course.</p>

        <div className="card">
          <Banner message={banner?.text} type={banner?.type} />
          <form onSubmit={handleSubmit} noValidate style={{ pointerEvents: submitted ? 'none' : 'auto' }}>
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
              <label htmlFor="courseDesc">Short Description *</label>
              <textarea id="courseDesc" value={form.description} onChange={e => update('description', e.target.value)} placeholder="Briefly describe what students will learn..."></textarea>
            </div>

            <div className="field">
              <label htmlFor="instructor">Instructor Name *</label>
              <input type="text" id="instructor" value={form.instructor} onChange={e => update('instructor', e.target.value)} placeholder="e.g. Arjun Kumar" />
            </div>

            <div className="form-row">
              <div className="field">
                <label htmlFor="coursePrice">Price (₹) — 0 for free</label>
                <input type="number" id="coursePrice" min="0" value={form.price} onChange={e => update('price', e.target.value)} placeholder="e.g. 1999" />
              </div>
              <div className="field">
                <label htmlFor="courseDuration">Duration (hours)</label>
                <input type="number" id="courseDuration" min="1" value={form.duration} onChange={e => update('duration', e.target.value)} placeholder="e.g. 24" />
              </div>
            </div>

            <div className="field">
              <label htmlFor="courseLessons">Number of Lessons</label>
              <input type="number" id="courseLessons" min="1" value={form.lessons} onChange={e => update('lessons', e.target.value)} placeholder="e.g. 42" />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <Link to="/browse-courses" className="btn btn-ghost">Cancel</Link>
              <button type="submit" className="btn btn-primary">🚀 Publish Course</button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
