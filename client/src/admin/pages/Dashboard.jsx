import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../services/adminApi.js';
import RecentBookings from '../components/RecentBookings.jsx';
import Loader from '../../components/Loader.jsx';

function AdminStatCard({ title, value, subtitle, highlight = false }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300"
      style={{
        background: highlight
          ? 'linear-gradient(145deg, rgba(212,175,55,0.14) 0%, rgba(20,19,16,0.95) 100%)'
          : 'linear-gradient(150deg, #1c1c1c 0%, #161616 55%, #131313 100%)',
        border: highlight
          ? '1px solid rgba(212,175,55,0.35)'
          : '1px solid rgba(212,175,55,0.12)',
        boxShadow: highlight
          ? '0 4px 30px rgba(212,175,55,0.12)'
          : '0 4px 30px rgba(0,0,0,0.5)',
      }}
    >
      <p className="font-sans text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.45)' }}>
        {title}
      </p>
      <p className="mt-4 font-display text-4xl font-bold tracking-tight text-white">
        {value}
      </p>
      {subtitle && (
        <p className="mt-2 font-sans text-xs" style={{ color: '#d4af37' }}>
          {subtitle}
        </p>
      )}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: highlight
            ? 'linear-gradient(90deg, #f5e27a, #d4af37, transparent)'
            : 'linear-gradient(90deg, rgba(212,175,55,0.4), transparent)',
        }}
      />
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await adminApi.getStats();
        if (!cancelled) setStats(data);
      } catch (e) {
        toast.error(e.message || 'Failed to load admin stats');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Loader label="Loading admin dashboard…" />;

  const recentBookings = stats?.recentBookings || [];
  const pendingCount = stats?.pendingCount || 0;

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* ── Page heading ─────────────────────────────────── */}
      <div className="mb-10 anim-fade-up">
        <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-luxury-muted mb-2">
          System Control
        </p>
        <h1
          className="font-display leading-none text-luxury-white"
          style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', letterSpacing: '0.01em' }}
        >
          Dashboard
        </h1>
        <p className="mt-2.5 font-sans text-sm text-luxury-muted">
          Platform-wide metrics & pending restaurant approval requests
        </p>
        <div
          className="mt-4 h-px w-20"
          style={{ background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.15), transparent)' }}
        />
      </div>

      {/* ── Pending Approval Alert Banner ────────────────── */}
      {pendingCount > 0 && (
        <div
          className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl p-6 anim-fade-up"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(30,25,15,0.95) 100%)',
            border: '1px solid rgba(212,175,55,0.4)',
            boxShadow: '0 8px 32px rgba(212,175,55,0.12)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold"
              style={{ background: 'rgba(212,175,55,0.2)', color: '#f5e27a', border: '1px solid rgba(212,175,55,0.4)' }}
            >
              ⚠️
            </div>
            <div>
              <h3 className="font-display text-lg text-white font-semibold">
                {pendingCount} Restaurant{pendingCount > 1 ? 's' : ''} Awaiting Approval
              </h3>
              <p className="font-sans text-xs text-white/70 mt-0.5">
                Review and approve new restaurant partner submissions to publish them to customers.
              </p>
            </div>
          </div>

          <Link
            to="/admin/restaurants?status=pending"
            className="shrink-0 rounded-xl px-5 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider text-black transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #f5e27a 0%, #d4af37 100%)',
              boxShadow: '0 0 20px rgba(212,175,55,0.4)',
            }}
          >
            Review Applications
          </Link>
        </div>
      )}

      {/* ── Stats cards ──────────────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        <AdminStatCard
          title="Total Restaurants"
          value={stats?.totalRestaurants ?? '—'}
          subtitle={`${pendingCount} Pending Approval`}
          highlight={pendingCount > 0}
        />
        <AdminStatCard
          title="Approved Operational"
          value={stats?.approvedCount ?? '—'}
          subtitle="Live on site"
        />
        <AdminStatCard
          title="Total Bookings"
          value={stats?.totalBookings ?? '—'}
          subtitle="Confirmed reservations"
        />
        <AdminStatCard
          title="Token Fees Collected"
          value={`₹${(stats?.totalTokenFees ?? 0).toLocaleString()}`}
          subtitle="Total platform fees"
        />
      </div>

      {/* ── Recent bookings ───────────────────────────────── */}
      <RecentBookings bookings={recentBookings} loading={false} />
    </div>
  );
}
