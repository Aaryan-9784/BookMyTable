import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../services/adminApi.js';
import ConfirmModal from './ConfirmModal.jsx';

/* ── SVG ICONS ──────────────────────────────────────────────── */
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
      className="inline-flex items-center rounded-full px-3 py-1 font-sans text-[11px] font-semibold tracking-wide whitespace-nowrap"
      style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}
    >
      Active
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

      {/* ── Active Restaurants Directory Table ──────────────── */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: '#141414',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              Active Restaurants Directory
            </h2>
            <p className="mt-0.5 font-sans text-xs text-luxury-muted">
              Overview of all active restaurant venues across the platform
            </p>
          </div>
          <Link
            to="/admin/restaurants"
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 font-sans text-[12px] font-semibold text-luxury-gold hover:bg-luxury-gold/20 transition-all duration-200"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}
          >
            View All Restaurants
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Column headers */}
        {!loading && restaurants.length > 0 && (
          <div
            className="grid px-6 py-2.5 font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted"
            style={{
              gridTemplateColumns: '1.8fr 1fr 0.8fr 0.8fr 1.2fr 1fr',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              background: 'rgba(0,0,0,0.2)',
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
              style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.14)' }}
            >
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M5 2v8A3.5 3.5 0 008.5 13.5v11" stroke="rgba(212,175,55,0.4)" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M8.5 2v5" stroke="rgba(212,175,55,0.35)" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M17 2s3.5 2.5 3.5 6.5S17 15 17 15v9.5" stroke="rgba(212,175,55,0.4)" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <p className="font-sans text-sm font-medium text-white/50">No restaurants registered yet</p>
            <p className="mt-1 font-sans text-xs text-white/25">Admin-added restaurants will appear here</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {restaurants.map((r) => (
              <div
                key={r._id}
                className="grid items-center px-6 py-4 transition-colors duration-150 hover:bg-white/[0.025]"
                style={{ gridTemplateColumns: '1.8fr 1fr 0.8fr 0.8fr 1.2fr 1fr' }}
              >
                {/* Restaurant info */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      className="h-10 w-10 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                  ) : (
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.18)' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M4 1.5v5.5A2.5 2.5 0 006.5 9.5v7" stroke="#d4af37" strokeWidth="1.3" strokeLinecap="round" />
                        <path d="M6.5 1.5v3.5" stroke="#d4af37" strokeWidth="1.3" strokeLinecap="round" />
                        <path d="M12 1.5s2.5 2 2.5 4.5S12 9.5 12 9.5v7" stroke="#d4af37" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-sans text-[13px] font-semibold text-white leading-snug truncate">{r.name}</p>
                    <p className="font-sans text-[11px] text-luxury-muted truncate mt-0.5">📍 {r.location || '—'}</p>
                  </div>
                </div>

                {/* Cuisine */}
                <span className="font-sans text-xs text-white/80 truncate">{r.category || 'Multi Cuisine'}</span>

                {/* Token Fee */}
                <span className="font-sans text-xs font-bold text-luxury-gold">₹{r.tokenFee || 150}</span>

                {/* Capacity */}
                <span className="font-sans text-xs text-white/80">{r.totalSeatingCapacity || 40} Seats</span>

                {/* Status */}
                <div><StatusBadge /></div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/admin/restaurants/${r._id}/edit`}
                    title="Edit Restaurant"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-luxury-gold transition-all duration-200 hover:bg-luxury-gold/10"
                    style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.22)' }}
                  >
                    <IconEdit />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteId(r._id)}
                    title="Delete Restaurant"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition-all duration-200 hover:bg-red-500/20"
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
