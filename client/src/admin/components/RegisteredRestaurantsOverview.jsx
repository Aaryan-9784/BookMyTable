import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../services/adminApi.js';
import ConfirmModal from './ConfirmModal.jsx';

/* ── SVG ICONS ──────────────────────────────────────────────── */
function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7l3.5 3.5 5.5-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCross() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 12h2.5L11.5 5 9 2.5 2 9.5V12z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 4L10 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 3.5h10M5.5 3.5V2.5h3v1M6 6v4M8 6v4M3 3.5l.8 7.5h6.4l.8-7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── STATUS BADGE ───────────────────────────────────────────── */
function StatusBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold tracking-wide whitespace-nowrap"
      style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#34d399' }} />
      Live &amp; Active
    </span>
  );
}

/* ── SKELETON ROW ───────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.035)' }}>
      <div className="skeleton-shimmer h-10 w-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton-shimmer h-3.5 w-36 rounded" />
        <div className="skeleton-shimmer h-2.5 w-24 rounded" />
      </div>
      <div className="skeleton-shimmer h-3 w-20 rounded hidden sm:block" />
      <div className="skeleton-shimmer h-3 w-16 rounded hidden md:block" />
      <div className="skeleton-shimmer h-6 w-24 rounded-full" />
    </div>
  );
}

/* ── MAIN COMPONENT ─────────────────────────────────────────── */
export default function RegisteredRestaurantsOverview() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [deleteId, setDeleteId]       = useState(null);
  const [deleting, setDeleting]       = useState(false);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.listRestaurants();
      setRestaurants(Array.isArray(data) ? data.slice(0, 6) : []);
    } catch (e) {
      toast.error(e.message || 'Failed to load restaurant directory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteRestaurant(deleteId);
      toast.success('Restaurant removed successfully');
      setDeleteId(null);
      fetchRestaurants();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="anim-fade-up delay-4">
      {/* ── Quick Admin Actions Grid ─────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Link
          to="/admin/restaurants"
          className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(145deg, rgba(212,175,55,0.12) 0%, rgba(24,22,18,0.95) 100%)',
            border: '1px solid rgba(212,175,55,0.30)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-gold font-semibold">
              Venue Directory
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-luxury-gold/15 text-luxury-gold text-sm font-bold">
              🏛️
            </div>
          </div>
          <p className="font-display text-white font-semibold text-lg group-hover:text-luxury-gold transition-colors">
            Manage All Venues
          </p>
          <p className="mt-1 font-sans text-xs text-luxury-muted">
            View, edit, and update active restaurant venues
          </p>
        </Link>

        <Link
          to="/admin/restaurants/new"
          className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(145deg, #1c1c1c 0%, #151515 100%)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted font-semibold">
              Admin Exclusive
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-white text-sm font-bold">
              ➕
            </div>
          </div>
          <p className="font-display text-white font-semibold text-lg group-hover:text-luxury-gold transition-colors">
            + Add Restaurant
          </p>
          <p className="mt-1 font-sans text-xs text-luxury-muted">
            Directly create a new restaurant venue
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(145deg, #1c1c1c 0%, #151515 100%)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted font-semibold">
              Access Control
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-white text-sm font-bold">
              👥
            </div>
          </div>
          <p className="font-display text-white font-semibold text-lg group-hover:text-luxury-gold transition-colors">
            Manage System Users
          </p>
          <p className="mt-1 font-sans text-xs text-luxury-muted">
            Update user roles &amp; permissions
          </p>
        </Link>
      </div>

      {/* ── Registered Restaurants Table Card ─────────────── */}
      <div
        className="overflow-hidden rounded-[20px]"
        style={{
          background: 'linear-gradient(160deg, rgba(28,26,22,0.95) 0%, rgba(18,17,14,0.98) 100%)',
          border: '1px solid rgba(212,175,55,0.10)',
          boxShadow: '0 8px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.06)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}
        >
          <div>
            <h2
              className="font-display text-white font-semibold"
              style={{ fontSize: '1.35rem', letterSpacing: '0.01em' }}
            >
              Active Restaurants Directory
            </h2>
            <p className="mt-0.5 font-sans text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Overview of all active restaurant venues across the platform
            </p>
          </div>

          <Link
            to="/admin/restaurants"
            className="flex items-center gap-1.5 rounded-full px-4 py-2 font-sans text-[12px] font-medium transition-all duration-200 hover:bg-luxury-gold/20"
            style={{
              background: 'rgba(212,175,55,0.08)',
              border: '1px solid rgba(212,175,55,0.25)',
              color: '#d4af37',
            }}
          >
            View All Restaurants
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Column Header */}
        {!loading && restaurants.length > 0 && (
          <div
            className="grid px-6 py-2.5 font-sans text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{
              gridTemplateColumns: '1.8fr 1fr 0.8fr 0.8fr 1.2fr 1fr',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              color: 'rgba(212,175,55,0.45)',
            }}
          >
            <span>Restaurant</span>
            <span>Cuisine</span>
            <span>Token Fee</span>
            <span>Capacity</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
        )}

        {/* Body */}
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
        ) : restaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.12)' }}
            >
              🍽️
            </div>
            <p className="font-sans text-sm font-medium text-white/50">No restaurants registered yet</p>
            <p className="mt-1 font-sans text-xs text-white/25">Admin added restaurants will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.035]">
            {restaurants.map((r) => (
              <div
                key={r._id}
                className="grid items-center px-6 py-4 transition-colors duration-150 hover:bg-white/[0.02]"
                style={{ gridTemplateColumns: '1.8fr 1fr 0.8fr 0.8fr 1.2fr 1fr' }}
              >
                {/* Restaurant Info */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      className="h-10 w-10 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                  ) : (
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 font-bold"
                      style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}
                    >
                      🍽️
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-sans text-[13px] font-semibold text-white leading-snug truncate">
                      {r.name}
                    </p>
                    <p className="font-sans text-[11px] text-luxury-muted truncate mt-0.5">
                      📍 {r.location || '—'}
                    </p>
                  </div>
                </div>

                {/* Cuisine */}
                <div className="font-sans text-xs text-white/80 truncate">
                  {r.category || 'Multi Cuisine'}
                </div>

                {/* Token Fee */}
                <div className="font-sans text-xs font-semibold text-luxury-gold">
                  ₹{r.tokenFee || 150}
                </div>

                {/* Seating Capacity */}
                <div className="font-sans text-xs text-white/80">
                  {r.totalSeatingCapacity || 40} Seats
                </div>

                {/* Status */}
                <div>
                  <StatusBadge />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/admin/restaurants/${r._id}/edit`}
                    title="Edit Restaurant"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-luxury-gold hover:bg-luxury-gold/10 transition-colors"
                    style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.22)' }}
                  >
                    <IconEdit />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteId(r._id)}
                    title="Delete Restaurant"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete restaurant?"
        message="This will permanently delete the restaurant and all associated details."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
