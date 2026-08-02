/**
 * Authenticated booking page — upgraded 2-column layout, venue summary card, Razorpay gateway & promo discounts.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from '../utils/toast.js';
import api from '../services/api.js';
import BookingForm from '../components/BookingForm.jsx';
import Loader from '../components/Loader.jsx';
import { restaurantTimeSlots } from '../utils/timeSlots.js';
import { getFallbackRestaurantImage } from '../utils/imageUtils.js';

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

  const slots = restaurantTimeSlots(restaurant?.openingHours);

  const handleBook = async ({ date, time, guests, paymentId, couponCode, discountAmount, finalPayable }) => {
    if (isPastDateStr(date)) {
      toast.error('Choose today or a future date');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/api/bookings', {
        restaurantId: id,
        date,
        time,
        guests,
        paymentId,
        couponCode,
        discountAmount,
        finalPayable,
      });

      const resData = res.data;
      const createdBooking = resData?.data || resData;
      const bookingId = createdBooking?._id;

      const delivery = resData?.emailDelivery;
      if (delivery?.ok) {
        toast.success(
          delivery.sandboxRedirect
            ? `Reservation confirmed! Receipt emailed to ${delivery.deliveredTo || 'your email'}.`
            : '🎉 Reservation confirmed! Email receipt sent.'
        );
      } else {
        toast.success('🎉 Table reserved successfully!');
      }

      try { localStorage.removeItem('bmt_cached_my_bookings'); } catch {}

      if (bookingId) {
        navigate(`/booking-confirmation/${bookingId}`);
      } else {
        navigate('/my-bookings');
      }
    } catch (e) {
      const errMsg = e.response?.data?.error?.message || e.response?.data?.message || e.message || 'Failed to create booking';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!restaurant) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center font-sans text-white/40">
        Invalid restaurant.{' '}
        <Link className="text-luxury-gold hover:underline" to="/restaurants">Browse all</Link>
      </div>
    );
  }

  const heroImage = restaurant.imageUrl || getFallbackRestaurantImage(restaurant);

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(180deg, #0b0b0c 0%, #111111 60%, #1a1a1a 100%)' }}
    >
      {/* Ambient Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(212,175,55,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-14">

        {/* Back Link */}
        <Link
          to={`/restaurants/${id}`}
          className="mb-8 inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wider text-white/40 transition-colors hover:text-luxury-gold"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to venue details
        </Link>

        {/* 2-Column Responsive Layout */}
        <div className="grid gap-8 lg:grid-cols-[42%_58%] items-start">

          {/* ── LEFT COLUMN: VENUE SUMMARY CARD ── */}
          <div className="space-y-6">
            <div
              className="overflow-hidden rounded-3xl"
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(212,175,55,0.22)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.65)',
              }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={heroImage} alt={restaurant.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(12,12,14,0.85) 0%, transparent 60%)' }} />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="rounded-full px-3 py-1 font-sans text-[11px] font-bold text-luxury-gold backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(212,175,55,0.3)' }}>
                    {restaurant.category || 'Multi-cuisine'}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-luxury-gold">
                    📍 {restaurant.location}
                  </p>
                  <h1 className="mt-1 font-display text-3xl font-light text-white">
                    {restaurant.name}
                  </h1>
                </div>

                <div className="h-px bg-white/10" />

                <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Rating</p>
                    <p className="mt-1 font-bold text-luxury-gold">★ {Number(restaurant.rating || 4.8).toFixed(1)} / 5.0</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Token Fee</p>
                    <p className="mt-1 font-bold text-white">₹{restaurant.tokenFee ?? 150} / Seat</p>
                  </div>
                </div>

                {restaurant.openingHours && (
                  <div className="rounded-xl p-3 font-sans text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-luxury-gold">Opening Hours</p>
                    <p className="mt-1 font-semibold text-white/90">🕒 {restaurant.openingHours}</p>
                  </div>
                )}

                <div
                  className="rounded-2xl p-5 space-y-3 font-sans"
                  style={{
                    background: 'rgba(212,175,55,0.06)',
                    border: '1px solid rgba(212,175,55,0.25)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  }}
                >
                  <p className="font-bold text-luxury-gold flex items-center gap-1.5 uppercase tracking-[0.16em] text-[11px]">
                    <span>✨</span> Reservation Guarantee
                  </p>
                  <div className="space-y-2 text-xs text-white/80 leading-relaxed">
                    <div className="flex items-start gap-2.5">
                      <span className="text-luxury-gold font-bold shrink-0">✓</span>
                      <span><strong className="text-white font-semibold">100% Refundable Deposit:</strong> Free cancellation up to 2 hours prior.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-luxury-gold font-bold shrink-0">✓</span>
                      <span><strong className="text-white font-semibold">Instant Table Lock:</strong> Priority seating upon arrival.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: RAZORPAY FORM & PROMO DISCOUNTS ── */}
          <BookingForm
            restaurant={restaurant}
            onSubmit={handleBook}
            submitting={submitting}
            defaultDate={minDate}
            defaultTime={slots[0] || "19:00"}
            defaultGuests={2}
            minDate={minDate}
            timeSlots={slots}
          />

        </div>
      </div>
    </div>
  );
}
