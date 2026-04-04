/**
 * Authenticated booking — posts to POST /api/bookings; SES email is triggered server-side.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import BookingForm from '../components/BookingForm.jsx';
import Loader from '../components/Loader.jsx';
import { restaurantTimeSlots } from '../utils/timeSlots.js';

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isPastDateStr(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${dateStr}T12:00:00`);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

export default function BookTable() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const slots = restaurantTimeSlots();
  const minDate = todayISO();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/api/restaurants/${id}`);
        if (!cancelled) setRestaurant(data);
      } catch (e) {
        toast.error(e.message);
        if (!cancelled) setRestaurant(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleBook = async ({ date, time, guests }) => {
    if (isPastDateStr(date)) {
      toast.error('Choose today or a future date');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/api/bookings', { restaurantId: id, date, time, guests });
      const delivery = data?.emailDelivery;
      if (delivery?.ok) {
        toast.success(
          delivery.sandboxRedirect
            ? `Reservation saved. Confirmation emailed to ${delivery.deliveredTo || 'your verified sender inbox'} (customer: ${delivery.intendedRecipient || '—'}).`
            : 'Reservation saved. Check your email for confirmation.'
        );
      } else {
        toast.success('Reservation saved in the app.');
        const why = delivery?.reason || 'Confirmation email was not sent.';
        toast.error(why, { duration: 6000 });
        if (delivery?.hint) toast(delivery.hint, { duration: 10000, icon: 'ℹ️' });
      }
      navigate('/my-bookings');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading restaurant…" />;

  if (!restaurant) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center font-sans text-white/40">
        Invalid restaurant.{' '}
        <Link className="text-luxury-gold hover:underline" to="/restaurants">Browse all</Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #0b0b0c 0%, #111111 60%, #1a1a1a 100%)' }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(212,175,55,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-lg px-4 py-14 md:px-6 md:py-20">

        {/* Back link */}
        <Link
          to={`/restaurants/${id}`}
          className="mb-10 inline-flex items-center gap-2 font-sans text-sm text-white/30 transition-colors hover:text-luxury-gold"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to restaurant
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <svg className="h-3.5 w-3.5 text-luxury-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-luxury-gold/70">
              {restaurant.location}
            </p>
          </div>
          <h1 className="font-display text-4xl font-light text-white md:text-5xl">
            Reserve at<br />
            <span
              style={{
                background: 'linear-gradient(135deg, #c9a84c, #f5e6a3, #c9a84c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {restaurant.name}
            </span>
          </h1>
          <div className="mt-4 h-px w-12" style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
          <p className="mt-3 font-sans text-sm text-white/30">
            Reserve your table in seconds
          </p>
        </div>

        {/* Form card */}
        <BookingForm
          onSubmit={handleBook}
          submitting={submitting}
          defaultDate={minDate}
          defaultTime="19:00"
          defaultGuests={2}
          minDate={minDate}
          timeSlots={slots}
        />
      </div>
    </div>
  );
}
