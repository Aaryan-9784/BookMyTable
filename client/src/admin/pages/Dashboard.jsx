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
    return () => {
      cancelled = true;
    };
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
    <div>
      <h1 className="font-display text-3xl text-white">Dashboard</h1>
      <p className="mt-1 font-sans text-luxury-muted">Overview of BookMyTable</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatsCard title="Users" value={stats?.totalUsers ?? '—'} />
        <StatsCard title="Bookings" value={stats?.totalBookings ?? '—'} />
        <StatsCard title="Restaurants" value={stats?.totalRestaurants ?? '—'} />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-white">Recent bookings</h2>
          <Link to="/admin/bookings" className="font-sans text-sm text-luxury-gold hover:underline">
            View all
          </Link>
        </div>
        <DataTable
          columns={[
            { key: 'when', label: 'When' },
            { key: 'user', label: 'User' },
            { key: 'restaurant', label: 'Restaurant' },
            { key: 'guests', label: 'Guests' },
            { key: 'status', label: 'Status' },
          ]}
          rows={recent}
          emptyMessage="No bookings yet"
        />
      </div>
    </div>
  );
}
