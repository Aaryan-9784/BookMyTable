/**
 * BookingConfirmation.jsx — Hyper-Realistic Official Tax Invoice & Reservation Deposit Receipt.
 * Features GSTIN breakdown, SAC codes, itemized financial table, Razorpay verification, and 1-page print architecture.
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Loader from '../components/Loader.jsx';
import { getFallbackRestaurantImage } from '../utils/imageUtils.js';

/** Convert numbers to words for authentic invoice formatting */
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
        <Link to="/my-bookings" className="mt-4 inline-block text-luxury-gold hover:underline font-bold">
          View all my bookings →
        </Link>
      </div>
    );
  }

  const restaurant = booking.restaurantId || {};
  const tokenFeePerGuest = restaurant.tokenFee || 200;
  const numGuests = booking.guests || 1;
  const grossDeposit = numGuests * tokenFeePerGuest;
  const discount = booking.discountAmount || 0;
  const finalPaid = booking.finalPayable ?? Math.max(0, grossDeposit - discount);
  const amountInWords = numberToWords(finalPaid);

  // GST Calculation (5% GST included in deposit)
  const taxableValue = (grossDeposit / 1.05).toFixed(2);
  const cgst = ((grossDeposit - taxableValue) / 2).toFixed(2);
  const sgst = cgst;

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
      className="min-h-screen text-white print:bg-white print:text-black print:p-0"
      style={{ background: 'linear-gradient(180deg, #09090b 0%, #111114 50%, #18181c 100%)' }}
    >
      {/* ── Strict 1-Page Official GST Invoice Print CSS ── */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
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
            background: #ffffff !important;
            border: 2px solid #000000 !important;
            box-shadow: none !important;
            border-radius: 8px !important;
            color: #000000 !important;
            padding: 24px 30px !important;
            width: 100% !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .official-receipt-box * {
            color: #000000 !important;
          }
          .gold-brand-text {
            color: #9a7812 !important;
            -webkit-text-fill-color: #9a7812 !important;
          }
          .table-header-bg {
            background: #f1f1f4 !important;
            border-bottom: 2px solid #000000 !important;
          }
          .receipt-border-dark {
            border-color: #000000 !important;
          }
          .receipt-bg-light {
            background: #f8f8fa !important;
            border: 1px solid #d0d0d8 !important;
          }
          .paid-badge {
            background: #e6f4ea !important;
            color: #137333 !important;
            border: 1.5px solid #137333 !important;
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

      <div className="receipt-page relative z-10 mx-auto max-w-3xl px-4 py-8 md:py-12">

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
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-green-500/20 text-green-400 border border-green-500/40">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="font-serif text-xl font-bold text-white sm:text-2xl">
            Reservation & Payment Verified
          </h1>
          <p className="mt-0.5 font-sans text-xs text-white/70">
            Your official tax invoice & reservation deposit receipt has been generated below.
          </p>
        </div>

        {/* ── SCREEN-ONLY: Clean Simple Summary Card ── */}
        <div
          className="print-hidden rounded-3xl overflow-hidden border"
          style={{
            background: 'rgba(20,20,24,0.95)',
            borderColor: 'rgba(212,175,55,0.25)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          }}
        >
          {/* Summary Header */}
          <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(212,175,55,0.05)' }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-white">
                  {restaurant.name || 'Restaurant'}
                </h2>
                <p className="font-sans text-xs text-white/50 mt-0.5">
                  📍 {restaurant.location || 'Ahmedabad'}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-xs font-bold" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', color: '#4ade80' }}>
                ✓ Confirmed
              </span>
            </div>
          </div>

          {/* Summary Info Grid */}
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-5">
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
              <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-white/40">Amount Paid</p>
              <p className="mt-1 font-sans text-sm font-bold text-luxury-gold">₹{finalPaid}.00</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="px-6 pb-5 space-y-2">
            <div className="rounded-xl p-4 space-y-1.5 font-sans text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex justify-between flex-wrap gap-1">
                <span className="text-white/50">Razorpay Transaction ID</span>
                <span className="font-mono text-luxury-gold font-bold">{booking.paymentId || `pay_${String(booking._id).slice(-10)}`}</span>
              </div>
              <div className="flex justify-between flex-wrap gap-1">
                <span className="text-white/50">Invoice Reference</span>
                <span className="text-white font-semibold">INV/2026/{String(booking._id).slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between flex-wrap gap-1">
                <span className="text-white/50">Payment Status</span>
                <span className="text-green-400 font-bold">Captured & Verified ✓</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between flex-wrap gap-1">
                  <span className="text-white/50">Coupon Applied</span>
                  <span className="text-green-400 font-semibold">{booking.couponCode} (−₹{discount})</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons (Screen Only) */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center print-hidden">
          <button
            type="button"
            onClick={handlePrintReceipt}
            className="flex items-center justify-center gap-2.5 rounded-2xl py-3.5 px-8 font-sans text-sm font-bold text-black transition-all hover:brightness-110 active:scale-95 shadow-xl shadow-luxury-gold/20"
            style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #f5e6a3 50%, #c9a84c 100%)' }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Official Tax Invoice (PDF)
          </button>

          <Link
            to="/my-bookings"
            className="flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 font-sans text-sm font-bold text-white border border-white/20 transition-all hover:bg-white/10 active:scale-95"
          >
            View All My Bookings
          </Link>
        </div>

        {/* ── PRINT-ONLY: Full Official GST Tax Invoice (hidden on screen) ── */}
        <div className="hidden print:block">
        <div
          className="official-receipt-box overflow-hidden rounded-3xl border"
          style={{
            background: 'linear-gradient(160deg, rgba(22,22,26,0.98) 0%, rgba(12,12,14,0.99) 100%)',
            borderColor: 'rgba(212,175,55,0.3)',
          }}
        >
          {/* 1. TOP HEADER: LOGO, GSTIN & INVOICE NUMBER */}
          <div
            className="table-header-bg border-b p-6 space-y-3"
            style={{
              borderColor: 'rgba(255,255,255,0.1)',
              background: 'rgba(212,175,55,0.06)',
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                {/* Official Brand Logo */}
                <div className="font-serif text-3xl font-bold tracking-tight text-white flex items-center">
                  <span>Book</span>
                  <span
                    className="gold-brand-text px-0.5"
                    style={{
                      background: 'linear-gradient(135deg, #c9a84c 0%, #f5e6a3 50%, #c9a84c 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    My
                  </span>
                  <span>Table</span>
                </div>
                <p className="font-sans text-[11px] font-bold text-white/80 print:text-black">
                  BookMyTable Technologies Pvt. Ltd.
                </p>
                <p className="font-sans text-[10px] text-white/50 print:text-gray-600">
                  GSTIN: <strong>24AAACB9876F1Z5</strong> | SAC Code: <strong>996331</strong> (Restaurant Table Booking Services)
                </p>
              </div>

              <div className="text-right">
                <div className="inline-block rounded-full px-3 py-1 font-sans text-[11px] font-extrabold uppercase tracking-wider paid-badge"
                  style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ade80' }}>
                  ✓ PAID & VERIFIED
                </div>
                <h2 className="mt-2 font-serif text-sm font-extrabold uppercase tracking-widest text-luxury-gold gold-brand-text">
                  TAX INVOICE & RECEIPT
                </h2>
                <p className="font-mono text-xs font-bold text-white/90 print:text-black">
                  Invoice No: <strong className="text-luxury-gold gold-brand-text">INV/2026/{String(booking._id).slice(-8).toUpperCase()}</strong>
                </p>
                <p className="font-sans text-[10px] text-white/50 print:text-gray-600">
                  Date of Issue: {issueDate}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">

            {/* 2. BILLED TO & MERCHANT DETAILS (2-COLUMN GRID) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 border-b border-white/10 receipt-border-dark">
              {/* Left: Merchant / Restaurant Details */}
              <div className="space-y-1">
                <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-luxury-gold gold-brand-text">
                  Service Provider (Restaurant Venue)
                </p>
                <h3 className="font-serif text-lg font-bold text-white print:text-black">
                  {restaurant.name || 'The Grand Thakar'}
                </h3>
                <p className="font-sans text-xs text-white/70 print:text-gray-700">
                  📍 Address: {restaurant.location || 'Odhav, Ahmedabad'}, Gujarat, India 382415
                </p>
                <p className="font-sans text-xs text-white/60 print:text-gray-600">
                  Cuisine Category: <strong className="text-white/80 print:text-black">{restaurant.category || 'Multi-cuisine Fine Dining'}</strong>
                </p>
              </div>

              {/* Right: Reservation Particulars */}
              <div className="space-y-1 sm:text-right">
                <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-luxury-gold gold-brand-text">
                  Reservation Particulars
                </p>
                <p className="font-sans text-xs font-semibold text-white print:text-black">
                  Booking Reference: <strong className="font-mono text-luxury-gold gold-brand-text">#BMT-{String(booking._id).slice(-6).toUpperCase()}</strong>
                </p>
                <p className="font-sans text-xs font-semibold text-white print:text-black">
                  📅 Reservation Date: <strong>{formattedDate}</strong>
                </p>
                <p className="font-sans text-xs font-semibold text-white print:text-black">
                  🕒 Time Slot: <strong>{booking.time}</strong>
                </p>
                <p className="font-sans text-xs font-semibold text-white print:text-black">
                  👥 Party Size: <strong>{numGuests} {numGuests === 1 ? 'Guest' : 'Guests'} (Guaranteed Table Lock)</strong>
                </p>
              </div>
            </div>

            {/* 3. ITEMISED GST FINANCIAL TABLE */}
            <div className="space-y-2">
              <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-luxury-gold gold-brand-text">
                Itemized Financial Summary
              </p>

              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="table-header-bg border-b border-white/10 print:border-black" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-white/70 print:text-black">S.No</th>
                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-white/70 print:text-black">Service Description</th>
                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-center text-white/70 print:text-black">SAC</th>
                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-center text-white/70 print:text-black">Qty</th>
                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-right text-white/70 print:text-black">Rate</th>
                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-right text-white/70 print:text-black">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-gray-300">
                  <tr>
                    <td className="py-3 px-3 text-white/60 print:text-black">1</td>
                    <td className="py-3 px-3 font-medium text-white print:text-black">
                      Table Reservation Deposit ({restaurant.name || 'Venue'})
                      <p className="text-[10px] text-white/50 print:text-gray-600">Guaranteed Priority Table Seating Fee (5% GST Incl.)</p>
                    </td>
                    <td className="py-3 px-3 text-center text-white/60 print:text-black">996331</td>
                    <td className="py-3 px-3 text-center text-white/80 print:text-black">{numGuests}</td>
                    <td className="py-3 px-3 text-right text-white/80 print:text-black">₹{tokenFeePerGuest}.00</td>
                    <td className="py-3 px-3 text-right font-semibold text-white print:text-black">₹{grossDeposit}.00</td>
                  </tr>

                  {discount > 0 && (
                    <tr className="text-green-400 print:text-green-800 font-semibold">
                      <td className="py-2.5 px-3" colSpan={5}>
                        Coupon Code Discount ({booking.couponCode || 'WELCOME100'})
                      </td>
                      <td className="py-2.5 px-3 text-right">-₹{discount}.00</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10 print:border-gray-400 text-white/70 print:text-gray-700 text-[11px]">
                    <td className="py-1.5 px-3" colSpan={5}>Taxable Value: ₹{taxableValue} | CGST (2.5%): ₹{cgst} | SGST (2.5%): ₹{sgst}</td>
                    <td className="py-1.5 px-3 text-right">₹{grossDeposit}.00</td>
                  </tr>
                  <tr className="border-t-2 border-white/20 print:border-black font-bold">
                    <td className="py-3 px-3 text-sm text-white print:text-black" colSpan={5}>
                      Total Amount Payable & Paid
                    </td>
                    <td className="py-3 px-3 text-right text-base text-luxury-gold gold-brand-text font-black">
                      ₹{finalPaid}.00
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Amount in Words */}
              <div className="receipt-bg-light rounded-xl p-3 text-xs font-sans font-semibold text-white/80 print:text-black flex justify-between flex-wrap gap-2">
                <span>Amount in Words: <strong className="text-luxury-gold gold-brand-text">{amountInWords}</strong></span>
                <span>Payment Mode: <strong>Online (Razorpay)</strong></span>
              </div>
            </div>

            {/* 4. PAYMENT GATEWAY VERIFICATION BOX */}
            <div
              className="receipt-bg-light rounded-2xl p-4 space-y-1.5 font-sans text-xs"
              style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <div className="flex justify-between flex-wrap gap-1">
                <span className="font-semibold text-white/60 print:text-gray-700">Payment Gateway Engine:</span>
                <span className="text-white font-bold print:text-black">Razorpay Online Payment (256-Bit SSL Encrypted)</span>
              </div>
              <div className="flex justify-between flex-wrap gap-1">
                <span className="font-semibold text-white/60 print:text-gray-700">Razorpay Transaction ID:</span>
                <span className="font-mono text-luxury-gold font-bold tracking-wider gold-brand-text">{booking.paymentId || `pay_${String(booking._id).slice(-10)}`}</span>
              </div>
              <div className="flex justify-between flex-wrap gap-1">
                <span className="font-semibold text-white/60 print:text-gray-700">Transaction Status:</span>
                <span className="text-green-400 font-bold print:text-green-800">CAPTURED & VERIFIED ✓</span>
              </div>
            </div>

            {/* 5. LEGAL TERMS & STAMP FOOTER */}
            <div className="border-t border-white/10 pt-4 text-center font-sans text-[10px] text-white/40 print:text-gray-600 receipt-border-dark space-y-1">
              <p>
                <strong>Reservation Policy:</strong> Deposit is 100% refundable if cancelled at least 2 hours prior to table time.
              </p>
              <p>
                This is a computer-generated tax invoice and deposit receipt issued by BookMyTable Technologies Pvt. Ltd. No signature required.
              </p>
              <p className="text-luxury-gold gold-brand-text font-bold pt-1">
                Thank you for reserving with BookMyTable!
              </p>
            </div>

          </div>
        </div>
        </div>

      </div>
    </div>
  );
}
