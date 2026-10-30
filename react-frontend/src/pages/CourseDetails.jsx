import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import * as api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import useAsync from '../hooks/useAsync.js';
import { Async } from '../components/Async.jsx';
import ModulePlayer from '../components/ModulePlayer.jsx';
import { catStyle, errMsg, formatPrice } from '../utils/ui.js';

export default function CourseDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const { isStudent, isAdmin } = useAuth();
  const { showToast, loadNotifications } = useData();

  const state = useAsync(async () => {
    const course = await api.getCourse(id);
    let enrollment = null;
    if (isStudent) {
      const list = await api.getEnrollments();
      enrollment = list.find((e) => String(e.courseId) === String(course.id)) || null;
    }
    return { course, enrollment };
  }, [id, isStudent]);

  const [enrollment, setEnrollment] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [busy, setBusy] = useState(false);
  const course = state.data?.course;

  useEffect(() => { if (state.data) setEnrollment(state.data.enrollment); }, [state.data]);
  useEffect(() => { setActiveId(null); }, [id]);
  useEffect(() => {
    if (course && !activeId) {
      const done = enrollment?.completedModules || [];
      const next = course.modules.find((m) => !done.includes(m.moduleId)) || course.modules[0];
      setActiveId(next?.moduleId || null);
    }
  }, [course, enrollment, activeId]);

  const onEnroll = async () => {
    if (!isStudent) { nav('/student-login', { state: { from: loc.pathname } }); return; }
    setBusy(true);
    try {
      const e = await api.enroll(course.id);
      setEnrollment(e);
      showToast('✅ Enrolled! Start with Module 1.');
      loadNotifications();
    } catch (err) {
      showToast(errMsg(err));
    } finally { setBusy(false); }
  };

  const onWithdraw = async () => {
    if (!window.confirm('Withdraw from this course? Your progress is kept if you re-enroll.')) return;
    try {
      await api.withdraw(enrollment.id);
      setEnrollment(null);
      showToast('You withdrew from this course.');
    } catch (err) { showToast(errMsg(err)); }
  };

  const onMark = async (kind) => {
    try {
      const r = await api.recordProgress(course.id, { moduleId: activeId, kind });
      setEnrollment(r.enrollment);
      if (r.courseDone) showToast('🏆 Course completed! Your certificate is ready.');
      else if (r.moduleDone) showToast('🎉 Module completed!');
      if (r.moduleDone) loadNotifications();
    } catch (err) { showToast(errMsg(err)); }
  };

  return (
    <div className="page-wrap" style={{ maxWidth: 1060 }}>
      <Link to="/browse-courses" className="back-link" style={{ marginBottom: 18, display: 'inline-flex' }}>← Back to Courses</Link>
      <Async state={state} loadingText="Loading course…">
        {({ course: c }) => {
          const cs = catStyle(c.category);
          const done = enrollment?.completedModules || [];
          const active = c.modules.find((m) => m.moduleId === activeId) || c.modules[0];
          const doneParts = done.includes(active?.moduleId)
            ? { photo: true, video: true, theory: true }
            : (enrollment?.moduleProgress?.[active?.moduleId] || {});
          const complete = enrollment && enrollment.progress >= 100;

          const Header = (
            <>
              <span className={`course-tag ${cs.tag}`} style={{ marginBottom: 10, display: 'inline-block' }}>{c.category}</span>
              <h1 style={{ fontSize: 26, marginBottom: 10 }}>{c.title}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.65, marginBottom: 18 }}>{c.description}</p>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 14, color: 'var(--text-muted)', marginBottom: 18 }}>
                <span>⭐ {c.rating}</span><span>👤 {c.instructor}</span><span>🕒 {c.duration} hours</span>
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 13, marginBottom: 24, flexWrap: 'wrap' }}>
                <span className="pill pill-primary">{c.level}</span>
                <span className="pill pill-success">Certificate</span>
                <span className="pill" style={{ background: 'var(--border)' }}>{c.lessons} lessons</span>
              </div>
            </>
          );

          if (enrollment) {
            return (
              <>
                {Header}
                <div className="card" style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                    <strong>Your progress</strong><span data-testid="progress-pct">{enrollment.progress}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: 10 }}>
                    <div className={`progress-fill ${complete ? 'green' : ''}`} style={{ width: `${enrollment.progress}%` }} />
                  </div>
                  <div className="row-actions" style={{ marginTop: 14 }}>
                    {complete && <Link to={`/certificate/${c.id}`} className="btn btn-success btn-sm">🏆 View Certificate</Link>}
                    <button className="btn btn-ghost btn-sm" onClick={onWithdraw}>Withdraw</button>
                  </div>
                </div>
                <div className="content-layout">
                  <div className="card">
                    {active && <ModulePlayer key={active.moduleId} module={active} done={doneParts} onMark={onMark} />}
                  </div>
                  <div className="card">
                    <h3 style={{ fontSize: 16, marginBottom: 12 }}>Course Modules</h3>
                    <div className="module-list">
                      {c.modules.map((m) => (
                        <div key={m.moduleId} className={`module-item${m.moduleId === activeId ? ' active' : ''}`} onClick={() => setActiveId(m.moduleId)} data-testid="module-item">
                          <span className="m-icon">{m.icon}</span>{m.title}
                          {done.includes(m.moduleId) ? <span className="m-check">✓ Done</span> : <span className="m-dur">{m.lessons} lessons</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            );
          }

          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 28 }} className="detail-grid">
              <div>
                {Header}
                <div className="card">
                  <h3 style={{ fontSize: 16, marginBottom: 14 }}>Course Curriculum</h3>
                  <div className="module-list">
                    {c.modules.map((m, i) => (
                      <div key={m.moduleId} className={`module-item${i === 0 ? ' active' : ''}`}>
                        <span className="m-icon">{m.icon}</span>{m.title}<span className="m-dur">{m.lessons} lessons</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="card" style={{ position: 'sticky', top: 80 }}>
                  <div style={{ background: cs.bg, borderRadius: 6, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, marginBottom: 18 }}>{c.emoji}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>{formatPrice(c.price)}</div>
                  {isAdmin ? (
                    <Link to={`/edit-course/${c.id}`} className="btn btn-primary btn-block">Edit Course</Link>
                  ) : (
                    <button className="btn btn-primary btn-block" onClick={onEnroll} disabled={busy} data-testid="enroll-btn">
                      {busy ? 'Enrolling…' : isStudent ? 'Enroll Now' : 'Sign in to Enroll'}
                    </button>
                  )}
                  <hr className="divider" />
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <div>📱 Access on all devices</div><div>♾️ Full lifetime access</div>
                    <div>🏆 Certificate of completion</div><div>💬 Community chat</div>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </Async>
    </div>
  );
}
