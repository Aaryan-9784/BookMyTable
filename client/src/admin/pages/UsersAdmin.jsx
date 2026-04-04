import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { adminApi } from '../services/adminApi.js';
import Loader from '../../components/Loader.jsx';

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function getInitials(email = '') {
  const name = email.split('@')[0];
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(email = '') {
  const hues = [210, 160, 280, 30, 340, 190, 60];
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return hues[Math.abs(hash) % hues.length];
}

/* ─────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────── */
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
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
      <path d="M1 8.5l1.5-5 2.5 3L5.5 2l.5 4.5 2.5-3L10 8.5H1z"
        stroke="#d4af37" strokeWidth="1" strokeLinejoin="round" fill="rgba(212,175,55,0.15)" />
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

/* ─────────────────────────────────────────────────────────────
   ROLE SELECT — premium pill dropdown
───────────────────────────────────────────────────────────── */
function RoleSelect({ userId, role, disabled, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isAdmin = role === 'admin';

  const pillStyle = isAdmin
    ? {
        background: 'rgba(212,175,55,0.12)',
        border: '1px solid rgba(212,175,55,0.32)',
        color: '#d4af37',
        boxShadow: '0 0 10px rgba(212,175,55,0.10)',
      }
    : {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.10)',
        color: '#9a9a9a',
      };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-[11px] font-semibold"
        style={{
          ...pillStyle,
          transition: 'all 0.18s ease',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'wait' : 'pointer',
        }}
      >
        {isAdmin && <CrownIcon />}
        {role}
        <ChevronDown />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1.5 w-28 overflow-hidden rounded-xl py-1"
          style={{
            background: 'rgba(22,22,22,0.97)',
            border: '1px solid rgba(212,175,55,0.15)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(16px)',
            animation: 'fadeUp 0.15s ease forwards',
          }}
        >
          {['user', 'admin'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => { setOpen(false); if (r !== role) onChange(userId, r); }}
              className="flex w-full items-center gap-2 px-3.5 py-2 font-sans text-[12px] font-medium"
              style={{
                color: r === role ? '#d4af37' : '#9a9a9a',
                background: r === role ? 'rgba(212,175,55,0.08)' : 'transparent',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => { if (r !== role) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={(e) => { if (r !== role) e.currentTarget.style.background = 'transparent'; }}
            >
              {r === 'admin' && <CrownIcon />}
              {r}
              {r === role && (
                <svg className="ml-auto" width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="#d4af37" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
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
      {[60, 45, 30].map((w, i) => (
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
      <td colSpan={3}>
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
function UserRow({ user: u, isLast, updatingId, onRoleChange }) {
  const [hovered, setHovered] = useState(false);
  const initials = getInitials(u.email);
  const hue = getAvatarColor(u.email);
  const isAdmin = u.role === 'admin';

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.032)',
        background: hovered
          ? isAdmin
            ? 'rgba(212,175,55,0.025)'
            : 'rgba(255,255,255,0.018)'
          : 'transparent',
        transition: 'background 0.18s ease',
      }}
    >
      {/* USER CARD */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-sans text-[11px] font-bold"
            style={{
              background: isAdmin
                ? 'linear-gradient(135deg, rgba(212,175,55,0.28), rgba(212,175,55,0.08))'
                : `hsla(${hue}, 55%, 35%, 0.25)`,
              border: isAdmin
                ? '1px solid rgba(212,175,55,0.30)'
                : `1px solid hsla(${hue}, 55%, 55%, 0.22)`,
              color: isAdmin ? '#d4af37' : `hsl(${hue}, 65%, 72%)`,
            }}
          >
            {initials}
          </div>
          {/* Email */}
          <div>
            <p className="font-sans text-[13px] font-medium text-luxury-mutedlt leading-snug truncate max-w-[220px]">
              {u.email}
            </p>
            {isAdmin && (
              <p className="font-sans text-[10px] text-luxury-gold mt-0.5 tracking-wide">
                Administrator
              </p>
            )}
          </div>
        </div>
      </td>

      {/* COGNITO ID */}
      <td className="px-6 py-4">
        {u.fullCognitoId
          ? <CopyId fullId={u.fullCognitoId} shortId={u.cognitoId} />
          : <span className="font-mono text-[12px] text-luxury-muted">{u.cognitoId}</span>
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
    </tr>
  );
}

/* ─────────────────────────────────────────────────────────────
   STAT CHIP
───────────────────────────────────────────────────────────── */
function StatChip({ label, value, color }) {
  const c = color === 'gold'
    ? { bg: 'rgba(212,175,55,0.07)', border: 'rgba(212,175,55,0.20)', text: '#d4af37' }
    : { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.09)', text: '#b8b8b8' };
  return (
    <div className="flex items-center gap-2 rounded-xl px-3.5 py-2"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <span className="font-display text-xl font-semibold leading-none" style={{ color: c.text }}>{value}</span>
      <span className="font-sans text-[10px] uppercase tracking-[0.12em] text-luxury-muted">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGINATION
───────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function UsersAdmin() {
  const { profile, refreshProfile } = useAuth();
  const [data, setData]       = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [q, setQ]             = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    try {
      const { data: body } = await adminApi.listUsers({ page, limit: 25, q: q.trim() || undefined });
      setData(body);
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

  if (loading && !data.items.length) return <Loader label="Loading users…" />;

  const allRows = (data.items || []).map((u) => ({
    key: u._id,
    id: u._id,
    email: u.email,
    role: u.role,
    cognitoId: u.cognitoId ? `${u.cognitoId.slice(0, 8)}…` : '—',
    fullCognitoId: u.cognitoId || null,
  }));

  const rows = allRows.filter((r) =>
    roleFilter === 'all' || r.role === roleFilter
  );

  const adminCount = allRows.filter((r) => r.role === 'admin').length;
  const userCount  = allRows.filter((r) => r.role === 'user').length;

  return (
    <div className="max-w-[1100px] mx-auto">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="mb-10 anim-fade-up">
        <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-luxury-muted mb-3">
          Admin / Users
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1
              className="font-display text-white leading-none"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', letterSpacing: '0.01em' }}
            >
              Users
            </h1>
            <p className="mt-2 font-sans text-sm text-luxury-muted">
              Manage platform users and permissions
            </p>
            <div
              className="mt-4 h-px w-16"
              style={{ background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.15), transparent)' }}
            />
          </div>

          {/* Stat chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <StatChip label="Total" value={data.total || allRows.length} color="default" />
            <StatChip label="Admins" value={adminCount} color="gold" />
            <StatChip label="Users" value={userCount} color="default" />
          </div>
        </div>
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
            placeholder="Search users by email…"
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
        <div className="flex items-center gap-1.5">
          {['all', 'admin', 'user'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sans text-[11px] font-medium capitalize"
              style={
                roleFilter === r
                  ? { background: 'rgba(212,175,55,0.14)', border: '1px solid rgba(212,175,55,0.32)', color: '#d4af37', boxShadow: '0 0 10px rgba(212,175,55,0.10)' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#7a7a7a', transition: 'background 0.18s ease' }
              }
            >
              {r === 'admin' && <CrownIcon />}
              {r === 'all' ? 'All' : r}
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
        <table className="w-full min-w-[560px]">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.07)' }}>
              {['User', 'Cognito ID', 'Role'].map((h) => (
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
    </div>
  );
}
