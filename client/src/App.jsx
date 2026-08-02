/**
 * App shell: public layout + admin area + protected user routes.
 * Wrapped with Error Boundaries for graceful error handling.
 */
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import RouteErrorBoundary from './components/RouteErrorBoundary.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import UserProtectedRoute from './components/UserProtectedRoute.jsx';
import AdminProtectedRoute from './admin/AdminProtectedRoute.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import Dashboard from './admin/pages/Dashboard.jsx';
import RestaurantsAdmin from './admin/pages/RestaurantsAdmin.jsx';
import AddRestaurant from './admin/pages/AddRestaurant.jsx';
import EditRestaurant from './admin/pages/EditRestaurant.jsx';
import UsersAdmin from './admin/pages/UsersAdmin.jsx';

import RestaurantProtectedRoute from './restaurant/RestaurantProtectedRoute.jsx';
import RestaurantLayout from './restaurant/RestaurantLayout.jsx';
import RestaurantDashboard from './restaurant/pages/RestaurantDashboard.jsx';
import TablesManagement from './restaurant/pages/TablesManagement.jsx';
import RestaurantBookings from './restaurant/pages/RestaurantBookings.jsx';
import TokenFeeAnalytics from './restaurant/pages/TokenFeeAnalytics.jsx';
import RestaurantSettings from './restaurant/pages/RestaurantSettings.jsx';

import Home from './pages/Home.jsx';
import Restaurants from './pages/Restaurants.jsx';
import RestaurantDetails from './pages/RestaurantDetails.jsx';
import BookTable from './pages/BookTable.jsx';
import MyBookings from './pages/MyBookings.jsx';
import BookingConfirmation from './pages/BookingConfirmation.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';

function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {/* pt-[73px] offsets the fixed navbar height on non-hero pages */}
      <main className="flex-1 pt-[73px]">{children}</main>
      <Footer />
    </div>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-[73px]">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<RouteErrorBoundary routeName="Admin Dashboard"><Dashboard /></RouteErrorBoundary>} />
          <Route path="restaurants" element={<RouteErrorBoundary routeName="Restaurants Management"><RestaurantsAdmin /></RouteErrorBoundary>} />
          <Route path="restaurants/new" element={<RouteErrorBoundary routeName="Add Restaurant"><AddRestaurant /></RouteErrorBoundary>} />
          <Route path="restaurants/:id/edit" element={<RouteErrorBoundary routeName="Edit Restaurant"><EditRestaurant /></RouteErrorBoundary>} />
          <Route path="users" element={<RouteErrorBoundary routeName="Users Management"><UsersAdmin /></RouteErrorBoundary>} />
        </Route>

        <Route
          path="/restaurant-dashboard"
          element={
            <RestaurantProtectedRoute>
              <RestaurantLayout />
            </RestaurantProtectedRoute>
          }
        >
          <Route index element={<RouteErrorBoundary routeName="Restaurant Dashboard"><RestaurantDashboard /></RouteErrorBoundary>} />
          <Route path="tables" element={<RouteErrorBoundary routeName="Tables Management"><TablesManagement /></RouteErrorBoundary>} />
          <Route path="bookings" element={<RouteErrorBoundary routeName="Bookings"><RestaurantBookings /></RouteErrorBoundary>} />
          <Route path="analytics" element={<RouteErrorBoundary routeName="Analytics"><TokenFeeAnalytics /></RouteErrorBoundary>} />
          <Route path="settings" element={<RouteErrorBoundary routeName="Settings"><RestaurantSettings /></RouteErrorBoundary>} />
        </Route>

        <Route
          path="/"
          element={
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">
                <RouteErrorBoundary routeName="Home">
                  <Home />
                </RouteErrorBoundary>
              </main>
              <Footer />
            </div>
          }
        />
        <Route
          path="/restaurants"
          element={
            <PublicLayout>
              <RouteErrorBoundary routeName="Restaurants">
                <Restaurants />
              </RouteErrorBoundary>
            </PublicLayout>
          }
        />
        <Route
          path="/restaurants/:id"
          element={
            <PublicLayout>
              <RouteErrorBoundary routeName="Restaurant Details">
                <RestaurantDetails />
              </RouteErrorBoundary>
            </PublicLayout>
          }
        />
        <Route
          path="/restaurants/:id/book"
          element={
            <PublicLayout>
              <UserProtectedRoute>
                <RouteErrorBoundary routeName="Book Table">
                  <BookTable />
                </RouteErrorBoundary>
              </UserProtectedRoute>
            </PublicLayout>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <PublicLayout>
              <UserProtectedRoute>
                <RouteErrorBoundary routeName="My Bookings">
                  <MyBookings />
                </RouteErrorBoundary>
              </UserProtectedRoute>
            </PublicLayout>
          }
        />
        <Route
          path="/booking-confirmation/:id"
          element={
            <PublicLayout>
              <UserProtectedRoute>
                <RouteErrorBoundary routeName="Booking Confirmation">
                  <BookingConfirmation />
                </RouteErrorBoundary>
              </UserProtectedRoute>
            </PublicLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <PublicLayout>
              <UserProtectedRoute>
                <RouteErrorBoundary routeName="Profile">
                  <Profile />
                </RouteErrorBoundary>
              </UserProtectedRoute>
            </PublicLayout>
          }
        />
        <Route path="/login" element={<RouteErrorBoundary routeName="Login"><Login /></RouteErrorBoundary>} />
        <Route path="/signup" element={<RouteErrorBoundary routeName="Signup"><Signup /></RouteErrorBoundary>} />
        <Route path="/forgot-password" element={<RouteErrorBoundary routeName="Forgot Password"><ForgotPassword /></RouteErrorBoundary>} />
      </Routes>
    </ErrorBoundary>
  );
}
