import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function RequireStudent({ children }) {
  const { isStudent } = useAuth();
  const loc = useLocation();
  return isStudent ? children : <Navigate to="/student-login" state={{ from: loc.pathname }} replace />;
}

export function RequireAdmin({ children }) {
  const { isAdmin } = useAuth();
  const loc = useLocation();
  return isAdmin ? children : <Navigate to="/admin-login" state={{ from: loc.pathname }} replace />;
}

// any logged-in user (student or admin)
export function RequireAuth({ children }) {
  const { session } = useAuth();
  const loc = useLocation();
  return session ? children : <Navigate to="/role" state={{ from: loc.pathname }} replace />;
}
