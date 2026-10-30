import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api.js';
import { useData } from '../context/DataContext.jsx';
import { useRealtime } from '../context/RealtimeContext.jsx';
import useAsync from '../hooks/useAsync.js';
import { Async, Empty } from '../components/Async.jsx';
import PageLayout from '../components/PageLayout.jsx';
import { catStyle, dayLabel, errMsg, formatPrice, statusPill } from '../utils/ui.js';

export default function AdminDashboard() {
  const { courses, loadCourses, showToast } = useData();
  const { socket } = useRealtime();
  const [q, setQ] = useState('');
  const state = useAsync(async () => {
    const [stats, enrollments, students] = await Promise.all([api.getAdminStats(), api.getEnrollments(), api.getStudents()]);
    return { stats, enrollments, students };
  }, []);

  // live refresh when students enroll / make progress
  useEffect(() => {
    if (!socket) return undefined;
    const refresh = () => { state.reload(); loadCourses(); };
    socket.on('data_changed', refresh);
    return () => socket.off('data_changed', refresh);
  }, [socket]); // eslint-disable-line

  const onDeleteCourse = async (c) => {
    if (!window.confirm(`Delete "${c.title}"? Enrollments for this course are removed too.`)) return;
    try { await api.deleteCourse(c.id); showToast('Course deleted'); await loadCourses(); state.reload(); } catch (e) { showToast(errMsg(e)); }
  };
  const onDeleteStudent = async (s) => {
    if (!window.confirm(`Delete student "${s.name}" and all their data?`)) return;
    try { await api.deleteStudent(s.id); showToast('Student deleted'); state.reload(); } catch (e) { showToast(errMsg(e)); }
  };

  const rows = useMemo(() => {
    const list = state.data?.enrollments || [];
    const t = q.trim().toLowerCase();
    return t ? list.filter((e) => `${e.student?.name} ${e.course?.title}`.toLowerCase().includes(t)) : list;
  }, [state.data, q]);

  return (
    <PageLayout role="admin">
      <div className="section-head"><h1 style={{ fontSize: 22 }}>Admin Dashboard</h1><Link to="/add-course" className="btn btn-primary btn-sm">+ Add Course</Link></div>
      <Async state={state} loadingText="Loading dashboard…">
        {({ stats, students }) => (
          <>
            <div className="stats-grid">
              <div className="stat-card"><span className="stat-icon">📚</span><span className="stat-label">Total Courses</span><span className="stat-val" data-testid="stat-courses">{stats.courses}</span></div>
              <div className="stat-card"><span className="stat-icon">🎓</span><span className="stat-label">Students</span><span className="stat-val" data-testid="stat-students">{stats.students}</span></div>
              <div className="stat-card"><span className="stat-icon">📝</span><span className="stat-label">Enrollments</span><span className="stat-val" data-testid="stat-enrollments">{stats.enrollments}</span></div>
              <div className="stat-card"><span className="stat-icon">🏆</span><span className="stat-label">Completions</span><span className="stat-val">{stats.completed}</span><span className="stat-sub">{stats.certificates} certificates issued</span></div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div className="section-head">
                <h4 style={{ fontSize: 16 }}>Student Progress</h4>
                <input aria-label="Filter progress" placeholder="Filter by student or course…" value={q} onChange={(e) => setQ(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }} />
              </div>
              {rows.length === 0 ? <Empty icon="📝" title="No enrollments found" /> : (
                <div className="table-wrap"><table className="table" data-testid="progress-table">
                  <thead><tr><th>Student</th><th>Course</th><th>Progress</th><th>Status</th><th>Last Active</th></tr></thead>
                  <tbody>{rows.map((e) => {
                    const pill = statusPill(e.status);
                    return (
                      <tr key={e.id}>
                        <td><strong>{e.student?.name}</strong><br /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.student?.email}</span></td>
                        <td>{e.course?.title}</td>
                        <td><div className="progress-bar" style={{ width: 140, display: 'inline-block', verticalAlign: 'middle' }}><div className={`progress-fill ${e.progress >= 100 ? 'green' : ''}`} style={{ width: `${e.progress}%` }} /></div> <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.progress}%</span></td>
                        <td><span className={`pill ${pill}`} style={!pill ? { background: 'var(--border)', color: 'var(--text-muted)' } : undefined}>{e.status}</span></td>
                        <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{e.progress > 0 ? dayLabel(e.lastActive) : '—'}</td>
                      </tr>
                    );
                  })}</tbody>
                </table></div>
              )}
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div className="section-head"><h4 style={{ fontSize: 16 }}>Manage Courses</h4></div>
              <div className="table-wrap"><table className="table" data-testid="courses-table">
                <thead><tr><th>Course</th><th>Category</th><th>Level</th><th>Price</th><th>Actions</th></tr></thead>
                <tbody>{courses.map((c) => (
                  <tr key={c.id}>
                    <td>{c.emoji} <strong>{c.title}</strong></td>
                    <td><span className={`course-tag ${catStyle(c.category).tag}`}>{c.category}</span></td>
                    <td>{c.level}</td><td>{formatPrice(c.price)}</td>
                    <td><div className="row-actions">
                      <Link to={`/edit-course/${c.id}`} className="btn btn-ghost btn-sm">Edit</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => onDeleteCourse(c)}>Delete</button>
                    </div></td>
                  </tr>))}</tbody>
              </table></div>
            </div>

            <div className="card">
              <div className="section-head"><h4 style={{ fontSize: 16 }}>Students</h4></div>
              {students.length === 0 ? <Empty icon="🎓" title="No students yet" /> : (
                <div className="table-wrap"><table className="table" data-testid="students-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Roll No</th><th>Actions</th></tr></thead>
                  <tbody>{students.map((s) => (
                    <tr key={s.id}><td><strong>{s.name}</strong></td><td>{s.email}</td><td>{s.rollNo || '—'}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => onDeleteStudent(s)}>Delete</button></td></tr>))}</tbody>
                </table></div>
              )}
            </div>
          </>
        )}
      </Async>
    </PageLayout>
  );
}
