import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../services/adminApi.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Loader from '../../components/Loader.jsx';

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="#888" strokeWidth="1.4" />
      <path d="M10.5 10.5L14 14" stroke="#888" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function StatusBadge({ status }) {
  const v = String(status || 'approved').toLowerCase();
  if (v === 'approved') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold tracking-wide whitespace-nowrap"
        style={{
          background: 'rgba(52,211,153,0.1)',
          border: '1px solid rgba(52,211,153,0.3)',
          color: '#34d399',
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#34d399' }} />
        Approved & Live
      </span>
    );
  }
  if (v === 'pending') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold tracking-wide whitespace-nowrap animate-pulse"
        style={{
          background: 'rgba(212,175,55,0.15)',
          border: '1px solid rgba(212,175,55,0.4)',
          color: '#f5e27a',
          boxShadow: '0 0 12px rgba(212,175,55,0.2)',
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#f5e27a' }} />
        Pending Approval
      </span>
    );
  }
  if (v === 'rejected') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold tracking-wide whitespace-nowrap"
        style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          color: '#f87171',
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#f87171' }} />
        Rejected
      </span>
    );
  }
  return <span className="font-sans text-xs capitalize text-white/50">{status}</span>;
}

export default function RestaurantsAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('status') || 'pending';

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const { data } = await adminApi.listRestaurants({
        q: q.trim() || undefined,
        status: activeTab,
      });
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.message || 'Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [q, activeTab]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await adminApi.approveRestaurant(id);
      toast.success('Restaurant approved & published!');
      load();
    } catch (e) {
      toast.error(e.message || 'Failed to approve restaurant');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingId) return;
    setActionLoading(true);
    try {
      await adminApi.rejectRestaurant(rejectingId, rejectReason);
      toast.success('Restaurant rejected with feedback');
      setRejectingId(null);
      setRejectReason('');
      load();
    } catch (e) {
      toast.error(e.message || 'Failed to reject restaurant');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteRestaurant(deleteId);
      toast.success('Restaurant removed');
      setDeleteId(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const pendingCount = list.filter((r) => r.approvalStatus === 'pending').length;

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* ── Page Header ──────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between anim-fade-up">
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-luxury-muted mb-2">
            Admin / Approval Center
          </p>
          <h1
            className="font-display text-white leading-none font-bold"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)' }}
          >
            Approve Restaurants
          </h1>
          <p className="mt-2 font-sans text-sm text-luxury-muted">
            Review, approve, or reject restaurant partner submissions
          </p>
          <div
            className="mt-4 h-px w-16"
            style={{ background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.15), transparent)' }}
          />
        </div>

        <Link
          to="/admin/restaurants/new"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-sans text-xs font-semibold text-luxury-bg shadow-lg transition-transform hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #f0cc55 45%, #c9a227 100%)',
            boxShadow: '0 0 24px rgba(212,175,55,0.28)',
          }}
        >
          + Add Restaurant Directly
        </Link>
      </div>

      {/* ── Filter Tabs ──────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {[
          { key: 'pending', label: 'Pending Approval', badge: activeTab === 'pending' ? pendingCount : null },
          { key: 'approved', label: 'Approved & Live' },
          { key: 'rejected', label: 'Rejected' },
          { key: 'all', label: 'All Submissions' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSearchParams({ status: tab.key })}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-sans text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/40 shadow-sm'
                : 'text-luxury-muted hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {tab.label}
            {tab.badge != null && tab.badge > 0 && (
              <span className="rounded-full bg-luxury-gold px-2 py-0.5 text-[10px] text-black font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Search Bar ───────────────────────────────────── */}
      <div className="mb-8 anim-fade-up">
        <div className="relative max-w-md">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by restaurant name, location, cuisine..."
            className="w-full rounded-full py-2.5 pl-11 pr-5 font-sans text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-luxury-gold/50"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          />
        </div>
      </div>

      {/* ── Restaurant Cards / Listing ───────────────────── */}
      {loading ? (
        <Loader label="Loading approval applications..." />
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl p-16 text-center" style={{ background: '#141414', border: '1px solid rgba(212,175,55,0.1)' }}>
          <p className="font-display text-xl text-white">No {activeTab} restaurants found</p>
          <p className="font-sans text-sm text-luxury-muted mt-1">
            {activeTab === 'pending'
              ? 'All submitted restaurant applications have been processed!'
              : 'Try selecting a different status filter or search query.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {list.map((r) => (
            <div
              key={r._id}
              className="relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 transition-all"
              style={{
                background: 'linear-gradient(160deg, #1a1a1a 0%, #121212 100%)',
                border: r.approvalStatus === 'pending'
                  ? '1px solid rgba(212,175,55,0.35)'
                  : '1px solid rgba(255,255,255,0.08)',
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
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-luxury-gold/10 border border-luxury-gold/20 text-luxury-gold font-bold">
                        🍽️
                      </div>
                    )}
                    <div>
                      <h3 className="font-display text-lg font-bold text-white">{r.name}</h3>
                      <p className="font-sans text-xs text-luxury-muted">📍 {r.location}</p>
                    </div>
                  </div>
                  <StatusBadge status={r.approvalStatus} />
                </div>

                <p className="font-sans text-xs text-white/70 line-clamp-2 mb-4">
                  {r.description || 'No description provided.'}
                </p>

                <div className="grid grid-cols-3 gap-2 rounded-xl bg-white/5 p-3 mb-4 text-center text-xs font-sans">
                  <div>
                    <span className="block text-luxury-muted text-[10px] uppercase">Cuisine</span>
                    <span className="font-semibold text-white truncate block">{r.category || 'Multi'}</span>
                  </div>
                  <div>
                    <span className="block text-luxury-muted text-[10px] uppercase">Token Fee</span>
                    <span className="font-semibold text-luxury-gold">₹{r.tokenFee || 150}</span>
                  </div>
                  <div>
                    <span className="block text-luxury-muted text-[10px] uppercase">Capacity</span>
                    <span className="font-semibold text-white">{r.totalSeatingCapacity || 40} Seats</span>
                  </div>
                </div>

                {r.ownerId && (
                  <div className="mb-4 rounded-lg bg-black/40 p-2.5 font-sans text-xs border border-white/5">
                    <p className="text-luxury-gold font-semibold">Submitted by Partner:</p>
                    <p className="text-white/80">{r.ownerId.name || r.ownerId.email}</p>
                    {r.ownerId.phone && <p className="text-luxury-muted">{r.ownerId.phone}</p>}
                  </div>
                )}

                {r.rejectionReason && (
                  <div className="mb-4 rounded-lg bg-red-500/10 p-2.5 font-sans text-xs text-red-300 border border-red-500/20">
                    <strong>Rejection Feedback:</strong> {r.rejectionReason}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-4 border-t border-white/10 mt-2">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/restaurants/${r._id}/edit`}
                    className="rounded-lg bg-white/5 px-3 py-1.5 font-sans text-xs text-white/80 hover:bg-white/10"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteId(r._id)}
                    className="rounded-lg bg-red-500/10 px-3 py-1.5 font-sans text-xs text-red-400 hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>

                {r.approvalStatus === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => setRejectingId(r._id)}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 font-sans text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleApprove(r._id)}
                      className="rounded-xl bg-emerald-500 text-black font-semibold px-4 py-1.5 font-sans text-xs hover:bg-emerald-400 shadow-md transition-all"
                    >
                      Approve & Publish
                    </button>
                  </div>
                )}
                {r.approvalStatus === 'rejected' && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleApprove(r._id)}
                    className="rounded-xl bg-luxury-gold/20 border border-luxury-gold/40 text-luxury-gold px-3.5 py-1.5 font-sans text-xs font-semibold hover:bg-luxury-gold/30"
                  >
                    Re-Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Reject Reason Modal ──────────────────────────── */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#181818] p-6 border border-luxury-gold/30 shadow-2xl">
            <h3 className="font-display text-xl text-white font-bold mb-2">Reject Restaurant Submission</h3>
            <p className="font-sans text-xs text-luxury-muted mb-4">
              Provide feedback to the restaurant owner explaining why this application was rejected.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Please provide high resolution images and verified opening hours."
              className="w-full rounded-xl bg-black/50 p-3 text-sm text-white border border-white/10 focus:border-luxury-gold outline-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectingId(null)}
                className="rounded-xl px-4 py-2 text-xs font-sans text-luxury-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleRejectConfirm}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-sans font-semibold text-white hover:bg-red-500"
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
        message="This will permanently delete the restaurant and associated bookings."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
