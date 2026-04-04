import { Link } from 'react-router-dom';

/* ── Helpers ──────────────────────────────────────────────── */
function formatDateTime(date, time) {
  // date: "YYYY-MM-DD", time: "HH:MM" or "HH:MM:SS"
  try {
    const [y, m, d] = (date || '').split('-');
    const [hRaw, min] = (time || '00:00').split(':');
    const h = parseInt(hRaw, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const hh = String(h12).padStart(2, '0');
    const mm = String(min).padStart(2, '0');
    return { date: `${d}-${m}-${y}`, time: `${hh}:${mm} ${ampm}` };
  } catch {
    return { date: date || '—', time: time || '—' };
  }
}

function getInitials(name, email) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return (email || '?')[0].toUpperCase();
}

/* ── Skeleton row ─────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.035)' }}>
      <div className="skeleton-shimmer h-9 w-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton-shimmer h-3 w-32 rounded" />
        <div className="skeleton-shimmer h-2.5 w-44 rounded" />
      </div>
      <div className="skeleton-shimmer h-3 w-24 rounded hidden sm:block" />
      <div className="skeleton-shimmer h-3 w-20 rounded hidden md:block" />
      <div className="skeleton-shimmer h-6 w-6 rounded-full hidden lg:block" />
      <div className="skeleton-shimmer h-6 w-20 rounded-full" />
    </div>
  );
}

/* ── Status badge ─────────────────────────────────────────── */
function StatusBadge({ status }) {
  const v = String(status).toLowerCase();
  if (v === 'confirmed') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold tracking-wide whitespace-nowrap"
        style={{
          background: 'rgba(52,211,153,0.08)',
          border: '1px solid rgba(52,211,153,0.25)',
          color: '#34d399',
          boxShadow: '0 0 12px rgba(52,211,153,0.10)',
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full shrink-0 status-pulse-green" style={{ background: '#34d399' }} />
        Confirmed
      </span>
    );
  }
  if (v === 'cancelled') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold tracking-wide whitespace-nowrap"
        style={{
          background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.22)',
          color: '#f87171',
          boxShadow: '0 0 10px rgba(220,38,38,0.06)',
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#f87171' }} />
        Cancelled
      </span>
    );
  }
  return <span className="font-sans text-xs capitalize" style={{ color: 'rgba(255,255,255,0.35)' }}>{status}</span>;
}

/* ── Guest badge ──────────────────────────────────────────── */
function GuestBadge({ count }) {
  return (
    <span
      className="inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 font-sans text-[11px] font-semibold"
      style={{
        background: 'rgba(212,175,55,0.07)',
        border: '1px solid rgba(212,175,55,0.15)',
        color: 'rgba(212,175,55,0.75)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm-5 6a5 5 0 0110 0H3z" fill="currentColor" />
      </svg>
      {count}
    </span>
  );
}

/* ── Booking row ──────────────────────────────────────────── */
function BookingRow({ booking, isLast }) {
  const name = booking.userId?.fullName || booking.userId?.name || '';
  const email = booking.userId?.email || '—';
  const initials = getInitials(name, email);
  const displayName = name || email;
  const { date, time } = formatDateTime(booking.date, booking.time);
  const restaurant = booking.restaurantId?.name || '—';

  return (
    <div
      className="booking-row group relative flex flex-wrap items-center gap-x-4 gap-y-3 px-6 py-4 transition-all duration-200"
      style={{ borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.035)' }}
    >
      {/* User card */}
      <div className="flex min-w-0 flex-1 items-center gap-3" style={{ minWidth: '180px' }}>
        {/* Avatar */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-sans text-[11px] font-bold"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.06) 100%)',
            border: '1px solid rgba(212,175,55,0.22)',
            color: '#d4af37',
            boxShadow: '0 0 10px rgba(212,175,55,0.08)',
          }}
        >
          {initials}
        </div>
        {/* Name + email */}
        <div className="min-w-0">
          <p className="truncate font-sans text-[13px] font-semibold leading-tight" style={{ color: '#e8e8e8' }}>
            {displayName}
          </p>
          {name && (
            <p className="truncate font-sans text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.32)' }}>
              {email}
            </p>
          )}
        </div>
      </div>

      {/* When */}
      <div className="hidden items-center gap-2 sm:flex" style={{ minWidth: '160px' }}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ color: 'rgba(212,175,55,0.45)', flexShrink: 0 }}>
          <rect x="1" y="2" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5 1v2M11 1v2M1 6h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <div>
          <p className="font-sans text-[12px] font-medium leading-tight" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {date}
          </p>
          <p className="font-sans text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.32)' }}>
            {time}
          </p>
        </div>
      </div>

      {/* Restaurant */}
      <div className="hidden md:block" style={{ minWidth: '130px' }}>
        <p className="truncate font-sans text-[13px] font-semibold" style={{ color: '#e8e8e8' }}>
          {restaurant}
        </p>
      </div>

      {/* Guests */}
      <div className="hidden lg:flex items-center justify-center" style={{ minWidth: '48px' }}>
        <GuestBadge count={booking.guests} />
      </div>

      {/* Status */}
      <div className="flex items-center justify-end" style={{ minWidth: '100px' }}>
        <StatusBadge status={booking.status} />
      </div>
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: 'rgba(212,175,55,0.06)',
          border: '1px solid rgba(212,175,55,0.12)',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: 'rgba(212,175,55,0.45)' }}>
          <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 2v3M16 2v3M3 9h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8 13h4M8 17h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-sans text-sm font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>No bookings yet</p>
      <p className="mt-1 font-sans text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>Reservations will appear here once made</p>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
export default function RecentBookings({ bookings = [], loading = false }) {
  return (
    <div className="anim-fade-up delay-4">
      {/* Card */}
      <div
        className="overflow-hidden rounded-[20px]"
        style={{
          background: 'linear-gradient(160deg, rgba(28,26,22,0.95) 0%, rgba(18,17,14,0.98) 100%)',
          border: '1px solid transparent',
          backgroundClip: 'padding-box',
          boxShadow: '0 8px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.10), inset 0 1px 0 rgba(212,175,55,0.06)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}
        >
          <div>
            <h2
              className="font-display text-white"
              style={{ fontSize: '1.35rem', letterSpacing: '0.01em' }}
            >
              Recent Bookings
            </h2>
            <p className="mt-0.5 font-sans text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Latest reservations across all restaurants
            </p>
          </div>

          <Link
            to="/admin/bookings"
            className="view-all-btn group flex items-center gap-1.5 rounded-full px-4 py-2 font-sans text-[12px] font-medium transition-all duration-200"
            style={{
              background: 'rgba(212,175,55,0.06)',
              border: '1px solid rgba(212,175,55,0.22)',
              color: '#d4af37',
            }}
          >
            View All
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Column labels */}
        {!loading && bookings.length > 0 && (
          <div
            className="hidden sm:flex items-center gap-x-4 px-6 py-2.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="flex-1 font-sans text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'rgba(212,175,55,0.45)', minWidth: '180px' }}>User</div>
            <div className="hidden sm:block font-sans text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'rgba(212,175,55,0.45)', minWidth: '160px' }}>When</div>
            <div className="hidden md:block font-sans text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'rgba(212,175,55,0.45)', minWidth: '130px' }}>Restaurant</div>
            <div className="hidden lg:block font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-center" style={{ color: 'rgba(212,175,55,0.45)', minWidth: '48px' }}>Guests</div>
            <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-right" style={{ color: 'rgba(212,175,55,0.45)', minWidth: '100px' }}>Status</div>
          </div>
        )}

        {/* Body */}
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : bookings.length === 0 ? (
          <EmptyState />
        ) : (
          bookings.map((b, i) => (
            <BookingRow key={b._id ?? i} booking={b} isLast={i === bookings.length - 1} />
          ))
        )}
      </div>
    </div>
  );
}
