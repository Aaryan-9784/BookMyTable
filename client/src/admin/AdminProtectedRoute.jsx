/**
 * Requires Cognito session + MongoDB role === admin.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';

export default function AdminProtectedRoute({ children }) {
  const { isAuthenticated, isAdmin, profileLoading } = useAuth();

  if (profileLoading) {
    return <Loader label="Loading account…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: { pathname: '/admin' } }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
