/**
 * Primary navigation — responsive; highlights active route.
 * On homepage: transparent until scroll. On other pages: always solid.
 */
import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navLinkClass = ({ isActive }) =>
  `relative font-sans text-sm font-medium tracking-wide transition-all duration-300
   after:absolute after:-bottom-1 after:left-0 after:h-px after:transition-all after:duration-300
   ${isActive
     ? 'text-luxury-gold after:w-full after:bg-luxury-gold'
     : 'text-white/70 hover:text-white after:w-0 after:bg-luxury-gold hover:after:w-full'
   }`;

function nameFromEmail(emailStr) {
  if (!emailStr) return '';
  const local = emailStr.split('@')[0];
  const stripped = local.replace(/[0-9_.\-]+/g, ' ').trim();
  const spaced = stripped.replace(/([a-z])([A-Z])/g, '$1 $2');
  return spaced.split(/\s+/).filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function initials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function Navbar() {
  const { isAuthenticated, email, isAdmin, profile, displayName } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const transparent = isHome && !scrolled;
  const userInitials = initials(displayName || nameFromEmail(email) || 'U');

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: transparent ? 'transparent' : 'rgba(6,6,7,0.96)',
        backdropFilter: transparent ? 'none' : 'blur(28px)',
        WebkitBackdropFilter: transparent ? 'none' : 'blur(28px)',
        borderBottom: transparent ? '1px solid transparent' : '1px solid rgba(212,175,55,0.1)',
        boxShadow: transparent ? 'none' : '0 8px 40px rgba(0,0,0,0.6)',
      }}
    >
      {/* Gold shimmer line — only when solid */}
      <div
        className="absolute inset-x-0 top-0 h-px transition-opacity duration-500"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.6) 30%, rgba(245,230,163,0.8) 50%, rgba(212,175,55,0.6) 70%, transparent 100%)',
          opacity: transparent ? 0 : 1,
        }}
      />

      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center font-display text-[1.6rem] font-semibold tracking-tight text-white transition-all duration-300 hover:opacity-80">
          <span>Book</span>
          <span style={{
            background: 'linear-gradient(135deg, #c9a84c 0%, #f5e6a3 45%, #c9a84c 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.35))',
          }}>My</span>
          <span>Table</span>
        </Link>

        {/* Center links */}
        <div className="hidden items-center md:flex" style={{ gap: '2rem' }}>
          <span className="h-1 w-1 rounded-full bg-luxury-gold/20" />
          <NavLink to="/restaurants" className={navLinkClass}>Restaurants</NavLink>
          {isAuthenticated && (
            <>
              <span className="h-3 w-px bg-white/10" />
              <NavLink to="/my-bookings" className={navLinkClass}>My bookings</NavLink>
            </>
          )}
          <span className="h-1 w-1 rounded-full bg-luxury-gold/20" />
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/profile"
              className="group hidden items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 transition-all duration-300 lg:flex"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.border = '1px solid rgba(212,175,55,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; }}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-sans text-[0.6rem] font-bold text-[#0a0a0a]"
                style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #f5e6a3 50%, #c9a84c 100%)', boxShadow: '0 0 12px rgba(212,175,55,0.4)' }}>
                {userInitials}
              </span>
              <span className="max-w-[120px] truncate font-sans text-xs font-medium text-white/80 group-hover:text-white">{displayName || nameFromEmail(email)}</span>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: '#d4af37', boxShadow: '0 0 6px rgba(212,175,55,0.9)' }} />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-full px-4 py-2 font-sans text-sm text-white/70 transition-all duration-200 hover:text-white">Log in</Link>
              <Link to="/signup" className="rounded-full px-5 py-2.5 font-sans text-sm font-semibold text-[#0a0a0a] transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #f5e6a3 50%, #c9a84c 100%)', boxShadow: '0 0 24px rgba(212,175,55,0.3)' }}>
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile nav */}
      <div className="flex border-t px-4 py-3 md:hidden" style={{ borderColor: 'rgba(212,175,55,0.07)' }}>
        <div className="flex w-full items-center justify-around">
          <NavLink to="/restaurants" className={navLinkClass}>Venues</NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/my-bookings" className={navLinkClass}>Bookings</NavLink>
              <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
              {isAdmin && <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
