import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from '../../utils/toast.js';
import { restaurantApi } from '../services/restaurantApi.js';
import Loader from '../../components/Loader.jsx';
import { downloadCSV, fmt, fmtDate, today } from '../utils/exportCSV.js';
import RestaurantHeader from '../components/RestaurantHeader.jsx';

/* ── DATE & TIME FORMATTERS ──────────────────────────────────── */
function formatBookingDate(rawDate) {
  if (!rawDate) return '—';
  const d = new Date(rawDate.length === 10 ? `${rawDate}T00:00:00` : rawDate);
  if (isNaN(d.getTime())) return rawDate;
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatBookingTime(timeStr) {
  if (!timeStr) return '—';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${mStr || '00'} ${ampm}`;
}

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
function StatCard({ line1, line2, label, value, sub, Icon, accent = false }) {
  let l1 = line1;
  let l2 = line2;
  if (!l1 && label) {
    const parts = label.trim().split(/\s+/);
    if (parts.length >= 2) {
      if (parts.length === 3 && parts[0].toLowerCase() === 'token') {
        l1 = `${parts[0]} ${parts[1]}`;
        l2 = parts[2];
      } else {
        l1 = parts[0];
        l2 = parts.slice(1).join(' ');
      }
    } else {
      l1 = label;
      l2 = '';
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300 group"
      style={{
        background: accent
          ? 'linear-gradient(150deg, #1f1b0d 0%, #161408 60%, #121003 100%)'
          : 'linear-gradient(150deg, #1c1c1c 0%, #161616 55%, #131313 100%)',
        border: accent ? '1px solid rgba(212,175,55,0.32)' : '1px solid rgba(212,175,55,0.13)',
        boxShadow: accent
          ? '0 4px 40px rgba(0,0,0,0.55), 0 0 24px rgba(212,175,55,0.08)'
          : '0 4px 40px rgba(0,0,0,0.55)',
      }}
    >
      {/* Corner glow for accent */}
      {accent && (
        <div
          className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)' }}
        />
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted font-semibold leading-[1.3] flex flex-col justify-center min-h-[2.4rem]">
          <span>{l1}</span>
          {l2 && <span>{l2}</span>}
        </div>
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
        style={{ fontSize: '2.4rem' }}
      >
        {value}
      </p>

      {sub && (
        <p className="mt-2.5 font-sans text-xs text-luxury-muted truncate">{sub}</p>
      )}

      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(90deg, rgba(212,175,55,0.6) 0%, transparent 100%)',
          opacity: accent ? 0.85 : 0.45,
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
          <p className="mt-1 font-display text-white font-semibold text-lg">{total} Total Tables Configured</p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-bold text-white">{pctAvail}%</p>
          <p className="font-sans text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Available Now</p>
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
      <div className="flex items-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="font-sans text-xs text-luxury-muted font-medium">{available} Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: 'rgba(212,175,55,0.7)' }} />
          <span className="font-sans text-xs text-luxury-muted font-medium">{reserved} Reserved</span>
        </div>
      </div>
    </div>
  );
}

import TimeSpentModal from '../components/TimeSpentModal.jsx';

/* ── STATUS BADGE ───────────────────────────────────────────── */
function StatusBadge({ status }) {
  const v = String(status).toLowerCase();
  const isCancelled = v === 'cancelled';

  const cfg = isCancelled
    ? { text: 'Cancelled', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.22)', color: '#f87171' }
    : { text: 'Confirmed', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.22)', color: '#4ade80' };

  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 font-sans text-[11px] font-semibold select-none"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      {cfg.text}
    </span>
  );
}

/* ── DIRECT CANCEL BUTTON ────────────────────────────────────── */
function DirectCancelBtn({ booking, onUpdated }) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await restaurantApi.updateBookingStatus(booking._id, 'cancelled');
      toast.success('Booking marked as Cancelled');
      onUpdated(booking._id, 'cancelled', res.data?.booking);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleCancel}
      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-sans text-xs font-semibold text-red-400 hover:text-red-300 transition-all duration-200 disabled:opacity-40"
      style={{
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.22)',
      }}
      title="Cancel reservation"
    >
      {loading ? (
        <span className="h-3 w-3 rounded-full border border-red-400 border-t-transparent animate-spin" />
      ) : (
        'Cancel'
      )}
    </button>
  );
}

/* ── MAIN DASHBOARD ─────────────────────────────────────────── */
export default function RestaurantDashboard() {
  const cachedStatsRes = restaurantApi.getCache('stats_default')?.data;
  const [data, setData]       = useState(() => cachedStatsRes || null);
  const [loading, setLoading] = useState(() => !cachedStatsRes);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState(() => cachedStatsRes?.recentBookings || []);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent && !restaurantApi.getCache('stats_default')) setLoading(true);
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
    const tokenFee = rest.tokenFee || 200;

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
            ['Wishlist Bookmarks', stats.wishlistCount       ?? 0],
            ['Base Token Fee',    fmt(tokenFee)],
            ['Approval Status',   rest.approvalStatus || 'Approved'],
          ],
        },
        {
          title: 'Recent Bookings',
          headers: ['Customer Name', 'Email / Phone', 'Date', 'Time', 'Guests', 'Token Fee', 'Status'],
          rows: bookings.map((b) => [
            b.userId?.name  || 'Guest',
            b.userId?.email || b.userId?.phone || '—',
            fmtDate(b.date),
            formatBookingTime(b.time),
            b.guests || 1,
            fmt(b.finalPayable > 0 ? b.finalPayable : (b.guests || 1) * tokenFee),
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

  const [selectedBookingForComplete, setSelectedBookingForComplete] = useState(null);
  const [submittingTimeSpent, setSubmittingTimeSpent] = useState(false);

  /* Inline booking status update (updates local state) */
  const handleBookingStatusUpdate = useCallback((bookingId, newStatus, updatedObj) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b._id === bookingId) {
          return {
            ...b,
            status: newStatus,
            ...(updatedObj || {}),
          };
        }
        return b;
      })
    );
  }, []);

  const handleConfirmCompleteWithTime = async ({ bookingId, timeSpentFormatted, timeSpentMinutes }) => {
    setSubmittingTimeSpent(true);
    try {
      const res = await restaurantApi.updateBookingStatus(bookingId, 'completed', {
        timeSpentFormatted,
        timeSpentMinutes,
      });
      toast.success(`Booking completed! Customer spent ${timeSpentFormatted}`);
      handleBookingStatusUpdate(bookingId, 'completed', res.data?.booking || { timeSpentFormatted });
      setSelectedBookingForComplete(null);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to complete booking');
    } finally {
      setSubmittingTimeSpent(false);
    }
  };



  const stats        = data?.stats      || {};
  const restaurant   = data?.restaurant || {};

  const availableCount = stats.availableTablesCount ?? 0;
  const reservedCount  = stats.reservedTablesCount  ?? 0;
  const totalTables    = stats.totalTables          ?? 0;

  const confirmedList = bookings.filter((b) => b.status === 'confirmed' || b.status === 'checked-in' || b.status === 'completed');
  const liveActiveCount = confirmedList.length;
  const liveTotalTokenFees = confirmedList.reduce((acc, b) => {
    const fee = b.finalPayable > 0 ? b.finalPayable : (b.guests || 1) * (restaurant.tokenFee || 200);
    return acc + fee;
  }, 0);

  return (
    <div className="max-w-[1100px] mx-auto pb-12">

      {/* ── Page Header Row ─────────────────────────────────── */}
      <RestaurantHeader
        restaurant={restaurant}
        title="Dashboard Overview"
        description={`${restaurant.name || 'Restaurant'} — performance & seating metrics`}
        extraMeta={
          <>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1.5 text-white/90 font-medium">
              <span className="text-luxury-gold">💎</span> Base Token Fee:{' '}
              <strong className="text-luxury-gold font-bold">₹{restaurant.tokenFee || 200}</strong>
            </span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1.5 text-white/90 font-medium">
              <span className="text-luxury-gold">🪑</span> Total Seating:{' '}
              <strong className="text-white font-semibold">{stats.totalSeatingCapacity || 50} Guests</strong>
            </span>
          </>
        }
        actions={
          <>
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
          </>
        }
      />

      {/* ── 5-KPI Stat Cards ────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-6">
        <StatCard
          line1="Total"
          line2="Tables"
          value={totalTables}
          sub={`${availableCount} available · ${reservedCount} reserved`}
          Icon={IconTables}
        />
        <StatCard
          line1="Seating"
          line2="Capacity"
          value={stats.totalCapacity ?? 0}
          sub="Total seats configured"
          Icon={IconSeating}
        />
        <StatCard
          line1="Active"
          line2="Bookings"
          value={liveActiveCount}
          sub={`${bookings.length} total reservations`}
          Icon={IconActiveBookings}
        />
        <StatCard
          line1="Wishlist"
          line2="Bookmarks"
          value={stats.wishlistCount ?? 0}
          sub="Saved by dining guests"
          Icon={() => (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          )}
        />
        <StatCard
          line1="Token Fees"
          line2="Earned"
          value={`₹${liveTotalTokenFees.toLocaleString()}`}
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
            className="grid px-6 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted"
            style={{
              gridTemplateColumns: '1.4fr 1.2fr 1.1fr 1fr 90px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span>Customer</span>
            <span>Date & Time</span>
            <span>Party & Fee</span>
            <span>Status</span>
            <span className="text-right">Action</span>
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
                style={{ gridTemplateColumns: '1.4fr 1.2fr 1.1fr 1fr 90px' }}
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

                {/* Date & Time */}
                <div>
                  <p className="font-sans text-sm text-white/90 font-medium">
                    {formatBookingDate(b.date)}
                  </p>
                  <p className="font-sans text-[11px] text-luxury-muted mt-0.5">
                    at {formatBookingTime(b.time)}
                  </p>
                </div>

                {/* Party & Fee */}
                <div>
                  <p className="font-sans text-sm text-white/90 font-medium">
                    {b.guests || 1} {(b.guests || 1) === 1 ? 'Guest' : 'Guests'}
                  </p>
                  <p className="font-sans text-[11px] text-luxury-gold mt-0.5 font-semibold">
                    ₹{((b.finalPayable > 0 ? b.finalPayable : (b.guests || 1) * (restaurant.tokenFee || 200))).toLocaleString()}
                  </p>
                </div>

                {/* Status badge */}
                <div>
                  <StatusBadge status={b.status} timeSpentFormatted={b.timeSpentFormatted} />
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                  {b.status !== 'cancelled' ? (
                    <DirectCancelBtn
                      booking={b}
                      onUpdated={handleBookingStatusUpdate}
                    />
                  ) : (
                    <span className="font-sans text-[10px] text-luxury-muted uppercase tracking-wider">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── TIME SPENT MODAL ── */}
      <TimeSpentModal
        open={Boolean(selectedBookingForComplete)}
        booking={selectedBookingForComplete}
        onClose={() => setSelectedBookingForComplete(null)}
        onConfirm={handleConfirmCompleteWithTime}
        loading={submittingTimeSpent}
      />
    </div>
  );
}
