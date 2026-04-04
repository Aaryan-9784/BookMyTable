/**
 * App shell: public layout + admin area + protected user routes.
 */
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import UserProtectedRoute from './components/UserProtectedRoute.jsx';
import AdminProtectedRoute from './admin/AdminProtectedRoute.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import Dashboard from './admin/pages/Dashboard.jsx';
import RestaurantsAdmin from './admin/pages/RestaurantsAdmin.jsx';
import AddRestaurant from './admin/pages/AddRestaurant.jsx';
import EditRestaurant from './admin/pages/EditRestaurant.jsx';
import BookingsAdmin from './admin/pages/BookingsAdmin.jsx';
import UsersAdmin from './admin/pages/UsersAdmin.jsx';
import Home from './pages/Home.jsx';
import Restaurants from './pages/Restaurants.jsx';
import RestaurantDetails from './pages/RestaurantDetails.jsx';
import BookTable from './pages/BookTable.jsx';
import MyBookings from './pages/MyBookings.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';

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
    <Routes>
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="restaurants" element={<RestaurantsAdmin />} />
        <Route path="restaurants/new" element={<AddRestaurant />} />
        <Route path="restaurants/:id/edit" element={<EditRestaurant />} />
        <Route path="bookings" element={<BookingsAdmin />} />
        <Route path="users" element={<UsersAdmin />} />
      </Route>

      <Route
        path="/"
        element={
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1"><Home /></main>
            <Footer />
          </div>
        }
      />
      <Route
        path="/restaurants"
        element={
          <PublicLayout>
            <Restaurants />
          </PublicLayout>
        }
      />
      <Route
        path="/restaurants/:id"
        element={
          <PublicLayout>
            <RestaurantDetails />
          </PublicLayout>
        }
      />
      <Route
        path="/restaurants/:id/book"
        element={
          <PublicLayout>
            <UserProtectedRoute>
              <BookTable />
            </UserProtectedRoute>
          </PublicLayout>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <PublicLayout>
            <UserProtectedRoute>
              <MyBookings />
            </UserProtectedRoute>
          </PublicLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <PublicLayout>
            <UserProtectedRoute>
              <Profile />
            </UserProtectedRoute>
          </PublicLayout>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}
