import { Outlet } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar.jsx';
import AdminNavbar from './components/AdminNavbar.jsx';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-luxury-bg">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
