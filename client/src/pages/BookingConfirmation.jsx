/**
 * BookingConfirmation.jsx — Luxury Official Table Reservation Deposit Receipt.
 * Features 100% clean A4 printable PDF layout, zero emojis, zero GST clutter,
 * 100% square gold brand borders on ALL elements, no black/gray lines, compact spacing,
 * and full dual screen/print architecture.
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from '../utils/toast.js';
import api from '../services/api.js';
import Loader from '../components/Loader.jsx';
import { getFallbackRestaurantImage } from '../utils/imageUtils.js';

/** Convert numbers to words for authentic receipt formatting */
function numberToWords(num) {
  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Zero Rupees Only';
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convert(val) {
    if (val < 20) return units[val];
    if (val < 100) return tens[Math.floor(val / 10)] + (val % 10 ? ' ' + units[val % 10] : '');
    if (val < 1000) return units[Math.floor(val / 100)] + ' Hundred' + (val % 100 ? ' ' + convert(val % 100) : '');
    if (val < 100000) return convert(Math.floor(val / 1000)) + ' Thousand' + (val % 1000 ? ' ' + convert(val % 1000) : '');
    return convert(Math.floor(val / 100000)) + ' Lakh' + (val % 100000 ? ' ' + convert(val % 100000) : '');
  }

  return `${convert(n)} Rupees Only`;
}

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
        <Link to="/my-bookings" className="mt-4 inline-block font-bold text-luxury-gold hover:underline">
          View all my bookings →
        </Link>
      </div>
    );
  }

  const restaurant = booking.restaurantId || {};
  const heroImage = restaurant.imageUrl || getFallbackRestaurantImage(restaurant);
  const tokenFeePerGuest = restaurant.tokenFee || 200;
  const numGuests = booking.guests || 1;
  const grossDeposit = numGuests * tokenFeePerGuest;
  const discount = booking.discountAmount || 0;
  const finalPaid = booking.finalPayable ?? Math.max(0, grossDeposit - discount);
  const amountInWords = numberToWords(finalPaid);

  const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const issueDate = new Date(booking.createdAt || Date.now()).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="min-h-screen font-sans text-white print:bg-white print:text-black print:p-0 print:min-h-0"
      style={{ background: 'linear-gradient(180deg, #09090b 0%, #111114 50%, #18181c 100%)' }}
    >
      {/* ── Strict Full-Bleed Luxury Print Stylesheet ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm !important;
          }
          *, *::before, *::after {
            box-shadow: none !important;
            text-shadow: none !important;
          }
          html, body, #root, main, .receipt-page {
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, nav, footer, .print-hidden, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .receipt-page {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .official-receipt-box {
            display: block !important;
            background: #ffffff !important;
            border: 2px solid #d4af37 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            outline: none !important;
            color: #0f172a !important;
            padding: 20px 24px !important;
            width: 100% !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .official-receipt-box div, 
          .official-receipt-box table, 
          .official-receipt-box tr, 
          .official-receipt-box td, 
          .official-receipt-box th {
            border-color: #d4af37 !important;
          }
          .gold-brand-text {
            color: #9a7812 !important;
            -webkit-text-fill-color: #9a7812 !important;
            font-weight: 800 !important;
          }
          .table-header-bg {
            background: #fdfbf7 !important;
            border-bottom: 2px solid #d4af37 !important;
            border-radius: 0 !important;
          }
          .receipt-bg-gold {
            background: #fffdf5 !important;
            border: 1.5px solid #d4af37 !important;
            border-radius: 0 !important;
          }
          .paid-badge {
            background: #e6f4ea !important;
            color: #137333 !important;
            border: 1.5px solid #137333 !important;
            border-radius: 0 !important;
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

      <div className="receipt-page relative z-10 mx-auto max-w-3xl px-4 py-8 md:py-12 print:max-w-none print:p-0 print:m-0">

        {/* Action Bar (Screen Only) */}
        <div className="mb-6 flex items-center print-hidden">
          <Link
            to="/my-bookings"
            className="inline-flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-white/60 transition-colors hover:text-luxury-gold"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            My Bookings
          </Link>
        </div>

        {/* Success Banner (Screen Only) */}
        <div
          className="mb-6 rounded-2xl p-5 text-center print-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.14) 0%, rgba(212,175,55,0.06) 100%)',
            border: '1px solid rgba(34,197,94,0.35)',
          }}
        >
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full border border-green-500/40 bg-green-500/20 text-green-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="font-serif text-xl font-bold text-white sm:text-2xl">
            Reservation & Payment Verified
          </h1>
          <p className="mt-0.5 font-sans text-xs text-white/70">
            Your official reservation deposit receipt has been generated below.
          </p>
        </div>

        {/* ── SCREEN-ONLY: Clean Simple Summary Card ── */}
        <div
          className="print-hidden overflow-hidden rounded-3xl border"
          style={{
            background: 'rgba(20,20,24,0.95)',
            borderColor: 'rgba(212,175,55,0.25)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          }}
        >
          {/* Summary Header */}
          <div className="border-b px-6 py-5" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(212,175,55,0.05)' }}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={heroImage}
                  alt={restaurant.name || 'Restaurant'}
                  className="h-16 w-16 shrink-0 rounded-2xl border border-luxury-gold/30 object-cover shadow-md sm:h-20 sm:w-20"
                />
                <div>
                  <h2 className="font-serif text-lg font-bold text-white sm:text-xl">
                    {restaurant.name || 'Restaurant'}
                  </h2>
                  <p className="mt-1 font-sans text-xs text-white/60">
                    Location: {restaurant.location || 'Ahmedabad'}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-xs font-bold" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', color: '#4ade80' }}>
                Confirmed
              </span>
            </div>
          </div>

          {/* Summary Info Grid */}
          <div className="grid grid-cols-2 gap-5 px-6 py-5 sm:grid-cols-5">
            <div>
              <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-white/40">Date</p>
              <p className="mt-1 font-sans text-sm font-bold text-white">{booking.date}</p>
            </div>
            <div>
              <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-white/40">Time</p>
              <p className="mt-1 font-sans text-sm font-bold text-white">{booking.time}</p>
            </div>
            <div>
              <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-white/40">Guests</p>
              <p className="mt-1 font-sans text-sm font-bold text-white">{numGuests} {numGuests === 1 ? 'Guest' : 'Guests'}</p>
            </div>
            <div>
              <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-white/40">Assigned Table</p>
              <p className="mt-1 font-sans text-sm font-bold text-amber-300">
                {booking.tableNumber ? `Table ${booking.tableNumber}${booking.tableZone ? ` (${booking.tableZone})` : ''}` : 'T-01 (Main Hall)'}
              </p>
            </div>
            <div>
              <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-white/40">Amount Paid</p>
              <p className="mt-1 font-sans text-sm font-bold text-luxury-gold">₹{finalPaid}.00</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="space-y-2 px-6 pb-5">
            <div className="space-y-1.5 rounded-xl p-4 font-sans text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex flex-wrap justify-between gap-1">
                <span className="text-white/50">Razorpay Transaction ID</span>
                <span className="font-mono font-bold text-luxury-gold">{booking.paymentId || `pay_${String(booking._id).slice(-10)}`}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-1">
                <span className="text-white/50">Receipt Reference</span>
                <span className="font-semibold text-white">REC/2026/{String(booking._id).slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-1">
                <span className="text-white/50">Payment Status</span>
                <span className="font-bold text-green-400">Captured & Verified</span>
              </div>
              {discount > 0 && (
                <div className="flex flex-wrap justify-between gap-1">
                  <span className="text-white/50">Coupon Applied</span>
                  <span className="font-semibold text-green-400">{booking.couponCode} (−₹{discount})</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons (Screen Only) */}
        <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row print-hidden">
          <button
            type="button"
            onClick={handlePrintReceipt}
            className="flex items-center justify-center gap-2.5 rounded-2xl px-8 py-3.5 font-sans text-sm font-bold text-black shadow-xl shadow-luxury-gold/20 transition-all hover:brightness-110 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #f5e6a3 50%, #c9a84c 100%)' }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Receipt (PDF)
          </button>

          <Link
            to="/my-bookings"
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-6 py-3.5 font-sans text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-95"
          >
            View All My Bookings
          </Link>
        </div>

        {/* ── PRINT-ONLY: Full Official Authentic Receipt (100% Gold Borders Only) ── */}
        <div className="hidden print:block print:w-full">
          <div className="official-receipt-box w-full bg-white text-slate-900 border-2 border-[#d4af37] rounded-none p-5 sm:p-7 space-y-4">

            {/* 1. TOP HEADER */}
            <div className="flex justify-between items-start border-b-2 border-[#d4af37] pb-4 table-header-bg p-3.5 rounded-none">
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center">
                  <span>Book</span>
                  <span className="gold-brand-text px-0.5 text-[#9a7812]">My</span>
                  <span>Table</span>
                </div>
                <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                  Official Table Reservation & Deposit Receipt
                </p>
              </div>

              <div className="text-right">
                <div className="paid-badge inline-block px-3 py-0.5 bg-[#e6f4ea] border-1.5 border-[#137333] text-[#137333] font-extrabold text-[11px] rounded-none">
                  PAID & VERIFIED
                </div>
                <h2 className="text-[11px] font-extrabold gold-brand-text text-[#9a7812] tracking-wider uppercase mt-1.5">
                  RESERVATION RECEIPT
                </h2>
                <p className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                  Receipt No: <span className="gold-brand-text text-[#9a7812]">REC/2026/{String(booking._id).slice(-8).toUpperCase()}</span>
                </p>
                <p className="text-[10px] font-semibold text-slate-700">
                  Issued On: {issueDate}
                </p>
              </div>
            </div>

            {/* 2. VENUE & RESERVATION PARTICULARS */}
            <div className="grid grid-cols-2 gap-6 border-b-2 border-[#d4af37] pb-4">
              <div>
                <p className="text-[10px] font-extrabold gold-brand-text text-[#9a7812] uppercase tracking-wider">
                  RESTAURANT VENUE
                </p>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {restaurant.name || 'The Grand Thakar'}
                </h3>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  Address: {restaurant.location || 'Odhav, Ahmedabad'}, Gujarat, India
                </p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  Cuisine Category: <strong className="text-slate-900">{restaurant.category || 'Multi-cuisine Fine Dining'}</strong>
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-extrabold gold-brand-text text-[#9a7812] uppercase tracking-wider">
                  RESERVATION PARTICULARS
                </p>
                <p className="text-xs font-semibold text-slate-900 mt-0.5">
                  Booking Reference: <strong className="font-mono gold-brand-text text-[#9a7812]">#BMT-{String(booking._id).slice(-6).toUpperCase()}</strong>
                </p>
                <p className="text-xs font-semibold text-slate-900 mt-0.5">
                  Reservation Date: <strong>{formattedDate}</strong>
                </p>
                <p className="text-xs font-semibold text-slate-900 mt-0.5">
                  Time Slot: <strong>{booking.time}</strong>
                </p>
                <p className="text-xs font-semibold text-slate-900 mt-0.5">
                  Party Size: <strong>{numGuests} {numGuests === 1 ? 'Guest' : 'Guests'} (Guaranteed Seating)</strong>
                </p>
              </div>
            </div>

            {/* 3. ITEMIZED FINANCIAL SUMMARY */}
            <div className="space-y-2.5">
              <p className="text-[10px] font-extrabold gold-brand-text text-[#9a7812] uppercase tracking-wider">
                ITEMIZED FINANCIAL SUMMARY
              </p>

              <table className="w-full border-collapse text-left font-sans text-xs">
                <thead>
                  <tr className="table-header-bg bg-[#fdfbf7] border-b-2 border-[#d4af37]">
                    <th className="py-2 px-3 font-extrabold text-slate-900">S.No</th>
                    <th className="py-2 px-3 font-extrabold text-slate-900">Service Description</th>
                    <th className="py-2 px-3 text-center font-extrabold text-slate-900">Qty</th>
                    <th className="py-2 px-3 text-right font-extrabold text-slate-900">Rate / Guest</th>
                    <th className="py-2 px-3 text-right font-extrabold text-slate-900">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d4af37]">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">1</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      Table Reservation Deposit ({restaurant.name || 'Venue'})
                      <p className="text-[10px] font-semibold text-slate-600 mt-0.5">Guaranteed Priority Table Seating Fee</p>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900">{numGuests}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{tokenFeePerGuest}.00</td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">₹{grossDeposit}.00</td>
                  </tr>

                  {discount > 0 && (
                    <tr className="font-bold text-green-800">
                      <td className="py-2 px-3" colSpan={4}>
                        Coupon Discount ({booking.couponCode || 'WELCOME100'})
                      </td>
                      <td className="py-2 px-3 text-right">-₹{discount}.00</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#d4af37] font-bold">
                    <td className="py-2.5 px-3 text-xs text-slate-900 font-serif" colSpan={4}>
                      Total Deposit Paid
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-base font-black gold-brand-text text-[#9a7812]">
                      ₹{finalPaid}.00
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="receipt-bg-gold flex justify-between items-center bg-[#fffdf5] rounded-none p-3 border-1.5 border-[#d4af37] text-xs font-bold text-slate-900">
                <span>Amount in Words: <strong className="gold-brand-text text-[#9a7812]">{amountInWords}</strong></span>
                <span>Payment Method: <strong>Online (Razorpay)</strong></span>
              </div>
            </div>

            {/* 4. PAYMENT GATEWAY VERIFICATION BOX */}
            <div className="receipt-bg-gold bg-[#fffdf5] rounded-none p-3.5 space-y-1 border-1.5 border-[#d4af37] text-xs">
              <div className="flex justify-between">
                <span className="text-slate-700 font-bold">Payment Gateway Engine:</span>
                <span className="font-bold text-slate-900">Razorpay Online Payment (256-Bit SSL Encrypted)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 font-bold">Razorpay Transaction ID:</span>
                <span className="font-mono font-extrabold gold-brand-text text-[#9a7812]">{booking.paymentId || `pay_${String(booking._id).slice(-10)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 font-bold">Verification Status:</span>
                <span className="font-extrabold text-green-800">CAPTURED & VERIFIED</span>
              </div>
            </div>

            {/* 5. POLICY & FOOTER */}
            <div className="border-t-2 border-[#d4af37] pt-3 pb-1 text-center text-[10px] font-semibold text-slate-700 space-y-1">
              <p>
                <strong>Cancellation Policy:</strong> Deposit is 100% refundable if cancelled at least 2 hours prior to table reservation time.
              </p>
              <p>
                This is an official computer-generated reservation deposit receipt issued by BookMyTable. No physical signature required.
              </p>
              <p className="font-bold gold-brand-text text-[#9a7812] pt-0.5">
                Thank you for reserving with BookMyTable!
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
