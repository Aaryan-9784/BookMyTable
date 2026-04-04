/**
 * Authenticated list of the current user's bookings — status + cancel.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Loader from '../components/Loader.jsx';
import ConfirmModal from '../admin/components/ConfirmModal.jsx';
import { formatISODate } from '../utils/formatDate.js';

/* ── tiny icon helpers ── */
function IconCalendar() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconGuests() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

export default function MyBookings() {
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [cancelId, setCancelId]   = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/api/bookings/my');
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const confirmCancel = async () => {
    if (!cancelId) return;
    const prev = rows;
    setRows((list) => list.map((b) => (b._id === cancelId ? { ...b, status: 'cancelled' } : b)));
    setCancelling(true);
    try {
      await api.patch(`/api/bookings/${cancelId}/cancel`);
      toast.success('Booking cancelled. A confirmation email was sent when possible.');
      setCancelId(null);
      await load();
    } catch (e) {
      setRows(prev);
      toast.error(e.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loader label="Loading your reservations…" />;

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #0b0b0c 0%, #121212 50%, #1a1a1a 100%)' }}
    >
      <div className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">

        {/* ── PAGE HEADER ── */}
        <header className="mb-12">
          <p className="mb-3 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-luxury-gold/70">
            Your account
          </p>
          <h1 className="font-display text-4xl font-light text-white md:text-5xl">
            My bookings
          </h1>
          <div className="mt-3 h-px w-12" style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
          <p className="mt-4 font-sans text-sm text-white/35">
            Your curated dining experiences
          </p>
        </header>

        {/* ── EMPTY STATE ── */}
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
              style={{
                background: 'rgba(212,175,55,0.06)',
                border: '1px solid rgba(212,175,55,0.15)',
              }}
            >
              <svg className="h-9 w-9 text-luxury-gold/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h3 className="font-display text-2xl font-light text-white">No reservations yet</h3>
            <p className="mt-2 max-w-xs font-sans text-sm text-white/35">
              Discover and book your perfect dining experience
            </p>
            <Link
              to="/restaurants"
              className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3 font-sans text-sm font-semibold text-[#0b0b0c] transition hover:brightness-110 active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)',
                boxShadow: '0 0 28px rgba(212,175,55,0.25)',
              }}
            >
              Explore Restaurants
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        ) : (
          /* ── BOOKING CARDS ── */
          <ul className="space-y-5">
            {rows.map((b) => {
              const rest     = b.restaurantId;
              const name     = typeof rest === 'object' && rest?.name ? rest.name : 'Restaurant';
              const rid      = typeof rest === 'object' && rest?._id  ? rest._id  : null;
              const status   = b.status || 'confirmed';
              const canCancel = status === 'confirmed';
              const isCancelled = status === 'cancelled';

              return (
                <li
                  key={b._id}
                  className="group relative overflow-hidden rounded-2xl transition-all duration-400"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: isCancelled
                      ? '1px solid rgba(255,255,255,0.05)'
                      : '1px solid rgba(212,175,55,0.12)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isCancelled) {
                      e.currentTarget.style.border = '1px solid rgba(212,175,55,0.28)';
                      e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = isCancelled
                      ? '1px solid rgba(255,255,255,0.05)'
                      : '1px solid rgba(212,175,55,0.12)';
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.35)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Cancelled overlay tint */}
                  {isCancelled && (
                    <div className="absolute inset-0 rounded-2xl bg-black/20 pointer-events-none" />
                  )}

                  <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:gap-6">

                    {/* LEFT — details */}
                    <div className="flex-1 min-w-0">
                      {/* Status badge */}
                      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1"
                        style={isCancelled ? {
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.2)',
                        } : {
                          background: 'rgba(212,175,55,0.1)',
                          border: '1px solid rgba(212,175,55,0.25)',
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: isCancelled ? '#ef4444' : '#d4af37' }}
                        />
                        <span
                          className="font-sans text-[0.6rem] font-semibold uppercase tracking-[0.2em]"
                          style={{ color: isCancelled ? '#f87171' : '#d4af37' }}
                        >
                          {isCancelled ? 'Cancelled' : 'Confirmed'}
                        </span>
                      </div>

                      {/* Restaurant name */}
                      {rid ? (
                        <Link
                          to={`/restaurants/${rid}`}
                          className="block font-display text-2xl font-light text-white transition-colors duration-200 hover:text-luxury-gold"
                          style={{ opacity: isCancelled ? 0.45 : 1 }}
                        >
                          {name}
                        </Link>
                      ) : (
                        <span
                          className="block font-display text-2xl font-light text-white"
                          style={{ opacity: isCancelled ? 0.45 : 1 }}
                        >
                          {name}
                        </span>
                      )}

                      {/* Divider */}
                      <div
                        className="my-4 h-px"
                        style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.15), transparent)' }}
                      />

                      {/* Booking meta */}
                      <div className="flex flex-wrap gap-x-6 gap-y-2" style={{ opacity: isCancelled ? 0.4 : 1 }}>
                        <span className="flex items-center gap-2 font-sans text-sm text-white/60">
                          <span className="text-luxury-gold/60"><IconCalendar /></span>
                          {formatISODate(b.date)}
                        </span>
                        <span className="flex items-center gap-2 font-sans text-sm text-white/60">
                          <span className="text-luxury-gold/60"><IconClock /></span>
                          {b.time}
                        </span>
                        <span className="flex items-center gap-2 font-sans text-sm text-white/60">
                          <span className="text-luxury-gold/60"><IconGuests /></span>
                          {b.guests} {b.guests === 1 ? 'guest' : 'guests'}
                        </span>
                      </div>
                    </div>

                    {/* RIGHT — cancel */}
                    {canCancel && (
                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={() => setCancelId(b._id)}
                          className="rounded-full border px-5 py-2.5 font-sans text-sm text-red-400/70 transition-all duration-200 hover:scale-[1.02] hover:text-red-300 active:scale-[0.97]"
                          style={{
                            borderColor: 'rgba(239,68,68,0.2)',
                            background: 'rgba(239,68,68,0.04)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.45)';
                            e.currentTarget.style.background = 'rgba(239,68,68,0.09)';
                            e.currentTarget.style.boxShadow = '0 0 16px rgba(239,68,68,0.12)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
                            e.currentTarget.style.background = 'rgba(239,68,68,0.04)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          Cancel booking
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── CONFIRM MODAL ── */}
      <ConfirmModal
        open={Boolean(cancelId)}
        title="Cancel this reservation?"
        message="We will mark it cancelled and send you an email when SES is configured."
        confirmLabel="Cancel booking"
        loading={cancelling}
        onConfirm={confirmCancel}
        onCancel={() => setCancelId(null)}
      />
    </div>
  );
}
