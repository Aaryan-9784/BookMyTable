/**
 * Protects Partner Console routes for restaurant owners and super admins.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';

export default function RestaurantProtectedRoute({ children }) {
  const { isAuthenticated, isRestaurant, isAdmin, profileLoading } = useAuth();

  if (profileLoading) {
    return <Loader label="Verifying partner credentials…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: { pathname: '/restaurant-dashboard' } }} />;
  }

  if (!isRestaurant && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
