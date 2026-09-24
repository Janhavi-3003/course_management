import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequireStudent({ children }) {
  const { session } = useAuth();
  return session ? children : <Navigate to="/student-login" replace />;
}

export function RequireAdmin({ children }) {
  const { admin } = useAuth();
  return admin ? children : <Navigate to="/admin-login" replace />;
}
