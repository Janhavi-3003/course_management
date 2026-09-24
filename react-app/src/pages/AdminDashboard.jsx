import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { getCourses, getAllProgressRecords } from '../utils/api';

export default function AdminDashboard() {
  const total = getCourses().length;
  const progressRecords = getAllProgressRecords();
  const enrolledCount = progressRecords.length;
  const completedCount = progressRecords.filter(r => r.completed).length;

  return (
    <>
      <Navbar variant="app" />
      <div className="layout">
        <Sidebar role="admin" />
        <main className="main-content">
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22 }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Manage the course catalog for the platform.</p>
          </div>

          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', maxWidth: 640 }}>
            <div className="stat-card"><span className="stat-icon">📚</span><span className="stat-label">Total Courses</span><span className="stat-val">{total}</span></div>
            <div className="stat-card"><span className="stat-icon">🎓</span><span className="stat-label">Total Enrollments</span><span className="stat-val">{enrolledCount}</span></div>
            <div className="stat-card"><span className="stat-icon">🏆</span><span className="stat-label">Completed</span><span className="stat-val">{completedCount}</span></div>
          </div>

          <div className="card" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to="/add-course" className="btn btn-primary">+ Add New Course</Link>
            <Link to="/browse-courses" className="btn btn-outline">✏️ Manage / Edit Courses</Link>
          </div>

          {progressRecords.length ? (
            <div className="card" style={{ marginTop: 24, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px 0' }}>
                <h3 style={{ fontSize: 15, marginBottom: 2 }}>🎓 Student Progress</h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 12 }}>Live progress for every student enrollment on the platform.</p>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ minWidth: 640 }}>
                  <thead><tr><th>Student</th><th>Course</th><th>Modules</th><th>Progress</th><th>Status</th></tr></thead>
                  <tbody>
                    {progressRecords.map((r, i) => (
                      <tr key={i}>
                        <td>{r.studentName}<div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{r.studentEmail}</div></td>
                        <td>{r.courseTitle}</td>
                        <td>{r.doneModules}/{r.totalModules}</td>
                        <td style={{ minWidth: 140 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="progress-bar" style={{ flex: 1 }}><div className={`progress-fill${r.completed ? ' green' : ''}`} style={{ width: `${r.progress}%` }}></div></div>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.progress}%</span>
                          </div>
                        </td>
                        <td>{r.completed ? <span className="pill pill-success">Completed</span> : <span className="pill pill-primary">In Progress</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card" style={{ marginTop: 24, textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🎓</div>
              <h3 style={{ fontSize: 16, marginBottom: 6 }}>No student enrollments yet</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Once students enroll and start courses, their progress will appear here.</p>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
