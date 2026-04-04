/**
 * User profile — email, role, stats, recent bookings, logout.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Loader from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatISODate } from '../utils/formatDate.js';

/* ── tiny icon helpers ── */
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

export default function Profile() {
  const { email, role, profile, profileLoading, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings]               = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

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

  if (profileLoading) return <Loader label="Loading profile…" />;

  const displayEmail = profile?.email || email || '—';
  const isAdmin      = (role || '').toLowerCase() === 'admin';

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #0b0b0c 0%, #121212 50%, #1a1a1a 100%)' }}
    >
      <div className="mx-auto max-w-2xl px-4 py-14 md:px-6 md:py-20">

        {/* ── PAGE HEADER ── */}
        <header className="mb-12">
          <p className="mb-3 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-luxury-gold/70">
            Your account
          </p>
          <h1 className="font-display text-4xl font-light text-white md:text-5xl">Profile</h1>
          <div className="mt-3 h-px w-12" style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
          <p className="mt-4 font-sans text-sm text-white/35">Manage your dining identity</p>
        </header>

        {/* ── PROFILE CARD ── */}
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(212,175,55,0.14)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* Gold left accent bar */}
          <div className="flex">
            <div className="w-1 shrink-0" style={{ background: 'linear-gradient(180deg, #d4af37 0%, rgba(212,175,55,0.1) 100%)' }} />

            <div className="flex-1 p-6 md:p-8">

              {/* Email + Role row */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="mb-1.5 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-luxury-gold/50">
                    Email address
                  </p>
                  <p className="break-all font-sans text-base text-white">{displayEmail}</p>
                </div>

                {/* Role badge */}
                <div className="shrink-0">
                  <p className="mb-1.5 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-luxury-gold/50">
                    Role
                  </p>
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => navigate('/admin')}
                      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-200 active:scale-[0.97]"
                      style={{
                        background: 'rgba(212,175,55,0.12)',
                        border: '1px solid rgba(212,175,55,0.35)',
                        color: '#d4af37',
                        boxShadow: '0 0 16px rgba(212,175,55,0.1)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(212,175,55,0.2)';
                        e.currentTarget.style.border = '1px solid rgba(212,175,55,0.6)';
                        e.currentTarget.style.boxShadow = '0 0 24px rgba(212,175,55,0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(212,175,55,0.12)';
                        e.currentTarget.style.border = '1px solid rgba(212,175,55,0.35)';
                        e.currentTarget.style.boxShadow = '0 0 16px rgba(212,175,55,0.1)';
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-luxury-gold" />
                      Admin
                    </button>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sans text-xs font-semibold uppercase tracking-widest"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {role || 'user'}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              {profile?.stats && (
                <>
                  <div className="my-6 h-px" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.15), transparent)' }} />
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Total bookings', value: profile.stats.totalBookings ?? 0 },
                      { label: 'Upcoming',        value: profile.stats.upcomingConfirmed ?? 0 },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.border = '1px solid rgba(212,175,55,0.2)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; }}
                      >
                        <p className="font-sans text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/30">
                          {label}
                        </p>
                        <p className="mt-2 font-display text-3xl font-light tabular-nums text-white">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="my-6 h-px" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.1), transparent)' }} />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Refresh */}
                <button
                  type="button"
                  onClick={() => { refreshProfile(); toast.success('Profile refreshed'); }}
                  className="flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 font-sans text-sm text-white/50 transition-all duration-200 hover:text-white active:scale-[0.97]"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)';
                    e.currentTarget.style.color = '#d4af37';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                  }}
                >
                  <IconRefresh />
                  Refresh
                </button>

                {/* Logout */}
                <button
                  type="button"
                  onClick={() => logout()}
                  className="flex items-center justify-center gap-2 rounded-full px-6 py-2.5 font-sans text-sm font-semibold text-[#0b0b0c] transition-all duration-200 hover:brightness-110 active:scale-[0.97] sm:ml-auto"
                  style={{
                    background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)',
                    boxShadow: '0 0 24px rgba(212,175,55,0.2)',
                  }}
                >
                  <IconLogout />
                  Log out
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* ── RECENT RESERVATIONS ── */}
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
            /* Skeleton */
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
            /* Empty state */
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
            /* Booking mini-cards */
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
                      {/* Left */}
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

                      {/* Status badge */}
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

      </div>
    </div>
  );
}
