import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getCourseById, getEnrollment } from '../utils/api';
import { certId } from '../utils/ui';

export default function Certificate() {
  const { courseId } = useParams();
  const { session } = useAuth();
  const course = courseId ? getCourseById(courseId) : null;
  const enrollment = course ? getEnrollment(session.email, course.id) : null;

  function renderBody() {
    if (!course || !enrollment) {
      return (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="e-icon" style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Certificate not found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>That course wasn't found or you're not enrolled in it.</p>
          <Link to="/my-courses" className="btn btn-primary">Back to My Courses</Link>
        </div>
      );
    }
    if (!enrollment.completedAt) {
      return (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="e-icon" style={{ fontSize: 48, marginBottom: 12 }}>📖</div>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Course not completed yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>You're at {enrollment.progress}% — finish every module to unlock your certificate.</p>
          <Link to={`/course/${course.id}`} className="btn btn-primary">Continue Learning</Link>
        </div>
      );
    }

    const dateStr = new Date(enrollment.completedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    const code = certId(session.email, course.id, enrollment.completedAt);

    return (
      <>
        <div className="cert-outer">
          <div className="cert-frame">
            <div className="cert-watermark">🎓</div>
            <div className="cert-corner tl"></div>
            <div className="cert-corner tr"></div>
            <div className="cert-corner bl"></div>
            <div className="cert-corner br"></div>

            <div className="cert-topline">
              <div className="cert-brand"><span className="logo-badge">C</span> Course Management</div>
              <div className="cert-idtag">Certificate ID: <strong>{code}</strong></div>
            </div>

            <div className="cert-body">
              <p className="cert-kicker">Certificate of Completion</p>
              <p className="cert-sub">This is to certify that</p>
              <div className="cert-name">{session.fullName}</div>
              <p className="cert-sub">has successfully completed the course</p>
              <div className="cert-course">{course.emoji} {course.title}</div>
              <p className="cert-meta">Instructor: {course.instructor} &nbsp;·&nbsp; {course.duration} hours &nbsp;·&nbsp; {course.lessons} lessons &nbsp;·&nbsp; {course.level}</p>

              <div className="cert-seal-row"><div className="cert-seal">🏅</div></div>

              <div className="cert-sign-row">
                <div className="cert-sign">
                  <div className="cert-sign-line"></div>
                  <strong>{course.instructor}</strong>
                  <span>Course Instructor</span>
                </div>
                <div className="cert-sign">
                  <div className="cert-sign-line"></div>
                  <strong>{dateStr}</strong>
                  <span>Date of Completion</span>
                </div>
                <div className="cert-sign">
                  <div className="cert-sign-line"></div>
                  <strong>Course Management</strong>
                  <span>Platform Director</span>
                </div>
              </div>

              <p className="cert-verify">Verify this certificate's authenticity anytime using code <code>{code}</code></p>
            </div>
          </div>
        </div>
        <div className="no-print" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <button onClick={() => window.print()} className="btn btn-primary">🖨️ Print / Save as PDF</button>
          <Link to="/my-courses" className="btn btn-ghost">Back to My Courses</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .navbar, footer, .no-print { display: none !important; }
          body { background: #fff; }
          .page-center { min-height:auto; padding:0; align-items:flex-start; }
          .cert-frame { box-shadow:none; }
        }
      `}</style>
      <Navbar variant="back" backTo="/my-courses" backLabel="← My Courses" />
      <div className="page-center" style={{ alignItems: 'flex-start', paddingTop: 50 }}>
        <div style={{ width: '100%', maxWidth: 820 }}>
          {renderBody()}
        </div>
      </div>
      <Footer />
    </>
  );
}
