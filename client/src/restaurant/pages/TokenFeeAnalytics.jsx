import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { restaurantApi } from '../services/restaurantApi.js';
import Loader from '../../components/Loader.jsx';
import { downloadCSV, fmt, today } from '../utils/exportCSV.js';

/* ── ICONS ──────────────────────────────────────────────────── */
function IconRevenue() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M9 5v8M6.5 7.5h5M6.5 10.5h5" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconAvgFee() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 13.5h14M3.5 10l3.5-5 3.5 3.5L14.5 3" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconGuests() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="6.5" cy="6" r="3" stroke="#d4af37" strokeWidth="1.4" />
      <circle cx="12.5" cy="6" r="3" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M1 16c0-3 2.5-5 5.5-5h2M10 16c0-3 2.5-5 5.5-5h1" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconRate() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 4h12M3 9h12M3 14h7" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="14" cy="14" r="2.5" stroke="#d4af37" strokeWidth="1.3" />
      <path d="M12.5 14h3M14 12.5v3" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round" />
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

/* ── STAT CARD (matches Dashboard/TablesManagement) ─────────── */
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
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, rgba(212,175,55,0.55) 0%, transparent 100%)',
          opacity: accent ? 0.8 : 0.5,
        }}
      />
    </div>
  );
}

/* ── ZONE CHIP ──────────────────────────────────────────────── */
const ZONE_COLORS = {
  'Main Hall':          { bg: 'rgba(99,102,241,0.10)',  color: '#a5b4fc' },
  'Outdoor Terrace':    { bg: 'rgba(34,197,94,0.08)',   color: '#6ee7b7' },
  'VIP Private Dining': { bg: 'rgba(212,175,55,0.10)',  color: '#f5e27a' },
  'Rooftop':            { bg: 'rgba(244,63,94,0.10)',   color: '#fb7185' },
  'Bar Counter':        { bg: 'rgba(249,115,22,0.10)',  color: '#fdba74' },
};
function ZoneChip({ zone }) {
  const cfg = ZONE_COLORS[zone] || { bg: 'rgba(255,255,255,0.06)', color: '#aaa' };
  return (
    <span
      className="rounded-full px-2.5 py-0.5 font-sans text-[10px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {zone}
    </span>
  );
}

/* ── TABLE STATUS BADGE ─────────────────────────────────────── */
function TableStatusBadge({ status }) {
  const cfgs = {
    Available:   { bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.25)',   color: '#4ade80' },
    Reserved:    { bg: 'rgba(212,175,55,0.10)',  border: 'rgba(212,175,55,0.28)',  color: '#d4af37' },
    Maintenance: { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.22)',   color: '#f87171' },
  };
  const cfg = cfgs[status] || { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: '#888' };
  return (
    <span
      className="inline-block rounded-full px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wider"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      {status}
    </span>
  );
}

/* ── SECTION CARD ───────────────────────────────────────────── */
function SectionCard({ title, sub, children, action }) {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div
        className="flex items-start justify-between px-6 py-5 gap-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div>
          <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
          {sub && <p className="mt-0.5 font-sans text-xs text-luxury-muted">{sub}</p>}
        </div>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

/* ── EMPTY STATE ────────────────────────────────────────────── */
function EmptyState({ icon, title, sub }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.12)' }}
      >
        {icon}
      </div>
      <p className="font-sans text-sm text-luxury-muted">{title}</p>
      {sub && <p className="font-sans text-xs text-white/20">{sub}</p>}
    </div>
  );
}

/* ── MAIN COMPONENT ─────────────────────────────────────────── */
export default function TokenFeeAnalytics() {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await restaurantApi.getAnalytics();
      setData(res.data.analytics || {});
    } catch (err) {
      toast.error(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <Loader label="Computing Token Fee Analysis…" />;

  const analytics        = data || {};
  const zoneBreakdown    = analytics.zoneBreakdown    || {};
  const capacityBreakdown = analytics.capacityBreakdown || {};
  const tableLeaderboard = analytics.tableLeaderboard  || [];

  const totalZones = Object.keys(zoneBreakdown).length;

  return (
    <div className="max-w-[1100px] mx-auto">

      {/* ── Page Header Row ─────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between anim-fade-up">
        <div>
          <h1
            className="font-display leading-none text-luxury-white font-bold"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}
          >
            Token Fee Analysis
          </h1>
          <p className="mt-2 font-sans text-sm text-luxury-muted">
            Financial breakdown by seating capacity, dining zones, and individual tables
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
            onClick={() => { fetchData(true); toast.success('Analytics refreshed'); }}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-xs text-luxury-muted hover:text-luxury-gold transition-all duration-200 disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className={refreshing ? 'animate-spin' : ''}><IconRefresh /></span>
            Refresh
          </button>

          <button
            type="button"
            onClick={() => {
              downloadCSV(
                `token_fee_analytics_${today()}.csv`,
                [
                  {
                    title: 'Performance Metrics',
                    headers: ['Metric', 'Value'],
                    rows: [
                      ['Total Token Revenue',      fmt(analytics.totalTokenRevenue)],
                      ['Total Confirmed Bookings', analytics.totalConfirmedBookings || 0],
                      ['Avg Fee / Reservation',    fmt(analytics.avgTokenFeePerBooking)],
                      ['Avg Guests / Booking',     analytics.avgGuestsPerBooking || 0],
                      ['Total Guests Served',      analytics.totalGuestsServed || 0],
                      ['Standard Token Rate',      fmt(analytics.tokenFeeRate || 150)],
                    ],
                  },
                  {
                    title: 'Dining Zone Distribution',
                    headers: ['Zone', 'Tables'],
                    rows: Object.entries(zoneBreakdown).map(([z, c]) => [z, c]),
                  },
                  {
                    title: 'Capacity Breakdown',
                    headers: ['Capacity', 'Tables', 'Total Seats', 'Avg Token Fee'],
                    rows: Object.entries(capacityBreakdown).map(([cap, item]) => [
                      cap, item.count, item.totalCapacity, fmt(item.avgTokenFee),
                    ]),
                  },
                  {
                    title: 'Table Inventory',
                    headers: ['Table Number', 'Capacity', 'Zone', 'Status', 'Token Fee'],
                    rows: tableLeaderboard.map((t) => [
                      t.tableNumber, `${t.capacity}-Seater`, t.zone, t.status, fmt(t.tokenFee),
                    ]),
                  },
                ],
              );
              toast.success('Analytics exported as CSV!');
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
          label="Total Token Revenue"
          value={`₹${(analytics.totalTokenRevenue || 0).toLocaleString()}`}
          sub={`From ${analytics.totalConfirmedBookings || 0} confirmed bookings`}
          Icon={IconRevenue}
          accent
        />
        <StatCard
          label="Avg Fee / Reservation"
          value={`₹${analytics.avgTokenFeePerBooking || 0}`}
          sub={`Avg ${analytics.avgGuestsPerBooking || 0} guests per booking`}
          Icon={IconAvgFee}
        />
        <StatCard
          label="Total Guests Served"
          value={analytics.totalGuestsServed || 0}
          sub="Confirmed guest count"
          Icon={IconGuests}
        />
        <StatCard
          label="Standard Token Rate"
          value={`₹${analytics.tokenFeeRate || 150}`}
          sub="Base rate per guest"
          Icon={IconRate}
        />
      </div>

      {/* ── Capacity Analysis ────────────────────────────────── */}
      <div className="mb-6">
        <SectionCard
          title="Seating Capacity vs Token Fee Analysis"
          sub="Breakdown of seating infrastructure by table capacity and average token fee structure"
        >
          {Object.keys(capacityBreakdown).length === 0 ? (
            <EmptyState
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="rgba(212,175,55,0.4)" strokeWidth={1.25}>
                  <rect x="3" y="5" width="14" height="10" rx="2" />
                  <path strokeLinecap="round" d="M5 15v3M15 15v3M6 2v3M14 2v3" />
                </svg>
              }
              title="No seating capacity data recorded"
              sub="Add tables with seating configurations to see the breakdown"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {Object.entries(capacityBreakdown).map(([capName, item]) => (
                <div
                  key={capName}
                  className="group rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.border = '1px solid rgba(212,175,55,0.22)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)'; }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display text-base font-bold text-white group-hover:text-luxury-gold transition-colors duration-200">
                      {capName}
                    </span>
                    <span
                      className="rounded-full px-2.5 py-0.5 font-sans text-[10px] font-bold"
                      style={{
                        background: 'rgba(212,175,55,0.08)',
                        border: '1px solid rgba(212,175,55,0.2)',
                        color: '#d4af37',
                      }}
                    >
                      {item.count} Table{item.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-sans text-[11px] text-luxury-muted">Total Seating</span>
                      <span className="font-sans text-xs font-semibold text-white">{item.totalCapacity} Seats</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-sans text-[11px] text-luxury-muted">Avg Token Fee</span>
                      <span className="font-sans text-xs font-bold text-emerald-400">₹{item.avgTokenFee} / table</span>
                    </div>
                    {/* Mini bar visual */}
                    <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (item.avgTokenFee / 500) * 100)}%`,
                          background: 'linear-gradient(90deg, #d4af37, #f5e27a)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Zone Distribution + Policy ──────────────────────── */}
      <div className="mb-6 grid gap-6 md:grid-cols-2">

        {/* Dining Zone Distribution */}
        <SectionCard
          title="Dining Zone Distribution"
          sub={totalZones > 0 ? `${totalZones} active zone${totalZones !== 1 ? 's' : ''} configured` : undefined}
        >
          {Object.keys(zoneBreakdown).length === 0 ? (
            <EmptyState
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="rgba(212,175,55,0.4)" strokeWidth={1.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 3a7 7 0 100 14A7 7 0 0010 3zM10 3v7l4 2" />
                </svg>
              }
              title="No dining zones recorded"
              sub="Zones appear once tables with zone assignments are created"
            />
          ) : (
            <div className="space-y-2.5">
              {Object.entries(zoneBreakdown).map(([zName, zCount]) => (
                <div
                  key={zName}
                  className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors duration-150"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="flex items-center gap-2.5">
                    <ZoneChip zone={zName} />
                    <span className="font-sans text-sm font-medium text-white">{zName}</span>
                  </div>
                  <span
                    className="font-sans text-xs font-bold"
                    style={{ color: '#d4af37' }}
                  >
                    {zCount} Table{zCount !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Token Fee Policy */}
        <div
          className="rounded-2xl p-6 flex flex-col justify-between"
          style={{
            background: 'linear-gradient(150deg, #1a1800 0%, #141200 100%)',
            border: '1px solid rgba(212,175,55,0.2)',
            boxShadow: '0 0 32px rgba(212,175,55,0.04)',
          }}
        >
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="#d4af37" strokeWidth="1.3" />
                  <path d="M8 5v3.5l2 1.5" stroke="#d4af37" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-luxury-gold">
                Token Fee Policy & Financial Flow
              </h3>
            </div>
            <p className="font-sans text-xs text-luxury-muted leading-relaxed mb-4">
              Token fees collected during table reservations act as an advance deposit for diners. This guarantees table allocation, prevents no-shows, and ensures smooth revenue flow for high-demand seating capacities.
            </p>
          </div>
          <div
            className="rounded-xl p-4"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,175,55,0.1)' }}
          >
            <p className="font-sans text-[11px] text-white/70 leading-relaxed">
              <strong className="text-luxury-gold/80">Table-Wise Custom Fees:</strong>{' '}
              You can assign custom token fee rates to VIP or larger capacity tables in the{' '}
              <em className="text-luxury-gold/60">Add Restaurant & Tables</em> page.
            </p>
          </div>
        </div>
      </div>

      {/* ── Table Token Fee Inventory ───────────────────────── */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              Individual Table Token Fee Inventory
            </h2>
            <p className="mt-0.5 font-sans text-xs text-luxury-muted">
              Table-by-table capacity, zone assignment, and token fee rates
            </p>
          </div>
          <span
            className="rounded-full px-3 py-1 font-sans text-[11px] font-semibold text-luxury-muted"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {tableLeaderboard.length} Table{tableLeaderboard.length !== 1 ? 's' : ''}
          </span>
        </div>

        {tableLeaderboard.length === 0 ? (
          <div className="px-6 py-5">
            <EmptyState
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="rgba(212,175,55,0.4)" strokeWidth={1.25}>
                  <rect x="3" y="5" width="14" height="10" rx="2" />
                  <path strokeLinecap="round" d="M5 15v3M15 15v3M6 2v3M14 2v3" />
                </svg>
              }
              title="No tables found"
              sub="Add tables to see the token fee inventory"
            />
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div
              className="grid px-6 py-2.5 font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted"
              style={{
                gridTemplateColumns: '1fr 1fr 1.5fr 1fr 1fr',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: 'rgba(0,0,0,0.2)',
              }}
            >
              <span>Table</span>
              <span>Capacity</span>
              <span>Zone</span>
              <span>Status</span>
              <span className="text-right">Token Fee</span>
            </div>

            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {tableLeaderboard.map((t) => (
                <div
                  key={t.id}
                  className="grid items-center px-6 py-4 transition-colors duration-150 hover:bg-white/[0.025]"
                  style={{ gridTemplateColumns: '1fr 1fr 1.5fr 1fr 1fr' }}
                >
                  <span className="font-display font-bold text-white">{t.tableNumber}</span>
                  <span className="font-sans text-sm text-white/80">{t.capacity}-Seater</span>
                  <span><ZoneChip zone={t.zone} /></span>
                  <span><TableStatusBadge status={t.status} /></span>
                  <span className="text-right font-sans text-sm font-bold text-emerald-400">
                    ₹{t.tokenFee}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
