import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../services/adminApi.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Loader from '../../components/Loader.jsx';
import { downloadCSV, today } from '../utils/exportCSV.js';

/* ─────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────── */
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="#888" strokeWidth="1.4" />
      <path d="M10.5 10.5L14 14" stroke="#888" strokeWidth="1.4" strokeLinecap="round" />
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

/* ─────────────────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function RestaurantsAdmin() {
  const [, setSearchParams] = useSearchParams();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data } = await adminApi.listRestaurants({
        q: q.trim() || undefined,
      });
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.message || 'Failed to fetch restaurants');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [q]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => load(), 250);
    return () => clearTimeout(t);
  }, [q]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteRestaurant(deleteId);
      toast.success('Restaurant removed successfully');
      setDeleteId(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingId) return;
    setActionLoading(true);
    try {
      await adminApi.rejectRestaurant(rejectingId, rejectReason.trim());
      toast.success('Restaurant rejected');
      setRejectingId(null);
      setRejectReason('');
      load();
    } catch (e) {
      toast.error(e.message || 'Failed to reject restaurant');
    } finally {
      setActionLoading(false);
    }
  };

  /* Export restaurants list as CSV */
  const exportRestaurants = () => {
    downloadCSV(
      `admin_restaurants_${today()}.csv`,
      [
        {
          title: `Active Restaurants`,
          headers: ['Name', 'Location', 'Category', 'Token Fee', 'Seating Capacity', 'Status', 'Owner/Manager'],
          rows: list.map((r) => [
            r.name,
            r.location || '—',
            r.category || 'Multi',
            r.tokenFee || 150,
            r.totalSeatingCapacity || 40,
            'Live & Active',
            r.ownerId?.name || r.ownerId?.email || 'Admin Managed',
          ]),
        },
      ],
      { 'Total Active Venues': list.length },
    );
    toast.success('Restaurants exported as CSV!');
  };

  return (
    <div className="max-w-[1100px] mx-auto">

      {/* ── Page Header ──────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between anim-fade-up">
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-luxury-muted mb-2">
            Admin / Venue Management
          </p>
          <h1
            className="font-display text-white leading-none font-bold"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}
          >
            Manage Restaurants
          </h1>
          <p className="mt-2 font-sans text-sm text-luxury-muted">
            Create, update, and manage all restaurant venues with full seating capacity and token fee settings
          </p>
          <div
            className="mt-4 h-px w-20"
            style={{ background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.15), transparent)' }}
          />
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={refreshing}
            onClick={() => { load(true); toast.success('List refreshed'); }}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-xs text-luxury-muted hover:text-luxury-gold transition-all duration-200 disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className={refreshing ? 'animate-spin' : ''}><IconRefresh /></span>
            Refresh
          </button>

          <button
            type="button"
            onClick={exportRestaurants}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-xs font-semibold text-[#0b0b0c] transition-all duration-200 hover:brightness-110 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)', boxShadow: '0 0 18px rgba(212,175,55,0.25)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5v7M4.5 6.5L7 9l2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1.5 10.5v1a1 1 0 001 1h9a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Export CSV
          </button>

          <Link
            to="/admin/restaurants/new"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-xs font-semibold text-luxury-bg shadow-lg transition-all hover:brightness-110 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #f0cc55 45%, #c9a227 100%)',
              boxShadow: '0 0 24px rgba(212,175,55,0.28)',
              color: '#0b0b0c',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            + Add Restaurant
          </Link>
        </div>
      </div>

      {/* ── Active Venues Count Badge ── */}
      <div className="mb-6 anim-fade-up">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-sans text-xs font-bold text-luxury-gold"
          style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          <span className="h-2 w-2 rounded-full bg-[#d4af37] animate-pulse" />
          <span>Active Restaurant Venues: {list.length}</span>
        </div>
      </div>

      {/* ── Search Bar ───────────────────────────────────── */}
      <div className="mb-8 anim-fade-up delay-1">
        <div className="relative max-w-md">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by restaurant name, location, cuisine…"
            className="w-full rounded-full py-2.5 pl-11 pr-5 font-sans text-sm text-white placeholder:text-white/30 focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              transition: 'border-color 0.22s ease, box-shadow 0.22s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212,175,55,0.40)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.07)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* ── Restaurant Cards / Listing ───────────────────── */}
      {loading ? (
        <Loader label="Loading active restaurants..." />
      ) : list.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl p-16 text-center anim-fade-up delay-2"
          style={{ background: '#141414', border: '1px solid rgba(212,175,55,0.1)' }}
        >
          <div
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.14)' }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 2.5v8.5A4 4 0 0010 15v11" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M10 2.5v5.5" stroke="rgba(212,175,55,0.35)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M19 2.5s4 3.2 4 7.5-4 7.5-4 7.5v8.5" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="font-display text-xl text-white mb-1">No restaurants found</p>
          <p className="font-sans text-sm text-luxury-muted mt-1">
            Click &quot;+ Add Restaurant&quot; above to create a new venue with full table booking capabilities.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 anim-fade-up delay-2">
          {list.map((r) => (
            <div
              key={r._id}
              className="relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl"
              style={{
                background: 'linear-gradient(160deg, #1a1a1a 0%, #121212 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {r.imageUrl ? (
                      <img
                        src={r.imageUrl}
                        alt={r.name}
                        className="h-12 w-12 rounded-xl object-cover border border-white/10"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                        style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.18)' }}>
                        🍽️
                      </div>
                    )}
                    <div>
                      <h3 className="font-display text-lg font-bold text-white">{r.name}</h3>
                      <p className="font-sans text-xs text-luxury-muted">📍 {r.location}</p>
                    </div>
                  </div>
                  <StatusBadge />
                </div>

                <p className="font-sans text-xs text-white/70 line-clamp-2 mb-4">
                  {r.description || 'No description provided.'}
                </p>

                <div className="grid grid-cols-3 gap-2 rounded-xl p-3 mb-4 text-center text-xs font-sans"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <span className="block text-luxury-muted text-[10px] uppercase mb-0.5">Cuisine</span>
                    <span className="font-semibold text-white truncate block">{r.category || 'Multi'}</span>
                  </div>
                  <div>
                    <span className="block text-luxury-muted text-[10px] uppercase mb-0.5">Token Fee</span>
                    <span className="font-semibold text-luxury-gold">₹{r.tokenFee || 150}</span>
                  </div>
                  <div>
                    <span className="block text-luxury-muted text-[10px] uppercase mb-0.5">Capacity</span>
                    <span className="font-semibold text-white">{r.totalSeatingCapacity || 40} Seats</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-4 mt-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/restaurants/${r._id}/edit`}
                    className="rounded-xl px-4 py-2 font-sans text-xs font-semibold text-luxury-gold transition-all hover:bg-luxury-gold/10"
                    style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.22)' }}
                  >
                    Edit Venue
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteId(r._id)}
                    className="rounded-xl px-3 py-2 font-sans text-xs font-medium text-red-400 transition-all hover:bg-red-500/20"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}
                  >
                    Delete
                  </button>
                </div>

                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold"
                  style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.20)', color: '#4ade80' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live &amp; Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Reject Reason Modal ──────────────────────────── */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ background: 'linear-gradient(160deg, #1e1e1e 0%, #161616 100%)', border: '1px solid rgba(212,175,55,0.25)' }}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.22)' }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 8v4M11 15h.01" stroke="#f87171" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M9.26 3.5L2 18h18L12.74 3.5a2 2 0 00-3.48 0z" stroke="#f87171" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-display text-xl text-white font-bold mb-1">Reject Restaurant</h3>
            <p className="font-sans text-xs text-luxury-muted mb-5">
              Provide feedback explaining why this application was rejected. This will be shown to the restaurant partner.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Please provide high-resolution images and verified opening hours…"
              className="w-full rounded-xl p-3 text-sm text-white mb-5 focus:outline-none resize-none"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.10)', transition: 'border-color 0.22s ease' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectingId(null)}
                className="rounded-xl px-4 py-2.5 text-xs font-sans font-medium text-luxury-muted hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleRejectConfirm}
                className="rounded-xl px-5 py-2.5 text-xs font-sans font-semibold text-white hover:brightness-110 disabled:opacity-50 transition-all"
                style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.85), rgba(185,28,28,0.90))', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete restaurant?"
        message="This will permanently delete the restaurant and all associated bookings."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
