import { Link } from 'react-router-dom';
import * as api from '../services/api.js';
import { useData } from '../context/DataContext.jsx';
import useAsync from '../hooks/useAsync.js';
import { Async, Empty } from '../components/Async.jsx';
import PageLayout from '../components/PageLayout.jsx';
import ChartCanvas from '../components/ChartCanvas.jsx';
import { catStyle, dailyHours, streak, totalHours } from '../utils/ui.js';

export default function Progress() {
  const { courses } = useData();
  const state = useAsync(async () => {
    const [enrollments, activity, certificates] = await Promise.all([api.getEnrollments(), api.getActivity(), api.getCertificates()]);
    return { enrollments, activity, certificates };
  }, []);
  const byId = new Map(courses.map((c) => [String(c.id), c]));

  return (
    <PageLayout role="student">
      <h1 style={{ fontSize: 22, marginBottom: 24 }}>My Progress</h1>
      <Async state={state} loadingText="Loading progress…">
        {({ enrollments, activity, certificates }) => {
          const items = enrollments.map((e) => ({ e, c: byId.get(String(e.courseId)) })).filter((x) => x.c);
          const lessons = items.reduce((s, { e, c }) => s + (e.completedLessons ?? Math.round((c.lessons * e.progress) / 100)), 0);
          // hours per week for the last 30 days
          const days = dailyHours(activity, 28);
          const weeks = [0, 1, 2, 3].map((w) => +days.slice(w * 7, w * 7 + 7).reduce((s, d) => s + d.hours, 0).toFixed(1));
          const cats = {};
          items.forEach(({ c }) => { cats[c.category] = (cats[c.category] || 0) + 1; });
          return (
            <>
              <div className="stats-grid">
                <div className="stat-card"><span className="stat-icon">📅</span><span className="stat-label">Day Streak</span><span className="stat-val">{streak(activity)} 🔥</span></div>
                <div className="stat-card"><span className="stat-icon">⏱️</span><span className="stat-label">Total Hours</span><span className="stat-val">{totalHours(activity)}h</span></div>
                <div className="stat-card"><span className="stat-icon">📝</span><span className="stat-label">Lessons Done</span><span className="stat-val">{lessons}</span></div>
                <div className="stat-card"><span className="stat-icon">🏆</span><span className="stat-label">Certificates</span><span className="stat-val">{certificates.length}</span></div>
              </div>
              <div className="charts-row">
                <div className="chart-card"><h4>📈 Hours per Week (last 4 weeks)</h4>
                  <ChartCanvas height={200} type="line" data={{ labels: ['3 weeks ago', '2 weeks ago', 'Last week', 'This week'], datasets: [{ label: 'Hours', data: weeks, borderColor: '#0A66C2', backgroundColor: 'rgba(10,102,194,0.1)', fill: true, tension: 0.4, borderWidth: 2, pointBackgroundColor: '#0A66C2' }] }}
                    options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => `${v}h` }, grid: { color: '#F0F0F0' } }, x: { grid: { display: false } } } }} />
                </div>
                <div className="chart-card"><h4>📚 Subjects Breakdown</h4>
                  {Object.keys(cats).length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Enroll in a course to see this chart.</p>
                    : <ChartCanvas height={200} type="pie" data={{ labels: Object.keys(cats), datasets: [{ data: Object.values(cats), backgroundColor: ['#0A66C2', '#0F9D58', '#EA580C', '#7C3AED', '#F4A400', '#5E6B77'], borderWidth: 0 }] }} options={{ plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10 } } } }} />}
                </div>
              </div>
              <div className="card">
                <h4 style={{ fontSize: 16, marginBottom: 16 }}>Course-by-Course Progress</h4>
                {items.length === 0 ? <Empty icon="📚" title="No courses yet">Enroll in a course to track it here.</Empty> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {items.map(({ e, c }) => (
                      <div key={e.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                          <Link to={`/course/${c.id}`}><strong>{c.title}</strong></Link>
                          <span style={{ color: e.progress >= 100 ? 'var(--success)' : 'var(--primary)' }}>{e.progress}%{e.progress >= 100 ? ' ✓' : ''}</span>
                        </div>
                        <div className="progress-bar" style={{ height: 10 }}><div className={`progress-fill ${e.progress >= 100 ? 'green' : catStyle(c.category).fill}`} style={{ width: `${e.progress}%` }} /></div>
                      </div>
                    ))}
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
