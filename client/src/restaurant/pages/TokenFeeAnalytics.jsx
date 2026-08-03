import { useEffect, useState, useCallback } from 'react';
import toast from '../../utils/toast.js';
import { restaurantApi } from '../services/restaurantApi.js';
import Loader from '../../components/Loader.jsx';
import { downloadCSV, fmt, today } from '../utils/exportCSV.js';
import RestaurantHeader from '../components/RestaurantHeader.jsx';

/* ── ICONS ──────────────────────────────────────────────────── */
function IconRevenue() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M9 5v8M6.5 7.5h5M6.5 10.5h5" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
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

/* ── STAT CARD ─────────────────────────────────────────────── */
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
        <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted font-semibold">{label}</p>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.20)' }}
        >
          <Icon />
        </div>
      </div>
      <p className="font-display leading-none text-white font-bold text-3xl truncate">{value}</p>
      {sub && <p className="mt-2 font-sans text-xs text-luxury-muted truncate">{sub}</p>}
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
  'Fine Dining':        { bg: 'rgba(212,175,55,0.12)', color: '#f5e27a' },
  'Outdoor Terrace':    { bg: 'rgba(34,197,94,0.12)',  color: '#86efac' },
  'Rooftop Dining':     { bg: 'rgba(168,85,247,0.12)', color: '#d8b4fe' },
  'VIP Dining':         { bg: 'rgba(234,179,8,0.12)',  color: '#fef08a' },
  'Bar & Lounge':       { bg: 'rgba(249,115,22,0.12)', color: '#fdba74' },
  'Gourmet Cuisine':    { bg: 'rgba(236,72,153,0.12)', color: '#fbcfe8' },
  'Private Dining':     { bg: 'rgba(99,102,241,0.12)', color: '#a5b4fc' },
  'Live Music':         { bg: 'rgba(14,165,233,0.12)', color: '#7dd3fc' },
  'Main Hall':          { bg: 'rgba(212,175,55,0.12)', color: '#f5e27a' },
};
function ZoneChip({ zone }) {
  const cfg = ZONE_COLORS[zone] || { bg: 'rgba(255,255,255,0.06)', color: '#aaa' };
  return (
    <span
      className="rounded-full px-2.5 py-0.5 font-sans text-[10px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {zone || 'General'}
    </span>
  );
}

/* ── BOOKING STATUS BADGE ───────────────────────────────────── */
function BookingStatusBadge({ status }) {
  const cfgs = {
    confirmed:  { bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.25)', color: '#4ade80', label: 'Confirmed' },
    'checked-in':{ bg: 'rgba(14,165,233,0.10)', border: 'rgba(14,165,233,0.25)', color: '#38bdf8', label: 'Checked In' },
    completed:  { bg: 'rgba(168,85,247,0.10)', border: 'rgba(168,85,247,0.25)', color: '#c084fc', label: 'Completed' },
    cancelled:  { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.22)', color: '#f87171', label: 'Cancelled' },
  };
  const cfg = cfgs[status] || { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: '#888', label: status };
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      {cfg.label}
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

/* ── MAIN COMPONENT ─────────────────────────────────────────── */
export default function TokenFeeAnalytics() {
  const cachedAnalyticsRes = restaurantApi.getCache('analytics_default')?.data;
  const [data, setData] = useState(() => cachedAnalyticsRes?.analytics || null);
  const [restaurant, setRestaurant] = useState(() => cachedAnalyticsRes?.restaurant || restaurantApi.getActiveRestaurant() || {});
  const [loading, setLoading] = useState(() => !cachedAnalyticsRes);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent && !restaurantApi.getCache('analytics_default')) setLoading(true);
    else setRefreshing(true);
    try {
      const [analyticsRes, settingsRes] = await Promise.all([
        restaurantApi.getAnalytics(),
        restaurantApi.getSettings(),
      ]);
      setData(analyticsRes.data.analytics || {});
      setRestaurant(settingsRes.data.restaurant || {});
    } catch (err) {
      toast.error(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader />
      </div>
    );
  }

  const analytics = data || {};
  const zoneBreakdown = analytics.zoneBreakdown || {};
  const tableLeaderboard = analytics.tableLeaderboard || [];
  const recentTransactions = analytics.recentTransactions || [];

  const totalRevenue = analytics.totalTokenRevenue || 0;
  const confirmedCount = analytics.totalConfirmedBookings || 0;
  const totalGuests = analytics.totalGuestsServed || 0;
  const tokenRate = analytics.tokenFeeRate || restaurant?.tokenFee || 200;

  // Calculate earnings per zone
  const zoneEarningsMap = {};
  tableLeaderboard.forEach((t) => {
    if (!zoneEarningsMap[t.zone]) {
      zoneEarningsMap[t.zone] = { tableCount: 0, seats: 0, revenue: 0 };
    }
    zoneEarningsMap[t.zone].tableCount += 1;
    zoneEarningsMap[t.zone].seats += (t.capacity || 0);
    zoneEarningsMap[t.zone].revenue += (t.earnedRevenue || 0);
  });

  return (
    <div className="max-w-[1100px] mx-auto pb-16">

      {/* ── Page Header Row ─────────────────────────────────── */}
      <RestaurantHeader
        restaurant={restaurant}
        title="Token Fee Overview"
        description="Clear breakdown of token fees collected, diner payments, and table earnings"
        extraMeta={
          <>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1.5 text-white/90 font-medium">
              <span className="text-luxury-gold">💎</span> Token Rate:{' '}
              <strong className="text-luxury-gold font-bold">₹{tokenRate} / seat</strong>
            </span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1.5 text-white/90 font-medium">
              <span className="text-luxury-gold">💰</span> Total Revenue:{' '}
              <strong className="text-emerald-400 font-bold">{fmt(totalRevenue)}</strong>
            </span>
          </>
        }
        actions={
          <>
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
                  `token_fee_summary_${today()}.csv`,
                  [
                    {
                      title: 'Token Fee Overview',
                      headers: ['Metric', 'Value'],
                      rows: [
                        ['Total Money Collected', fmt(totalRevenue)],
                        ['Total Active Bookings', confirmedCount],
                        ['Total Guests Served', totalGuests],
                        ['Token Fee Per Person', fmt(tokenRate)],
                      ],
                    },
                    {
                      title: 'Diner Payments Log',
                      headers: ['Customer', 'Date', 'Time', 'Guests', 'Table', 'Status', 'Amount Paid'],
                      rows: recentTransactions.map((tx) => [
                        tx.customerName, tx.date, tx.time, tx.guests, tx.tableNumber, tx.status, fmt(tx.amount),
                      ]),
                    },
                    {
                      title: 'Table Earnings',
                      headers: ['Table Number', 'Capacity', 'Zone', 'Bookings', 'Total Earned'],
                      rows: tableLeaderboard.map((t) => [
                        t.tableNumber, `${t.capacity}-Seater`, t.zone, t.bookingCount || 0, fmt(t.earnedRevenue || 0),
                      ]),
                    },
                  ]
                );
                toast.success('Downloaded Token Fee Summary CSV!');
              }}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-xs font-semibold text-[#0b0b0c] transition-all duration-200 hover:brightness-110 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)', boxShadow: '0 0 18px rgba(212,175,55,0.25)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5v7M4.5 6.5L7 9l2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1.5 10.5v1a1 1 0 001 1h9a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Export Report
            </button>
          </>
        }
      />

      {/* ── 4 Key Numbers (Simple & Clear) ──────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard
          label="Total Money Collected"
          value={`₹${totalRevenue.toLocaleString()}`}
          sub={`From ${confirmedCount} confirmed bookings`}
          Icon={IconRevenue}
          accent
        />
        <StatCard
          label="Confirmed Bookings"
          value={confirmedCount}
          sub="Active table reservations"
          Icon={IconBookings}
        />
        <StatCard
          label="Total Guests Booked"
          value={totalGuests}
          sub="Total diners reserved"
          Icon={IconGuests}
        />
        <StatCard
          label="Token Rate Per Seat"
          value={`₹${tokenRate}`}
          sub="Deposit amount per guest"
          Icon={IconRate}
        />
      </div>

      {/* ── Card 1: Recent Diner Payments ────────────────────── */}
      <div className="mb-8">
        <SectionCard
          title="💳 Customer Payments Log"
          sub="List of customer payments collected for table reservations"
        >
          {recentTransactions.length === 0 ? (
            <div className="py-10 text-center text-luxury-muted text-xs">
              No customer payments recorded yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-wider text-luxury-muted">
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Date & Time</th>
                    <th className="pb-3 font-semibold">Party Size</th>
                    <th className="pb-3 font-semibold">Assigned Table</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Payment Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="py-3.5 font-medium text-white">
                        <div className="font-bold text-white text-sm">{tx.customerName}</div>
                        <div className="text-[11px] text-luxury-muted">{tx.customerEmail}</div>
                      </td>
                      <td className="py-3.5 text-white/80">
                        <div className="font-semibold text-white">{tx.date}</div>
                        <div className="text-[11px] text-luxury-gold">{tx.time}</div>
                      </td>
                      <td className="py-3.5 font-bold text-white text-sm">
                        {tx.guests} <span className="font-normal text-xs text-luxury-muted">Guests</span>
                      </td>
                      <td className="py-3.5 text-white/80">
                        <div className="font-semibold text-white">{tx.tableNumber}</div>
                        <div className="text-[10px] text-luxury-muted">{tx.tableZone}</div>
                      </td>
                      <td className="py-3.5">
                        <BookingStatusBadge status={tx.status} />
                      </td>
                      <td className="py-3.5 text-right font-bold text-emerald-400 text-sm">
                        ₹{(tx.amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Card 2: Dining Zone Earnings ────────────────────── */}
      <div className="mb-8">
        <SectionCard
          title="🏰 Money Collected by Dining Area"
          sub="Total revenue generated across your restaurant seating zones"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(zoneEarningsMap).map(([zName, info]) => (
              <div
                key={zName}
                className="group relative overflow-hidden rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(160deg, #181818 0%, #121212 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <ZoneChip zone={zName} />
                  <span className="font-sans text-xs font-bold text-luxury-gold">
                    {info.tableCount} Table{info.tableCount !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-1.5 mt-2">
                  <div className="flex items-center justify-between font-sans text-xs text-luxury-muted">
                    <span>Total Capacity:</span>
                    <span className="text-white font-semibold">{info.seats} Seats</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                    <span className="font-sans text-xs font-bold text-luxury-gold">Total Earned:</span>
                    <span className="font-display text-base font-bold text-emerald-400">
                      ₹{info.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Card 3: Individual Table Earnings ──────────────── */}
      <div className="mb-6">
        <SectionCard
          title="🏆 Money Earned by Each Table"
          sub="Table-by-table seating capacity, zone assignment, and total money earned"
        >
          {tableLeaderboard.length === 0 ? (
            <div className="py-8 text-center text-luxury-muted text-xs">
              No tables found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-wider text-luxury-muted">
                    <th className="pb-3 font-semibold">Table</th>
                    <th className="pb-3 font-semibold">Capacity</th>
                    <th className="pb-3 font-semibold">Dining Area</th>
                    <th className="pb-3 font-semibold text-center">Bookings Count</th>
                    <th className="pb-3 font-semibold text-right">Total Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {tableLeaderboard.map((t) => (
                    <tr key={t.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="py-3.5 font-display font-bold text-white text-sm">
                        {t.tableNumber}
                      </td>
                      <td className="py-3.5 text-white/80">{t.capacity}-Seater</td>
                      <td className="py-3.5"><ZoneChip zone={t.zone} /></td>
                      <td className="py-3.5 text-center font-bold text-white">{t.bookingCount || 0}</td>
                      <td className="py-3.5 text-right font-bold text-emerald-400 text-sm">
                        ₹{(t.earnedRevenue || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>

    </div>
  );
}
