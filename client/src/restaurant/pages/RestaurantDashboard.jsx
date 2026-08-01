import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { restaurantApi } from '../services/restaurantApi.js';
import Loader from '../../components/Loader.jsx';
import { downloadCSV, fmt, fmtDate, today } from '../utils/exportCSV.js';

/* ── SVG ICONS ──────────────────────────────────────────────── */
function IconTables() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="4" width="14" height="9" rx="2" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M4 13v3M14 13v3M5 1.5v2.5M13 1.5v2.5" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconSeating() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M5 7V4a1 1 0 011-1h6a1 1 0 011 1v3" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="2" y="7" width="14" height="5" rx="1.5" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M4 12v4M14 12v4" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconActiveBookings() {
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

/* ── KPI STAT CARD ──────────────────────────────────────────── */
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
          style={{
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.20)',
          }}
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

/* ── OCCUPANCY BAR ──────────────────────────────────────────── */
function OccupancyCard({ available, reserved, total }) {
  const pctAvail = total > 0 ? Math.round((available / total) * 100) : 0;
  const pctReserved = total > 0 ? Math.round((reserved / total) * 100) : 0;

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
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted">Table Occupancy</p>
          <p className="mt-1 font-display text-white font-semibold text-lg">{total} Total Tables</p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-bold text-white">{pctAvail}%</p>
          <p className="font-sans text-[10px] text-emerald-400 uppercase tracking-wider">Available</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
          style={{
            width: `${pctAvail}%`,
            background: 'linear-gradient(90deg, #22c55e, #16a34a)',
            boxShadow: '0 0 8px rgba(34,197,94,0.4)',
          }}
        />
        {pctReserved > 0 && (
          <div
            className="absolute top-0 h-full rounded-full transition-all duration-700"
            style={{
              left: `${pctAvail}%`,
              width: `${pctReserved}%`,
              background: 'linear-gradient(90deg, rgba(212,175,55,0.7), rgba(212,175,55,0.4))',
            }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="font-sans text-xs text-luxury-muted">{available} Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: 'rgba(212,175,55,0.7)' }} />
          <span className="font-sans text-xs text-luxury-muted">{reserved} Reserved</span>
        </div>
      </div>
    </div>
  );
}

/* ── STATUS BADGE ───────────────────────────────────────────── */
function StatusBadge({ status }) {
  const v = String(status).toLowerCase();
  const configs = {
    confirmed: { text: 'Confirmed', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.22)', color: '#4ade80', dot: true },
    completed:  { text: 'Completed', bg: 'rgba(99,102,241,0.10)', border: 'rgba(99,102,241,0.22)', color: '#a5b4fc', dot: false },
    cancelled:  { text: 'Cancelled', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.22)', color: '#f87171', dot: false },
    pending:    { text: 'Pending',   bg: 'rgba(234,179,8,0.10)', border: 'rgba(234,179,8,0.22)', color: '#fbbf24', dot: true },
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

/* ── INLINE STATUS SELECTOR ─────────────────────────────────── */
function StatusSelector({ bookingId, currentStatus, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const options = [
    { value: 'confirmed', label: 'Confirmed', color: '#4ade80' },
    { value: 'completed', label: 'Completed', color: '#a5b4fc' },
    { value: 'cancelled', label: 'Cancelled', color: '#f87171' },
  ].filter((o) => o.value !== currentStatus);

  const handleSelect = async (newStatus) => {
    setOpen(false);
    setLoading(true);
    try {
      await restaurantApi.updateBookingStatus(bookingId, newStatus);
      toast.success(`Booking marked as ${newStatus}`);
      onUpdated(bookingId, newStatus);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-xl px-2 py-1 font-sans text-[10px] text-luxury-muted hover:text-luxury-gold transition-all duration-200"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        title="Change status"
      >
        {loading ? (
          <span className="h-3 w-3 rounded-full border border-luxury-gold/40 border-t-luxury-gold animate-spin" />
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        Change
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl py-1 min-w-[130px]"
            style={{
              background: '#1a1a1a',
              border: '1px solid rgba(212,175,55,0.15)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
            }}
          >
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => handleSelect(o.value)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 font-sans text-xs transition-colors duration-150 hover:bg-white/5"
                style={{ color: o.color }}
              >
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: o.color }} />
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── MAIN DASHBOARD ─────────────────────────────────────────── */
export default function RestaurantDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState([]);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await restaurantApi.getStats();
      setData(res.data);
      setBookings(res.data?.recentBookings || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Export analytics as CSV ── */
  const exportAnalytics = useCallback(() => {
    const stats = data?.stats      || {};
    const rest  = data?.restaurant || {};

    downloadCSV(
      `${(rest.name || 'restaurant').replace(/\s+/g, '_')}_dashboard_analytics_${today()}.csv`,
      [
        {
          title: 'Performance Metrics',
          headers: ['Metric', 'Value'],
          rows: [
            ['Total Tables',      stats.totalTables        ?? 0],
            ['Seating Capacity',  stats.totalCapacity      ?? 0],
            ['Active Bookings',   stats.activeBookings     ?? 0],
            ['Total Bookings',    stats.totalBookings      ?? 0],
            ['Token Fees Earned', fmt(stats.totalTokenFees)],
            ['Available Tables',  stats.availableTablesCount ?? 0],
            ['Reserved Tables',   stats.reservedTablesCount  ?? 0],
            ['Base Token Fee',    fmt(rest.tokenFee || 150)],
            ['Approval Status',   rest.approvalStatus || '—'],
          ],
        },
        {
          title: 'Recent Bookings',
          headers: ['Customer Name', 'Email / Phone', 'Date', 'Time', 'Guests', 'Token Fee', 'Status'],
          rows: bookings.map((b) => [
            b.userId?.name  || 'Guest',
            b.userId?.email || b.userId?.phone || '—',
            fmtDate(b.date), b.time,
            b.guests || 1,
            fmt((b.guests || 1) * (b.tokenFee || 150)),
            b.status,
          ]),
        },
      ],
      {
        Restaurant: rest.name     || '—',
        Location:   rest.location || '—',
        Category:   rest.category || '—',
      },
    );
    toast.success('Analytics exported as CSV!');
  }, [data, bookings]);

  /* Inline booking status update (updates local state) */
  const handleBookingStatusUpdate = useCallback((bookingId, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
    );
  }, []);

  if (loading) return <Loader label="Loading Partner Console…" />;

  const stats        = data?.stats      || {};
  const restaurant   = data?.restaurant || {};
  const approvalStatus = restaurant.approvalStatus || 'approved';

  const availableCount = stats.availableTablesCount ?? 0;
  const reservedCount  = stats.reservedTablesCount  ?? 0;
  const totalTables    = stats.totalTables          ?? 0;

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
            {restaurant.name || 'Restaurant'} — performance & seating metrics
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
            onClick={() => { fetchData(true); toast.success('Dashboard refreshed'); }}
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

      {/* ── Approval Status Banners ──────────────────────────── */}
      {approvalStatus === 'pending' && (
        <div className="mb-8 rounded-2xl p-5 border border-amber-500/40 bg-amber-500/10 text-amber-200 font-sans flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-amber-400">⏳ Submission Pending Admin Approval</h3>
            <p className="text-xs opacity-90 mt-1">
              Your restaurant details have been saved and submitted. Once approved, your restaurant will be live for customer table bookings.
            </p>
          </div>
          <Link
            to="/restaurant-dashboard/tables"
            className="shrink-0 rounded-xl bg-amber-400 text-black px-4 py-2 text-xs font-semibold hover:bg-amber-300 transition-colors"
          >
            Manage Setup
          </Link>
        </div>
      )}

      {approvalStatus === 'rejected' && (
        <div className="mb-8 rounded-2xl p-5 border border-red-500/40 bg-red-500/10 text-red-200 font-sans">
          <h3 className="font-bold text-red-400">❌ Application Requires Attention</h3>
          <p className="text-xs opacity-90 mt-1">
            <strong>Feedback from Admin:</strong> {restaurant.rejectionReason || 'Please verify restaurant details and table configurations.'}
          </p>
          <Link
            to="/restaurant-dashboard/tables"
            className="inline-block mt-3 rounded-xl bg-red-500 text-white px-4 py-1.5 text-xs font-semibold hover:bg-red-400 transition-colors"
          >
            Update Details & Resubmit
          </Link>
        </div>
      )}



      {/* ── 4-KPI Stat Cards ────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard
          label="Total Tables"
          value={totalTables}
          sub={`${availableCount} available · ${reservedCount} reserved`}
          Icon={IconTables}
        />
        <StatCard
          label="Seating Capacity"
          value={stats.totalCapacity ?? 0}
          sub="Total seats configured"
          Icon={IconSeating}
        />
        <StatCard
          label="Active Bookings"
          value={stats.activeBookings ?? 0}
          sub={`${stats.totalBookings ?? 0} total reservations`}
          Icon={IconActiveBookings}
        />
        <StatCard
          label="Token Fees Earned"
          value={`₹${(stats.totalTokenFees ?? 0).toLocaleString()}`}
          sub="From confirmed bookings"
          Icon={IconRevenue}
          accent
        />
      </div>

      {/* ── Occupancy Bar ────────────────────────────────────── */}
      <div className="mb-8">
        <OccupancyCard
          available={availableCount}
          reserved={reservedCount}
          total={totalTables}
        />
      </div>

      {/* ── Recent Bookings Table ────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h2 className="font-display text-lg text-white font-semibold">Recent Bookings</h2>
            <p className="font-sans text-xs text-luxury-muted mt-0.5">
              Latest table reservations for {restaurant.name || 'your restaurant'}
            </p>
          </div>
          <Link
            to="/restaurant-dashboard/bookings"
            className="rounded-full px-4 py-1.5 font-sans text-xs font-semibold text-luxury-gold hover:bg-luxury-gold/20 transition-all duration-200"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}
          >
            View All Bookings
          </Link>
        </div>

        {/* Column headers */}
        {bookings.length > 0 && (
          <div
            className="grid px-6 py-2.5 font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted"
            style={{
              gridTemplateColumns: '1fr 1fr 1fr auto',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <span>Customer</span>
            <span>Date & Time</span>
            <span>Status</span>
            <span />
          </div>
        )}

        {/* Body */}
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.12)' }}
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="rgba(212,175,55,0.4)" strokeWidth={1.25}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <p className="font-display text-white/60 font-light">No table bookings yet</p>
            <p className="font-sans text-xs text-luxury-muted">Bookings will appear here once customers reserve tables</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {bookings.map((b, i) => (
              <div
                key={b._id || i}
                className="grid items-center gap-4 px-6 py-4 transition-colors duration-150 hover:bg-white/[0.025]"
                style={{ gridTemplateColumns: '1fr 1fr 1fr auto' }}
              >
                {/* Customer */}
                <div className="min-w-0">
                  <p className="font-sans font-semibold text-white text-sm truncate">
                    {b.userId?.name || 'Customer'}
                  </p>
                  <p className="font-sans text-[11px] text-luxury-muted truncate mt-0.5">
                    {b.userId?.email || b.userId?.phone || '—'}
                  </p>
                </div>

                {/* Date & Guests */}
                <div>
                  <p className="font-sans text-sm text-white/80">{b.date} at {b.time}</p>
                  <p className="font-sans text-[11px] text-luxury-muted mt-0.5">
                    {b.guests || 1} {(b.guests || 1) === 1 ? 'Guest' : 'Guests'}
                  </p>
                </div>

                {/* Status badge */}
                <div>
                  <StatusBadge status={b.status} />
                </div>

                {/* Actions */}
                <div className="shrink-0">
                  {b.status !== 'cancelled' && b.status !== 'completed' && (
                    <StatusSelector
                      bookingId={b._id}
                      currentStatus={b.status}
                      onUpdated={handleBookingStatusUpdate}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
