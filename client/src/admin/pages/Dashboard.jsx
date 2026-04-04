import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../services/adminApi.js';
import StatsCard from '../components/StatsCard.jsx';
import RecentBookings from '../components/RecentBookings.jsx';
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

  const recentBookings = stats?.recentBookings || [];

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
      <RecentBookings bookings={recentBookings} loading={false} />

    </div>
  );
}
