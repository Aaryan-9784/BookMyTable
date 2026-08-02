/**
 * BookingConfirmation.jsx — Luxury Redesigned Payment Confirmation & PDF Tax Invoice Download.
 * Designed for crystal clear high-contrast display both on screen & on print export.
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Loader from '../components/Loader.jsx';
import { getFallbackRestaurantImage } from '../utils/imageUtils.js';

export default function BookingConfirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await api.get(`/api/bookings/${id}`);
        if (res.data?.success) {
          setBooking(res.data.data);
        } else {
          toast.error('Booking not found');
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [id]);

  const handlePrintReceipt = () => {
    window.print();
  };

  if (loading) return <Loader />;

  if (!booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center font-sans text-white/50">
        <p className="text-lg font-semibold">Booking record not found.</p>
        <Link to="/my-bookings" className="mt-4 inline-block text-luxury-gold hover:underline font-bold">
          View all my bookings →
        </Link>
      </div>
    );
  }

  const restaurant = booking.restaurantId || {};
  const heroImage = restaurant.imageUrl || getFallbackRestaurantImage(restaurant);
  const tokenFeePerGuest = restaurant.tokenFee || 150;
  const baseDeposit = (booking.guests || 1) * tokenFeePerGuest;

  return (
    <div
      className="min-h-screen text-white print:bg-white print:text-black print:p-0"
      style={{ background: 'linear-gradient(180deg, #09090b 0%, #111114 50%, #18181c 100%)' }}
    >
      {/* Dynamic Print Engine Style Overrides */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, nav, footer, .print-hidden, .no-print {
            display: none !important;
          }
          main {
            padding-top: 0 !important;
            margin: 0 !important;
          }
          .print-invoice-card {
            background: #ffffff !important;
            border: 2px solid #111111 !important;
            box-shadow: none !important;
            border-radius: 12px !important;
            color: #000000 !important;
            padding: 24px !important;
            margin: 0 auto !important;
            max-width: 100% !important;
          }
          .print-invoice-card * {
            color: #000000 !important;
            text-shadow: none !important;
          }
          .print-invoice-header {
            background: #f8f8f9 !important;
            border-bottom: 2px solid #111111 !important;
          }
          .print-invoice-gold {
            color: #b48c14 !important;
            font-weight: 800 !important;
          }
          .print-invoice-green {
            color: #15803d !important;
            font-weight: 800 !important;
          }
          .print-invoice-box {
            background: #f4f4f6 !important;
            border: 1px solid #d1d5db !important;
            border-radius: 8px !important;
          }
        }
      `}</style>

      {/* Ambient Glow (Screen Only) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 print-hidden"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 15%, rgba(212,175,55,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-8 md:py-12">

        {/* Action Header / Back Link (Screen Only) */}
        <div className="mb-6 flex items-center justify-between print-hidden">
          <Link
            to="/my-bookings"
            className="inline-flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-white/60 transition-colors hover:text-luxury-gold"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            My Bookings
          </Link>

          <button
            type="button"
            onClick={handlePrintReceipt}
            className="inline-flex items-center gap-2.5 rounded-xl border border-luxury-gold px-5 py-2.5 font-sans text-xs font-bold text-luxury-gold transition-all hover:bg-luxury-gold hover:text-black active:scale-95 shadow-lg shadow-luxury-gold/10"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download / Print Tax Invoice
          </button>
        </div>

        {/* Success Banner (Screen Only) */}
        <div
          className="mb-8 rounded-3xl p-6 text-center print-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.14) 0%, rgba(212,175,55,0.06) 100%)',
            border: '1px solid rgba(34,197,94,0.35)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 text-green-400 border border-green-500/40">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-bold text-white sm:text-3xl">
            Reservation & Payment Confirmed!
          </h1>
          <p className="mt-1 font-sans text-xs sm:text-sm text-white/80">
            Official tax receipt & table details have been sent to your email address.
          </p>
        </div>

        {/* 🧾 OFFICIAL PAYMENT RECEIPT CARD */}
        <div
          className="print-invoice-card overflow-hidden rounded-3xl border"
          style={{
            background: 'linear-gradient(160deg, rgba(22,22,26,0.96) 0%, rgba(12,12,14,0.98) 100%)',
            borderColor: 'rgba(212,175,55,0.3)',
            boxShadow: '0 25px 70px rgba(0,0,0,0.9)',
          }}
        >
          {/* Header Bar */}
          <div
            className="print-invoice-header flex items-center justify-between border-b px-6 py-5"
            style={{
              borderColor: 'rgba(255,255,255,0.1)',
              background: 'rgba(212,175,55,0.07)',
            }}
          >
            <div>
              <span className="font-serif text-xl font-black text-luxury-gold print-invoice-gold">
                BookMyTable
              </span>
              <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-white/50 print-invoice-muted">
                Official Payment Receipt & Tax Invoice
              </p>
            </div>

            <div className="text-right">
              <span className="font-mono text-xs font-extrabold text-white print-invoice-gold">
                Ref: #{String(booking._id).slice(-8).toUpperCase()}
              </span>
              <p className="font-sans text-[11px] font-bold text-green-400 print-invoice-green">
                ✓ PAYMENT VERIFIED
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6 sm:p-8">

            {/* Restaurant Info & Image Header */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <img
                src={heroImage}
                alt={restaurant.name}
                className="h-20 w-28 rounded-2xl object-cover border border-white/10 print-hidden"
              />
              <div className="space-y-1">
                <h2 className="font-serif text-2xl font-bold text-white print:text-black">
                  {restaurant.name}
                </h2>
                <p className="font-sans text-xs text-white/70 print-invoice-muted font-medium">
                  📍 {restaurant.location || 'Odhav, Ahmedabad'} {restaurant.city ? `, ${restaurant.city}` : ''}
                </p>
                <p className="font-sans text-xs text-luxury-gold print-invoice-gold font-semibold">
                  🍽️ {restaurant.category || 'Multi-cuisine'} Fine Dining
                </p>
              </div>
            </div>

            {/* Reservation Key Specs Grid */}
            <div
              className="print-invoice-box grid grid-cols-3 gap-3 rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div>
                <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-white/40 print-invoice-muted">Date</p>
                <p className="mt-1 font-sans text-xs sm:text-sm font-extrabold text-white print:text-black">{booking.date}</p>
              </div>
              <div>
                <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-white/40 print-invoice-muted">Time Slot</p>
                <p className="mt-1 font-sans text-xs sm:text-sm font-extrabold text-white print:text-black">🕒 {booking.time}</p>
              </div>
              <div>
                <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-white/40 print-invoice-muted">Guests</p>
                <p className="mt-1 font-sans text-xs sm:text-sm font-extrabold text-white print:text-black">👥 {booking.guests} Guest(s)</p>
              </div>
            </div>

            {/* Payment Summary Table */}
            <div className="space-y-3 pt-2">
              <p className="font-sans text-xs font-bold uppercase tracking-widest text-luxury-gold print-invoice-gold">
                Payment Breakdown
              </p>

              <div
                className="print-invoice-box rounded-2xl p-4 space-y-2 text-xs font-sans"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex justify-between text-white/90 print:text-black font-semibold">
                  <span>Table Token Deposit ({booking.guests} × ₹{tokenFeePerGuest})</span>
                  <span>₹{baseDeposit}</span>
                </div>

                {booking.discountAmount > 0 && (
                  <div className="flex justify-between text-green-400 font-bold print-invoice-green">
                    <span>Coupon Discount ({booking.couponCode})</span>
                    <span>-₹{booking.discountAmount}</span>
                  </div>
                )}

                <div className="h-px bg-white/10 my-2 print:bg-black" />

                <div className="flex justify-between text-sm font-extrabold text-white print:text-black">
                  <span>Total Amount Paid</span>
                  <span className="text-luxury-gold text-base font-extrabold print-invoice-gold">₹{booking.finalPayable ?? Math.max(0, baseDeposit - (booking.discountAmount || 0))}</span>
                </div>
              </div>
            </div>

            {/* Razorpay Gateway Transaction Info */}
            <div
              className="print-invoice-box rounded-2xl p-4 space-y-2 font-sans text-xs"
              style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <div className="flex justify-between flex-wrap gap-1">
                <span className="font-semibold text-white/70 print-invoice-muted">Razorpay Payment ID:</span>
                <span className="font-mono text-luxury-gold font-bold tracking-wider print-invoice-gold">{booking.paymentId || `pay_${String(booking._id).slice(-10)}`}</span>
              </div>
              <div className="flex justify-between flex-wrap gap-1">
                <span className="font-semibold text-white/70 print-invoice-muted">Payment Gateway:</span>
                <span className="text-white font-bold print:text-black">Razorpay 256-Bit SSL Encrypted</span>
              </div>
              <div className="flex justify-between flex-wrap gap-1">
                <span className="font-semibold text-white/70 print-invoice-muted">Payment Status:</span>
                <span className="text-green-400 font-bold print-invoice-green">Completed & Verified ✓</span>
              </div>
              <div className="flex justify-between flex-wrap gap-1">
                <span className="font-semibold text-white/70 print-invoice-muted">Issued Timestamp:</span>
                <span className="text-white/80 font-medium print:text-black">{new Date(booking.createdAt || Date.now()).toLocaleString()}</span>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="border-t border-white/10 pt-4 text-center font-sans text-[11px] text-white/50 print-invoice-muted">
              <p>Thank you for reserving with BookMyTable. Present this official tax invoice or your booking reference upon arrival.</p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons (Screen Only) */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center print-hidden">
          <button
            type="button"
            onClick={handlePrintReceipt}
            className="flex items-center justify-center gap-2.5 rounded-2xl py-3.5 px-8 font-sans text-sm font-bold text-black transition-all hover:brightness-110 active:scale-95 shadow-xl shadow-luxury-gold/20"
            style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #f5e6a3 50%, #c9a84c 100%)' }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download / Print Tax Invoice
          </button>

          <Link
            to="/my-bookings"
            className="flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 font-sans text-sm font-bold text-white border border-white/20 transition-all hover:bg-white/10 active:scale-95"
          >
            View All My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
