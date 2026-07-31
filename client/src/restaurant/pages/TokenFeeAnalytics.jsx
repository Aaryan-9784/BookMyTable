import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { restaurantApi } from '../services/restaurantApi.js';
import Loader from '../../components/Loader.jsx';

export default function TokenFeeAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await restaurantApi.getAnalytics();
        if (!cancelled) setData(res.data.analytics || {});
      } catch (err) {
        toast.error(err.message || 'Failed to load token fee analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Loader label="Computing Token Fee Analysis…" />;

  const analytics = data || {};
  const zoneBreakdown = analytics.zoneBreakdown || {};
  const capacityBreakdown = analytics.capacityBreakdown || {};
  const tableLeaderboard = analytics.tableLeaderboard || [];

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="mb-10 anim-fade-up">
        <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-luxury-gold font-bold mb-2">
          Financial & Infrastructure Analytics
        </p>
        <h1 className="font-display text-white text-3xl font-bold">
          Token Fee & Capacity Analysis
        </h1>
        <p className="mt-2 text-sm text-luxury-muted">
          Comprehensive token fee financial breakdown by seating capacity, dining zones, and individual tables.
        </p>
        <div
          className="mt-4 h-px w-24"
          style={{ background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.15), transparent)' }}
        />
      </div>

      {/* ── Primary KPI Cards ────────────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-4 mb-10">
        <div className="rounded-2xl border border-luxury-gold/30 bg-gradient-to-br from-luxury-gold/15 to-[#121218] p-5 shadow-xl">
          <p className="text-[10px] uppercase tracking-wider text-luxury-gold font-bold">Total Token Revenue</p>
          <p className="text-3xl font-bold font-display text-white mt-2">
            ₹{(analytics.totalTokenRevenue || 0).toLocaleString()}
          </p>
          <p className="text-xs text-luxury-muted mt-1">From {analytics.totalConfirmedBookings || 0} confirmed bookings</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121218] p-5">
          <p className="text-[10px] uppercase tracking-wider text-luxury-muted font-semibold">Avg Fee / Reservation</p>
          <p className="text-3xl font-bold font-display text-emerald-400 mt-2">
            ₹{analytics.avgTokenFeePerBooking || 0}
          </p>
          <p className="text-xs text-luxury-muted mt-1">Avg {analytics.avgGuestsPerBooking || 0} guests per table</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121218] p-5">
          <p className="text-[10px] uppercase tracking-wider text-luxury-muted font-semibold">Total Guests Served</p>
          <p className="text-3xl font-bold font-display text-white mt-2">
            {analytics.totalGuestsServed || 0}
          </p>
          <p className="text-xs text-luxury-muted mt-1">Confirmed guest count</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121218] p-5">
          <p className="text-[10px] uppercase tracking-wider text-luxury-muted font-semibold">Standard Token Rate</p>
          <p className="text-3xl font-bold font-display text-luxury-gold mt-2">
            ₹{analytics.tokenFeeRate || 150}
          </p>
          <p className="text-xs text-luxury-muted mt-1">Base rate per guest</p>
        </div>
      </div>

      {/* ── Capacity-Wise Token Fee Analysis ─────────────────── */}
      <div className="mb-10 rounded-2xl border border-white/10 bg-[#141414] p-6">
        <h3 className="font-display text-xl text-white font-bold mb-4">
          Seating Capacity vs Token Fee Analysis
        </h3>
        <p className="font-sans text-xs text-luxury-muted mb-6">
          Breakdown of seating infrastructure by table capacity and average token fee structure.
        </p>

        {Object.keys(capacityBreakdown).length === 0 ? (
          <p className="text-xs text-luxury-muted">No seating capacity data recorded.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Object.entries(capacityBreakdown).map(([capName, item]) => (
              <div
                key={capName}
                className="rounded-xl border border-white/10 bg-black/40 p-4 hover:border-luxury-gold/30 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-base font-bold text-white">{capName}</span>
                  <span className="rounded-full bg-luxury-gold/10 px-2.5 py-0.5 text-[11px] text-luxury-gold font-bold border border-luxury-gold/20">
                    {item.count} Table(s)
                  </span>
                </div>
                <div className="space-y-1 text-xs text-luxury-muted">
                  <p className="flex justify-between">
                    <span>Total Seating:</span>
                    <strong className="text-white">{item.totalCapacity} Seats</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Avg Token Fee:</span>
                    <strong className="text-emerald-400">₹{item.avgTokenFee} / table</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Dining Zones & Status Distribution ─────────────── */}
      <div className="grid gap-8 md:grid-cols-2 mb-10">
        {/* Dining Zones */}
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-6">
          <h3 className="font-display text-lg text-white font-bold mb-4">Dining Zone Distribution</h3>
          <div className="space-y-3">
            {Object.keys(zoneBreakdown).length === 0 ? (
              <p className="text-xs text-luxury-muted">No dining zones recorded.</p>
            ) : (
              Object.entries(zoneBreakdown).map(([zName, zCount]) => (
                <div key={zName} className="flex justify-between items-center border-b border-white/5 pb-2.5 text-xs">
                  <span className="text-white font-medium">{zName}</span>
                  <span className="font-bold text-luxury-gold bg-luxury-gold/10 px-3 py-1 rounded-full border border-luxury-gold/20">
                    {zCount} Table(s)
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Token Policy Guarantee */}
        <div className="rounded-2xl border border-luxury-gold/30 bg-[#141414] p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-display text-lg text-luxury-gold font-bold mb-2">💡 Token Fee Policy & Financial Flow</h4>
            <p className="text-xs text-luxury-muted leading-relaxed mb-4">
              Token fees collected during table reservations act as an advance deposit for diners. This guarantees table allocation, prevents no-shows, and ensures smooth revenue flow for high-demand seating capacities.
            </p>
          </div>
          <div className="rounded-xl bg-black/50 p-3 text-xs text-white/80 border border-white/5">
            <strong>Table-Wise Custom Fees:</strong> You can assign custom token fee rates to VIP or larger capacity tables in the <em>Add Restaurant & Tables</em> page.
          </div>
        </div>
      </div>

      {/* ── Table Token Fee Inventory Leaderboard ────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#141414] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="font-display text-lg text-white font-bold">Individual Table Token Fee Inventory</h3>
          <p className="text-xs text-luxury-muted">Table-by-table capacity and assigned token fee rates</p>
        </div>

        {tableLeaderboard.length === 0 ? (
          <div className="p-8 text-center text-xs text-luxury-muted">No tables found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-black/40 text-luxury-gold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3">Table Number</th>
                  <th className="px-6 py-3">Capacity</th>
                  <th className="px-6 py-3">Zone</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Table Token Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tableLeaderboard.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5">
                    <td className="px-6 py-3.5 font-bold text-white">{t.tableNumber}</td>
                    <td className="px-6 py-3.5 text-white/80">{t.capacity}-Seater ({t.capacity} Guests)</td>
                    <td className="px-6 py-3.5 text-luxury-muted">{t.zone}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-luxury-gold/10 text-luxury-gold'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-bold text-emerald-400">₹{t.tokenFee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
