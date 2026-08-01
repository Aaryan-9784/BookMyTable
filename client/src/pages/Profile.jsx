/**
 * User profile — email, role, stats, recent bookings, logout.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Loader from '../components/Loader.jsx';
import EditProfileModal from '../components/EditProfileModal.jsx';
import ChangePasswordModal from '../components/ChangePasswordModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatISODate } from '../utils/formatDate.js';

/* ── tiny icon helpers ── */
function IconKey() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0121 8.25z" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}
function IconPencil() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
  );
}

export default function Profile() {
  const { email, role, isRestaurant, profile, profileLoading, logout, refreshProfile, displayName } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings]               = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [editOpen, setEditOpen]               = useState(false);
  const [changePassOpen, setChangePassOpen]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/api/bookings/my');
        const list = Array.isArray(data) ? data : [];
        if (!cancelled)
          setBookings(list.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 10));
      } catch (e) {
        toast.error(e.message);
        if (!cancelled) setBookings([]);
      } finally {
        if (!cancelled) setLoadingBookings(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (profileLoading) return null;

  const displayEmail = profile?.email || email || '—';
  const rawPhone     = profile?.phone || profile?.phoneNumber || localStorage.getItem('bookmytable_phone') || '+91 8238012515';
  const displayPhone = rawPhone.startsWith('+') ? rawPhone : `+91 ${rawPhone}`;
  const isAdmin      = (role || '').toLowerCase() === 'admin';

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #0b0b0c 0%, #121212 50%, #1a1a1a 100%)' }}
    >
      <div className="mx-auto max-w-[1100px] px-4 py-12 md:px-8 md:py-16">

        {/* ── EDIT PROFILE MODAL ── */}
        <EditProfileModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          onUpdated={() => { refreshProfile(); }}
        />

        {/* ── CHANGE PASSWORD MODAL ── */}
        <ChangePasswordModal
          isOpen={changePassOpen}
          onClose={() => setChangePassOpen(false)}
          userEmail={displayEmail}
        />

        <header className="mb-10">
          <p className="mb-2.5 font-sans text-[0.65rem] font-bold uppercase tracking-[0.28em] text-luxury-gold/80">
            YOUR ACCOUNT
          </p>
          <h1 className="font-display text-4xl font-light text-white md:text-5xl">Profile</h1>
          <div className="mt-3.5 h-px w-16" style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
          <p className="mt-4 font-sans text-sm text-white/40">Manage your dining identity & dashboard access</p>
        </header>

        {/* ── PROFILE CARD ── */}
        <div
          className="overflow-hidden rounded-2xl transition-all duration-300"
          style={{
            background: 'linear-gradient(165deg, rgba(30,30,35,0.7) 0%, rgba(14,14,16,0.95) 100%)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(212,175,55,0.22)',
            boxShadow: '0 28px 84px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex">
            {/* Gold left accent bar */}
            <div className="w-1.5 shrink-0" style={{ background: 'linear-gradient(180deg, #f5e27a 0%, #d4af37 50%, rgba(212,175,55,0.1) 100%)' }} />

            <div className="flex-1 p-6 sm:p-8 md:p-10">

              {/* ── User identity row ── */}
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                {/* Avatar + Name + Email */}
                <div className="flex items-center gap-5">
                  <div
                    className="relative shrink-0 rounded-full"
                    style={{
                      width: 64,
                      height: 64,
                      padding: '2px',
                      background: 'linear-gradient(135deg, #f5e27a 0%, #d4af37 50%, #997819 100%)',
                      boxShadow: '0 0 28px rgba(212,175,55,0.35)',
                    }}
                  >
                    <div
                      className="flex h-full w-full items-center justify-center rounded-full font-sans text-xl font-extrabold"
                      style={{
                        background: 'linear-gradient(145deg, #242424, #141414)',
                        color: '#f5e27a',
                        letterSpacing: '0.04em',
                        textShadow: '0 0 10px rgba(212,175,55,0.4)',
                      }}
                    >
                      {(displayName || displayEmail)
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w) => w[0].toUpperCase())
                        .join('')}
                    </div>
                    {/* Live Online status indicator */}
                    <span
                      className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-[#121212] bg-emerald-400"
                      title="Online"
                    />
                  </div>

                  {/* Name + email stack */}
                  <div className="space-y-1">
                    <p className="font-display text-2xl font-light text-white leading-tight">
                      {displayName || '—'}
                    </p>
                    <p className="break-all font-sans text-xs text-gray-400">{displayEmail}</p>
                    <div className="pt-1.5">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          background: 'rgba(212,175,55,0.12)',
                          border: '1px solid rgba(212,175,55,0.30)',
                          color: '#f5e27a',
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                        {isAdmin ? 'Super Admin' : isRestaurant ? 'Restaurant Partner' : 'Customer Account'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Console / Dashboard Action Button */}
                <div className="flex items-center gap-3 sm:shrink-0">
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => navigate('/admin')}
                      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-[#0b0b0c] transition-all duration-300 hover:brightness-110 active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)',
                        boxShadow: '0 0 24px rgba(212,175,55,0.3)',
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0b0b0c]" />
                      Admin Console →
                    </button>
                  ) : isRestaurant ? (
                    <button
                      type="button"
                      onClick={() => navigate('/restaurant-dashboard')}
                      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-[#0b0b0c] transition-all duration-300 hover:brightness-110 hover:scale-[1.02] active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)',
                        boxShadow: '0 0 24px rgba(212,175,55,0.3)',
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0b0b0c]" />
                      Partner Console →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate('/my-bookings')}
                      className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-[#0b0b0c] transition-all duration-300 hover:brightness-110 hover:scale-[1.02] active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)',
                        boxShadow: '0 0 24px rgba(212,175,55,0.3)',
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0b0b0c]" />
                      My Bookings <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Account Quick Info Cards */}
              <div className="my-8 h-px" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.04) 100%)' }} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {(isRestaurant ? [
                  { label: 'Mobile Number',   value: displayPhone, icon: '📱', highlight: 'amber' },
                  { label: 'Partner Status',  value: 'Active & Verified', icon: '🟢', highlight: 'emerald' },
                ] : isAdmin ? [
                  { label: 'Mobile Number',   value: displayPhone, icon: '📱', highlight: 'amber' },
                  { label: 'System Access',   value: 'Root Administrator', icon: '👑', highlight: 'emerald' },
                ] : [
                  { label: 'Total bookings', value: profile?.stats?.totalBookings ?? 0, icon: '📊', highlight: 'white' },
                  { label: 'Upcoming',        value: profile?.stats?.upcomingConfirmed ?? 0, icon: '📅', highlight: 'amber' },
                ]).map(({ label, value, icon, highlight }) => (
                  <div
                    key={label}
                    className="group rounded-xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(212,175,55,0.04) 100%)',
                      border: '1px solid rgba(212,175,55,0.14)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-sans text-[0.65rem] font-bold uppercase tracking-[0.22em] text-white/40 group-hover:text-luxury-gold/80 transition-colors">
                        {label}
                      </p>
                      <span className="text-sm opacity-70 group-hover:scale-110 transition-transform">{icon}</span>
                    </div>
                    <p className={`mt-2 font-sans ${typeof value === 'number' ? 'font-display text-3xl font-light tabular-nums' : 'text-sm font-semibold'} ${highlight === 'emerald' ? 'text-emerald-400' : highlight === 'amber' ? 'text-amber-300' : 'text-white'}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Divider & Actions Toolbar */}
              <div className="my-8 h-px" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.18) 0%, transparent 100%)' }} />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                
                {/* Left Account Settings Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider text-gray-300 transition-all duration-200 hover:text-amber-300 hover:border-amber-500/40 hover:bg-amber-500/10 active:scale-[0.97]"
                    style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)' }}
                  >
                    <IconPencil />
                    Edit Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => setChangePassOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider text-amber-400/90 transition-all duration-200 hover:text-amber-300 hover:border-amber-400/60 hover:bg-amber-500/15 active:scale-[0.97]"
                    style={{ borderColor: 'rgba(212,175,55,0.30)', background: 'rgba(212,175,55,0.06)' }}
                  >
                    <IconKey />
                    Change Password
                  </button>
                </div>

                {/* Right Logout Action */}
                <button
                  type="button"
                  onClick={() => logout()}
                  className="flex items-center justify-center gap-2 rounded-full border px-6 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider text-red-400/90 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/40 transition-all duration-200 active:scale-[0.97]"
                  style={{ borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.04)' }}
                >
                  <IconLogout />
                  Log out
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* ── RECENT RESERVATIONS (Customers only) ── */}
        {!isRestaurant && (
          <section className="mt-14">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="mb-1.5 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-luxury-gold/70">
                  History
                </p>
                <h2 className="font-display text-2xl font-light text-white">Recent reservations</h2>
              </div>
              <Link
                to="/my-bookings"
                className="flex items-center gap-1.5 font-sans text-sm text-luxury-gold/60 transition-all duration-200 hover:text-luxury-gold"
              >
                All bookings
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            {loadingBookings ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl p-4"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4 w-36 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
                        <div className="h-3 w-24 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
                      </div>
                      <div className="h-5 w-20 rounded-full" style={{ background: 'rgba(212,175,55,0.08)' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div
                  className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}
                >
                  <svg className="h-7 w-7 text-luxury-gold/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <p className="font-display text-xl font-light text-white">No recent dining experiences</p>
                <p className="mt-2 font-sans text-sm text-white/30">Start exploring curated restaurants</p>
                <Link
                  to="/restaurants"
                  className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2.5 font-sans text-sm font-semibold text-[#0b0b0c] transition hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg, #c9a84c, #f0d060)' }}
                >
                  Explore Restaurants
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {bookings.map((b) => {
                  const rest        = b.restaurantId;
                  const name        = typeof rest === 'object' && rest?.name ? rest.name : 'Restaurant';
                  const rid         = typeof rest === 'object' && rest?._id  ? rest._id  : null;
                  const status      = b.status || 'confirmed';
                  const isCancelled = status === 'cancelled';

                  return (
                    <li
                      key={b._id}
                      className="group rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.border = '1px solid rgba(212,175,55,0.2)';
                        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
                        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.25)';
                      }}
                    >
                      <div className="flex items-center justify-between gap-4 px-5 py-4">
                        <div className="min-w-0">
                          {rid ? (
                            <Link
                              to={`/restaurants/${rid}`}
                              className="block font-display text-base font-light text-white transition-colors duration-200 hover:text-luxury-gold"
                              style={{ opacity: isCancelled ? 0.45 : 1 }}
                            >
                              {name}
                            </Link>
                          ) : (
                            <span
                              className="block font-display text-base font-light text-white"
                              style={{ opacity: isCancelled ? 0.45 : 1 }}
                            >
                              {name}
                            </span>
                          )}
                          <div className="mt-1.5 flex items-center gap-1.5 font-sans text-xs text-white/35">
                            <span className="text-luxury-gold/40"><IconCalendar /></span>
                            {formatISODate(b.date)} · {b.time}
                          </div>
                        </div>
                        <span
                          className="shrink-0 rounded-full px-3 py-1 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.18em]"
                          style={isCancelled ? {
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            color: '#f87171',
                          } : {
                            background: 'rgba(212,175,55,0.1)',
                            border: '1px solid rgba(212,175,55,0.25)',
                            color: '#d4af37',
                          }}
                        >
                          {isCancelled ? 'Cancelled' : 'Confirmed'}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

      </div>
    </div>
  );
}
