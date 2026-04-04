import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../services/adminApi.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Loader from '../../components/Loader.jsx';
import { formatISODate } from '../../utils/formatDate.js';

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function getInitials(email = '') {
  return email.split('@')[0].slice(0, 2).toUpperCase();
}

function fmtTime(t = '') {
  // "17:30" → "5:30 PM"
  const [hStr, mStr] = t.split(':');
  const h = parseInt(hStr, 10);
  if (isNaN(h)) return t;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${suffix}`;
}

/* ─────────────────────────────────────────────────────────────
   SMALL ICONS
───────────────────────────────────────────────────────────── */
function CalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="rgba(212,175,55,0.45)" strokeWidth="1.1" />
      <path d="M1 5h10" stroke="rgba(212,175,55,0.45)" strokeWidth="1.1" />
      <path d="M4 1v2M8 1v2" stroke="rgba(212,175,55,0.45)" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2 3.5h10M5.5 3.5V2.5h3v1M6 6v4M8 6v4M3 3.5l.8 7.5h6.4l.8-7.5"
        stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <circle cx="6.5" cy="6.5" r="4" stroke="#555" strokeWidth="1.3" />
      <path d="M10 10L13 13" stroke="#555" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const v = String(status).toLowerCase();

  if (v === 'confirmed') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold tracking-wide"
        style={{
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.25)',
          color: '#34d399',
          boxShadow: '0 0 10px rgba(16,185,129,0.07)',
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full shrink-0 status-pulse-green"
          style={{ background: '#34d399' }}
        />
        Confirmed
      </span>
    );
  }

  if (v === 'cancelled') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold tracking-wide"
        style={{
          background: 'rgba(239,68,68,0.07)',
          border: '1px solid rgba(239,68,68,0.22)',
          color: '#f87171',
          boxShadow: '0 0 10px rgba(239,68,68,0.06)',
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#f87171' }} />
        Cancelled
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold"
      style={{
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.22)',
        color: '#fbbf24',
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#fbbf24' }} />
      {status}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   GUESTS BADGE
───────────────────────────────────────────────────────────── */
function GuestsBadge({ count }) {
  return (
    <span
      className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-lg px-2 font-sans text-[12px] font-semibold"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#c0c0c0',
      }}
    >
      {count}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   SHIMMER SKELETON
───────────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-6 py-4">
          <div
            className="h-4 rounded-full skeleton-shimmer"
            style={{ width: `${[55, 70, 50, 20, 40, 20][i - 1]}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <tr>
      <td colSpan={6}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: 'rgba(212,175,55,0.06)',
              border: '1px solid rgba(212,175,55,0.14)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="4" width="22" height="20" rx="3" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5" />
              <path d="M3 10h22" stroke="rgba(212,175,55,0.35)" strokeWidth="1.5" />
              <path d="M9 2v4M19 2v4" stroke="rgba(212,175,55,0.35)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="14" cy="18" r="3" stroke="rgba(212,175,55,0.3)" strokeWidth="1.3" />
            </svg>
          </div>
          <p className="font-display text-xl text-white mb-1">No bookings found</p>
          <p className="font-sans text-sm text-luxury-muted">Reservations will appear here once made</p>
        </div>
      </td>
    </tr>
  );
}

/* ─────────────────────────────────────────────────────────────
   BOOKING ROW
───────────────────────────────────────────────────────────── */
function BookingRow({ booking: b, isLast, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const initials = getInitials(b.user);
  const [date, time] = b.when.split(' · ');

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.032)',
        background: hovered ? 'rgba(212,175,55,0.028)' : 'transparent',
        transition: 'background 0.18s ease',
      }}
    >
      {/* WHEN */}
      <td className="px-6 py-4">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 shrink-0"><CalIcon /></span>
          <div>
            <p className="font-sans text-[13px] font-medium text-luxury-mutedlt leading-snug">
              {date}
            </p>
            <p className="font-sans text-[11px] text-luxury-muted mt-0.5">
              {fmtTime(time?.trim())}
            </p>
          </div>
        </div>
      </td>

      {/* USER */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-sans text-[10px] font-bold"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.08))',
              border: '1px solid rgba(212,175,55,0.22)',
              color: '#d4af37',
            }}
          >
            {initials}
          </div>
          <p className="font-sans text-[12px] text-luxury-muted truncate max-w-[160px]">
            {b.user}
          </p>
        </div>
      </td>

      {/* RESTAURANT */}
      <td className="px-6 py-4">
        <p className="font-sans text-[13px] font-semibold text-white leading-snug">
          {b.restaurant}
        </p>
      </td>

      {/* GUESTS */}
      <td className="px-6 py-4">
        <GuestsBadge count={b.guests} />
      </td>

      {/* STATUS */}
      <td className="px-6 py-4">
        <StatusBadge status={b.status} />
      </td>

      {/* DELETE */}
      <td className="px-6 py-4">
        <div
          style={{
            opacity: hovered ? 1 : 0.3,
            transition: 'opacity 0.18s ease',
          }}
        >
          <button
            type="button"
            onClick={onDelete}
            title="Delete booking"
            className="delete-row-btn flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.16)',
              color: '#f87171',
              transition: 'background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.16)';
              e.currentTarget.style.boxShadow = '0 0 14px rgba(239,68,68,0.18)';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.07)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGINATION
───────────────────────────────────────────────────────────── */
function Pagination({ page, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="mt-6 flex items-center justify-between font-sans anim-fade-up delay-3">
      <p className="text-[12px] text-luxury-muted">
        Page <span className="text-luxury-mutedlt">{page}</span> of{' '}
        <span className="text-luxury-mutedlt">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1.5">
        {/* Prev */}
        <button
          type="button"
          disabled={page <= 1}
          onClick={onPrev}
          className="flex h-8 w-8 items-center justify-center rounded-lg font-sans text-luxury-muted disabled:opacity-30"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            transition: 'background 0.18s ease, color 0.18s ease',
          }}
          onMouseEnter={(e) => { if (page > 1) { e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; e.currentTarget.style.color = '#d4af37'; } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = ''; }}
        >
          <ChevronLeft />
        </button>

        {/* Page numbers */}
        {visible.map((p, idx) => {
          const prev = visible[idx - 1];
          const showEllipsis = prev && p - prev > 1;
          return (
            <span key={p} className="flex items-center gap-1.5">
              {showEllipsis && (
                <span className="font-sans text-[12px] text-luxury-muted px-1">…</span>
              )}
              <button
                type="button"
                onClick={() => p !== page && (p < page ? onPrev() : onNext())}
                className="flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 font-sans text-[12px] font-medium"
                style={
                  p === page
                    ? {
                        background: 'rgba(212,175,55,0.15)',
                        border: '1px solid rgba(212,175,55,0.35)',
                        color: '#d4af37',
                        boxShadow: '0 0 12px rgba(212,175,55,0.12)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: '#7a7a7a',
                      }
                }
              >
                {p}
              </button>
            </span>
          );
        })}

        {/* Next */}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={onNext}
          className="flex h-8 w-8 items-center justify-center rounded-lg font-sans text-luxury-muted disabled:opacity-30"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            transition: 'background 0.18s ease, color 0.18s ease',
          }}
          onMouseEnter={(e) => { if (page < totalPages) { e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; e.currentTarget.style.color = '#d4af37'; } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = ''; }}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function BookingsAdmin() {
  const [data, setData]       = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch]   = useState('');

  const load = async () => {
    try {
      const { data: body } = await adminApi.listBookings({ page, limit: 20 });
      setData(body);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteBooking(deleteId);
      toast.success('Booking removed');
      setDeleteId(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !data.items.length) return <Loader label="Loading bookings…" />;

  /* Client-side filter (search + status) — data already paginated from server */
  const rows = (data.items || [])
    .map((b) => ({
      key: b._id,
      id: b._id,
      when: `${formatISODate(b.date)} · ${b.time}`,
      user: b.userId?.email || '—',
      restaurant: b.restaurantId?.name || '—',
      guests: b.guests,
      status: b.status,
    }))
    .filter((r) => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        r.user.toLowerCase().includes(q) ||
        r.restaurant.toLowerCase().includes(q) ||
        r.when.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });

  const confirmedCount  = (data.items || []).filter((b) => b.status === 'confirmed').length;
  const cancelledCount  = (data.items || []).filter((b) => b.status === 'cancelled').length;

  return (
    <div className="max-w-[1100px] mx-auto">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="mb-10 anim-fade-up">
        <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-luxury-muted mb-3">
          Admin / Bookings
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1
              className="font-display text-white leading-none"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', letterSpacing: '0.01em' }}
            >
              Bookings
            </h1>
            <p className="mt-2 font-sans text-sm text-luxury-muted">
              Manage and monitor all reservations
            </p>
            <div
              className="mt-4 h-px w-16"
              style={{ background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.15), transparent)' }}
            />
          </div>

          {/* Quick stats chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <StatChip label="Total" value={data.total || data.items?.length || 0} />
            <StatChip label="Confirmed" value={confirmedCount} color="green" />
            <StatChip label="Cancelled" value={cancelledCount} color="red" />
          </div>
        </div>
      </div>

      {/* ── Filter bar ───────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center anim-fade-up delay-1">
        {/* Search */}
        <div className="relative flex-1" style={{ maxWidth: '420px' }}>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            type="search"
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, restaurant, date…"
            className="w-full rounded-full py-2.5 pl-11 pr-5 font-sans text-sm text-white placeholder:text-luxury-muted focus:outline-none"
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

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5">
          {['all', 'confirmed', 'cancelled'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className="rounded-full px-3.5 py-1.5 font-sans text-[11px] font-medium capitalize"
              style={
                statusFilter === s
                  ? {
                      background: 'rgba(212,175,55,0.14)',
                      border: '1px solid rgba(212,175,55,0.32)',
                      color: '#d4af37',
                      boxShadow: '0 0 10px rgba(212,175,55,0.10)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: '#7a7a7a',
                      transition: 'background 0.18s ease, color 0.18s ease',
                    }
              }
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table card ───────────────────────────────────── */}
      <div
        className="anim-fade-up delay-2 overflow-x-auto rounded-2xl"
        style={{
          background: 'linear-gradient(160deg, #1b1b1b 0%, #151515 100%)',
          border: '1px solid rgba(212,175,55,0.09)',
          boxShadow: '0 4px 48px rgba(0,0,0,0.55)',
        }}
      >
        <table className="w-full min-w-[760px]">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.07)' }}>
              {['When', 'User', 'Restaurant', 'Guests', 'Status', ''].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-left font-sans text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: 'rgba(212,175,55,0.45)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : rows.length === 0 ? (
              <EmptyState />
            ) : (
              rows.map((b, i) => (
                <BookingRow
                  key={b.key}
                  booking={b}
                  isLast={i === rows.length - 1}
                  onDelete={() => setDeleteId(b.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ───────────────────────────────────── */}
      <Pagination
        page={page}
        totalPages={data.totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
      />

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete booking?"
        message="This permanently removes the reservation."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STAT CHIP (header area)
───────────────────────────────────────────────────────────── */
function StatChip({ label, value, color }) {
  const colors = {
    green: { bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.20)', text: '#34d399' },
    red:   { bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.20)',  text: '#f87171' },
  };
  const c = colors[color] ?? {
    bg: 'rgba(212,175,55,0.07)',
    border: 'rgba(212,175,55,0.20)',
    text: '#d4af37',
  };

  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3.5 py-2"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <span className="font-display text-xl font-semibold leading-none" style={{ color: c.text }}>
        {value}
      </span>
      <span className="font-sans text-[10px] uppercase tracking-[0.12em] text-luxury-muted">
        {label}
      </span>
    </div>
  );
}
