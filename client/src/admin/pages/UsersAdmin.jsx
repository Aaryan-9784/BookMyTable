import { useEffect, useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { adminApi } from '../services/adminApi.js';
import Loader from '../../components/Loader.jsx';
import { downloadCSV, today } from '../utils/exportCSV.js';

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function getInitials(fullName, email) {
  if (fullName && fullName.trim()) {
    const parts = fullName.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return (email || '?').slice(0, 2).toUpperCase();
}

function getAvatarColor(seed = '') {
  const hues = [210, 160, 280, 30, 340, 190, 60];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return hues[Math.abs(hash) % hues.length];
}

/* ─────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────── */
function IconTotalUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="7" cy="6" r="3.5" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M1 16c0-3.5 2.7-6 6-6s6 2.5 6 6" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13.5 9c1.5 0 3 1.2 3 3.5v3.5" stroke="#d4af37" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="13.5" cy="6" r="2" stroke="#d4af37" strokeWidth="1.3" />
    </svg>
  );
}
function IconAdmins() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="7" r="3.5" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M2 16.5c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.5 4.5l1.5-2 1.5 2L11 3l-1 2.5h-4L5 3l1.5 1.5z" stroke="#d4af37" strokeWidth="1" strokeLinejoin="round" fill="rgba(212,175,55,0.15)" />
    </svg>
  );
}
function IconRestaurantPartners() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 1.5v5.5A2.5 2.5 0 006.5 9.5v7" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.5 1.5v3.5" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 1.5s2.5 2 2.5 4.5S12 9.5 12 9.5v7" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconRegularUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="6.5" r="3.5" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M2 16.5c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
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
function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <rect x="4" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M3 8H2a1 1 0 01-1-1V2a1 1 0 011-1h5a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
function CrownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 11 11" fill="none" aria-hidden>
      <path
        d="M1 8.5l1.5-5 2.5 3L5.5 2l.5 4.5 2.5-3L10 8.5H1z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.25"
      />
    </svg>
  );
}
function ChevronDown() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
      <path d="M2 4l3.5 3.5L9 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
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
function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M6 7v3M8 7v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M3 4l.7 7.3A1 1 0 004.7 12h4.6a1 1 0 001-.7L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
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
   KPI STAT CARD (matches Partner Console)
───────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────
   DELETE USER MODAL
───────────────────────────────────────────────────────────── */
function DeleteUserModal({ user, onConfirm, onCancel, loading }) {
  const initials = getInitials(user.fullName, user.email);
  const hue = getAvatarColor(user.email);
  const isAdmin = user.role === 'admin';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="w-full max-w-md"
        style={{
          background: 'linear-gradient(160deg, rgba(24,22,18,0.98) 0%, rgba(16,15,12,0.99) 100%)',
          border: '1px solid rgba(212,175,55,0.14)',
          borderRadius: '20px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,175,55,0.06), inset 0 1px 0 rgba(212,175,55,0.06)',
          animation: 'deleteModalIn 0.22s cubic-bezier(0.22,1,0.36,1) forwards',
        }}
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.22)' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 8v4M11 15h.01" stroke="#f87171" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M9.26 3.5L2 18h18L12.74 3.5a2 2 0 00-3.48 0z" stroke="#f87171" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-display text-xl text-white mb-1">Delete User Account</h2>
          <p className="font-sans text-[13px]" style={{ color: 'rgba(255,255,255,0.42)' }}>
            This action is permanent and cannot be undone.
          </p>
        </div>

        {/* User preview */}
        <div className="px-7 py-5">
          <div className="flex items-center gap-3.5 rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-sans text-[13px] font-bold"
              style={{
                background: isAdmin
                  ? 'linear-gradient(135deg, rgba(212,175,55,0.28), rgba(212,175,55,0.08))'
                  : `hsla(${hue}, 55%, 35%, 0.25)`,
                border: isAdmin ? '1.5px solid rgba(212,175,55,0.45)' : `1px solid hsla(${hue}, 55%, 55%, 0.22)`,
                color: isAdmin ? '#d4af37' : `hsl(${hue}, 65%, 72%)`,
              }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-sans text-[14px] font-semibold truncate" style={{ color: '#e8e8e8' }}>
                {user.fullName || user.email}
              </p>
              {user.fullName && (
                <p className="font-sans text-[12px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {user.email}
                </p>
              )}
              {isAdmin && (
                <p className="font-sans text-[10px] mt-0.5 tracking-wide" style={{ color: '#d4af37' }}>
                  Administrator
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-xl px-4 py-3"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.16)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0">
              <circle cx="7" cy="7" r="6" stroke="#f87171" strokeWidth="1.2" />
              <path d="M7 4.5v3M7 9.5h.01" stroke="#f87171" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <p className="font-sans text-[12px] leading-relaxed" style={{ color: '#f87171' }}>
              All bookings associated with this account will also be permanently deleted.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-7 pb-7">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl py-3 font-sans text-[13px] font-medium transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#9a9a9a' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e8e8e8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#9a9a9a'; }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-sans text-[13px] font-semibold transition-all duration-200 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.85), rgba(185,28,28,0.90))', border: '1px solid rgba(239,68,68,0.35)', color: '#fff', boxShadow: '0 4px 20px rgba(220,38,38,0.25)' }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.boxShadow = '0 6px 28px rgba(220,38,38,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(220,38,38,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Deleting…
              </>
            ) : (
              <>
                <TrashIcon />
                Delete Account
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROLE SELECT
───────────────────────────────────────────────────────────── */
function RoleSelect({ userId, role, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const normalizedRole = role === 'user' ? 'customer' : role;
  const isAdmin = normalizedRole === 'admin';

  const pillStyle = isAdmin
    ? { background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.32)', color: '#d4af37', boxShadow: '0 0 10px rgba(212,175,55,0.10)' }
    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: '#9a9a9a' };

  const roleOptions = [
    { value: 'customer', label: 'customer', icon: '👤' },
    { value: 'restaurant', label: 'restaurant', icon: '🍴' },
    { value: 'admin', label: 'admin', icon: <CrownIcon /> },
  ];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-[11px] font-semibold"
        style={{ ...pillStyle, transition: 'all 0.18s ease', opacity: disabled ? 0.5 : 1, cursor: disabled ? 'wait' : 'pointer' }}
      >
        {normalizedRole === 'admin' ? (
          <CrownIcon />
        ) : normalizedRole === 'restaurant' ? (
          <span className="text-[10px]">🍴</span>
        ) : (
          <span className="text-[10px]">👤</span>
        )}
        {normalizedRole}
        <ChevronDown />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1.5 w-32 overflow-hidden rounded-xl py-1 shadow-2xl"
          style={{ background: 'rgba(22,22,22,0.98)', border: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 12px 40px rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', animation: 'fadeUp 0.15s ease forwards' }}
        >
          {roleOptions.map(({ value: r, label, icon }) => {
            const isSelected = normalizedRole === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => { setOpen(false); if (r !== normalizedRole) onChange(userId, r); }}
                className="flex w-full items-center gap-2 px-3.5 py-2 font-sans text-[12px] font-medium"
                style={{ color: isSelected ? '#d4af37' : '#9a9a9a', background: isSelected ? 'rgba(212,175,55,0.08)' : 'transparent', transition: 'background 0.15s ease' }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                {icon && typeof icon === 'string' ? <span className="text-[10px]">{icon}</span> : icon}
                <span>{label}</span>
                {isSelected && (
                  <svg className="ml-auto" width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#d4af37" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   COPY ID BUTTON
───────────────────────────────────────────────────────────── */
function CopyId({ fullId, shortId }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[12px] text-luxury-muted">{shortId}</span>
      <button
        type="button"
        onClick={handleCopy}
        title="Copy full ID"
        className="flex h-6 w-6 items-center justify-center rounded-md"
        style={{
          background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
          border: copied ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.08)',
          color: copied ? '#34d399' : '#666',
          transition: 'all 0.18s ease',
        }}
        onMouseEnter={(e) => { if (!copied) { e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; e.currentTarget.style.color = '#d4af37'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.20)'; } }}
        onMouseLeave={(e) => { if (!copied) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; } }}
      >
        {copied
          ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#34d399" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          : <CopyIcon />
        }
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SKELETON ROW
───────────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr>
      {[60, 45, 30, 10].map((w, i) => (
        <td key={i} className="px-6 py-4">
          <div className="flex items-center gap-3">
            {i === 0 && <div className="h-9 w-9 rounded-full skeleton-shimmer shrink-0" />}
            <div className="h-3.5 rounded-full skeleton-shimmer" style={{ width: `${w}%` }} />
          </div>
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
      <td colSpan={4}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.14)' }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="10" r="5" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5" />
              <path d="M4 24c0-5.5 4.5-9 10-9s10 3.5 10 9" stroke="rgba(212,175,55,0.35)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="font-display text-xl text-white mb-1">No users found</p>
          <p className="font-sans text-sm text-luxury-muted">Try a different search term</p>
        </div>
      </td>
    </tr>
  );
}

/* ─────────────────────────────────────────────────────────────
   USER ROW
───────────────────────────────────────────────────────────── */
function UserRow({ user: u, isLast, updatingId, onRoleChange, onDelete, isSelf }) {
  const [hovered, setHovered] = useState(false);
  const initials = getInitials(u.fullName, u.email);
  const hue = getAvatarColor(u.email);
  const isAdmin = u.role === 'admin';

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.032)',
        background: hovered
          ? isAdmin ? 'rgba(212,175,55,0.028)' : 'rgba(255,255,255,0.018)'
          : 'transparent',
        transition: 'background 0.18s ease',
      }}
    >
      {/* USER CARD */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3.5">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-sans text-[12px] font-bold transition-all duration-200"
            style={{
              background: isAdmin
                ? 'linear-gradient(135deg, rgba(212,175,55,0.28), rgba(212,175,55,0.08))'
                : `hsla(${hue}, 55%, 35%, 0.25)`,
              border: isAdmin
                ? '1.5px solid rgba(212,175,55,0.45)'
                : `1px solid hsla(${hue}, 55%, 55%, 0.22)`,
              color: isAdmin ? '#d4af37' : `hsl(${hue}, 65%, 72%)`,
              boxShadow: isAdmin && hovered ? '0 0 14px rgba(212,175,55,0.22)' : 'none',
            }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-sans text-[13px] font-semibold leading-snug"
              style={{ color: '#e8e8e8', maxWidth: '220px' }} title={u.fullName || u.email}>
              {u.fullName || u.email}
            </p>
            {u.fullName && (
              <p className="truncate font-sans text-[11px] leading-snug"
                style={{ color: 'rgba(255,255,255,0.32)', maxWidth: '220px', letterSpacing: '0.01em' }}
                title={u.email}>
                {u.email}
              </p>
            )}
            {isAdmin && (
              <p className="font-sans text-[10px] text-luxury-gold mt-0.5 tracking-wide">Administrator</p>
            )}
          </div>
        </div>
      </td>

      {/* USER ID */}
      <td className="px-6 py-4">
        {u.fullUserId
          ? <CopyId fullId={u.fullUserId} shortId={u.userId} />
          : <span className="font-mono text-[12px] text-luxury-muted">—</span>
        }
      </td>

      {/* ROLE */}
      <td className="px-6 py-4">
        <RoleSelect
          userId={u.id}
          role={u.role}
          disabled={updatingId === u.id}
          onChange={onRoleChange}
        />
      </td>

      {/* ACTIONS */}
      <td className="px-6 py-4">
        <div className="flex justify-end" style={{ opacity: hovered ? 1 : 0.25, transition: 'opacity 0.18s ease' }}>
          <button
            type="button"
            onClick={onDelete}
            disabled={isSelf}
            title={isSelf ? "Can't delete your own account" : 'Delete user'}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30"
            style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.16)', color: '#f87171' }}
            onMouseEnter={(e) => { if (!isSelf) { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.boxShadow = '0 0 14px rgba(239,68,68,0.22)'; e.currentTarget.style.transform = 'scale(1.08)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
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
function PagBtn({ children, active, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 font-sans text-[12px] font-medium disabled:opacity-30"
      style={active
        ? { background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.35)', color: '#d4af37', boxShadow: '0 0 12px rgba(212,175,55,0.12)' }
        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#7a7a7a', transition: 'background 0.18s ease' }
      }
      onMouseEnter={(e) => { if (!active && !disabled) { e.currentTarget.style.background = 'rgba(212,175,55,0.07)'; e.currentTarget.style.color = '#d4af37'; } }}
      onMouseLeave={(e) => { if (!active && !disabled) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#7a7a7a'; } }}
    >
      {children}
    </button>
  );
}

function Pagination({ page, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-between font-sans anim-fade-up delay-3">
      <p className="text-[12px] text-luxury-muted">
        Page <span className="text-luxury-mutedlt">{page}</span> of{' '}
        <span className="text-luxury-mutedlt">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <PagBtn disabled={page <= 1} onClick={onPrev}><ChevronLeft /></PagBtn>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = totalPages <= 5 ? i + 1 : Math.max(1, page - 2) + i;
          if (p > totalPages) return null;
          return (
            <PagBtn key={p} active={p === page} onClick={() => p < page ? onPrev() : onNext()}>
              {p}
            </PagBtn>
          );
        })}
        <PagBtn disabled={page >= totalPages} onClick={onNext}><ChevronRight /></PagBtn>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function UsersAdmin() {
  const { profile, refreshProfile } = useAuth();
  const [data, setData]       = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage]       = useState(1);
  const [q, setQ]             = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data: body } = await adminApi.listUsers({ page, limit: 25, q: q.trim() || undefined });
      setData(body);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, q]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [page, q]);

  const changeRole = async (userId, role) => {
    setUpdatingId(userId);
    try {
      await adminApi.updateUserRole(userId, role);
      toast.success('Role updated');
      if (profile?._id === userId) await refreshProfile();
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteUser(deleteTarget.id);
      toast.success('User deleted successfully');
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const allRows = (data.items || []).map((u) => ({
    key: u._id,
    id: u._id,
    fullName: u.fullName || u.name || '',
    email: u.email,
    role: u.role,
    userId: u._id ? `...${u._id.slice(-8)}` : '—',
    fullUserId: u._id || null,
  }));

  const rows = allRows.filter(
    (r) =>
      roleFilter === 'all' ||
      r.role === roleFilter ||
      (roleFilter === 'user' && (r.role === 'customer' || r.role === 'user'))
  );

  const adminCount      = allRows.filter((r) => r.role === 'admin').length;
  const restaurantCount = allRows.filter((r) => r.role === 'restaurant').length;
  const userCount       = allRows.filter((r) => r.role === 'user' || r.role === 'customer').length;

  /* Export users as CSV */
  const exportUsers = () => {
    downloadCSV(
      `admin_users_${today()}.csv`,
      [
        {
          title: 'User Summary',
          headers: ['Metric', 'Value'],
          rows: [
            ['Total Users',          data.total || allRows.length],
            ['Administrators',       adminCount],
            ['Restaurant Partners',  restaurantCount],
            ['Regular Users',        userCount],
          ],
        },
        {
          title: 'All Users',
          headers: ['Name', 'Email', 'Role', 'User ID'],
          rows: allRows.map((u) => [
            u.fullName || '—',
            u.email,
            u.role,
            u.fullUserId || '—',
          ]),
        },
      ],
    );
    toast.success('Users exported as CSV!');
  };

  return (
    <div className="max-w-[1100px] mx-auto">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between anim-fade-up">
        <div>
          <h1
            className="font-display text-white leading-none font-bold"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}
          >
            System Users
          </h1>
          <p className="mt-2 font-sans text-sm text-luxury-muted">
            Manage platform users, roles and permissions
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
            onClick={() => { load(true); toast.success('Users refreshed'); }}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-xs text-luxury-muted hover:text-luxury-gold transition-all duration-200 disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className={refreshing ? 'animate-spin' : ''}><IconRefresh /></span>
            Refresh
          </button>

          <button
            type="button"
            onClick={exportUsers}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-xs font-semibold text-[#0b0b0c] transition-all duration-200 hover:brightness-110 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)', boxShadow: '0 0 18px rgba(212,175,55,0.25)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5v7M4.5 6.5L7 9l2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1.5 10.5v1a1 1 0 001 1h9a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* ── 4-KPI Stat Cards ────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard
          label="Total Users"
          value={data.total || allRows.length}
          sub="Registered accounts"
          Icon={IconTotalUsers}
        />
        <StatCard
          label="Administrators"
          value={adminCount}
          sub="Platform admins"
          Icon={IconAdmins}
          accent={adminCount > 0}
        />
        <StatCard
          label="Restaurant Partners"
          value={restaurantCount}
          sub="Active restaurant owners"
          Icon={IconRestaurantPartners}
        />
        <StatCard
          label="Regular Users"
          value={userCount}
          sub="Customer accounts"
          Icon={IconRegularUsers}
        />
      </div>

      {/* ── Search + filter bar ───────────────────────────── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center anim-fade-up delay-1">
        {/* Search */}
        <div className="relative flex-1" style={{ maxWidth: '420px' }}>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            type="search"
            autoComplete="off"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search by name or email…"
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

        {/* Role filter pills */}
        <div
          className="flex items-center gap-1 rounded-full p-1.5 transition-all duration-200"
          style={{
            background: 'rgba(20, 20, 22, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
          }}
        >
          {[
            { id: 'all', label: 'ALL', icon: null },
            { id: 'admin', label: 'ADMIN', icon: <CrownIcon /> },
            { id: 'restaurant', label: 'RESTAURANT', icon: '🍴' },
            { id: 'user', label: 'CUSTOMER', icon: '👤' },
          ].map(({ id, label, icon }) => {
            const active = roleFilter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setRoleFilter(id)}
                className="group relative inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 select-none hover:text-white"
                style={
                  active
                    ? {
                        background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 100%)',
                        color: '#0a0a0b',
                        boxShadow: '0 0 16px rgba(212,175,55,0.35)',
                      }
                    : {
                        background: 'transparent',
                        color: 'rgba(255,255,255,0.45)',
                      }
                }
              >
                {icon && typeof icon === 'string' ? (
                  <span className="text-[11px]">{icon}</span>
                ) : (
                  icon
                )}
                <span>{label}</span>
              </button>
            );
          })}
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
        <table className="w-full min-w-[560px]">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.07)' }}>
              {['User', 'User ID', 'Role', 'Actions'].map((h, i) => (
                <th
                  key={h}
                  className={`px-6 py-4 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] ${i === 3 ? 'text-right' : 'text-left'}`}
                  style={{ color: 'rgba(212,175,55,0.45)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              : rows.length === 0
              ? <EmptyState />
              : rows.map((u, i) => (
                  <UserRow
                    key={u.key}
                    user={u}
                    isLast={i === rows.length - 1}
                    updatingId={updatingId}
                    onRoleChange={changeRole}
                    isSelf={profile?._id === u.id}
                    onDelete={() => setDeleteTarget(u)}
                  />
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Row count */}
      {rows.length > 0 && (
        <p className="mt-4 font-sans text-[11px] text-luxury-muted anim-fade-up delay-3">
          {rows.length} user{rows.length !== 1 ? 's' : ''} shown
        </p>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={data.totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
      />

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteUserModal
          user={deleteTarget}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
