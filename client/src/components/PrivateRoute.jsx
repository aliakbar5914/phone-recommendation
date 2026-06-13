import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!user)             return <Navigate to="/login" replace />;
  // Admins trying to visit user-only pages → friendly notice page
  if (user.role === 'admin') return <Navigate to="/admin-notice" replace />;

  return children;
}

export function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!user)              return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/403" replace />;

  return children;
}
