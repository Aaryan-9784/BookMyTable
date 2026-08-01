import { useEffect, useRef, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';

/* ── PAGE TITLES ────────────────────────────────────────────── */
const PAGE_TITLES = {
  '/admin':             'Super Admin Dashboard',
  '/admin/restaurants': 'Restaurants Directory',
  '/admin/users':       'Users Management',
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

/* ── SVG ICONS ────────────────────────────────────────────── */
function IconCrown() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 13h12M2.5 10.5l1.5-6 4 3.5 4-3.5 1.5 6H2.5z" stroke="#d4af37" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="5" r="2.8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconRestaurants() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
      <path d="M2 4.5h10M2 9.5h10M4.5 2v10M9.5 2v10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
      <path d="M4.5 6a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4zM9.5 6a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4zM1.5 12.5c0-2.2 2-3.5 4.5-3.5s4.5 1.3 4.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
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

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke="#777" strokeWidth="1.35" />
      <path d="M10.5 10.5L14 14" stroke="#777" strokeWidth="1.35" strokeLinecap="round" />
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

function IconCheckVerified() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" fill="#d4af37" />
      <path d="M4 7l2 2 4-4" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── AVATAR ───────────────────────────────────────────────── */
function Avatar({ initials, size = 32, showStatus = true }) {
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
          <span className="font-sans text-[13px] font-semibold text-white">Admin Alerts</span>
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
        <span className="font-sans text-[10px] text-gray-500">Super Admin Command Feed</span>
      </div>
    </div>
  );
}

/* ── PROFILE POPUP MENU ────────────────────────────────────── */
function ProfilePopup({ name, email, role, onClose, onLogout }) {
  const initials = getInitials(name, email);
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
            <Avatar initials={initials} size={40} showStatus={true} />
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
                {role || 'Super Admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Links */}
        <div className="px-2 py-2">
          <Link to="/profile" onClick={onClose}>
            <MenuItem icon={<IconProfile />} label="View Profile" />
          </Link>
          <Link to="/" onClick={onClose}>
            <MenuItem icon={<IconSwitchView />} label="Switch to User View" />
          </Link>
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

/* ── BREADCRUMB SEPARATOR ─────────────────────────────────── */
/* ── BREADCRUMB SEPARATOR ─────────────────────────────────── */
function BreadcrumbSep() {
  return (
    <span className="text-amber-500/40 font-sans text-[11px] select-none mx-0.5 font-light">/</span>
  );
}

/* ── MAIN ADMIN NAVBAR ────────────────────────────────────── */
export default function AdminNavbar() {
  const { email, role, logout, displayName } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pillHov, setPillHov] = useState(false);
  const [searchModal, setSearchModal] = useState(false);
  const { unreadCount } = useNotifications();
  const ref = useRef(null);
  const notifRef = useRef(null);

  const name     = displayName || getDisplayName('', email);
  const initials = getInitials(displayName, email);

  const title = Object.entries(PAGE_TITLES).find(([p]) =>
    p === '/admin' ? pathname === '/admin' : pathname.startsWith(p)
  )?.[1] ?? 'Dashboard';

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
        setSearchModal(false);
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const handleLogout = () => { setOpen(false); logout(); };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-5 md:px-8"
      style={{
        height: '64px',
        background: 'rgba(10, 10, 12, 0.90)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderBottom: '1px solid rgba(212,175,55,0.10)',
        boxShadow: '0 4px 28px rgba(0,0,0,0.45), inset 0 -1px 0 rgba(255,255,255,0.02)',
      }}
    >
      {/* Top Ambient Gold Wire */}
      <div
        className="pointer-events-none absolute left-0 bottom-0 right-0 h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.25) 50%, transparent 100%)' }}
      />

      {/* ── Breadcrumb (Home Icon > Admin Console > Title) ────── */}
      <div className="flex items-center gap-2 font-sans text-xs">
        <Link
          to="/"
          className="flex items-center justify-center text-gray-400 hover:text-amber-400 transition-colors p-1 rounded-md hover:bg-white/5"
          title="Home"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M2.5 6.5L8 2l5.5 4.5v7a1 1 0 01-1 1h-3.5v-4h-2v4H3.5a1 1 0 01-1-1v-7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <BreadcrumbSep />

        <Link
          to="/admin"
          className="font-semibold text-amber-400/90 hover:text-amber-300 transition-colors tracking-wide text-[12.5px]"
        >
          Admin Console
        </Link>

        <BreadcrumbSep />

        <span
          className="font-bold text-[13.5px]"
          style={{ color: '#ffffff', letterSpacing: '0.01em' }}
        >
          {title}
        </span>
      </div>

      {/* ── Right Actions & Profile Pill ────────────────────── */}
      <div className="flex items-center gap-3.5">
        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((n) => !n)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.08] text-gray-300 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/10 transition-all duration-200"
            title="Admin Notifications"
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
            <Avatar initials={initials} size={30} showStatus={true} />

            <div className="hidden sm:flex flex-col justify-center text-left my-auto">
              <p className="font-sans font-bold text-white leading-tight text-[12.5px] tracking-wide group-hover:text-amber-200 transition-colors">
                {name}
              </p>
              <p
                className="font-sans text-[9px] font-extrabold uppercase tracking-wider leading-tight mt-[2px]"
                style={{ color: '#d4af37' }}
              >
                {role ?? 'Super Admin'}
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
              name={name}
              email={email}
              role={role ?? 'Super Admin'}
              onClose={() => setOpen(false)}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </header>
  );
}

