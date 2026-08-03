import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

/* ── NAV CONFIG (Priority Order & Professional Titles) ─────── */
const NAV = [
  { to: '/restaurant-dashboard',           label: 'Dashboard Overview',       Icon: DashIcon,       end: true },
  { to: '/restaurant-dashboard/bookings',  label: 'Bookings & Reservations',  Icon: BookingIcon },
  { to: '/restaurant-dashboard/tables',    label: 'Tables & Seating',         Icon: TableIcon },
  { to: '/restaurant-dashboard/analytics', label: 'Token Fee Analytics',     Icon: AnalyticsIcon },
  { to: '/restaurant-dashboard/settings',  label: 'Restaurant Settings',     Icon: SettingsIcon },
];

/* ── SVG ICONS (Distinct 20x20 Vector Symbols) ──────────── */
function DashIcon({ active }) {
  const c = active ? '#d4af37' : '#606060';
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.8" stroke={c} strokeWidth="1.5" />
      <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.8" stroke={c} strokeWidth="1.5" />
      <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.8" stroke={c} strokeWidth="1.5" />
      <rect x="11" y="11" width="6.5" height="6.5" rx="1.8" stroke={c} strokeWidth="1.5" />
    </svg>
  );
}

function BookingIcon({ active }) {
  const c = active ? '#d4af37' : '#606060';
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="3.5" width="15" height="14" rx="2.2" stroke={c} strokeWidth="1.5" />
      <path d="M6 1.8v3.4M14 1.8v3.4" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2.5 7.5h15" stroke={c} strokeWidth="1.3" />
      <path d="M6.5 12l2.2 2.2 4.8-4.8" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TableIcon({ active }) {
  const c = active ? '#d4af37' : '#606060';
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      {/* Table surface */}
      <rect x="5" y="8.2" width="10" height="1.8" rx="0.9" fill={c} fillOpacity={active ? "0.9" : "0.5"} />
      {/* Table legs */}
      <path d="M7.2 10v6M12.8 10v6" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      {/* Left Chair */}
      <path d="M2.5 4.5v6.5M2.5 11h2.5M2.5 11v5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Right Chair */}
      <path d="M17.5 4.5v6.5M15 11h2.5M17.5 11v5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AnalyticsIcon({ active }) {
  const c = active ? '#d4af37' : '#606060';
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="11.5" width="3" height="6" rx="0.8" fill={c} fillOpacity={active ? "0.85" : "0.5"} />
      <rect x="8.5" y="7.5" width="3" height="10" rx="0.8" fill={c} fillOpacity={active ? "0.85" : "0.5"} />
      <rect x="14.5" y="3.5" width="3" height="14" rx="0.8" fill={c} stroke={c} strokeWidth="0.5" />
      <path d="M2.5 10l5.5-5 4 3 5.5-5" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 3h3v3" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon({ active }) {
  const c = active ? '#d4af37' : '#606060';
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14M3 10h14M3 15h14" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7" cy="5" r="2" fill="#181818" stroke={c} strokeWidth="1.5" />
      <circle cx="13" cy="10" r="2" fill="#181818" stroke={c} strokeWidth="1.5" />
      <circle cx="8" cy="15" r="2" fill="#181818" stroke={c} strokeWidth="1.5" />
    </svg>
  );
}

/* ── NAV ITEM (Identical to Admin Sidebar NavItem) ───────── */
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
      <span
        className="shrink-0"
        style={{
          filter: isActive ? 'drop-shadow(0 0 5px rgba(212,175,55,0.55))' : 'none',
          transition: 'filter 0.22s ease',
        }}
      >
        <Icon active={isActive} />
      </span>

      <span className="flex-1">{label}</span>

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

/* ── SIDEBAR (Identical to Admin Sidebar) ─────────────────── */
export default function RestaurantSidebar() {
  return (
    <aside
      className="hidden md:flex flex-col w-[228px] shrink-0 sticky top-0 h-screen overflow-hidden z-[60]"
      style={{
        background: 'linear-gradient(175deg, #181818 0%, #121212 50%, #0d0d0d 100%)',
        borderRight: '1px solid rgba(212,175,55,0.08)',
        boxShadow: '6px 0 48px rgba(0,0,0,0.6), inset -1px 0 0 rgba(255,255,255,0.02)',
      }}
    >
      <div
        className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)' }}
      />

      {/* Logo */}
      <div className="relative px-6 pt-8 pb-6">
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

        <p
          className="mt-1.5 font-sans uppercase"
          style={{ fontSize: '9px', letterSpacing: '0.28em', color: '#484848' }}
        >
          Partner Console
        </p>

        <div
          className="mt-5"
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, rgba(212,175,55,0.22), rgba(212,175,55,0.06), transparent)',
          }}
        />
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="px-3 pb-8">
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
