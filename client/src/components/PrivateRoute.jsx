/**
 * Wraps protected pages — redirects to login if no Cognito ID token in storage.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from './Loader.jsx';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, profileLoading } = useAuth();
  const location = useLocation();

  if (profileLoading) {
    return <Loader label="Loading account…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
