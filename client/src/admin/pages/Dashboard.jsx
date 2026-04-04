import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/adminApi.js';
import StatsCard from '../components/StatsCard.jsx';
import DataTable from '../components/DataTable.jsx';
import Loader from '../../components/Loader.jsx';

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
        toast.error(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Loader label="Loading dashboard…" />;

  const recent = (stats?.recentBookings || []).map((b) => ({
    key: b._id,
    when: `${b.date} ${b.time}`,
    user: b.userId?.email || '—',
    restaurant: b.restaurantId?.name || '—',
    guests: b.guests,
    status: b.status,
  }));

  return (
    <div className="max-w-[1100px] mx-auto">

      {/* ── Page heading ─────────────────────────────────── */}
      <div className="mb-12 anim-fade-up">
        <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-luxury-muted mb-3">
          Overview
        </p>
        <h1
          className="font-display leading-none text-luxury-white"
          style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', letterSpacing: '0.01em' }}
        >
          Dashboard
        </h1>
        <p className="mt-2.5 font-sans text-sm text-luxury-muted">
          BookMyTable — platform at a glance
        </p>
        {/* Gold rule */}
        <div
          className="mt-5 h-px w-20"
          style={{ background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.15), transparent)' }}
        />
      </div>

      {/* ── Stats cards ──────────────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-3 mb-14">
        <div className="anim-fade-up delay-1">
          <StatsCard title="Users"       value={stats?.totalUsers       ?? '—'} />
        </div>
        <div className="anim-fade-up delay-2">
          <StatsCard title="Bookings"    value={stats?.totalBookings    ?? '—'} />
        </div>
        <div className="anim-fade-up delay-3">
          <StatsCard title="Restaurants" value={stats?.totalRestaurants ?? '—'} />
        </div>
      </div>

      {/* ── Recent bookings ───────────────────────────────── */}
      <div className="anim-fade-up delay-4">

        {/* Section header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2
              className="font-display text-white"
              style={{ fontSize: '1.65rem', letterSpacing: '0.01em' }}
            >
              Recent Bookings
            </h2>
            <p className="mt-1 font-sans text-[12px] text-luxury-muted">
              Latest reservations across all restaurants
            </p>
          </div>

          <Link
            to="/admin/bookings"
            className="view-all-btn flex items-center gap-1.5 rounded-xl px-4 py-2 font-sans text-[12px] font-medium text-luxury-gold"
            style={{
              background: 'rgba(212,175,55,0.07)',
              border: '1px solid rgba(212,175,55,0.18)',
            }}
          >
            View all
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <DataTable
          columns={[
            { key: 'when',       label: 'When'       },
            { key: 'user',       label: 'User'       },
            { key: 'restaurant', label: 'Restaurant' },
            { key: 'guests',     label: 'Guests'     },
            { key: 'status',     label: 'Status'     },
          ]}
          rows={recent}
          emptyMessage="No bookings yet"
        />
      </div>

    </div>
  );
}
