import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminNavbar() {
  const { email, logout } = useAuth();
  return (
    <header className="flex items-center justify-between border-b border-luxury-border bg-luxury-bg/95 px-6 py-3">
      <Link to="/" className="font-display text-xl text-white">
        Book<span className="text-luxury-gold">My</span>Table
      </Link>
      <div className="flex items-center gap-4">
        <span className="hidden max-w-[200px] truncate text-xs text-luxury-muted sm:inline">{email}</span>
        <button
          type="button"
          onClick={logout}
          className="rounded border border-luxury-border px-3 py-1.5 font-sans text-sm text-luxury-muted hover:text-luxury-gold"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
