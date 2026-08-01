import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../services/adminApi.js';
import RegisteredRestaurantsOverview from '../components/RegisteredRestaurantsOverview.jsx';
import Loader from '../../components/Loader.jsx';
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
function IconApproved() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M6 9l2 2 4-4" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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

/* ── KPI STAT CARD (matches Partner Console StatCard) ───────── */
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
      {/* Corner glow for accent */}
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

      <p
        className="font-display leading-none text-white font-bold"
        style={{ fontSize: '2.6rem' }}
      >
        {value}
      </p>

      {sub && (
        <p className="mt-2 font-sans text-xs text-luxury-muted">{sub}</p>
      )}

      {/* Bottom accent bar */}
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

/* ── PLATFORM OVERVIEW BAR ──────────────────────────────────── */
function PlatformBar({ approved, pending, rejected, total }) {
  const pctApproved = total > 0 ? Math.round((approved / total) * 100) : 0;
  const pctPending  = total > 0 ? Math.round((pending  / total) * 100) : 0;
  const pctRejected = total > 0 ? Math.round((rejected / total) * 100) : 0;

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'linear-gradient(150deg, #181818 0%, #131313 100%)',
        border: '1px solid rgba(212,175,55,0.12)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted">Restaurant Approval</p>
          <p className="mt-1 font-display text-white font-semibold text-lg">{total} Total Registered</p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-bold text-white">{pctApproved}%</p>
          <p className="font-sans text-[10px] text-emerald-400 uppercase tracking-wider">Live</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="absolute left-0 top-0 h-full rounded-l-full transition-all duration-700"
          style={{
            width: `${pctApproved}%`,
            background: 'linear-gradient(90deg, #22c55e, #16a34a)',
            boxShadow: '0 0 8px rgba(34,197,94,0.4)',
          }}
        />
        {pctPending > 0 && (
          <div
            className="absolute top-0 h-full transition-all duration-700"
            style={{
              left: `${pctApproved}%`,
              width: `${pctPending}%`,
              background: 'linear-gradient(90deg, rgba(212,175,55,0.7), rgba(212,175,55,0.4))',
            }}
          />
        )}
        {pctRejected > 0 && (
          <div
            className="absolute top-0 h-full rounded-r-full transition-all duration-700"
            style={{
              left: `${pctApproved + pctPending}%`,
              width: `${pctRejected}%`,
              background: 'linear-gradient(90deg, rgba(239,68,68,0.5), rgba(239,68,68,0.3))',
            }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="font-sans text-xs text-luxury-muted">{approved} Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: 'rgba(212,175,55,0.7)' }} />
          <span className="font-sans text-xs text-luxury-muted">{pending} Pending</span>
        </div>
        {rejected > 0 && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span className="font-sans text-xs text-luxury-muted">{rejected} Rejected</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── MAIN DASHBOARD ─────────────────────────────────────────── */
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
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

  /* Export platform analytics as CSV */
  const exportAnalytics = useCallback(() => {
    const recentBookings = stats?.recentBookings || [];
    downloadCSV(
      `admin_platform_analytics_${today()}.csv`,
      [
        {
          title: 'Platform Metrics',
          headers: ['Metric', 'Value'],
          rows: [
            ['Active Restaurants',    stats?.totalRestaurants ?? 0],
            ['Total Users',           stats?.totalUsers       ?? 0],
            ['Total Bookings',        stats?.totalBookings    ?? 0],
            ['Token Fees Collected',  fmt(stats?.totalTokenFees ?? 0)],
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
      { 'Report Type': 'Admin Platform Overview' }
    );
    toast.success('Platform analytics exported as CSV!');
  }, [stats]);

  return (
    <div className="max-w-[1100px] mx-auto">

      {/* ── Page Header Row ─────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between anim-fade-up">
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-luxury-muted mb-2">
            System Control
          </p>
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

        {/* Quick Actions */}
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

      {/* ── 4-KPI Stat Cards ────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-8">
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
          Icon={IconApproved}
        />
        <StatCard
          label="Total Bookings"
          value={stats?.totalBookings ?? 0}
          sub="Platform-wide reservations"
          Icon={IconBookings}
        />
        <StatCard
          label="Token Fees Collected"
          value={`₹${(stats?.totalTokenFees ?? 0).toLocaleString()}`}
          sub="Total platform revenue"
          Icon={IconRevenue}
          accent
        />
      </div>

      {/* ── Partner Restaurants Directory & Action Hub ──── */}
      <RegisteredRestaurantsOverview />
    </div>
  );
}
