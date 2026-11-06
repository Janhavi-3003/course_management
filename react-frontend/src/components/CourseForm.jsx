import { useState } from 'react';
import { FormField } from './FormField.jsx';
import { CATEGORIES, LEVELS, generateModules } from '../utils/ui.js';

const toEditable = (mods = []) => mods.map((m) => ({ moduleId: m.moduleId, icon: m.icon, title: m.title, text: (m.theory || []).join('\n\n') }));
const splitEven = (total, n) => Array.from({ length: n }, (_, i) => Math.max(1, Math.floor(total / n) + (i < total % n ? 1 : 0)));

// Shared by AddCourse and EditCourse
export default function CourseForm({ initial, onSubmit, submitLabel, busy }) {
  const [f, setF] = useState({
    title: '', category: CATEGORIES[0], level: LEVELS[0], instructor: '', description: '',
    price: 0, duration: 10, lessons: 20, emoji: '📘', ...initial,
  });
  const [modules, setModules] = useState(toEditable(initial?.modules));
  const [err, setErr] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setMod = (i, k) => (e) => setModules(modules.map((m, x) => (x === i ? { ...m, [k]: e.target.value } : m)));
  const addMod = () => setModules([...modules, { moduleId: '', icon: '📘', title: '', text: '' }]);
  const autoGen = () => {
    if (f.title.trim().length < 3) { setErr({ ...err, title: 'Enter the course title first.' }); return; }
    setModules(toEditable(generateModules(f.title.trim(), Number(f.lessons) || 10, 3)));
  };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (f.title.trim().length < 3) er.title = 'Enter a course title (3+ characters).';
    if (f.instructor.trim().length < 2) er.instructor = 'Enter the instructor name.';
    if (f.description.trim().length < 10) er.description = 'Write a short description (10+ characters).';
    if (f.price === '' || Number(f.price) < 0) er.price = 'Enter a price (0 for free).';
    if (!(Number(f.duration) >= 1)) er.duration = 'Enter duration in hours (1 or more).';
    if (!(Number(f.lessons) >= 1)) er.lessons = 'Enter number of lessons.';
    if (modules.some((m) => m.title.trim().length < 2 || m.text.trim().length < 10)) {
      er.modules = 'Every module needs a title and some text (10+ characters), or remove it. Leave the list empty to auto-generate.';
    }
    setErr(er);
    if (Object.keys(er).length) return;
    const counts = splitEven(Math.max(Number(f.lessons), modules.length), modules.length || 1);
    onSubmit({
      title: f.title.trim(), category: f.category, level: f.level, instructor: f.instructor.trim(),
      description: f.description.trim(), price: Number(f.price), duration: Number(f.duration),
      lessons: Number(f.lessons), emoji: f.emoji || '📘',
      ...(modules.length ? {
        modules: modules.map((m, i) => ({
          moduleId: m.moduleId || `n${Date.now().toString(36)}${i}`,
          title: m.title.trim(), icon: m.icon || '📘', lessons: counts[i], videoMinutes: 10,
          theory: m.text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
        })),
      } : {}),
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
      <div style={{ margin: '8px 0 18px' }}>
        <div className="section-head">
          <h4 style={{ fontSize: 15 }}>Course Modules (text lessons)</h4>
          <div className="row-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={autoGen}>✨ Auto-generate 3 modules</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addMod}>+ Add module</button>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Write the lesson text yourself, or leave this empty and 3 modules are created automatically. Separate paragraphs with a blank line.</p>
        {err.modules && <div className="banner bad show" role="alert">{err.modules}</div>}
        {modules.map((m, i) => (
          <div key={m.moduleId || i} className="card" style={{ marginBottom: 12, padding: 14 }} data-testid="module-editor">
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input aria-label={`Module ${i + 1} title`} placeholder={`Module ${i + 1} title`} value={m.title} onChange={setMod(i, 'title')} style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'inherit', fontSize: 14 }} />
              <button type="button" className="btn btn-danger btn-sm" onClick={() => setModules(modules.filter((_, x) => x !== i))}>Remove</button>
            </div>
            <textarea aria-label={`Module ${i + 1} text`} placeholder="Lesson text…" rows={6} value={m.text} onChange={setMod(i, 'text')} style={{ width: '100%', boxSizing: 'border-box', padding: 10, border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'inherit', fontSize: 14, resize: 'vertical' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button>
      </div>
    </form>
  );
}
