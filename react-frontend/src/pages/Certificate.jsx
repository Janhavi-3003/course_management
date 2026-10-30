import { Link, useParams } from 'react-router-dom';
import * as api from '../services/api.js';
import useAsync from '../hooks/useAsync.js';
import { Async } from '../components/Async.jsx';
import PageLayout from '../components/PageLayout.jsx';
import { formatDate } from '../utils/ui.js';

export default function Certificate() {
  const { courseId } = useParams();
  const state = useAsync(() => api.getCertificate(courseId), [courseId]);

  return (
    <PageLayout role="student">
      <Link to="/my-courses" className="back-link no-print" style={{ marginBottom: 18, display: 'inline-flex' }}>← My Courses</Link>
      {state.error && !state.loading ? (
        <div className="empty-state"><div className="e-icon">🏆</div><h3>No certificate yet</h3><p>{state.error}</p>
          <Link to={`/course/${courseId}`} className="btn btn-primary" style={{ marginTop: 14 }}>Continue the course</Link></div>
      ) : (
        <Async state={state} loadingText="Loading certificate…">
          {(c) => (
            <>
              <div className="cert-box" data-testid="certificate">
                <h2>Certificate of Completion</h2>
                <p>This certifies that</p>
                <div className="cert-name">{c.student?.name}</div>
                <p>has successfully completed</p>
                <div className="cert-course">{c.course?.title}</div>
                <p style={{ fontSize: 13 }}>Instructor: {c.course?.instructor} · Issued {formatDate(c.issuedAt)}</p>
                <p style={{ fontSize: 12, marginTop: 14, letterSpacing: '0.06em' }}>Verification code: <strong>{c.code}</strong></p>
              </div>
              <div style={{ textAlign: 'center', marginTop: 20 }} className="no-print">
                <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print / Save as PDF</button>
              </div>
            </>
          )}
        </Async>
      )}
    </PageLayout>
  );
}
