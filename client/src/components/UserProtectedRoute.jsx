/**
 * Alias for authenticated routes (Cognito JWT required).
 */
import PrivateRoute from './PrivateRoute.jsx';

export default function UserProtectedRoute({ children }) {
  return <PrivateRoute>{children}</PrivateRoute>;
}
