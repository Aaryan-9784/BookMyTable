import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../services/adminApi.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Loader from '../../components/Loader.jsx';
import { downloadCSV, today } from '../utils/exportCSV.js';

/* ── ICONS ──────────────────────────────────────────────────── */
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
function IconEdit() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M9.5 1.5l2 2-8 8H1.5v-2l8-8z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1.5 3.5h10M5 3.5V2h3v1.5M2.5 3.5l.8 7.5h4.4l.8-7.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconRestaurant() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 1.5v5.5A2.5 2.5 0 006.5 9.5v7" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.5 1.5v3.5" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 1.5s2.5 2 2.5 4.5S12 9.5 12 9.5v7" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* ── STAT CARD (matches partner console) ────────────────────── */
function StatCard({ label, value, sub, Icon, accent = false }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300 group"
      style={{
        background: accent
          ? 'linear-gradient(150deg, #1e1b0f 0%, #181507 60%, #151300 100%)'
          : 'linear-gradient(150deg, #1c1c1c 0%, #161616 55%, #131313 100%)',
        border: accent ? '1px solid rgba(212,175,55,0.28)' : '1px solid rgba(212,175,55,0.13)',
        boxShadow: accent
          ? '0 4px 40px rgba(0,0,0,0.55), 0 0 24px rgba(212,175,55,0.08)'
          : '0 4px 40px rgba(0,0,0,0.55)',
      }}
    >
      {accent && (
        <div
          className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)' }}
        />
      )}
      <div className="flex items-start justify-between mb-4">
        <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted">{label}</p>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.20)' }}
        >
          <Icon />
        </div>
      </div>
      <p className="font-sans leading-none text-white font-extrabold tracking-tight" style={{ fontSize: '2.5rem' }}>{value}</p>
      {sub && <p className="mt-2 font-sans text-xs text-luxury-muted">{sub}</p>}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(90deg, rgba(212,175,55,0.55) 0%, transparent 100%)',
          opacity: accent ? 0.8 : 0.5,
        }}
      />
    </div>
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

/* ── ACTION BUTTON ──────────────────────────────────────────── */
function ActionBtn({ icon, label, color, hoverBg, hoverBorder, onClick, as: Tag = 'button', href }) {
  const [hov, setHov] = useState(false);
  const style = {
    color,
    background: hov ? hoverBg : hoverBg.replace('0.15', '0.07').replace('0.12', '0.05'),
    border: `1px solid ${hov ? hoverBorder : hoverBorder.replace('0.35', '0.18').replace('0.30', '0.15')}`,
    transition: 'all 0.18s ease',
  };

  if (Tag === 'a' || href) {
    return (
      <Link
        to={href}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-sans text-xs font-semibold"
        style={style}
      >
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-sans text-xs font-semibold"
      style={style}
    >
      {icon}
      {label}
    </button>
  );
}

/* ── MAIN PAGE ──────────────────────────────────────────────── */
export default function RestaurantsAdmin() {
  const [list, setList]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ]                 = useState('');

  const [deleteId, setDeleteId]   = useState(null);
  const [deleting, setDeleting]   = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data } = await adminApi.listRestaurants({ q: q.trim() || undefined });
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

  const exportRestaurants = () => {
    downloadCSV(
      `admin_restaurants_${today()}.csv`,
      [
        {
          title: 'Active Restaurants',
          headers: ['Name', 'Location', 'Category', 'Token Fee', 'Seating Capacity', 'Status', 'Owner'],
          rows: list.map((r) => [
            r.name,
            r.location || '—',
            r.category || 'Multi',
            r.tokenFee || 100,
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

  // Derived stats
  const totalCapacity = list.reduce((s, r) => s + (r.totalSeatingCapacity || 0), 0);
  const avgTokenFee   = list.length
    ? Math.round(list.reduce((s, r) => s + Math.min(r.tokenFee || 100, 100), 0) / list.length)
    : 0;

  return (
    <div className="max-w-[1100px] mx-auto">

      {/* ── Page Header ──────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between anim-fade-up">
        <div>
          <h1
            className="font-display text-white leading-none font-bold"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}
          >
            Restaurants
          </h1>
          <p className="mt-2 font-sans text-sm text-luxury-muted">
            Create, update, and manage all restaurant venues across the platform
          </p>
          <div
            className="mt-4 h-px w-20"
            style={{ background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.15), transparent)' }}
          />
        </div>

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
            Export Analytics
          </button>
        </div>
      </div>

      {/* ── 3-KPI Stat Cards ────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-3 mb-8">
        <StatCard
          label="Total Active Venues"
          value={list.length}
          sub="Admin managed restaurants"
          Icon={IconRestaurant}
          accent
        />
        <StatCard
          label="Total Seating Capacity"
          value={totalCapacity || 0}
          sub="Across all venues"
          Icon={() => (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M5 7V4a1 1 0 011-1h6a1 1 0 011 1v3" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
              <rect x="2" y="7" width="14" height="5" rx="1.5" stroke="#d4af37" strokeWidth="1.4" />
              <path d="M4 12v4M14 12v4" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          )}
        />
        <StatCard
          label="Avg Token Fee"
          value={avgTokenFee ? `₹${avgTokenFee}` : '₹0'}
          sub="Per guest across venues"
          Icon={() => (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="#d4af37" strokeWidth="1.4" />
              <path d="M9 5v8M6.5 7.5h5M6.5 10.5h5" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          )}
        />
      </div>

      {/* ── Controls Bar: Search & Primary Action ──────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 anim-fade-up">
        <div className="relative w-full sm:max-w-md">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, location, or cuisine…"
            className="w-full rounded-xl py-2.5 pl-11 pr-5 font-sans text-sm text-white placeholder:text-white/30 focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              transition: 'border-color 0.22s ease, box-shadow 0.22s ease',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.40)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.07)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>

        <Link
          to="/admin/restaurants/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-sans text-xs font-bold tracking-wide text-[#0b0b0c] transition-all hover:brightness-110 active:scale-95 shrink-0"
          style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #f0cc55 45%, #c9a227 100%)',
            boxShadow: '0 0 24px rgba(212,175,55,0.28)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Add Restaurant
        </Link>
      </div>

      {/* ── Table / Listing ─────────────────────────────────── */}
      {loading ? (
        <Loader label="Loading restaurants…" />
      ) : list.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl p-20 text-center anim-fade-up"
          style={{ background: '#141414', border: '1px solid rgba(212,175,55,0.10)' }}
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
          <p className="font-sans text-sm text-luxury-muted mt-1 max-w-xs">
            {q ? `No results for "${q}" — try a different search.` : 'Click "Add Restaurant" above to create a new venue.'}
          </p>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-2xl anim-fade-up"
          style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Table header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div>
              <h2 className="font-display text-lg font-semibold text-white">All Restaurants</h2>
              <p className="mt-0.5 font-sans text-xs text-luxury-muted">
                {list.length} venue{list.length !== 1 ? 's' : ''} {q ? `matching "${q}"` : 'registered'}
              </p>
            </div>
          </div>

          {/* Column headers */}
          <div
            className="hidden md:grid px-6 py-2.5 font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted"
            style={{
              gridTemplateColumns: '1.8fr 1fr 0.8fr 0.8fr 1fr 1fr',
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

          {/* Rows */}
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {list.map((r) => (
              <div
                key={r._id}
                className="flex flex-col gap-3 px-6 py-4 transition-colors duration-150 hover:bg-white/[0.025] md:grid md:items-center md:gap-4"
                style={{ gridTemplateColumns: '1.8fr 1fr 0.8fr 0.8fr 1fr 1fr' }}
              >
                {/* Restaurant info */}
                <div className="flex items-center gap-3 min-w-0">
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      className="h-11 w-11 shrink-0 rounded-xl object-cover border border-white/10"
                    />
                  ) : (
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.18)' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                        <path d="M4 1.5v5.5A2.5 2.5 0 006.5 9.5v7" stroke="#d4af37" strokeWidth="1.3" strokeLinecap="round" />
                        <path d="M6.5 1.5v3.5" stroke="#d4af37" strokeWidth="1.3" strokeLinecap="round" />
                        <path d="M12 1.5s2.5 2 2.5 4.5S12 9.5 12 9.5v7" stroke="#d4af37" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-sans font-semibold text-white text-sm truncate" title={r.name}>{r.name}</p>
                    <p className="font-sans text-[11px] text-luxury-muted truncate mt-0.5" title={r.location || '—'}>
                      📍 {r.location || '—'}
                    </p>
                  </div>
                </div>

                {/* Cuisine */}
                <div className="font-sans text-sm text-white/80 truncate" title={r.category || 'Multi Cuisine'}>
                  {r.category || 'Multi Cuisine'}
                </div>

                {/* Token Fee */}
                <div className="font-sans text-sm font-bold text-luxury-gold">
                  ₹{r.tokenFee || 100}
                </div>

                {/* Capacity */}
                <div className="font-sans text-sm font-semibold text-white">
                  {r.totalSeatingCapacity || 40}
                  <span className="text-luxury-muted font-normal ml-1 text-[11px]">Seats</span>
                </div>

                {/* Status */}
                <div><StatusBadge /></div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 flex-wrap">
                  <ActionBtn
                    href={`/admin/restaurants/${r._id}/edit`}
                    as="a"
                    icon={<IconEdit />}
                    label="Edit"
                    color="#d4af37"
                    hoverBg="rgba(212,175,55,0.15)"
                    hoverBorder="rgba(212,175,55,0.35)"
                  />
                  <ActionBtn
                    icon={<IconTrash />}
                    label="Delete"
                    color="#f87171"
                    hoverBg="rgba(239,68,68,0.15)"
                    hoverBorder="rgba(239,68,68,0.35)"
                    onClick={() => setDeleteId(r._id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete restaurant?"
        message="This will permanently delete the restaurant and all associated bookings and tables."
        confirmLabel="Delete Restaurant"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
