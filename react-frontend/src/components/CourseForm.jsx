import { useState } from 'react';
import { FormField } from './FormField.jsx';
import { CATEGORIES, LEVELS } from '../utils/ui.js';

// Shared by AddCourse and EditCourse
export default function CourseForm({ initial, onSubmit, submitLabel, busy }) {
  const [f, setF] = useState({
    title: '', category: CATEGORIES[0], level: LEVELS[0], instructor: '', description: '',
    price: 0, duration: 10, lessons: 20, emoji: '📘', ...initial,
  });
  const [err, setErr] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (f.title.trim().length < 3) er.title = 'Enter a course title (3+ characters).';
    if (f.instructor.trim().length < 2) er.instructor = 'Enter the instructor name.';
    if (f.description.trim().length < 10) er.description = 'Write a short description (10+ characters).';
    if (f.price === '' || Number(f.price) < 0) er.price = 'Enter a price (0 for free).';
    if (!(Number(f.duration) >= 1)) er.duration = 'Enter duration in hours (1 or more).';
    if (!(Number(f.lessons) >= 1)) er.lessons = 'Enter number of lessons.';
    setErr(er);
    if (Object.keys(er).length) return;
    onSubmit({
      title: f.title.trim(), category: f.category, level: f.level, instructor: f.instructor.trim(),
      description: f.description.trim(), price: Number(f.price), duration: Number(f.duration),
      lessons: Number(f.lessons), emoji: f.emoji || '📘',
    });
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="form-row">
        <FormField label="Course Title" htmlFor="title" error={err.title}><input id="title" value={f.title} onChange={set('title')} /></FormField>
        <FormField label="Category" htmlFor="cat"><select id="cat" value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></FormField>
      </div>
      <FormField label="Short Description" htmlFor="desc" error={err.description}><textarea id="desc" value={f.description} onChange={set('description')} /></FormField>
      <div className="form-row">
        <FormField label="Instructor Name" htmlFor="ins" error={err.instructor}><input id="ins" value={f.instructor} onChange={set('instructor')} /></FormField>
        <FormField label="Level" htmlFor="lvl"><select id="lvl" value={f.level} onChange={set('level')}>{LEVELS.map((c) => <option key={c}>{c}</option>)}</select></FormField>
      </div>
      <div className="form-row">
        <FormField label="Price (₹)" htmlFor="price" error={err.price}><input id="price" type="number" min="0" value={f.price} onChange={set('price')} /></FormField>
        <FormField label="Duration (hours)" htmlFor="dur" error={err.duration}><input id="dur" type="number" min="1" value={f.duration} onChange={set('duration')} /></FormField>
      </div>
      <div className="form-row">
        <FormField label="Total Lessons" htmlFor="les" error={err.lessons}><input id="les" type="number" min="1" value={f.lessons} onChange={set('lessons')} /></FormField>
        <FormField label="Emoji icon" htmlFor="emo"><input id="emo" maxLength={4} value={f.emoji} onChange={set('emoji')} /></FormField>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button>
      </div>
    </form>
  );
}
