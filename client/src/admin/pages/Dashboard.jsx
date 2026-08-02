import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../services/adminApi.js';
import RegisteredRestaurantsOverview from '../components/RegisteredRestaurantsOverview.jsx';
import { downloadCSV, fmt, fmtDate, today } from '../utils/exportCSV.js';

/* ── SVG ICONS ──────────────────────────────────────────────── */
function IconRestaurants() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 1.5v5.5A2.5 2.5 0 006.5 9.5v7" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.5 1.5v3.5" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 1.5s2.5 2 2.5 4.5S12 9.5 12 9.5v7" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="7" cy="6" r="3.5" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M1 16c0-3.5 2.7-6 6-6s6 2.5 6 6" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13.5 9c1.5 0 3 1.2 3 3.5v3.5" stroke="#d4af37" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="13.5" cy="6" r="2" stroke="#d4af37" strokeWidth="1.3" />
    </svg>
  );
}
function IconBookings() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="13" rx="2" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M6 1.5v3M12 1.5v3" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2 7.5h14" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M6 11l2 2 4-3" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconRevenue() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M9 5v8M6.5 7.5h5M6.5 10.5h5" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconRefresh() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M13 7.5A5.5 5.5 0 012.02 9M2 7.5A5.5 5.5 0 0112.98 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M12.5 3v3h-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 12v-3h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── KPI STAT CARD (identical to partner console) ───────────── */
function StatCard({ label, value, sub, Icon, accent = false }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300 group"
      style={{
        background: accent
          ? 'linear-gradient(150deg, #1e1b0f 0%, #181507 60%, #151300 100%)'
          : 'linear-gradient(150deg, #1c1c1c 0%, #161616 55%, #131313 100%)',
        border: accent ? '1px solid rgba(212,175,55,0.28)' : '1px solid rgba(212,175,55,0.13)',
        boxShadow: accent
          ? '0 4px 40px rgba(0,0,0,0.55), 0 0 24px rgba(212,175,55,0.08)'
          : '0 4px 40px rgba(0,0,0,0.55)',
      }}
    >
      {accent && (
        <div
          className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)' }}
        />
      )}
      <div className="flex items-start justify-between mb-4">
        <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted">{label}</p>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.20)' }}
        >
          <Icon />
        </div>
      </div>
      <p className="font-display leading-none text-white font-bold" style={{ fontSize: '2.6rem' }}>{value}</p>
      {sub && <p className="mt-2 font-sans text-xs text-luxury-muted">{sub}</p>}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(90deg, rgba(212,175,55,0.55) 0%, transparent 100%)',
          opacity: accent ? 0.8 : 0.5,
        }}
      />
    </div>
  );
}

/* ── STATUS BADGE ───────────────────────────────────────────── */
function StatusBadge({ status }) {
  const v = String(status || '').toLowerCase();
  const configs = {
    confirmed: { text: 'Confirmed', bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.22)',  color: '#4ade80', dot: true  },
    completed: { text: 'Completed', bg: 'rgba(99,102,241,0.10)', border: 'rgba(99,102,241,0.22)', color: '#a5b4fc', dot: false },
    cancelled: { text: 'Cancelled', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.22)',  color: '#f87171', dot: false },
    pending:   { text: 'Pending',   bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.22)',  color: '#fbbf24', dot: true  },
  };
  const cfg = configs[v] || { text: status, bg: 'transparent', border: 'rgba(255,255,255,0.1)', color: '#888', dot: false };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      {cfg.dot && <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: cfg.color }} />}
      {cfg.text}
    </span>
  );
}

/* ── MAIN DASHBOARD ─────────────────────────────────────────── */
export default function Dashboard() {
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data } = await adminApi.getStats();
      setStats(data);
    } catch (e) {
      toast.error(e.message || 'Failed to load admin stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const exportAnalytics = useCallback(() => {
    const recentBookings = stats?.recentBookings || [];
    downloadCSV(
      `admin_platform_analytics_${today()}.csv`,
      [
        {
          title: 'Platform Metrics',
          headers: ['Metric', 'Value'],
          rows: [
            ['Active Restaurants', stats?.totalRestaurants ?? 0],
            ['Total Users',        stats?.totalUsers       ?? 0],
            ['Total Bookings',     stats?.totalBookings    ?? 0],
          ],
        },
        {
          title: 'Recent Bookings',
          headers: ['Customer', 'Email', 'Restaurant', 'Date', 'Time', 'Guests', 'Status'],
          rows: recentBookings.map((b) => [
            b.userId?.fullName || b.userId?.name || 'Guest',
            b.userId?.email || '—',
            b.restaurantId?.name || '—',
            fmtDate(b.date),
            b.time || '—',
            b.guests || 1,
            b.status,
          ]),
        },
      ],
      { 'Report Type': 'Admin Platform Overview' },
    );
    toast.success('Platform analytics exported as CSV!');
  }, [stats]);

  const recentBookings = stats?.recentBookings || [];

  return (
    <div className="max-w-[1100px] mx-auto">

      {/* ── Page Header Row ─────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between anim-fade-up">
        <div>
          <h1
            className="font-display leading-none text-luxury-white font-bold"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}
          >
            Dashboard
          </h1>
          <p className="mt-2 font-sans text-sm text-luxury-muted">
            Platform-wide metrics &amp; active restaurant venue management
          </p>
          <div
            className="mt-4 h-px w-20"
            style={{ background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.15), transparent)' }}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={refreshing}
            onClick={() => { fetchStats(true); toast.success('Dashboard refreshed'); }}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-xs text-luxury-muted hover:text-luxury-gold transition-all duration-200 disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className={refreshing ? 'animate-spin' : ''}><IconRefresh /></span>
            Refresh
          </button>

          <button
            type="button"
            onClick={exportAnalytics}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-xs font-semibold text-[#0b0b0c] transition-all duration-200 hover:brightness-110 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)', boxShadow: '0 0 18px rgba(212,175,55,0.25)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5v7M4.5 6.5L7 9l2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1.5 10.5v1a1 1 0 001 1h9a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Export Analytics
          </button>
        </div>
      </div>

      {/* ── 4-KPI Stat Cards ────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          label="Active Restaurants"
          value={stats?.totalRestaurants ?? 0}
          sub="Admin managed venues"
          Icon={IconRestaurants}
          accent
        />
        <StatCard
          label="Total Users"
          value={stats?.totalUsers ?? 0}
          sub="Registered accounts"
          Icon={IconUsers}
        />
        <StatCard
          label="Total Bookings"
          value={stats?.totalBookings ?? 0}
          sub="Platform-wide reservations"
          Icon={IconBookings}
        />
        <StatCard
          label="Wishlist Bookmarks"
          value={stats?.totalWishlistSaves ?? 0}
          sub="Platform-wide saved venues"
          Icon={() => (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          )}
        />
      </div>

      {/* ── Recent Bookings Table ────────────────────────────── */}
      {recentBookings.length > 0 && (
        <div
          className="overflow-hidden rounded-2xl mb-8"
          style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="flex items-center justify-between px-6 py-5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div>
              <h2 className="font-display text-lg font-semibold text-white">Recent Platform Bookings</h2>
              <p className="font-sans text-xs text-luxury-muted mt-0.5">
                Latest table reservations across all venues
              </p>
            </div>
            <Link
              to="/admin/restaurants"
              className="rounded-full px-4 py-1.5 font-sans text-xs font-semibold text-luxury-gold hover:bg-luxury-gold/20 transition-all duration-200"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}
            >
              View Restaurants →
            </Link>
          </div>

          {/* Column headers */}
          <div
            className="grid px-6 py-2.5 font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted"
            style={{
              gridTemplateColumns: '1.4fr 1fr 1fr 0.7fr 1fr',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            <span>Customer</span>
            <span>Restaurant</span>
            <span>Date &amp; Time</span>
            <span>Guests</span>
            <span>Status</span>
          </div>

          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {recentBookings.map((b, i) => (
              <div
                key={b._id || i}
                className="grid items-center px-6 py-4 transition-colors duration-150 hover:bg-white/[0.025]"
                style={{ gridTemplateColumns: '1.4fr 1fr 1fr 0.7fr 1fr' }}
              >
                <div className="min-w-0">
                  <p className="font-sans font-semibold text-white text-sm truncate">
                    {b.userId?.fullName || b.userId?.name || 'Guest'}
                  </p>
                  <p className="font-sans text-[11px] text-luxury-muted truncate mt-0.5">
                    {b.userId?.email || '—'}
                  </p>
                </div>
                <div className="font-sans text-sm text-white/80 truncate">
                  {b.restaurantId?.name || '—'}
                </div>
                <div>
                  <p className="font-sans text-sm text-white/85">{fmtDate(b.date)}</p>
                  <p className="font-sans text-[11px] text-luxury-gold/60 mt-0.5">{b.time || '—'}</p>
                </div>
                <div className="font-sans text-sm font-semibold text-white">
                  {b.guests || 1}
                  <span className="text-luxury-muted font-normal ml-1 text-[11px]">
                    {(b.guests || 1) === 1 ? 'Person' : 'Guests'}
                  </span>
                </div>
                <div><StatusBadge status={b.status} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Admin Quick Actions + Restaurant Directory ───────── */}
      <RegisteredRestaurantsOverview />
    </div>
  );
}
