import { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const PAGE_TITLES = {
  '/admin':             'Dashboard',
  '/admin/restaurants': 'Restaurants',
  '/admin/bookings':    'Bookings',
  '/admin/users':       'Users',
};

function getInitials(name = '', email = '') {
  const src = name?.trim() || email.split('@')[0];
  const parts = src.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

function getDisplayName(name = '', email = '') {
  if (name?.trim()) return name.trim();
  const local = email.split('@')[0].replace(/[._-]/g, ' ');
  return local.replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ─────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────── */
function IconProfile() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="5" r="2.8" stroke="currentColor" strokeWidth="1.25" />
      <path d="M1.5 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}
function IconSwitchView() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 4.5h9M7.5 2l3 2.5-3 2.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 9.5H4M6.5 7l-3 2.5 3 2.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M9.5 9.5L12 7l-2.5-2.5M12 7H5.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconChevron({ open }) {
  return (
    <svg
      width="10" height="10" viewBox="0 0 10 10" fill="none"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s ease' }}
    >
      <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────────────────────── */
function Avatar({ initials, size = 32 }) {
  return (
    <div
      className="shrink-0 rounded-full"
      style={{
        width: size + 4,
        height: size + 4,
        padding: '1.5px',
        background: 'linear-gradient(135deg, #f5e27a 0%, #d4af37 50%, #a8892a 100%)',
        boxShadow: '0 0 10px rgba(212,175,55,0.30)',
      }}
    >
      <div
        className="flex h-full w-full items-center justify-center rounded-full font-sans font-bold"
        style={{
          background: 'linear-gradient(145deg, #242424, #181818)',
          color: '#d4af37',
          fontSize: size * 0.34,
          letterSpacing: '0.04em',
        }}
      >
        {initials}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   POPUP MENU ITEM
───────────────────────────────────────────────────────────── */
function MenuItem({ icon, label, onClick, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-sans text-[13px] font-medium text-left"
      style={{
        color: danger ? (hov ? '#f87171' : '#888') : (hov ? '#d4af37' : '#aaa'),
        background: danger
          ? hov ? 'rgba(239,68,68,0.08)' : 'transparent'
          : hov ? 'rgba(212,175,55,0.08)' : 'transparent',
        transition: 'background 0.18s ease, color 0.18s ease',
      }}
    >
      <span style={{ color: danger ? (hov ? '#f87171' : '#555') : (hov ? '#d4af37' : '#555'), transition: 'color 0.18s ease' }}>
        {icon}
      </span>
      {label}
      {!danger && hov && (
        <svg className="ml-auto" width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   PROFILE POPUP
───────────────────────────────────────────────────────────── */
function ProfilePopup({ name, email, role, onClose, onLogout }) {
  const initials = getInitials(name, email);
  return (
    <div
      className="absolute right-0 top-full z-50 mt-2.5 w-[268px]"
      style={{ animation: 'profilePopupIn 0.22s cubic-bezier(0.22,1,0.36,1) forwards' }}
    >
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(160deg, #1e1e1e 0%, #161616 100%)',
          border: '1px solid rgba(212,175,55,0.13)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.025), inset 0 1px 0 rgba(255,255,255,0.04)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
        }}
      >
        {/* Top ambient glow */}
        <div
          className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 h-20 w-32 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.08) 0%, transparent 70%)' }}
        />

        {/* ── Profile header ─────────────────────────────── */}
        <div className="relative px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3.5">
            <Avatar initials={initials} size={44} />
            <div className="min-w-0 flex-1">
              <p className="font-sans text-[14px] font-semibold text-white leading-snug truncate">
                {name}
              </p>
              <p className="font-sans text-[11px] text-luxury-muted truncate mt-0.5">
                {email}
              </p>
              <span
                className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-sans text-[9px] font-bold uppercase tracking-[0.14em]"
                style={{
                  background: role === 'admin' ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.06)',
                  border: role === 'admin' ? '1px solid rgba(212,175,55,0.28)' : '1px solid rgba(255,255,255,0.10)',
                  color: role === 'admin' ? '#d4af37' : '#9a9a9a',
                }}
              >
                {role === 'admin' && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 6.5l.8-3L4 5l2.2-1.5.8 3H1z" fill="#d4af37" />
                  </svg>
                )}
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* ── Menu ───────────────────────────────────────── */}
        <div className="px-2 py-2">
          <Link to="/profile" onClick={onClose}>
            <MenuItem icon={<IconProfile />} label="View Profile" />
          </Link>
          <Link to="/" onClick={onClose}>
            <MenuItem icon={<IconSwitchView />} label="Switch to User View" />
          </Link>
        </div>

        {/* ── Divider ────────────────────────────────────── */}
        <div
          className="mx-4"
          style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.16), transparent)' }}
        />

        {/* ── Logout ─────────────────────────────────────── */}
        <div className="px-2 py-2">
          <MenuItem icon={<IconLogout />} label="Log out" onClick={onLogout} danger />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BREADCRUMB SEPARATOR
───────────────────────────────────────────────────────────── */
function BreadcrumbSep() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M4.5 2.5L7.5 6l-3 3.5" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN NAVBAR
───────────────────────────────────────────────────────────── */
export default function AdminNavbar() {
  const { email, profile, role, logout } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [pillHov, setPillHov] = useState(false);
  const ref = useRef(null);

  const name     = getDisplayName(profile?.name, email);
  const initials = getInitials(profile?.name, email);

  const title = Object.entries(PAGE_TITLES).find(([p]) =>
    p === '/admin' ? pathname === '/admin' : pathname.startsWith(p)
  )?.[1] ?? 'Admin';

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const handleLogout = () => { setOpen(false); logout(); };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-7 md:px-10"
      style={{
        height: '58px',
        background: 'rgba(9,9,10,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(212,175,55,0.07)',
        boxShadow: '0 1px 0 rgba(212,175,55,0.04), 0 4px 24px rgba(0,0,0,0.35)',
      }}
    >
      {/* ── Breadcrumb ───────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <span
          className="font-sans uppercase"
          style={{ fontSize: '10px', letterSpacing: '0.20em', color: '#404040' }}
        >
          Admin
        </span>
        <BreadcrumbSep />
        <span
          className="font-sans font-semibold"
          style={{ fontSize: '13px', color: '#d8d8d8', letterSpacing: '0.01em' }}
        >
          {title}
        </span>
      </div>

      {/* ── Profile pill ─────────────────────────────────── */}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          onMouseEnter={() => setPillHov(true)}
          onMouseLeave={() => setPillHov(false)}
          className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3.5"
          style={{
            background: open
              ? 'rgba(212,175,55,0.10)'
              : pillHov
              ? 'rgba(212,175,55,0.06)'
              : 'rgba(255,255,255,0.04)',
            border: open
              ? '1px solid rgba(212,175,55,0.32)'
              : pillHov
              ? '1px solid rgba(212,175,55,0.20)'
              : '1px solid rgba(212,175,55,0.11)',
            boxShadow: open
              ? '0 0 22px rgba(212,175,55,0.14), inset 0 0 12px rgba(212,175,55,0.04)'
              : pillHov
              ? '0 0 14px rgba(212,175,55,0.08)'
              : 'none',
            transform: pillHov && !open ? 'scale(1.025)' : 'scale(1)',
            transition: 'all 0.22s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
        >
          <Avatar initials={initials} size={28} />

          <div className="hidden sm:block text-left">
            <p className="font-sans font-semibold text-white leading-none" style={{ fontSize: '12px' }}>
              {name}
            </p>
            <p
              className="leading-none mt-0.5 capitalize"
              style={{ fontSize: '10px', color: '#d4af37', letterSpacing: '0.04em', fontFamily: 'inherit' }}
            >
              {role ?? 'Admin'}
            </p>
          </div>

          <span
            className="hidden sm:block ml-0.5"
            style={{ color: open ? '#d4af37' : '#555', transition: 'color 0.22s ease' }}
          >
            <IconChevron open={open} />
          </span>
        </button>

        {open && (
          <ProfilePopup
            name={name}
            email={email}
            role={role ?? 'admin'}
            onClose={() => setOpen(false)}
            onLogout={handleLogout}
          />
        )}
      </div>
    </header>
  );
}
