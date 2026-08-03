/**
 * Upgraded BookingForm Component — Single Promo Code Enforcement & Guest Count Validation.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { getFallbackRestaurantImage } from '../utils/imageUtils.js';
import { useAuth } from '../context/AuthContext.jsx';

import { getZoneTokenFee, DINING_ZONES_META } from '../utils/zoneFeeUtils.js';

const fieldBase = [
  'w-full rounded-xl border bg-white/[0.04] px-4 py-3.5 font-sans text-sm text-white',
  'placeholder:text-white/20 transition-all duration-200 focus:outline-none',
  'border-white/10 focus:border-luxury-gold/50 focus:ring-1 focus:ring-luxury-gold/20',
  'hover:border-white/20',
].join(' ');

/** Valid coupon codes with guest count thresholds */
const VALID_COUPONS = {
  WELCOME100: { code: 'WELCOME100', label: 'Welcome Discount', type: 'flat', amount: 100, minGuests: 1, desc: '₹100 OFF on deposit' },
  GROUP10: { code: 'GROUP10', label: 'Group Party (10+ guests)', type: 'percent', amount: 10, minGuests: 10, desc: '10% OFF group discount' },
  FEAST15: { code: 'FEAST15', label: 'Grand Gathering (15+ guests)', type: 'percent', amount: 15, minGuests: 15, desc: '15% OFF group discount' },
  BANQUET20: { code: 'BANQUET20', label: 'Banquet Tier (20+ guests)', type: 'percent', amount: 20, minGuests: 20, desc: '20% OFF group discount' },
  CELEBRATE25: { code: 'CELEBRATE25', label: 'Celebration Tier (25+ guests)', type: 'percent', amount: 25, minGuests: 25, desc: '25% OFF group discount' },
  GIGA50: { code: 'GIGA50', label: 'Mega Event (50+ guests)', type: 'percent', amount: 30, minGuests: 50, desc: '30% OFF group discount' },
  ROYAL75: { code: 'ROYAL75', label: 'Royal Gala (75+ guests)', type: 'percent', amount: 35, minGuests: 75, desc: '35% OFF group discount' },
  TITAN100: { code: 'TITAN100', label: 'Grand Titan (100+ guests)', type: 'percent', amount: 40, minGuests: 100, desc: '40% OFF group discount' },
  VIPINFINITY: { code: 'VIPINFINITY', label: 'VIP Executive (>100 guests)', type: 'percent', amount: 50, minGuests: 101, desc: '50% OFF VIP Group Discount' },
};

function getUnlockedGroupCoupon(numGuests) {
  const g = Number(numGuests) || 0;
  if (g > 100) return VALID_COUPONS.VIPINFINITY;
  if (g >= 100) return VALID_COUPONS.TITAN100;
  if (g >= 75) return VALID_COUPONS.ROYAL75;
  if (g >= 50) return VALID_COUPONS.GIGA50;
  if (g >= 25) return VALID_COUPONS.CELEBRATE25;
  if (g >= 20) return VALID_COUPONS.BANQUET20;
  if (g >= 15) return VALID_COUPONS.FEAST15;
  if (g >= 10) return VALID_COUPONS.GROUP10;
  return null;
}

/** Dynamically load Razorpay SDK */
function loadRazorpaySDK() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* ── Portal Time Dropdown ── */
function TimeSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setMenuStyle({ position: 'fixed', top: r.bottom + 6, left: r.left, width: r.width, zIndex: 9999 });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)) setOpen(false);
    };
    const closeScroll = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', closeScroll, true);
    return () => { document.removeEventListener('mousedown', close); window.removeEventListener('scroll', closeScroll, true); };
  }, [open]);

  const menu = open ? createPortal(
    <div
      ref={menuRef}
      style={{
        ...menuStyle,
        background: '#111113',
        border: '1px solid rgba(212,175,55,0.25)',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.95)',
        overflow: 'hidden auto',
        maxHeight: '240px',
        paddingTop: '4px',
        paddingBottom: '4px',
      }}
    >
      {options.map((t) => {
        const isActive = t === value;
        return (
          <button
            key={t}
            type="button"
            onClick={() => { onChange(t); setOpen(false); }}
            className="flex w-full items-center justify-between px-4 py-2.5 font-sans text-sm transition-all duration-150"
            style={{ background: isActive ? 'rgba(212,175,55,0.14)' : 'transparent', color: isActive ? '#d4af37' : 'rgba(255,255,255,0.75)' }}
            onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; e.currentTarget.style.color = '#fff'; } }}
            onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; } }}
          >
            <span className="font-semibold">{t}</span>
            {isActive && (
              <svg className="h-4 w-4" style={{ color: '#d4af37' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        );
      })}
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-[50px] w-full items-center justify-between rounded-xl px-4 font-sans text-sm text-white transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: open ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: open ? '0 0 0 3px rgba(212,175,55,0.08)' : 'none',
        }}
      >
        <span className="font-semibold">{value || 'Select time'}</span>
        <svg className="h-4 w-4 shrink-0 transition-transform duration-200" style={{ color: 'rgba(212,175,55,0.7)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {menu}
    </div>
  );
}

function IconCalendar() {
  return (
    <svg className="h-4 w-4 text-luxury-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg className="h-4 w-4 text-luxury-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconGuests() {
  return (
    <svg className="h-4 w-4 text-luxury-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

export default function BookingForm({
  restaurant = {},
  onSubmit,
  submitting = false,
  defaultDate = '',
  defaultTime = '',
  defaultGuests = 2,
  defaultZone = 'Fine Dining',
  minDate = '',
  timeSlots = null,
}) {
  const { email: authEmail, profile, displayName } = useAuth();
  const resolvedDefault = timeSlots?.length
    ? (defaultTime && timeSlots.includes(defaultTime) ? defaultTime : timeSlots[0])
    : defaultTime;

  // Generate Check-Out time slots from 11:30 to 23:00 (11:30 AM to 11:00 PM)
  const checkOutSlots = (() => {
    const slots = [];
    for (let m = 690; m <= 1380; m += 30) {
      const hh = Math.floor(m / 60);
      const mm = m % 60;
      slots.push(`${String(hh).padStart(2, '0')}:${mm === 0 ? '00' : '30'}`);
    }
    return slots;
  })();

  const [date, setDate] = useState(defaultDate);
  const [selectedTime, setSelectedTime] = useState(resolvedDefault);
  const [checkOutTime, setCheckOutTime] = useState(() => {
    if (!resolvedDefault) return '12:30';
    const [h, m] = resolvedDefault.split(':').map((v) => parseInt(v, 10) || 0);
    const outMins = Math.min(1380, Math.max(690, h * 60 + m + 90)); // default +1.5 hrs
    const outH = Math.floor(outMins / 60);
    const outM = outMins % 60;
    return `${String(outH).padStart(2, '0')}:${outM === 0 ? '00' : '30'}`;
  });
  const [guests, setGuests] = useState(defaultGuests);
  const [selectedZone, setSelectedZone] = useState(defaultZone);
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);

  /* Table Selection & Availability State */
  const [tablesList, setTablesList] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [tableError, setTableError] = useState('');

  useEffect(() => {
    if (!restaurant?._id || !date || !selectedTime) return;
    let cancelled = false;
    setLoadingTables(true);
    setTableError('');

    api.get(`/api/restaurants/${restaurant._id}/tables`, {
      params: { date, time: selectedTime, guests: Number(guests) || 1 }
    }).then(({ data }) => {
      if (cancelled) return;
      const allTables = data?.tables || [];
      setTablesList(allTables);

      if (allTables.length > 0) {
        const numG = Number(guests) || 1;
        const availableTables = allTables.filter((t) => t.isAvailable);

        if (availableTables.length === 0) {
          setTableError(`No tables available at ${selectedTime} on ${date}. All tables are reserved.`);
          setSelectedTableId('');
        } else {
          // Find available tables that fit party size
          const fittingTables = availableTables
            .filter((t) => Number(t.capacity) >= numG)
            .sort((a, b) => Number(a.capacity) - Number(b.capacity));

          if (fittingTables.length > 0) {
            // Auto-select best matching table if current selected is invalid or not in fittingTables
            if (!selectedTableId || !fittingTables.some((t) => String(t._id) === String(selectedTableId))) {
              setSelectedTableId(fittingTables[0]._id);
            }
            setTableError('');
          } else {
            const maxCap = Math.max(...availableTables.map((t) => Number(t.capacity) || 0), 0);
            setTableError(`No single table available for ${numG} guests. Maximum available single table capacity is ${maxCap} seats.`);
            setSelectedTableId('');
          }
        }
      } else {
        setSelectedTableId('');
        setTableError('');
      }
    }).catch(() => {
      if (!cancelled) setTablesList([]);
    }).finally(() => {
      if (!cancelled) setLoadingTables(false);
    });

    return () => { cancelled = true; };
  }, [restaurant?._id, date, selectedTime, guests]);

  // Auto adjust checkOutTime when selectedTime (check-in) changes
  useEffect(() => {
    if (!selectedTime) return;
    const [inH, inM] = selectedTime.split(':').map((v) => parseInt(v, 10) || 0);
    const inMins = inH * 60 + inM;
    const [outH, outM] = (checkOutTime || '').split(':').map((v) => parseInt(v, 10) || 0);
    const outMins = outH * 60 + outM;

    if (outMins <= inMins) {
      const targetMins = Math.min(1380, Math.max(690, inMins + 90));
      const hh = Math.floor(targetMins / 60);
      const mm = targetMins % 60;
      setCheckOutTime(`${String(hh).padStart(2, '0')}:${mm === 0 ? '00' : '30'}`);
    }
  }, [selectedTime]);

  // Auto calculate duration in minutes & formatted text
  const calculateDuration = (inT, outT) => {
    if (!inT || !outT) return { mins: 90, formatted: '1 hr 30 mins' };
    const [inH, inM] = inT.split(':').map((v) => parseInt(v, 10) || 0);
    const [outH, outM] = outT.split(':').map((v) => parseInt(v, 10) || 0);
    
    let diff = (outH * 60 + outM) - (inH * 60 + inM);
    if (diff <= 0) diff += 24 * 60; // handle post-midnight checkout
    
    const h = Math.floor(diff / 60);
    const m = Math.round(diff % 60);
    
    let formatted = '';
    if (h > 0 && m > 0) formatted = `${h} hr${h > 1 ? 's' : ''} ${m} min${m > 1 ? 's' : ''}`;
    else if (h > 0) formatted = `${h} hr${h > 1 ? 's' : ''}`;
    else formatted = `${m} min${m > 1 ? 's' : ''}`;
    
    return { mins: diff, formatted };
  };

  const durationInfo = calculateDuration(selectedTime, checkOutTime);

  /* Coupon State — Strict Single Active Coupon Rule */
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  /* Unlocked Group Discount Tier */
  const unlockedGroupCoupon = getUnlockedGroupCoupon(guests);

  /* Automatically validate applied coupon against current guest count */
  useEffect(() => {
    if (appliedCoupon && appliedCoupon.minGuests && (Number(guests) || 1) < appliedCoupon.minGuests) {
      toast.error(`Coupon "${appliedCoupon.code}" removed: Minimum ${appliedCoupon.minGuests} guests required.`);
      setAppliedCoupon(null);
    }
  }, [guests, appliedCoupon]);

  /* Calculation */
  const selectedTable = tablesList.find((t) => String(t._id) === String(selectedTableId));
  const tokenFeePerGuest = getZoneTokenFee(restaurant, selectedZone, selectedTable);
  const baseDeposit = (Number(guests) || 1) * tokenFeePerGuest;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'flat') {
      discountAmount = appliedCoupon.amount;
    } else if (appliedCoupon.type === 'percent') {
      discountAmount = Math.round((baseDeposit * appliedCoupon.amount) / 100);
    }
  }

  const finalPayable = Math.max(0, baseDeposit - discountAmount);

  const applyCouponCode = (codeToApply) => {
    const cleanCode = (codeToApply || couponInput).trim().toUpperCase();
    if (!cleanCode) {
      toast.error('Please enter a promo code');
      return;
    }

    const found = VALID_COUPONS[cleanCode];
    if (!found) {
      toast.error(`Invalid promo code "${cleanCode}". Please check your code and try again.`);
      return;
    }

    // Validate minimum guest requirement for this coupon
    const currentGuestCount = Number(guests) || 1;
    if (found.minGuests && currentGuestCount < found.minGuests) {
      toast.error(`Code ${found.code} requires a minimum of ${found.minGuests} guests (Current: ${currentGuestCount} guests).`);
      return;
    }

    // Single Promo Code Enforcement: Replaces any previously applied coupon!
    setAppliedCoupon(found);
    setCouponInput(cleanCode);
    toast.success(`🎉 Promo Code "${cleanCode}" applied! (${found.desc})`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    toast('Promo code removed', { icon: 'ℹ️' });
  };

  const handleRazorpayPayment = async (e) => {
    e.preventDefault();

    if (!date) {
      toast.error('Please select a reservation date');
      return;
    }

    if (!selectedTime) {
      toast.error('Please select a time slot');
      return;
    }

    if (!guests || guests < 1) {
      toast.error('Please enter at least 1 guest');
      return;
    }

    if (tableError) {
      toast.error(tableError);
      return;
    }

    const payloadTimes = {
      checkInTime: date && selectedTime ? `${date}T${selectedTime}:00` : null,
      checkOutTime: date && checkOutTime ? `${date}T${checkOutTime}:00` : null,
      timeSpentFormatted: durationInfo.formatted,
      timeSpentMinutes: durationInfo.mins,
    };

    const isLoaded = await loadRazorpaySDK();
    if (!isLoaded) {
      toast.error('Razorpay SDK failed to load. Proceeding with instant reservation...');
      onSubmit({
        date,
        time: selectedTime,
        guests,
        tableId: selectedTableId || null,
        couponCode: appliedCoupon?.code || null,
        discountAmount,
        finalPayable,
        ...payloadTimes,
      });
      return;
    }

    /* Extract user database details for Razorpay prefill */
    const userFullName =
      profile?.name?.trim() ||
      profile?.fullName?.trim() ||
      displayName?.trim() ||
      localStorage.getItem('bookmytable_full_name')?.trim() ||
      'Guest User';

    const userEmail =
      profile?.email?.trim() ||
      authEmail?.trim() ||
      localStorage.getItem('bookmytable_email')?.trim() ||
      'customer@bookmytable.me';

    const userPhone =
      profile?.phone?.trim() ||
      profile?.phoneNumber?.trim() ||
      localStorage.getItem('bookmytable_phone')?.trim() ||
      '8238012515';

    /* Configure Razorpay Modal */
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_bookmytable',
      amount: finalPayable * 100, // amount in paise
      currency: 'INR',
      name: 'BookMyTable',
      description: `Table Deposit: ${restaurant.name || 'Reservation'}`,
      image: restaurant.imageUrl || getFallbackRestaurantImage(restaurant),
      handler: function (response) {
        toast.success(`💳 Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
        onSubmit({
          date,
          time: selectedTime,
          guests,
          tableId: selectedTableId || null,
          paymentId: response.razorpay_payment_id,
          couponCode: appliedCoupon?.code || null,
          discountAmount,
          finalPayable,
          ...payloadTimes,
        });
      },
      prefill: {
        name: userFullName,
        email: userEmail,
        contact: userPhone,
      },
      theme: {
        color: '#d4af37',
      },
      modal: {
        ondismiss: function () {
          toast('Payment window closed before completing transaction.', { icon: 'ℹ️' });
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      onSubmit({
        date,
        time: selectedTime,
        guests,
        tableId: selectedTableId || null,
        couponCode: appliedCoupon?.code || null,
        discountAmount,
        finalPayable,
        ...payloadTimes,
      });
    }
  };

  return (
    <div
      className="overflow-hidden rounded-3xl"
      style={{
        background: 'linear-gradient(160deg, rgba(24,24,28,0.92) 0%, rgba(12,12,14,0.96) 100%)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(212,175,55,0.25)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.85), 0 0 30px rgba(212,175,55,0.07)',
      }}
    >
      <form onSubmit={handleRazorpayPayment} className="space-y-6 p-6 sm:p-8">

        {/* ── RESERVATION DETAILS ── */}
        <div className="space-y-5">
          <div className="border-b border-white/10 pb-3">
            <h3 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-luxury-gold">
              Reservation Details
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Date */}
            <div>
              <label htmlFor="date" className="mb-2 flex items-center gap-2 font-sans text-xs font-semibold text-white/80">
                <IconCalendar /> Date *
              </label>
              <input
                id="date"
                type="date"
                required
                min={minDate || undefined}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={fieldBase}
                style={{ colorScheme: 'dark' }}
              />
            </div>

            {/* Check-In Time */}
            <div>
              <label className="mb-2 flex items-center gap-2 font-sans text-xs font-semibold text-white/80">
                <IconClock /> Check-In Time *
              </label>
              {timeSlots?.length ? (
                <TimeSelect value={selectedTime} onChange={setSelectedTime} options={timeSlots} />
              ) : (
                <input
                  id="time"
                  type="time"
                  required
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className={fieldBase}
                  style={{ colorScheme: 'dark' }}
                />
              )}
            </div>

            {/* Check-Out Time */}
            <div>
              <label className="mb-2 flex items-center gap-2 font-sans text-xs font-semibold text-white/80">
                <IconClock /> Check-Out Time *
              </label>
              <TimeSelect value={checkOutTime} onChange={setCheckOutTime} options={checkOutSlots} />
            </div>
          </div>

          {/* Calculated Duration Banner */}
          <div
            className="flex items-center justify-between rounded-xl px-4 py-2.5"
            style={{
              background: 'rgba(212,175,55,0.08)',
              border: '1px solid rgba(212,175,55,0.22)',
            }}
          >
            <span className="font-sans text-xs font-medium text-luxury-gold flex items-center gap-1.5">
              <span>⏱️</span> Expected Dining Duration:
            </span>
            <span className="font-sans text-xs font-bold text-white">
              {durationInfo.formatted} ({selectedTime} to {checkOutTime})
            </span>
          </div>
          {/* ── DINING ZONE SELECTOR (MATCHES IMAGE 2 MOCKUP) ── */}
          <div className="space-y-2 relative">
            <label className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 block">
              DINING ZONE *
            </label>
            
            <button
              type="button"
              onClick={() => setZoneDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-between rounded-xl px-4 py-3.5 font-sans text-sm font-semibold text-white transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: zoneDropdownOpen ? '1px solid #d4af37' : '1px solid rgba(212,175,55,0.3)',
                boxShadow: zoneDropdownOpen ? '0 0 15px rgba(212,175,55,0.15)' : 'none',
              }}
            >
              <span className="flex items-center gap-3 font-medium text-white">
                <span className="text-base">
                  {DINING_ZONES_META.find((z) => z.id === selectedZone)?.icon || '🕯️'}
                </span>
                <span>{selectedZone}</span>
              </span>
              <svg
                className={`h-4 w-4 text-luxury-gold transition-transform duration-200 ${zoneDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {zoneDropdownOpen && (
              <div
                className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl p-2 space-y-1 shadow-2xl overflow-hidden"
                style={{
                  background: '#141416',
                  border: '1px solid rgba(212,175,55,0.35)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.95)',
                }}
              >
                {(Array.isArray(restaurant.experiences) && restaurant.experiences.length > 0
                  ? restaurant.experiences
                  : DINING_ZONES_META.map((z) => z.id)
                ).map((zoneName) => {
                  const meta = DINING_ZONES_META.find((z) => z.id === zoneName) || { icon: '🕯️', label: zoneName };
                  const isSelected = selectedZone === zoneName;
                  const zoneFee = getZoneTokenFee(restaurant, zoneName);

                  return (
                    <button
                      key={zoneName}
                      type="button"
                      onClick={() => {
                        setSelectedZone(zoneName);
                        setZoneDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between rounded-xl px-4 py-3 font-sans text-sm font-medium transition-all duration-150"
                      style={{
                        background: isSelected ? 'rgba(212,175,55,0.15)' : 'transparent',
                        color: isSelected ? '#d4af37' : 'rgba(255,255,255,0.85)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">{meta.icon}</span>
                        <span>{zoneName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/40 font-normal">₹{zoneFee}/guest</span>
                        {isSelected && (
                          <svg className="h-4 w-4 text-luxury-gold stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Guest Selector (Manual Edit Support) */}
          <div>
            <label htmlFor="guests" className="mb-2 flex items-center justify-between font-sans text-xs font-semibold text-white/80">
              <span className="flex items-center gap-2">
                <IconGuests /> Number of Guests *
              </span>
              <span className="text-luxury-gold font-bold">
                {guests || 1} {(guests || 1) === 1 ? 'Guest' : 'Guests'}
              </span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGuests((g) => Math.max(1, (Number(g) || 1) - 1))}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-lg font-bold text-white transition-all hover:bg-white/10 active:scale-95"
              >
                –
              </button>

              <div className="relative flex-1">
                <input
                  id="guests"
                  type="number"
                  min={1}
                  max={500}
                  required
                  value={guests}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setGuests(isNaN(val) ? '' : Math.max(1, Math.min(500, val)));
                  }}
                  placeholder="Number of guests"
                  className="w-full text-center rounded-xl border border-white/10 bg-white/[0.04] pl-4 pr-10 py-3 font-sans text-base font-bold text-white outline-none focus:border-luxury-gold/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                {/* Custom Luxury Gold Up/Down Spinner Buttons */}
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.min(500, (Number(g) || 0) + 1))}
                    className="p-1 rounded text-luxury-gold hover:bg-luxury-gold/20 transition-colors"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.max(1, (Number(g) || 1) - 1))}
                    className="p-1 rounded text-luxury-gold hover:bg-luxury-gold/20 transition-colors"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setGuests((g) => Math.min(500, (Number(g) || 0) + 1))}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-lg font-bold text-white transition-all hover:bg-white/10 active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* ── Table Allocation & Seating Capacity Guard ── */}
          {loadingTables ? (
            <div className="rounded-2xl border border-luxury-gold/20 bg-white/[0.03] p-4 flex items-center justify-center gap-3 font-sans text-xs text-luxury-gold animate-pulse">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Verifying live table availability & capacity...
            </div>
          ) : tableError ? (
            <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-4 space-y-1 text-xs font-sans text-red-300">
              <div className="flex items-center gap-2 font-bold text-red-400">
                <span>⚠️</span> Table Capacity Notice
              </div>
              <p>{tableError}</p>
            </div>
          ) : tablesList.length > 0 ? (
            <div className="space-y-2.5 pt-1">
              <label className="flex items-center justify-between font-sans text-xs font-semibold text-white/80">
                <span className="flex items-center gap-2">
                  <span>🪑</span> Select Table / Zone *
                </span>
                <span className="text-luxury-gold text-[11px] font-bold uppercase tracking-wider">
                  {tablesList.filter((t) => t.isAvailable && Number(t.capacity) >= (Number(guests) || 1)).length} Available
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {tablesList.map((t) => {
                  const isAvailable = t.isAvailable;
                  const fits = Number(t.capacity) >= (Number(guests) || 1);
                  const isSelected = String(t._id) === String(selectedTableId);
                  const isDisabled = !isAvailable || !fits;

                  return (
                    <button
                      key={t._id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setSelectedTableId(t._id)}
                      className={`relative flex flex-col justify-between rounded-xl border p-3 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-luxury-gold bg-luxury-gold/15 shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                          : isDisabled
                          ? 'border-white/5 bg-white/[0.01] opacity-40 cursor-not-allowed'
                          : 'border-white/10 bg-white/[0.04] hover:border-luxury-gold/40 hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-sm text-white">
                          {t.tableNumber}
                        </span>
                        {isSelected && (
                          <span className="text-luxury-gold font-bold text-xs">✓</span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] font-sans">
                        <span className="text-luxury-muted font-medium">{t.zone || 'Fine Dining'}</span>
                        <span className="font-semibold text-amber-300">{t.capacity}-Seater</span>
                      </div>
                      {isDisabled && (
                        <span className="mt-1 font-sans text-[10px] font-semibold text-red-400">
                          {!isAvailable ? 'Reserved' : 'Too Small'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* ── STEP 2: PROMO CODE & DISCOUNTS ── */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <label className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-luxury-gold flex items-center gap-1.5">
              <span>🎟️</span> Promo Code & Discounts
            </label>
            {appliedCoupon && (
              <button
                type="button"
                onClick={removeCoupon}
                className="font-sans text-xs text-red-400 hover:underline font-semibold"
              >
                Remove Code
              </button>
            )}
          </div>

          {/* Clean Promo Code Input */}
          <div className="flex gap-2.5">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="Enter Promo Code"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-sans text-xs uppercase tracking-wider text-white outline-none focus:border-luxury-gold/60"
            />
            <button
              type="button"
              onClick={() => applyCouponCode()}
              className="rounded-xl px-6 py-3 font-sans text-xs font-bold text-black transition-all hover:brightness-110 active:scale-95 shrink-0"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #f5e6a3)' }}
            >
              Apply Code
            </button>
          </div>

          {/* Unlocked Group Discount Banner */}
          {unlockedGroupCoupon && (
            <div
              className="rounded-2xl p-4 sm:p-5 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.02) 100%)',
                border: '1px solid rgba(212,175,55,0.35)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="space-y-1">
                  <p className="font-sans text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <span>🎉</span> GROUP DISCOUNT UNLOCKED ({guests} GUESTS)
                  </p>
                  <p className="font-sans text-xs text-gray-300">
                    Promo Code: <strong className="text-amber-400 font-bold tracking-wide">{unlockedGroupCoupon.code}</strong> ({unlockedGroupCoupon.desc})
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => applyCouponCode(unlockedGroupCoupon.code)}
                  className="rounded-full px-5 py-2 font-sans text-xs font-bold text-black transition-all hover:scale-[1.02] active:scale-95 shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #e6c86e 0%, #d4af37 100%)',
                    boxShadow: '0 2px 10px rgba(212,175,55,0.25)',
                  }}
                >
                  {appliedCoupon?.code === unlockedGroupCoupon.code ? '✓ Applied' : 'Apply Discount'}
                </button>
              </div>
            </div>
          )}

          {/* Applied Promo Code Green Alert Box */}
          {appliedCoupon && (
            <div
              className="rounded-2xl px-4 py-3.5 sm:px-5 flex items-center justify-between gap-3 transition-all duration-300"
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
              }}
            >
              <span className="font-sans text-xs sm:text-sm font-medium text-emerald-400">
                ✓ Promo Code "{appliedCoupon.code}" Applied! ({appliedCoupon.desc})
              </span>
              <span className="font-sans text-xs sm:text-sm font-bold text-emerald-400 shrink-0">
                -₹{discountAmount}
              </span>
            </div>
          )}
        </div>

        {/* ── STEP 3: PAYMENT BREAKDOWN ── */}
        <div
          className="rounded-2xl p-5 space-y-3"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(212,175,55,0.2)',
          }}
        >
          <p className="font-sans text-xs font-bold uppercase tracking-widest text-luxury-gold">
            Payment Breakdown
          </p>

          <div className="space-y-2 text-xs text-white/70 font-sans">
            <div className="flex justify-between">
              <span>Token Deposit ({guests || 1} × ₹{tokenFeePerGuest} in {selectedZone})</span>
              <span className="font-semibold text-white">₹{baseDeposit}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-green-400 font-semibold">
                <span>Discount ({appliedCoupon?.code})</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            <div className="h-px bg-white/10 my-2" />

            <div className="flex justify-between text-sm font-extrabold text-[#ffffff]">
              <span>Total Amount Payable</span>
              <span className="text-luxury-gold text-base">₹{finalPayable}</span>
            </div>
          </div>
        </div>

        {/* ── UPGRADED PAY BUTTON ── */}
        <button
          type="submit"
          disabled={submitting || !!tableError || loadingTables}
          className="w-full rounded-2xl py-4 font-sans text-sm sm:text-base font-bold text-[#0a0a0a] transition-all duration-300 hover:brightness-110 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #c9a84c 0%, #f5e6a3 50%, #c9a84c 100%)',
            boxShadow: '0 0 35px rgba(212,175,55,0.4), 0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Processing Reservation…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2 font-extrabold text-base">
              Pay ₹{finalPayable}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          )}
        </button>

        <div className="flex flex-wrap items-center justify-center gap-3 text-center font-sans text-xs text-white/50 pt-1">
          <span className="flex items-center gap-1.5">
            <span>🔒</span>
            <span>256-Bit Razorpay Encryption</span>
          </span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1.5">
            <span>⚡</span>
            <span>Instant Reservation Confirmation</span>
          </span>
        </div>
      </form>
    </div>
  );
}
