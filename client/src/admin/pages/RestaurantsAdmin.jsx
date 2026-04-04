import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../services/adminApi.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Loader from '../../components/Loader.jsx';

/* ── Search icon ─────────────────────────────────────────── */
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="#666" strokeWidth="1.4" />
      <path d="M10.5 10.5L14 14" stroke="#666" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* ── Edit icon ───────────────────────────────────────────── */
function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M9.5 1.5l2 2L4 11H2v-2L9.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Delete icon ─────────────────────────────────────────── */
function DeleteIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M2 3.5h9M5 3.5V2.5h3v1M5.5 6v4M7.5 6v4M3 3.5l.7 7h5.6l.7-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Empty state ─────────────────────────────────────────── */
function EmptyState({ hasQuery }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          background: 'rgba(212,175,55,0.07)',
          border: '1px solid rgba(212,175,55,0.15)',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="3" y="5" width="22" height="18" rx="3" stroke="rgba(212,175,55,0.5)" strokeWidth="1.5" />
          <path d="M8 10h12M8 14h8M8 18h5" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-display text-xl text-white mb-1">
        {hasQuery ? 'No results found' : 'No restaurants yet'}
      </p>
      <p className="font-sans text-sm text-luxury-muted mb-6">
        {hasQuery
          ? 'Try a different search term'
          : 'Add your first restaurant to get started'}
      </p>
      {!hasQuery && (
        <Link
          to="/admin/restaurants/new"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-sans text-sm font-semibold text-luxury-bg"
          style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #f0cc55 50%, #c9a227 100%)',
            boxShadow: '0 0 20px rgba(212,175,55,0.30)',
          }}
        >
          + Add your first restaurant
        </Link>
      )}
    </div>
  );
}

/* ── Category pill ───────────────────────────────────────── */
function Pill({ children }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-[11px] font-medium"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.09)',
        color: '#9a9a9a',
      }}
    >
      {children}
    </span>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export default function RestaurantsAdmin() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]             = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const { data } = await adminApi.listRestaurants({ q: q.trim() || undefined });
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [q]);

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

  if (loading && !list.length) return <Loader label="Loading restaurants…" />;

  return (
    <div className="max-w-[1100px] mx-auto">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between anim-fade-up">
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-luxury-muted mb-3">
            Admin / Restaurants
          </p>
          <h1
            className="font-display text-white leading-none"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', letterSpacing: '0.01em' }}
          >
            Restaurants
          </h1>
          <div
            className="mt-4 h-px w-16"
            style={{ background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.15), transparent)' }}
          />
        </div>

        {/* Add button */}
        <Link
          to="/admin/restaurants/new"
          className="add-restaurant-btn inline-flex items-center gap-2 self-start rounded-full px-5 py-2.5 font-sans text-sm font-semibold text-luxury-bg sm:self-auto"
          style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #f0cc55 45%, #c9a227 100%)',
            boxShadow: '0 0 24px rgba(212,175,55,0.28)',
            transition: 'transform 0.22s ease, box-shadow 0.22s ease, filter 0.22s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 32px rgba(212,175,55,0.45)';
            e.currentTarget.style.filter = 'brightness(1.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 0 24px rgba(212,175,55,0.28)';
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1.5v10M1.5 6.5h10" stroke="#0b0b0c" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Add Restaurant
        </Link>
      </div>

      {/* ── Search bar ───────────────────────────────────── */}
      <div className="mb-8 anim-fade-up delay-1">
        <div
          className="admin-search-wrap relative"
          style={{ maxWidth: '520px' }}
        >
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <SearchIcon />
          </span>
          <input
            type="search"
            autoComplete="off"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search restaurants, locations, cuisines…"
            className="admin-search-input w-full rounded-full py-3 pl-11 pr-5 font-sans text-sm text-white placeholder:text-luxury-muted focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              transition: 'border-color 0.22s ease, box-shadow 0.22s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212,175,55,0.45)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.08), 0 0 20px rgba(212,175,55,0.06)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* ── Table card ───────────────────────────────────── */}
      <div
        className="anim-fade-up delay-2 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1b1b1b 0%, #151515 100%)',
          border: '1px solid rgba(212,175,55,0.10)',
          boxShadow: '0 4px 48px rgba(0,0,0,0.55)',
        }}
      >
        {list.length === 0 ? (
          <EmptyState hasQuery={Boolean(q.trim())} />
        ) : (
          <table className="w-full min-w-[640px]">
            {/* Column headers */}
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
                {['Name', 'Location', 'Category', ''].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left font-sans text-[10px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: 'rgba(212,175,55,0.50)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {list.map((r, i) => (
                <RestaurantRow
                  key={r._id}
                  restaurant={r}
                  isLast={i === list.length - 1}
                  onDelete={() => setDeleteId(r._id)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Row count */}
      {list.length > 0 && (
        <p className="mt-4 font-sans text-[11px] text-luxury-muted anim-fade-up delay-3">
          {list.length} restaurant{list.length !== 1 ? 's' : ''} found
        </p>
      )}

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete restaurant?"
        message="This removes the restaurant and associated bookings."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

/* ── Restaurant row ──────────────────────────────────────── */
function RestaurantRow({ restaurant: r, isLast, onDelete }) {
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.035)',
        background: hovered ? 'rgba(212,175,55,0.035)' : 'transparent',
        transition: 'background 0.18s ease',
      }}
    >
      {/* Name + category subtext */}
      <td className="px-6 py-4">
        <p className="font-sans text-[14px] font-semibold text-white leading-snug">
          {r.name}
        </p>
        {r.category && (
          <p className="mt-0.5 font-sans text-[11px] text-luxury-muted">
            {r.category}
          </p>
        )}
      </td>

      {/* Location pill */}
      <td className="px-6 py-4">
        <Pill>{r.location}</Pill>
      </td>

      {/* Category pill */}
      <td className="px-6 py-4">
        <Pill>{r.category || '—'}</Pill>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div
          className="flex items-center justify-end gap-2"
          style={{
            opacity: hovered ? 1 : 0.45,
            transition: 'opacity 0.18s ease',
          }}
        >
          {/* Edit */}
          <Link
            to={`/admin/restaurants/${r._id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-[12px] font-medium"
            style={{
              background: 'rgba(212,175,55,0.08)',
              border: '1px solid rgba(212,175,55,0.20)',
              color: '#d4af37',
              transition: 'background 0.18s ease, box-shadow 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(212,175,55,0.16)';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(212,175,55,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(212,175,55,0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <EditIcon />
            Edit
          </Link>

          {/* Delete */}
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-[12px] font-medium"
            style={{
              background: 'rgba(220,38,38,0.07)',
              border: '1px solid rgba(220,38,38,0.18)',
              color: '#f87171',
              transition: 'background 0.18s ease, box-shadow 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(220,38,38,0.14)';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(220,38,38,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(220,38,38,0.07)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <DeleteIcon />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
