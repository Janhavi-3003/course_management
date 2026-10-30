import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-center">
      <div className="empty-state">
        <div className="e-icon">🧭</div>
        <h2>Page not found</h2>
        <p>The page you are looking for does not exist.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Home</Link>
      </div>
    </div>
  );
}
