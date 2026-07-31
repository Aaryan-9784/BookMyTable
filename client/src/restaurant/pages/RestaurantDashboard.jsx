import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { restaurantApi } from '../services/restaurantApi.js';
import Loader from '../../components/Loader.jsx';

/* ── SVG ICONS (Matching Admin StatsCard) ──────────────────── */
function TablesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="4" width="14" height="9" rx="2" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M4 13v3M14 13v3M5 1.5v2.5M13 1.5v2.5" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BookingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="13" rx="2" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M6 1.5v3M12 1.5v3" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2 7.5h14" stroke="#d4af37" strokeWidth="1.4" />
      <circle cx="6.5" cy="11.5" r="1" fill="#d4af37" />
      <circle cx="9" cy="11.5" r="1" fill="#d4af37" />
      <circle cx="11.5" cy="11.5" r="1" fill="#d4af37" />
    </svg>
  );
}

function RevenueIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M9 5v8M6.5 7.5h5M6.5 10.5h5" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* ── STATS CARD COMPONENT (Identical to Admin StatsCard) ───── */
function RestaurantStatsCard({ label, value, Icon }) {
  return (
    <div
      className="stats-card relative overflow-hidden rounded-2xl p-7 transition-all duration-300"
      style={{
        background: 'linear-gradient(150deg, #1c1c1c 0%, #161616 55%, #131313 100%)',
        border: '1px solid rgba(212,175,55,0.13)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.55)',
      }}
    >
      {/* Ambient glow */}
      <div
        className="stats-glow pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.14) 0%, transparent 70%)' }}
      />

      {/* Header row */}
      <div className="flex items-start justify-between">
        <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted">
          {label}
        </p>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
          style={{
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.20)',
            boxShadow: '0 0 14px rgba(212,175,55,0.08)',
          }}
        >
          <Icon />
        </div>
      </div>

      {/* Value */}
      <p
        className="mt-5 font-display leading-none"
        style={{ fontSize: '3.6rem', color: '#f0f0f0', fontWeight: 600 }}
      >
        {value}
      </p>

      {/* Bottom gold accent strip */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, rgba(212,175,55,0.55) 0%, rgba(212,175,55,0.10) 50%, transparent 100%)',
        }}
      />
    </div>
  );
}

/* ── STATUS BADGE COMPONENT (Identical to Admin StatusBadge) ─ */
function StatusBadge({ status }) {
  const v = String(status).toLowerCase();
  if (v === 'confirmed') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold tracking-wide whitespace-nowrap"
        style={{
          background: 'rgba(52,211,153,0.08)',
          border: '1px solid rgba(52,211,153,0.25)',
          color: '#34d399',
          boxShadow: '0 0 12px rgba(52,211,153,0.10)',
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full shrink-0 animate-pulse" style={{ background: '#34d399' }} />
        Confirmed
      </span>
    );
  }
  if (v === 'cancelled') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold tracking-wide whitespace-nowrap"
        style={{
          background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.22)',
          color: '#f87171',
          boxShadow: '0 0 10px rgba(220,38,38,0.06)',
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#f87171' }} />
        Cancelled
      </span>
    );
  }
  return <span className="font-sans text-xs capitalize text-white/40">{status}</span>;
}

/* ── MAIN RESTAURANT DASHBOARD COMPONENT ───────────────────── */
export default function RestaurantDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await restaurantApi.getStats();
        if (!cancelled) setData(res.data);
      } catch (err) {
        toast.error(err.message || 'Failed to load restaurant dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Loader label="Loading Partner Console…" />;

  const stats = data?.stats || {};
  const restaurant = data?.restaurant || {};
  const recentBookings = data?.recentBookings || [];

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* ── Page Heading (Identical to Admin Dashboard) ──────── */}
      <div className="mb-12 anim-fade-up">
        <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-luxury-muted mb-3">
          Overview
        </p>
        <h1
          className="font-display leading-none text-luxury-white"
          style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', letterSpacing: '0.01em' }}
        >
          Dashboard
        </h1>
        <p className="mt-2.5 font-sans text-sm text-luxury-muted">
          BookMyTable — restaurant performance at a glance
        </p>
        {/* Gold rule */}
        <div
          className="mt-5 h-px w-20"
          style={{ background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.15), transparent)' }}
        />
      </div>

      {/* ── 3 Stat Cards (Identical Layout to Admin Dashboard) ─ */}
      <div className="grid gap-6 sm:grid-cols-3 mb-14">
        <div className="anim-fade-up delay-1">
          <RestaurantStatsCard
            label="Total Tables"
            value={stats.totalTables ?? 0}
            Icon={TablesIcon}
          />
        </div>
        <div className="anim-fade-up delay-2">
          <RestaurantStatsCard
            label="Total Bookings"
            value={stats.totalBookings ?? 0}
            Icon={BookingsIcon}
          />
        </div>
        <div className="anim-fade-up delay-3">
          <RestaurantStatsCard
            label="Token Fees Collected"
            value={`₹${(stats.totalTokenFees ?? 0).toLocaleString()}`}
            Icon={RevenueIcon}
          />
        </div>
      </div>

      {/* ── Recent Bookings Table (Identical to Admin RecentBookings) ── */}
      <div className="anim-fade-up delay-4">
        <div
          className="overflow-hidden rounded-[20px]"
          style={{
            background: 'linear-gradient(160deg, rgba(28,26,22,0.95) 0%, rgba(18,17,14,0.98) 100%)',
            border: '1px solid transparent',
            backgroundClip: 'padding-box',
            boxShadow: '0 8px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.10), inset 0 1px 0 rgba(212,175,55,0.06)',
          }}
        >
          {/* Card Header */}
          <div
            className="flex items-center justify-between px-6 py-5"
            style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}
          >
            <div>
              <h2
                className="font-display text-white"
                style={{ fontSize: '1.35rem', letterSpacing: '0.01em' }}
              >
                Recent Bookings
              </h2>
              <p className="mt-0.5 font-sans text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Latest reservations for {restaurant.name || 'your restaurant'}
              </p>
            </div>

            <Link
              to="/restaurant-dashboard/bookings"
              className="view-all-btn group flex items-center gap-1.5 rounded-full px-4 py-2 font-sans text-[12px] font-medium transition-all duration-200"
              style={{
                background: 'rgba(212,175,55,0.06)',
                border: '1px solid rgba(212,175,55,0.22)',
                color: '#d4af37',
              }}
            >
              View All
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {/* Column labels */}
          {recentBookings.length > 0 && (
            <div
              className="hidden sm:flex items-center gap-x-4 px-6 py-2.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="flex-1 font-sans text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'rgba(212,175,55,0.45)', minWidth: '180px' }}>User</div>
              <div className="hidden sm:block font-sans text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'rgba(212,175,55,0.45)', minWidth: '160px' }}>When</div>
              <div className="hidden md:block font-sans text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'rgba(212,175,55,0.45)', minWidth: '130px' }}>Guests</div>
              <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-right" style={{ color: 'rgba(212,175,55,0.45)', minWidth: '100px' }}>Status</div>
            </div>
          )}

          {/* Table Rows */}
          {recentBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: 'rgba(212,175,55,0.06)',
                  border: '1px solid rgba(212,175,55,0.12)',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: 'rgba(212,175,55,0.45)' }}>
                  <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 2v3M16 2v3M3 9h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M8 13h4M8 17h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="font-sans text-sm font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>No bookings yet</p>
              <p className="mt-1 font-sans text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>Reservations will appear here once made</p>
            </div>
          ) : (
            recentBookings.map((b, i) => {
              const name = b.userId?.name || 'Guest User';
              const email = b.userId?.email || b.userId?.phone || '—';
              const initials = name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'GU';

              return (
                <div
                  key={b._id || i}
                  className="booking-row group relative flex flex-wrap items-center gap-x-4 gap-y-3 px-6 py-4 transition-all duration-200"
                  style={{ borderBottom: i === recentBookings.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.035)' }}
                >
                  {/* User */}
                  <div className="flex min-w-0 flex-1 items-center gap-3" style={{ minWidth: '180px' }}>
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-sans text-[11px] font-bold"
                      style={{
                        background: 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.06) 100%)',
                        border: '1px solid rgba(212,175,55,0.22)',
                        color: '#d4af37',
                        boxShadow: '0 0 10px rgba(212,175,55,0.08)',
                      }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-sans text-[13px] font-semibold leading-tight" style={{ color: '#e8e8e8' }}>
                        {name}
                      </p>
                      <p className="truncate font-sans text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.32)' }}>
                        {email}
                      </p>
                    </div>
                  </div>

                  {/* When */}
                  <div className="hidden items-center gap-2 sm:flex" style={{ minWidth: '160px' }}>
                    <div>
                      <p className="font-sans text-[12px] font-medium leading-tight" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        {b.date}
                      </p>
                      <p className="font-sans text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.32)' }}>
                        {b.time}
                      </p>
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="hidden md:block" style={{ minWidth: '130px' }}>
                    <p className="truncate font-sans text-[13px] font-semibold" style={{ color: '#e8e8e8' }}>
                      {b.guests || 1} Guest(s)
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-end" style={{ minWidth: '100px' }}>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
