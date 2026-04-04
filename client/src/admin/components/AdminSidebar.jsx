import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────
   NAV CONFIG
───────────────────────────────────────────────────────────── */
const NAV = [
  { to: '/admin',             label: 'Dashboard',   Icon: DashIcon,       end: true },
  { to: '/admin/restaurants', label: 'Restaurants', Icon: RestaurantIcon        },
  { to: '/admin/bookings',    label: 'Bookings',    Icon: BookingIcon           },
  { to: '/admin/users',       label: 'Users',       Icon: UsersIcon             },
];

/* ─────────────────────────────────────────────────────────────
   ICONS  (stroke weight 1.35, consistent style)
───────────────────────────────────────────────────────────── */
function DashIcon({ active }) {
  const c = active ? '#d4af37' : '#505050';
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.4" stroke={c} strokeWidth="1.35" />
      <rect x="9"   y="1.5" width="5.5" height="5.5" rx="1.4" stroke={c} strokeWidth="1.35" />
      <rect x="1.5" y="9"   width="5.5" height="5.5" rx="1.4" stroke={c} strokeWidth="1.35" />
      <rect x="9"   y="9"   width="5.5" height="5.5" rx="1.4" stroke={c} strokeWidth="1.35" />
    </svg>
  );
}
function RestaurantIcon({ active }) {
  const c = active ? '#d4af37' : '#505050';
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 1.5v5.2A2.3 2.3 0 006.3 9v5.5" stroke={c} strokeWidth="1.35" strokeLinecap="round" />
      <path d="M6.3 1.5v3.2" stroke={c} strokeWidth="1.35" strokeLinecap="round" />
      <path d="M11 1.5s2.5 1.8 2.5 4.3S11 9 11 9v5.5" stroke={c} strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}
function BookingIcon({ active }) {
  const c = active ? '#d4af37' : '#505050';
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="3" width="13" height="11.5" rx="2" stroke={c} strokeWidth="1.35" />
      <path d="M5.5 1.5v3M10.5 1.5v3" stroke={c} strokeWidth="1.35" strokeLinecap="round" />
      <path d="M1.5 7h13" stroke={c} strokeWidth="1.35" />
      <circle cx="5.5" cy="10.5" r="0.9" fill={c} />
      <circle cx="8"   cy="10.5" r="0.9" fill={c} />
      <circle cx="10.5" cy="10.5" r="0.9" fill={c} />
    </svg>
  );
}
function UsersIcon({ active }) {
  const c = active ? '#d4af37' : '#505050';
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.8" stroke={c} strokeWidth="1.35" />
      <path d="M1 14c0-2.8 2.2-4.8 5-4.8s5 2 5 4.8" stroke={c} strokeWidth="1.35" strokeLinecap="round" />
      <path d="M11.5 7.2c1.2 0 2.2 1 2.2 2.2M13.7 14c0-1.6-.9-3-2.2-3.8" stroke={c} strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   NAV ITEM
───────────────────────────────────────────────────────────── */
function NavItem({ to, label, Icon, end }) {
  const { pathname } = useLocation();
  const isActive = end ? pathname === to : pathname.startsWith(to);
  const [hov, setHov] = useState(false);

  return (
    <NavLink
      to={to}
      end={end}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="relative flex items-center gap-3 rounded-[14px] px-4 py-[11px] font-sans text-[13px] font-medium select-none"
      style={{
        color: isActive ? '#d4af37' : hov ? '#d0d0d0' : '#606060',
        background: isActive
          ? 'linear-gradient(100deg, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0.05) 100%)'
          : hov
          ? 'rgba(255,255,255,0.04)'
          : 'transparent',
        border: isActive
          ? '1px solid rgba(212,175,55,0.28)'
          : '1px solid transparent',
        boxShadow: isActive
          ? 'inset 0 0 16px rgba(212,175,55,0.05), 0 0 20px rgba(212,175,55,0.07)'
          : 'none',
        transform: hov && !isActive ? 'translateX(3px)' : 'translateX(0)',
        transition: 'all 0.22s cubic-bezier(0.25,0.46,0.45,0.94)',
      }}
    >
      {/* Icon */}
      <span
        className="shrink-0"
        style={{
          filter: isActive ? 'drop-shadow(0 0 5px rgba(212,175,55,0.55))' : 'none',
          transition: 'filter 0.22s ease',
        }}
      >
        <Icon active={isActive} />
      </span>

      {/* Label */}
      <span className="flex-1">{label}</span>

      {/* Active dot */}
      {isActive && (
        <span
          className="ml-auto h-[7px] w-[7px] shrink-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, #f5e27a 0%, #d4af37 60%)',
            boxShadow: '0 0 8px rgba(212,175,55,0.9)',
          }}
        />
      )}

      {/* Active left accent bar */}
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
          style={{
            height: '60%',
            background: 'linear-gradient(180deg, #f5e27a, #d4af37)',
            boxShadow: '0 0 8px rgba(212,175,55,0.7)',
          }}
        />
      )}
    </NavLink>
  );
}

/* ─────────────────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────────────────── */
export default function AdminSidebar() {
  return (
    <aside
      className="hidden md:flex flex-col w-[228px] shrink-0 sticky top-0 h-screen overflow-hidden"
      style={{
        background: 'linear-gradient(175deg, #181818 0%, #121212 50%, #0d0d0d 100%)',
        borderRight: '1px solid rgba(212,175,55,0.08)',
        boxShadow: '6px 0 48px rgba(0,0,0,0.6), inset -1px 0 0 rgba(255,255,255,0.02)',
      }}
    >
      {/* ── Ambient top glow ─────────────────────────────── */}
      <div
        className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)' }}
      />

      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="relative px-6 pt-8 pb-6">
        {/* Wordmark */}
        <div className="flex items-baseline gap-0 select-none">
          <span
            className="font-display leading-none"
            style={{ fontSize: '21px', color: '#f0f0f0', letterSpacing: '0.02em' }}
          >
            Book
          </span>
          <span
            className="font-display leading-none"
            style={{
              fontSize: '21px',
              letterSpacing: '0.02em',
              background: 'linear-gradient(135deg, #f5e27a 0%, #d4af37 50%, #a8892a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.35))',
            }}
          >
            My
          </span>
          <span
            className="font-display leading-none"
            style={{ fontSize: '21px', color: '#f0f0f0', letterSpacing: '0.02em' }}
          >
            Table
          </span>
        </div>

        {/* Console label */}
        <p
          className="mt-1.5 font-sans uppercase"
          style={{ fontSize: '9px', letterSpacing: '0.28em', color: '#484848' }}
        >
          Admin Console
        </p>

        {/* Divider */}
        <div
          className="mt-5"
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, rgba(212,175,55,0.22), rgba(212,175,55,0.06), transparent)',
          }}
        />
      </div>

      {/* ── Section label ────────────────────────────────── */}
      <p
        className="px-6 pb-2 font-sans uppercase"
        style={{ fontSize: '9px', letterSpacing: '0.22em', color: '#383838' }}
      >
        Navigation
      </p>

      {/* ── Nav items ────────────────────────────────────── */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* ── Bottom ───────────────────────────────────────── */}
      <div className="px-3 pb-8">
        {/* Divider */}
        <div
          className="mb-3 mx-1"
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
          }}
        />

        <BackToSite />
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────
   BACK TO SITE
───────────────────────────────────────────────────────────── */
function BackToSite() {
  const [hov, setHov] = useState(false);
  return (
    <NavLink
      to="/"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex items-center gap-2.5 rounded-[14px] px-4 py-[10px] font-sans text-[12px]"
      style={{
        color: hov ? '#d4af37' : '#484848',
        background: hov ? 'rgba(212,175,55,0.06)' : 'transparent',
        transform: hov ? 'translateX(3px)' : 'translateX(0)',
        transition: 'all 0.22s ease',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M9 2.5L4 7l5 4.5"
          stroke={hov ? '#d4af37' : '#484848'}
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: 'stroke 0.22s ease' }}
        />
      </svg>
      Back to site
    </NavLink>
  );
}
