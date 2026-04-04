import { NavLink, useLocation } from 'react-router-dom';

const link =
  'block rounded-lg px-4 py-2.5 font-sans text-sm transition hover:bg-luxury-border/60';
const active = 'bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/30';

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const restaurantsActive = pathname.startsWith('/admin/restaurants');

  return (
    <aside className="w-56 shrink-0 border-r border-luxury-border bg-luxury-surface/80 p-4">
      <p className="font-display text-lg text-white">
        Admin<span className="text-luxury-gold">Panel</span>
      </p>
      <nav className="mt-6 flex flex-col gap-1">
        <NavLink end to="/admin" className={({ isActive }) => `${link} ${isActive ? active : 'text-luxury-muted'}`}>
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/restaurants"
          className={() => `${link} ${restaurantsActive ? active : 'text-luxury-muted'}`}
        >
          Restaurants
        </NavLink>
        <NavLink to="/admin/bookings" className={({ isActive }) => `${link} ${isActive ? active : 'text-luxury-muted'}`}>
          Bookings
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => `${link} ${isActive ? active : 'text-luxury-muted'}`}>
          Users
        </NavLink>
        <NavLink to="/" className={`${link} mt-4 text-luxury-muted`}>
          ← Back to site
        </NavLink>
      </nav>
    </aside>
  );
}
