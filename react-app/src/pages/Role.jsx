import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Role() {
  return (
    <>
      <Navbar variant="back" backTo="/" backLabel="← Home" />
      <div className="page-center">
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h2 style={{ fontSize: 24, marginBottom: 6 }}>How would you like to sign in?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>Choose your role to continue</p>

          <div className="role-grid" style={{ margin: '0 auto' }}>
            <Link to="/student-login" className="role-card">
              <div className="icon">🎓</div>
              <h3>Student</h3>
              <p>Browse &amp; enroll in courses</p>
            </Link>
            <Link to="/admin-login" className="role-card">
              <div className="icon">🛡️</div>
              <h3>Admin</h3>
              <p>Manage courses &amp; enrollments</p>
            </Link>
          </div>

          <p style={{ marginTop: 28, fontSize: 14, color: 'var(--text-muted)' }}>
            New student? <Link to="/student-register">Create an account</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
