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

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="mb-10">
        <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-[#d4af37] font-bold mb-1">
          Financial Intelligence
        </p>
        <h1 className="font-display text-white text-3xl">Token Fee & Revenue Analysis</h1>
        <p className="mt-1 text-sm text-[#aaa]">
          Detailed breakdown of table reservation token fees, seat revenue, and zone performance.
        </p>
        <div
          className="mt-4 h-px w-24"
          style={{ background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.15), transparent)' }}
        />
      </div>

      {/* Primary Analytics Cards */}
      <div className="grid gap-6 sm:grid-cols-3 mb-10">
        <div className="rounded-[20px] border border-[rgba(212,175,55,0.35)] bg-[linear-gradient(135deg,rgba(212,175,55,0.15)_0%,rgba(18,18,24,0.95)_100%)] p-6 shadow-xl">
          <p className="text-xs uppercase tracking-wider text-[#d4af37] font-bold">Total Token Revenue</p>
          <p className="text-3xl font-bold font-display text-white mt-2">
            ₹{(analytics.totalTokenRevenue || 0).toLocaleString()}
          </p>
          <p className="text-xs text-[#aaa] mt-2">From {analytics.totalConfirmedBookings || 0} confirmed reservations</p>
        </div>

        <div className="rounded-[20px] border border-white/10 bg-[#121218] p-6 shadow-lg">
          <p className="text-xs uppercase tracking-wider text-[#888]">Token Fee Rate</p>
          <p className="text-3xl font-bold font-display text-[#f5e27a] mt-2">
            ₹{analytics.tokenFeeRate || 150} <span className="text-xs text-[#888] font-normal">/ seat</span>
          </p>
          <p className="text-xs text-[#777] mt-2">Standard token fee rate per guest seat</p>
        </div>

        <div className="rounded-[20px] border border-white/10 bg-[#121218] p-6 shadow-lg">
          <p className="text-xs uppercase tracking-wider text-[#888]">Avg Fee / Reservation</p>
          <p className="text-3xl font-bold font-display text-[#4caf50] mt-2">
            ₹{analytics.avgTokenFeePerBooking || 0}
          </p>
          <p className="text-xs text-[#777] mt-2">Avg {analytics.avgGuestsPerBooking || 0} guests per table</p>
        </div>
      </div>

      {/* Secondary Performance Metrics */}
      <div className="grid gap-8 md:grid-cols-2 mb-10">
        {/* Reservation Status Breakdown */}
        <div className="rounded-[20px] border border-white/10 bg-[#121218] p-6">
          <h3 className="font-display text-xl text-white mb-6">Reservation Status Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white font-medium">Confirmed Reservations</span>
                <span className="text-[#4caf50] font-bold">{analytics.totalConfirmedBookings || 0}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-[#4caf50]"
                  style={{
                    width: `${
                      analytics.totalConfirmedBookings + analytics.totalCancelledBookings > 0
                        ? (analytics.totalConfirmedBookings /
                            (analytics.totalConfirmedBookings + analytics.totalCancelledBookings)) *
                          100
                        : 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white font-medium">Cancelled Reservations</span>
                <span className="text-[#e57373] font-bold">{analytics.totalCancelledBookings || 0}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-[#e57373]"
                  style={{
                    width: `${
                      analytics.totalConfirmedBookings + analytics.totalCancelledBookings > 0
                        ? (analytics.totalCancelledBookings /
                            (analytics.totalConfirmedBookings + analytics.totalCancelledBookings)) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seating Zones Distribution */}
        <div className="rounded-[20px] border border-white/10 bg-[#121218] p-6">
          <h3 className="font-display text-xl text-white mb-6">Dining Zones Inventory</h3>
          <div className="space-y-3">
            {Object.keys(zoneBreakdown).length === 0 ? (
              <p className="text-sm text-[#777]">No table zone data recorded.</p>
            ) : (
              Object.entries(zoneBreakdown).map(([zName, zCount]) => (
                <div key={zName} className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <span className="text-sm text-[#ddd]">{zName}</span>
                  <span className="text-xs font-bold text-[#d4af37] bg-[rgba(212,175,55,0.1)] px-3 py-1 rounded-full border border-[rgba(212,175,55,0.2)]">
                    {zCount} Table(s)
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Token Fee Rules Card */}
      <div className="rounded-[20px] border border-[rgba(212,175,55,0.25)] bg-[#121218] p-6">
        <h4 className="font-display text-lg text-[#f5e27a] mb-2">💡 Token Fee Policy & Guarantee</h4>
        <p className="text-sm text-[#aaa] leading-relaxed">
          Token fees are automatically calculated per seat upon table reservation confirmation to prevent no-shows. The fee collected guarantees table availability and is credited towards the diner's final bill at your restaurant.
        </p>
      </div>
    </div>
  );
}
