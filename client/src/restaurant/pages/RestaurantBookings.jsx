import { useEffect, useState, useCallback } from 'react';
import toast from '../../utils/toast.js';
import { restaurantApi } from '../services/restaurantApi.js';
import Loader from '../../components/Loader.jsx';
import { downloadCSV, fmt, fmtDate, today } from '../utils/exportCSV.js';

/* ── ICONS ──────────────────────────────────────────────────── */
function IconRefresh() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M13 7.5A5.5 5.5 0 012.02 9M2 7.5A5.5 5.5 0 0112.98 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M12.5 3v3h-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 12v-3h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="13" rx="2" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M6 1.5v3M12 1.5v3" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2 7.5h14" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M6 11l2 2 4-3" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconConfirmed() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M6 9l2 2 4-4" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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
function IconCancelled() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M6.5 6.5l5 5M11.5 6.5l-5 5" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* ── STAT CARD (matches Dashboard) ─────────────────────────── */
function StatCard({ line1, line2, label, value, sub, Icon, accent = false }) {
  let l1 = line1;
  let l2 = line2;
  if (!l1 && label) {
    const parts = label.trim().split(/\s+/);
    if (parts.length >= 2) {
      l1 = parts[0];
      l2 = parts.slice(1).join(' ');
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
        <div className="font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted font-semibold leading-[1.3] flex flex-col justify-center min-h-[2.4rem]">
          <span>{l1}</span>
          {l2 && <span>{l2}</span>}
        </div>
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
        className="absolute bottom-0 left-0 right-0 h-[2px]"
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
  const v = String(status).toLowerCase();
  const configs = {
    confirmed: { text: 'Confirmed', bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.22)',  color: '#4ade80', dot: true  },
    completed: { text: 'Completed', bg: 'rgba(99,102,241,0.10)', border: 'rgba(99,102,241,0.22)', color: '#a5b4fc', dot: false },
    cancelled: { text: 'Cancelled', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.22)',  color: '#f87171', dot: false },
    pending:   { text: 'Pending',   bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.22)',  color: '#fbbf24', dot: true  },
  };
  const cfg = configs[v] || { text: status, bg: 'transparent', border: 'rgba(255,255,255,0.1)', color: '#888', dot: false };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold capitalize"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      {cfg.dot && <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: cfg.color }} />}
      {cfg.text}
    </span>
  );
}

/* ── ACTION BUTTON ──────────────────────────────────────────── */
function ActionBtn({ label, color, hoverBg, hoverBorder, onClick, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="rounded-xl px-3.5 py-1.5 font-sans text-xs font-semibold transition-all duration-200 disabled:opacity-40"
      style={{
        color,
        background: hov ? hoverBg : `${hoverBg.replace('0.15', '0.08')}`,
        border: `1px solid ${hov ? hoverBorder : hoverBorder.replace('0.35', '0.18')}`,
      }}
    >
      {disabled ? (
        <span className="inline-block h-3 w-3 rounded-full border border-current border-t-transparent animate-spin" />
      ) : label}
    </button>
  );
}

/* ── FILTER TAB ─────────────────────────────────────────────── */
const FILTER_TABS = ['all', 'confirmed', 'completed', 'cancelled'];

/* ── MAIN COMPONENT ─────────────────────────────────────────── */
export default function RestaurantBookings() {
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter,     setFilter]     = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await restaurantApi.getBookings();
      setBookings(res.data.bookings || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await restaurantApi.updateBookingStatus(id, status);
      toast.success(`Booking marked as ${status}`);
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status } : b));
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  /* ── Derived stats ── */
  const confirmed  = bookings.filter((b) => b.status === 'confirmed');
  const completed  = bookings.filter((b) => b.status === 'completed');
  const cancelled  = bookings.filter((b) => b.status === 'cancelled');
  const totalRevenue = confirmed.reduce(
    (s, b) => s + (b.guests || 1) * (b.tokenFee || 150), 0
  );

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  return (
    <div className="max-w-[1100px] mx-auto">

      {/* ── Page Header Row ─────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between anim-fade-up">
        <div>
          <h1
            className="font-display leading-none text-luxury-white font-bold"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}
          >
            Manage Bookings
          </h1>
          <p className="mt-2 font-sans text-sm text-luxury-muted">
            Approve, track, and manage all table reservations for your restaurant guests
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
            onClick={() => { fetchBookings(true); toast.success('Bookings refreshed'); }}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-xs text-luxury-muted hover:text-luxury-gold transition-all duration-200 disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className={refreshing ? 'animate-spin' : ''}><IconRefresh /></span>
            Refresh
          </button>

          <button
            type="button"
            onClick={() => {
              const confirmed = bookings.filter((b) => b.status === 'confirmed');
              downloadCSV(
                `bookings_export_${today()}.csv`,
                [
                  {
                    title: 'Summary',
                    headers: ['Metric', 'Value'],
                    rows: [
                      ['Total Reservations', bookings.length],
                      ['Confirmed',          bookings.filter((b) => b.status === 'confirmed').length],
                      ['Completed',          bookings.filter((b) => b.status === 'completed').length],
                      ['Cancelled',          bookings.filter((b) => b.status === 'cancelled').length],
                      ['Token Revenue',      fmt(confirmed.reduce((s, b) => s + (b.guests || 1) * (b.tokenFee || 150), 0))],
                    ],
                  },
                  {
                    title: 'All Reservations',
                    headers: ['Customer Name', 'Email / Phone', 'Date', 'Time', 'Guests', 'Token Fee Paid', 'Status'],
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
              );
              toast.success('Bookings exported as CSV!');
            }}
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
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard
          label="Total Reservations"
          value={bookings.length}
          sub="All time bookings"
          Icon={IconCalendar}
        />
        <StatCard
          label="Confirmed"
          value={confirmed.length}
          sub="Active confirmed bookings"
          Icon={IconConfirmed}
        />
        <StatCard
          label="Token Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          sub="From confirmed bookings"
          Icon={IconRevenue}
          accent
        />
        <StatCard
          label="Cancelled"
          value={cancelled.length}
          sub={`${completed.length} completed`}
          Icon={IconCancelled}
        />
      </div>

      {/* ── Bookings Table ───────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Header + Filter */}
        <div
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <h2 className="font-display text-lg font-semibold text-white">All Reservations</h2>
            <p className="mt-0.5 font-sans text-xs text-luxury-muted">
              {filteredBookings.length} reservation{filteredBookings.length !== 1 ? 's' : ''} matching &ldquo;{filter}&rdquo;
            </p>
          </div>

          {/* Filter tabs */}
          <div
            className="flex items-center gap-1 rounded-full p-1.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {FILTER_TABS.map((tab) => {
              const isActive = filter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className="rounded-full px-4 py-1.5 font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, #c9a84c, #f0d060)'
                      : 'transparent',
                    color: isActive ? '#0b0b0c' : 'rgba(255,255,255,0.4)',
                    boxShadow: isActive ? '0 0 12px rgba(212,175,55,0.3)' : 'none',
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.12)' }}
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="rgba(212,175,55,0.35)" strokeWidth={1.25}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div>
              <p className="font-display text-white/60 font-light text-lg">No reservations found</p>
              <p className="mt-1 font-sans text-xs text-luxury-muted">
                {filter === 'all'
                  ? 'Reservations will appear here once customers book tables'
                  : `No "${filter}" reservations at this time`}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div
              className="hidden md:grid px-6 py-2.5 font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted"
              style={{
                gridTemplateColumns: '1.5fr 1fr 0.7fr 0.8fr 1fr 1.2fr',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: 'rgba(0,0,0,0.2)',
              }}
            >
              <span>Guest</span>
              <span>Date & Time</span>
              <span>Guests</span>
              <span>Token Fee</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {filteredBookings.map((b) => (
                <div
                  key={b._id}
                  className="flex flex-col gap-3 px-6 py-4 transition-colors duration-150 hover:bg-white/[0.025] md:grid md:items-center md:gap-4"
                  style={{ gridTemplateColumns: '1.5fr 1fr 0.7fr 0.8fr 1fr 1.2fr' }}
                >
                  {/* Guest */}
                  <div className="min-w-0">
                    <p className="font-sans font-semibold text-white text-sm truncate">
                      {b.userId?.name || 'Guest User'}
                    </p>
                    <p className="font-sans text-[11px] text-luxury-muted truncate mt-0.5">
                      {b.userId?.email || b.userId?.phone || '—'}
                    </p>
                  </div>

                  {/* Date & Time */}
                  <div>
                    <p className="font-sans text-sm text-white/85">{b.date}</p>
                    <p className="font-sans text-[11px] text-luxury-gold/60 mt-0.5">{b.time}</p>
                  </div>

                  {/* Guests */}
                  <div className="font-sans text-sm font-semibold text-white">
                    {b.guests || 1}
                    <span className="text-luxury-muted font-normal ml-1">
                      {(b.guests || 1) === 1 ? 'Person' : 'Guests'}
                    </span>
                  </div>

                  {/* Token Fee */}
                  <div className="font-sans text-sm font-bold text-luxury-gold/90">
                    ₹{((b.guests || 1) * (b.tokenFee || 150)).toLocaleString()}
                  </div>

                  {/* Status */}
                  <div>
                    <StatusBadge status={b.status} />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    {b.status !== 'confirmed' && (
                      <ActionBtn
                        label="Confirm"
                        color="#4ade80"
                        hoverBg="rgba(34,197,94,0.15)"
                        hoverBorder="rgba(34,197,94,0.35)"
                        onClick={() => handleStatusChange(b._id, 'confirmed')}
                        disabled={updatingId === b._id}
                      />
                    )}
                    {b.status !== 'completed' && (
                      <ActionBtn
                        label="Complete"
                        color="#a5b4fc"
                        hoverBg="rgba(99,102,241,0.15)"
                        hoverBorder="rgba(99,102,241,0.35)"
                        onClick={() => handleStatusChange(b._id, 'completed')}
                        disabled={updatingId === b._id}
                      />
                    )}
                    {b.status !== 'cancelled' && (
                      <ActionBtn
                        label="Cancel"
                        color="#f87171"
                        hoverBg="rgba(239,68,68,0.15)"
                        hoverBorder="rgba(239,68,68,0.35)"
                        onClick={() => handleStatusChange(b._id, 'cancelled')}
                        disabled={updatingId === b._id}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
