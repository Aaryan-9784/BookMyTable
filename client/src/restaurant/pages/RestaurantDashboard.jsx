import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { restaurantApi } from '../services/restaurantApi.js';
import Loader from '../../components/Loader.jsx';

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

function RestaurantStatsCard({ label, value, Icon }) {
  return (
    <div
      className="stats-card relative overflow-hidden rounded-2xl p-6 transition-all duration-300"
      style={{
        background: 'linear-gradient(150deg, #1c1c1c 0%, #161616 55%, #131313 100%)',
        border: '1px solid rgba(212,175,55,0.13)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.55)',
      }}
    >
      <div className="flex items-start justify-between">
        <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted">
          {label}
        </p>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
          style={{
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.20)',
          }}
        >
          <Icon />
        </div>
      </div>
      <p
        className="mt-4 font-display leading-none text-white font-bold"
        style={{ fontSize: '3rem' }}
      >
        {value}
      </p>
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, rgba(212,175,55,0.55) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}

function StatusBadge({ status }) {
  const v = String(status).toLowerCase();
  if (v === 'confirmed') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Confirmed
      </span>
    );
  }
  if (v === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20">
        Cancelled
      </span>
    );
  }
  return <span className="font-sans text-xs capitalize text-white/40">{status}</span>;
}

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
  const approvalStatus = restaurant.approvalStatus || 'approved';

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* ── Page Heading ─────────────────────────────────────── */}
      <div className="mb-8 anim-fade-up">
        <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-luxury-muted mb-2">
          Partner Console
        </p>
        <h1
          className="font-display leading-none text-luxury-white font-bold"
          style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)' }}
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

      {/* ── Approval Status Notice Banner ───────────────────── */}
      {approvalStatus === 'pending' && (
        <div className="mb-8 rounded-2xl p-5 border border-amber-500/40 bg-amber-500/10 text-amber-200 font-sans flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-amber-400">⏳ Submission Pending Admin Approval</h3>
            <p className="text-xs opacity-90 mt-1">
              Your restaurant details have been saved and submitted to the platform Admin. Once approved, your restaurant will be visible to public users for table bookings.
            </p>
          </div>
          <Link
            to="/restaurant-dashboard/tables"
            className="shrink-0 rounded-xl bg-amber-400 text-black px-4 py-2 text-xs font-semibold hover:bg-amber-300"
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
            className="inline-block mt-3 rounded-xl bg-red-500 text-white px-4 py-1.5 text-xs font-semibold hover:bg-red-400"
          >
            Update Details & Resubmit
          </Link>
        </div>
      )}

      {approvalStatus === 'approved' && (
        <div className="mb-8 rounded-2xl p-4 border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-sans flex items-center justify-between text-xs">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <strong>Operational Status:</strong> Approved & Live for Customer Table Reservations
          </span>
          <span className="text-luxury-muted">Base Token Fee: ₹{restaurant.tokenFee || 150}</span>
        </div>
      )}

      {/* ── 3 Stat Cards ─────────────────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-3 mb-10">
        <RestaurantStatsCard
          label="Total Tables"
          value={stats.totalTables ?? 0}
          Icon={TablesIcon}
        />
        <RestaurantStatsCard
          label="Seating Capacity"
          value={`${stats.totalCapacity ?? 0} Seats`}
          Icon={TablesIcon}
        />
        <RestaurantStatsCard
          label="Token Fees Earned"
          value={`₹${(stats.totalTokenFees ?? 0).toLocaleString()}`}
          Icon={RevenueIcon}
        />
      </div>

      {/* ── Quick Action Cards ───────────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-3 mb-12">
        <Link
          to="/restaurant-dashboard/tables"
          className="rounded-2xl p-6 bg-[#161616] border border-white/10 hover:border-luxury-gold/50 transition-all group"
        >
          <div className="text-2xl mb-2">🪑</div>
          <h3 className="font-display font-semibold text-white group-hover:text-luxury-gold">Add Restaurant & Tables</h3>
          <p className="font-sans text-xs text-luxury-muted mt-1">
            Manage restaurant profile, total tables, different capacities & table-wise token fees.
          </p>
        </Link>

        <Link
          to="/restaurant-dashboard/analytics"
          className="rounded-2xl p-6 bg-[#161616] border border-white/10 hover:border-luxury-gold/50 transition-all group"
        >
          <div className="text-2xl mb-2">📊</div>
          <h3 className="font-display font-semibold text-white group-hover:text-luxury-gold">Token Fee Analysis</h3>
          <p className="font-sans text-xs text-luxury-muted mt-1">
            View financial breakdown by seating capacity, zones, and average token earnings.
          </p>
        </Link>

        <Link
          to="/restaurant-dashboard/bookings"
          className="rounded-2xl p-6 bg-[#161616] border border-white/10 hover:border-luxury-gold/50 transition-all group"
        >
          <div className="text-2xl mb-2">📅</div>
          <h3 className="font-display font-semibold text-white group-hover:text-luxury-gold">Booking Management</h3>
          <p className="font-sans text-xs text-luxury-muted mt-1">
            Review customer reservations, guest counts, assigned tables & update statuses.
          </p>
        </Link>
      </div>

      {/* ── Recent Bookings Table ───────────────────────────── */}
      <div className="overflow-hidden rounded-2xl bg-[#141414] border border-white/10">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <h2 className="font-display text-lg text-white font-semibold">Recent Bookings</h2>
            <p className="font-sans text-xs text-luxury-muted">Latest table reservations for {restaurant.name}</p>
          </div>
          <Link
            to="/restaurant-dashboard/bookings"
            className="rounded-full bg-luxury-gold/10 border border-luxury-gold/30 px-4 py-1.5 font-sans text-xs font-semibold text-luxury-gold hover:bg-luxury-gold/20"
          >
            View All Bookings
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="p-12 text-center text-luxury-muted font-sans text-sm">
            No table bookings registered yet.
          </div>
        ) : (
          <div className="divide-y divide-white/5 font-sans text-xs">
            {recentBookings.map((b, i) => (
              <div key={b._id || i} className="flex items-center justify-between p-4 px-6 hover:bg-white/5">
                <div>
                  <p className="font-semibold text-white text-sm">{b.userId?.name || 'Customer'}</p>
                  <p className="text-luxury-muted">{b.userId?.email || b.userId?.phone || '—'}</p>
                </div>
                <div className="text-center">
                  <p className="text-white">{b.date} at {b.time}</p>
                  <p className="text-luxury-muted">{b.guests || 1} Guests</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
