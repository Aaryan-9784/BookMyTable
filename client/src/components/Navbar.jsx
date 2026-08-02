/**
 * Primary navigation — responsive; highlights active route.
 * On homepage: transparent until scroll. On other pages: always solid.
 */
import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';

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

/* ── SVG ICONS ────────────────────────────────────────────── */
function IconProfile() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="5" r="2.8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconSwitchView() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
      <path d="M1 4.5h9M7.5 2l3 2.5-3 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 9.5H4M6.5 7l-3 2.5 3 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
      <path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M9.5 9.5L12 7l-2.5-2.5M12 7H5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevron({ open }) {
  return (
    <svg
      width="11" height="11" viewBox="0 0 10 10" fill="none"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
    >
      <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2a3.5 3.5 0 00-3.5 3.5v2.8L3 10.5h10l-1.5-2.2V5.5A3.5 3.5 0 008 2z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 12.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/* ── AVATAR COMPONENT WITH ONLINE STATUS DOT ─────────────── */
function Avatar({ initials, size = 30, showStatus = true }) {
  return (
    <div className="relative shrink-0 select-none">
      <div
        className="rounded-full"
        style={{
          width: size + 4,
          height: size + 4,
          padding: '1.5px',
          background: 'linear-gradient(135deg, #f5e27a 0%, #d4af37 50%, #997819 100%)',
          boxShadow: '0 0 14px rgba(212,175,55,0.35)',
        }}
      >
        <div
          className="flex h-full w-full items-center justify-center rounded-full font-sans font-extrabold"
          style={{
            background: 'linear-gradient(145deg, #242424, #141414)',
            color: '#f5e27a',
            fontSize: Math.round(size * 0.36),
            letterSpacing: '0.04em',
            textShadow: '0 0 8px rgba(212,175,55,0.4)',
          }}
        >
          {initials}
        </div>
      </div>
      {showStatus && (
        <span
          className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#09090a] bg-emerald-400 status-pulse-green"
          title="Online"
        />
      )}
    </div>
  );
}

/* ── MENU ITEM ────────────────────────────────────────────── */
function MenuItem({ icon, label, onClick, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-sans text-[13px] font-medium text-left transition-all duration-180"
      style={{
        color: danger ? (hov ? '#f87171' : '#888') : (hov ? '#d4af37' : '#aaa'),
        background: danger
          ? hov ? 'rgba(239,68,68,0.08)' : 'transparent'
          : hov ? 'rgba(212,175,55,0.08)' : 'transparent',
      }}
    >
      <span
        style={{
          color: danger ? (hov ? '#f87171' : '#555') : (hov ? '#d4af37' : '#555'),
          transition: 'color 0.18s ease',
        }}
      >
        {icon}
      </span>
      <span className="flex-1 leading-none">{label}</span>
    </button>
  );
}

/* ── NOTIFICATIONS POPUP ───────────────────────────────────── */
function NotificationsPopup() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const unreadItems = notifications.filter((n) => n.unread);

  return (
    <div
      className="absolute right-0 top-full z-50 mt-2.5 w-[310px] sm:w-[330px] overflow-hidden rounded-2xl"
      style={{
        animation: 'profilePopupIn 0.22s cubic-bezier(0.22,1,0.36,1) forwards',
        background: 'linear-gradient(160deg, #1c1c1f 0%, #121214 100%)',
        border: '1px solid rgba(212,175,55,0.18)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
      }}
    >
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="font-sans text-[13px] font-semibold text-white">Notifications</span>
          {unreadCount > 0 && (
            <span
              className="rounded-full px-2 py-0.5 font-sans text-[10px] font-bold"
              style={{
                background: 'rgba(212,175,55,0.16)',
                border: '1px solid rgba(212,175,55,0.30)',
                color: '#f5e27a',
              }}
            >
              {unreadCount} New
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="font-sans text-[11px] font-medium text-amber-400/80 hover:text-amber-300 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="divide-y divide-white/5">
        {unreadItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 gap-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-gray-600">
              <path d="M12 3a5 5 0 00-5 5v3.5L5 14h14l-2-2.5V8a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 18a2 2 0 004 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <p className="font-sans text-[11px] text-gray-500">All caught up!</p>
          </div>
        ) : (
          unreadItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => markRead(item.id)}
              className="w-full text-left p-3.5 transition-colors bg-amber-500/[0.04] hover:bg-amber-500/[0.07]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0 mt-0.5" />
                  <p className="font-sans text-[12px] font-semibold text-gray-100 leading-snug truncate">{item.title}</p>
                </div>
                <span className="font-sans text-[10px] text-gray-500 shrink-0">{item.time}</span>
              </div>
              <p className="font-sans text-[11px] text-gray-500 mt-1 leading-relaxed pl-3.5 text-left">{item.desc}</p>
            </button>
          ))
        )}
      </div>

      <div className="border-t border-white/5 p-2 bg-black/20 text-center">
        <span className="font-sans text-[10px] text-gray-500">Live Activity Feed • Realtime Updates</span>
      </div>
    </div>
  );
}

function IconCalendar() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
      <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 1v3M9.5 1v3M1.5 5.5h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/* ── PROFILE POPUP MENU ────────────────────────────────────── */
function ProfilePopup({ name, email, role, isCustomer, isRestaurant, isAdmin, onClose, onLogout }) {
  const userInitials = initials(name);
  return (
    <div
      className="absolute right-0 top-full z-50 mt-2.5 w-[260px]"
      style={{ animation: 'profilePopupIn 0.22s cubic-bezier(0.22,1,0.36,1) forwards' }}
    >
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(160deg, #1e1e1e 0%, #141414 100%)',
          border: '1px solid rgba(212,175,55,0.13)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.025), inset 0 1px 0 rgba(255,255,255,0.04)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
        }}
      >
        {/* Profile Card Header */}
        <div className="relative px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3">
            <Avatar initials={userInitials} size={40} showStatus={true} />
            <div className="min-w-0 flex-1">
              <p className="font-sans text-[13.5px] font-semibold text-white leading-snug truncate">
                {name}
              </p>
              <p className="font-sans text-[11px] text-gray-400 truncate mt-0.5">
                {email}
              </p>
              <span
                className="mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider"
                style={{
                  background: 'rgba(212,175,55,0.12)',
                  border: '1px solid rgba(212,175,55,0.25)',
                  color: '#d4af37',
                }}
              >
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Links */}
        <div className="px-2 py-2">
          <Link to="/profile" onClick={onClose}>
            <MenuItem icon={<IconProfile />} label="View Profile" />
          </Link>

          <Link to="/my-bookings" onClick={onClose}>
            <MenuItem icon={<IconCalendar />} label="My Bookings" />
          </Link>

          {isRestaurant && (
            <Link to="/restaurant-dashboard" onClick={onClose}>
              <MenuItem icon={<IconSwitchView />} label="Partner Portal" />
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" onClick={onClose}>
              <MenuItem icon={<IconSwitchView />} label="Admin Console" />
            </Link>
          )}
        </div>

        {/* Divider */}
        <div
          className="mx-3"
          style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.16), transparent)' }}
        />

        {/* Logout */}
        <div className="px-2 py-2">
          <MenuItem icon={<IconLogout />} label="Log out" onClick={onLogout} danger />
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { isAuthenticated, email, isAdmin, isRestaurant, isCustomer, profile, displayName, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pillHov, setPillHov] = useState(false);
  const location = useLocation();
  const ref = useRef(null);
  const notifRef = useRef(null);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const userName =
    profile?.name?.trim() ||
    profile?.fullName?.trim() ||
    displayName ||
    localStorage.getItem('bookmytable_full_name')?.trim() ||
    nameFromEmail(email) ||
    'User';

  const rawRole = profile?.role || (isAdmin ? 'admin' : isRestaurant ? 'restaurant' : 'customer');
  const displayRole = rawRole === 'admin' ? 'ADMIN' : rawRole === 'restaurant' ? 'RESTAURANT' : 'CUSTOMER';

  const transparent = isHome && !scrolled;
  const userInitials = initials(userName);

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 print:hidden"
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

      <nav className="flex w-full items-center justify-between gap-6 px-6 py-4 md:px-14">
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
        <div className="hidden items-center md:flex" style={{ gap: '1.5rem' }}>
          <NavLink to="/restaurants" className={navLinkClass}>Restaurants</NavLink>

          {isRestaurant && (
            <NavLink to="/restaurant-dashboard" className={navLinkClass}>Partner Portal</NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>Admin Console</NavLink>
          )}
        </div>

        {/* Right Actions & Profile Pill */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3.5">
              {/* Notification Bell */}
              <div ref={notifRef} className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen((n) => !n)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.08] text-gray-300 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/10 transition-all duration-200"
                  title="Notifications"
                >
                  <IconBell />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-[#0a0a0c]" />
                  )}
                </button>

                {notifOpen && <NotificationsPopup />}
              </div>

              {/* Profile Pill */}
              <div ref={ref} className="relative">
                <button
                  type="button"
                  onClick={() => setOpen((o) => !o)}
                  onMouseEnter={() => setPillHov(true)}
                  onMouseLeave={() => setPillHov(false)}
                  className="group flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-3.5 transition-all duration-250 select-none"
                  style={{
                    background: open
                      ? 'rgba(212,175,55,0.14)'
                      : pillHov
                      ? 'rgba(212,175,55,0.08)'
                      : 'rgba(255,255,255,0.04)',
                    border: open
                      ? '1px solid rgba(212,175,55,0.40)'
                      : pillHov
                      ? '1px solid rgba(212,175,55,0.25)'
                      : '1px solid rgba(212,175,55,0.14)',
                    boxShadow: open
                      ? '0 0 24px rgba(212,175,55,0.20), inset 0 0 12px rgba(212,175,55,0.06)'
                      : pillHov
                      ? '0 0 16px rgba(212,175,55,0.12)'
                      : 'none',
                    transform: pillHov && !open ? 'translateY(-1px)' : 'translateY(0)',
                  }}
                >
                  <Avatar initials={userInitials} size={30} showStatus={true} />

                  <div className="hidden sm:flex flex-col justify-center text-left my-auto">
                    <p className="font-sans font-bold text-white leading-tight text-[12.5px] tracking-wide group-hover:text-amber-200 transition-colors">
                      {userName}
                    </p>
                    <p
                      className="font-sans text-[9px] font-extrabold uppercase tracking-wider leading-tight mt-[2px]"
                      style={{ color: '#d4af37' }}
                    >
                      {displayRole}
                    </p>
                  </div>

                  <span
                    className="hidden sm:flex items-center justify-center self-center ml-0.5"
                    style={{ color: open ? '#f5e27a' : '#777', transition: 'color 0.22s ease' }}
                  >
                    <IconChevron open={open} />
                  </span>
                </button>

                {open && (
                  <ProfilePopup
                    name={userName}
                    email={email}
                    role={displayRole}
                    isCustomer={isCustomer}
                    isRestaurant={isRestaurant}
                    isAdmin={isAdmin}
                    onClose={() => setOpen(false)}
                    onLogout={handleLogout}
                  />
                )}
              </div>
            </div>
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
      <div className="flex border-t px-6 py-3 md:hidden" style={{ borderColor: 'rgba(212,175,55,0.07)' }}>
        <div className="flex w-full items-center justify-around">
          <NavLink to="/restaurants" className={navLinkClass}>Venues</NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/my-bookings" className={navLinkClass}>Bookings</NavLink>
              <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
              {isRestaurant && <NavLink to="/restaurant-dashboard" className={navLinkClass}>Partner</NavLink>}
              {isAdmin && <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

