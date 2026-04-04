import { Outlet } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar.jsx';
import AdminNavbar from './components/AdminNavbar.jsx';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen" style={{ background: '#0b0b0c' }}>
      <AdminSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <AdminNavbar />
        <main className="flex-1 overflow-auto px-6 py-8 md:px-10 md:py-10 anim-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
