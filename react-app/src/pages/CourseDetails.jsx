import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { TAG_MAP, generateModulesForCourse } from '../data/courseData';
import { formatPrice, partsLabel } from '../utils/ui';
import {
  getCourseById, updateCourse, isEnrolled, getEnrollment, enrollInCourse,
  setModulePartDone,
} from '../utils/api';

export default function CourseDetails() {
  const { id } = useParams();
  const { session, admin } = useAuth();
  const [course, setCourse] = useState(() => getCourseById(id));
  const [, forceRender] = useState(0);
  const rerender = () => forceRender(n => n + 1);

  // Self-heal: any course with no modules yet gets a real curriculum
  // generated for it now, tailored to its own details, and saved.
  useEffect(() => {
    if (course && (!course.modules || !course.modules.length)) {
      const modules = generateModulesForCourse(course);
      updateCourse(course.id, { modules });
      setCourse({ ...course, modules });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id]);

  if (!course) {
    return (
      <>
        <Navbar variant="back" backTo="/browse-courses" backLabel="← Back to Courses" />
        <div style={{ maxWidth: 980, margin: '30px auto', padding: '0 24px 70px' }}>
          <div className="empty-state">
            <div className="e-icon">🔍</div><h3>Course not found</h3><p>It may have been removed by an admin.</p>
            <Link to="/browse-courses" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Courses</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const enrolled = session && isEnrolled(session.email, course.id);
  const enrollmentRec = enrolled ? getEnrollment(session.email, course.id) : null;
  const modules = course.modules || [];

  function handleEnroll() {
    enrollInCourse(session.email, course.id);
    setCourse(getCourseById(course.id));
    rerender();
  }

  return (
    <>
      <Navbar variant="back" backTo="/browse-courses" backLabel="← Back to Courses" />
      <div style={{ maxWidth: 980, margin: '30px auto', padding: '0 24px 70px' }}>
        <Link to="/browse-courses" className="back-link" style={{ marginBottom: 18, display: 'inline-flex' }}>← Back to Courses</Link>
        <div className="content-details-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
              <div className="course-thumb" style={{ width: 72, height: 72, borderRadius: 12, background: course.bg, fontSize: 36 }}>{course.emoji}</div>
              <div>
                <span className={`course-tag ${TAG_MAP[course.category] || 'tag-blue'}`}>{course.category}</span>
                <h1 style={{ fontSize: 22, marginTop: 6 }}>{course.title}</h1>
              </div>
            </div>
            <div className="course-meta" style={{ marginBottom: 16, fontSize: 13 }}>
              👤 {course.instructor} &nbsp;·&nbsp; 🕒 {course.duration}h &nbsp;·&nbsp; 📘 {course.lessons} lessons &nbsp;·&nbsp; ⭐ {course.rating} &nbsp;·&nbsp; 🎯 {course.level}
            </div>
            <hr className="divider" />
            <h3 style={{ fontSize: 15, marginBottom: 8 }}>About this course</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>{course.description || 'No description provided.'}</p>
          </div>

          <div className="card" style={{ height: 'fit-content' }}>
            <div style={{ marginBottom: 16 }}>
              {course.price === 0
                ? <span className="course-price free" style={{ fontSize: 22 }}>FREE</span>
                : <span className="course-price" style={{ fontSize: 22 }}>{formatPrice(course.price)}</span>}
            </div>
            {admin ? (
              <Link to={`/edit-course/${course.id}`} className="btn btn-primary btn-block">✏️ Edit This Course</Link>
            ) : session ? (
              enrolled ? (
                <>
                  <div className="banner show ok" style={{ marginBottom: 14 }}>✅ You're enrolled in this course.</div>
                  {enrollmentRec?.completedAt && (
                    <Link to={`/certificate/${course.id}`} className="btn btn-primary btn-block" style={{ marginBottom: 10 }}>🏆 View Certificate</Link>
                  )}
                  <Link to="/my-courses" className="btn btn-ghost btn-block">Go to My Courses</Link>
                </>
              ) : (
                <button className="btn btn-primary btn-block" onClick={handleEnroll}>🚀 Enroll Now</button>
              )
            ) : (
              <>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Sign in as a student to enroll in this course.</p>
                <Link to="/student-login" className="btn btn-primary btn-block">Student Login</Link>
              </>
            )}
          </div>
        </div>

        {enrolled && modules.length > 0 && (
          <div className="card" style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>📘 Course Content</h3>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14 }}>Open a module and scroll it to the end to mark it complete.</p>
            <ModulesList session={session} course={course} modules={modules} />
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

function ModulesList({ session, course, modules }) {
  const [openModuleId, setOpenModuleId] = useState(modules[0]?.id || null);
  const [activeTab, setActiveTab] = useState({});
  const [, force] = useState(0);
  const rerender = () => force(n => n + 1);

  function getState(moduleId) {
    const enrollment = getEnrollment(session.email, course.id);
    return (enrollment?.moduleState && enrollment.moduleState[moduleId]) || { read: false, watched: false, viewed: false };
  }

  function markDone(moduleId, flag) {
    setModulePartDone(session.email, course.id, moduleId, flag);
    rerender();
  }

  function toggleModule(moduleId) {
    const next = openModuleId === moduleId ? null : moduleId;
    setOpenModuleId(next);
    if (next && !activeTab[next]) setActiveTab(t => ({ ...t, [next]: 'photo' }));
  }

  function switchTab(moduleId, tab) {
    setActiveTab(t => ({ ...t, [moduleId]: tab }));
  }

  // Auto-mark photo viewed when the photo tab is showing.
  useEffect(() => {
    if (!openModuleId) return;
    const tab = activeTab[openModuleId] || 'photo';
    const state = getState(openModuleId);
    if (tab === 'photo' && !state.viewed) {
      markDone(openModuleId, 'viewed');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModuleId, activeTab[openModuleId]]);

  return (
    <div>
      {modules.map((m, i) => {
        const state = getState(m.id);
        const isFullyDone = state.read && state.watched && state.viewed;
        const isOpen = openModuleId === m.id;
        const tab = activeTab[m.id] || 'photo';
        const label = partsLabel(state);

        return (
          <div key={m.id} style={{ borderBottom: '1px solid var(--border)', padding: '14px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: 10 }} onClick={() => toggleModule(m.id)}>
              <span style={{ fontSize: 14, fontWeight: 600, color: isFullyDone ? 'var(--success)' : 'var(--text)' }}>
                {isFullyDone ? '✅' : '⬜'} Module {i + 1}: {m.title}
              </span>
              <span className={`pill ${label.cls}`} style={{ flexShrink: 0 }}>{label.text}</span>
            </div>
            {isOpen && (
              <>
                <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => switchTab(m.id, 'photo')} className={`btn btn-sm ${tab === 'photo' ? 'btn-primary' : 'btn-ghost'}`}>📷 Photo {state.viewed ? '✓' : ''}</button>
                  <button type="button" onClick={() => switchTab(m.id, 'video')} className={`btn btn-sm ${tab === 'video' ? 'btn-primary' : 'btn-ghost'}`}>🎥 Video {state.watched ? '✓' : ''}</button>
                  <button type="button" onClick={() => switchTab(m.id, 'theory')} className={`btn btn-sm ${tab === 'theory' ? 'btn-primary' : 'btn-ghost'}`}>📖 Theory {state.read ? '✓' : ''}</button>
                </div>
                {tab === 'photo' && (
                  <div style={{ marginTop: 14, borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ height: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#fff', background: `linear-gradient(135deg,${m.gradFrom},${m.gradTo})` }}>
                      <div style={{ fontSize: 44 }}>{m.icon}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, opacity: .9 }}>{m.caption}</div>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{state.viewed ? '✅ Viewed' : 'Marking as viewed…'}</p>
                  </div>
                )}
                {tab === 'video' && (
                  <VideoPanel m={m} state={state} onWatched={() => markDone(m.id, 'watched')} />
                )}
                {tab === 'theory' && (
                  <TheoryPanel m={m} state={state} onRead={() => markDone(m.id, 'read')} />
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

function VideoPanel({ m, state, onWatched }) {
  const [pct, setPct] = useState(state.watched ? 100 : 0);
  const [playing, setPlaying] = useState(false);
  const [shownTime, setShownTime] = useState(state.watched ? m.duration : '0:00');
  const timerRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function play() {
    if (state.watched || playing) return;
    setPlaying(true);
    const totalMs = m.watchSeconds * 1000;
    const startedAt = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const p = Math.min(100, Math.round((elapsed / totalMs) * 100));
      setPct(p);
      const totalSeconds = m.duration.split(':').reduce((a, b) => a * 60 + Number(b), 0);
      const shownSeconds = Math.round((p / 100) * totalSeconds);
      const mm = Math.floor(shownSeconds / 60), ss = String(shownSeconds % 60).padStart(2, '0');
      setShownTime(`${mm}:${ss} / ${m.duration}`);
      if (p >= 100) {
        clearInterval(timerRef.current);
        onWatched();
      }
    }, 200);
  }

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ background: 'var(--navy)', borderRadius: 8, padding: 22, textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 13, opacity: .85, marginBottom: 10 }}>🎬 Lecture: {m.title} &nbsp;·&nbsp; {m.duration}</div>
        {state.watched ? (
          <><div style={{ fontSize: 28 }}>✅</div><p style={{ fontSize: 13, marginTop: 8 }}>Video watched</p></>
        ) : (
          <button type="button" onClick={play} disabled={playing} className="btn btn-hero-primary btn-sm">{playing ? '▶ Playing…' : '▶ Play Lecture'}</button>
        )}
        <div className="progress-bar" style={{ marginTop: 14, background: 'rgba(255,255,255,0.15)' }}>
          <div className="progress-fill" style={{ width: `${pct}%` }}></div>
        </div>
        <div style={{ fontSize: 11, marginTop: 6, opacity: .8 }}>{shownTime}</div>
      </div>
    </div>
  );
}

function TheoryPanel({ m, state, onRead }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || state.read) return;
    function onScroll() {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 15) {
        el.removeEventListener('scroll', onScroll);
        onRead();
      }
    }
    el.addEventListener('scroll', onScroll);
    if (el.scrollHeight <= el.clientHeight + 5) onRead();
    return () => el.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paras = m.content.split('\n\n');
  return (
    <div ref={ref} className="module-content" style={{ display: 'block', maxHeight: 260, overflowY: 'auto', marginTop: 14, padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13.5, lineHeight: 1.7, color: 'var(--text-muted)' }}>
      {paras.map((p, i) => <p key={i} style={{ marginBottom: 12 }}>{p}</p>)}
      <p style={{ marginTop: 6, fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>{state.read ? '✅ Theory read' : '— Scroll to the end to mark this read —'}</p>
    </div>
  );
}
