import { Link } from 'react-router-dom';
import * as api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import useAsync from '../hooks/useAsync.js';
import { Async, Empty } from '../components/Async.jsx';
import PageLayout from '../components/PageLayout.jsx';
import ChartCanvas from '../components/ChartCanvas.jsx';
import { dailyHours, dayLabel, greeting, statusPill, streak, totalHours, catStyle } from '../utils/ui.js';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { courses } = useData();
  const state = useAsync(async () => {
    const [enrollments, activity, certificates] = await Promise.all([api.getEnrollments(), api.getActivity(), api.getCertificates()]);
    return { enrollments, activity, certificates };
  }, []);
  const byId = new Map(courses.map((c) => [String(c.id), c]));
  const first = (user?.name || 'there').split(' ')[0];

  return (
    <PageLayout role="student">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22 }}>{greeting()}, {first} 👋</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Here is your learning overview.</p>
      </div>
      <Async state={state} loadingText="Loading your dashboard…">
        {({ enrollments, activity, certificates }) => {
          const completed = enrollments.filter((e) => e.progress >= 100).length;
          const inProgress = enrollments.filter((e) => e.progress > 0 && e.progress < 100).length;
          const notStarted = enrollments.length - completed - inProgress;
          const week = dailyHours(activity, 7);
          const month = dailyHours(activity, 30);
          const todayHours = week[week.length - 1].hours;
          const s = streak(activity);
          return (
            <>
              <div className="stats-grid">
                <div className="stat-card"><span className="stat-icon">📚</span><span className="stat-label">Enrolled</span><span className="stat-val" data-testid="stat-enrolled">{enrollments.length}</span><span className="stat-sub">Active courses</span></div>
                <div className="stat-card"><span className="stat-icon">✅</span><span className="stat-label">Completed</span><span className="stat-val">{completed}</span><span className="stat-sub">{enrollments.length ? Math.round((completed / enrollments.length) * 100) : 0}% rate</span></div>
                <div className="stat-card"><span className="stat-icon">⏱️</span><span className="stat-label">Hours Learned</span><span className="stat-val">{totalHours(activity)}</span><span className="stat-sub">+{todayHours} today</span></div>
                <div className="stat-card"><span className="stat-icon">🔥</span><span className="stat-label">Day Streak</span><span className="stat-val">{s}</span><span className="stat-sub">{certificates.length} certificate{certificates.length === 1 ? '' : 's'}</span></div>
              </div>

              <div className="charts-row">
                <div className="chart-card">
                  <h4>📈 Weekly Learning Hours</h4>
                  <ChartCanvas type="bar" data={{
                    labels: week.map((d) => d.label),
                    datasets: [
                      { label: 'Hours', data: week.map((d) => d.hours), backgroundColor: week.map((_, i) => (i === week.length - 1 ? '#0A66C2' : '#BBD6F2')), borderRadius: 5 },
                      { label: 'Goal', data: week.map(() => 2), type: 'line', borderColor: '#F4A400', borderDash: [5, 4], pointRadius: 0, borderWidth: 2 },
                    ],
                  }} options={{ plugins: { legend: { labels: { font: { size: 11 } } } }, scales: { y: { beginAtZero: true, suggestedMax: 4, ticks: { callback: (v) => `${v}h` }, grid: { color: '#F0F0F0' } }, x: { grid: { display: false } } } }} />
                </div>
                <div className="chart-card">
                  <h4>🎯 Course Status</h4>
                  <ChartCanvas type="doughnut" data={{ labels: ['Completed', 'In Progress', 'Not Started'], datasets: [{ data: [completed, inProgress, notStarted], backgroundColor: ['#0F9D58', '#0A66C2', '#DCE2E8'], borderWidth: 0 }] }}
                    options={{ cutout: '68%', plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10 } } } }} />
                </div>
              </div>

              <div className="chart-card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h4 style={{ margin: 0 }}>📅 Daily Progress — Last 30 Days</h4>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Goal: <strong style={{ color: 'var(--primary)' }}>2 hrs/day</strong></span>
                </div>
                <ChartCanvas height={180} type="bar" data={{
                  labels: month.map((d) => d.day),
                  datasets: [
                    { label: 'Hours', data: month.map((d) => d.hours), backgroundColor: month.map((d) => (d.hours >= 2 ? '#0A66C2' : '#BBD6F2')), borderRadius: 3 },
                    { label: 'Goal', data: month.map(() => 2), type: 'line', borderColor: '#F4A400', borderDash: [4, 3], pointRadius: 0, borderWidth: 2 },
                  ],
                }} options={{ plugins: { legend: { labels: { font: { size: 11 } } } }, scales: { y: { beginAtZero: true, suggestedMax: 4, ticks: { callback: (v) => `${v}h` }, grid: { color: '#F0F0F0' } }, x: { grid: { display: false }, ticks: { maxRotation: 0, font: { size: 9 } } } } }} />
              </div>

              <div className="card" style={{ marginBottom: 24 }}>
                <div className="section-head"><h4 style={{ fontSize: 16 }}>All Courses Progress</h4><Link to="/progress" className="btn btn-ghost btn-sm">Details →</Link></div>
                {enrollments.length === 0 ? (
                  <Empty icon="📚" title="No courses yet">Browse the catalogue and enroll in your first course.</Empty>
                ) : (
                  <div className="table-wrap">
                    <table className="table">
                      <thead><tr><th>Course</th><th>Progress</th><th>Status</th><th>Last Active</th></tr></thead>
                      <tbody>
                        {enrollments.map((e) => {
                          const c = byId.get(String(e.courseId));
                          const cs = catStyle(c?.category);
                          const pill = statusPill(e.status);
                          return (
                            <tr key={e.id}>
                              <td><Link to={`/course/${e.courseId}`}><strong>{c?.title || e.course?.title || 'Course'}</strong></Link></td>
                              <td><div className="progress-bar" style={{ width: 180, display: 'inline-block', verticalAlign: 'middle' }}><div className={`progress-fill ${e.progress >= 100 ? 'green' : cs.fill}`} style={{ width: `${e.progress}%` }} /></div><span style={{ fontSize: 12, color: 'var(--text-muted)' }}> {e.progress}%</span></td>
                              <td><span className={`pill ${pill}`} style={!pill ? { background: 'var(--border)', color: 'var(--text-muted)' } : undefined}>{e.status}{e.progress >= 100 ? ' ✓' : ''}</span></td>
                              <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{e.progress > 0 ? dayLabel(e.lastActive) : '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          );
        }}
      </Async>
    </PageLayout>
  );
}
