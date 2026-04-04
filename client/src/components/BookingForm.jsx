/**
 * Shared booking form — date, time, guests; submits via onSubmit handler.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const fieldBase = [
  'w-full rounded-xl border bg-white/[0.04] px-4 py-3.5 font-sans text-sm text-white',
  'placeholder:text-white/20 transition-all duration-200 focus:outline-none',
  'border-white/8 focus:border-luxury-gold/50 focus:ring-1 focus:ring-luxury-gold/15',
  'hover:border-white/15',
].join(' ');

/* ── Portal dropdown — no browser chrome ── */
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
      // Only close if scroll happens outside the menu itself
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
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
        overflow: 'hidden auto',
        maxHeight: '220px',
        paddingTop: '3px',
        paddingBottom: '3px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(212,175,55,0.3) transparent',
      }}
    >
      {options.map((t) => {
        const isActive = t === value;
        return (
          <button
            key={t}
            type="button"
            onClick={() => { onChange(t); setOpen(false); }}
            className="flex w-full items-center justify-between px-4 py-2 font-sans text-sm transition-all duration-150"
            style={{ background: isActive ? 'rgba(212,175,55,0.12)' : 'transparent', color: isActive ? '#d4af37' : 'rgba(255,255,255,0.7)' }}
            onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(212,175,55,0.07)'; e.currentTarget.style.color = '#fff'; } }}
            onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; } }}
          >
            <span>{t}</span>
            {isActive && (
              <svg className="h-3.5 w-3.5" style={{ color: '#d4af37' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
        <span>{value || 'Select time'}</span>
        <svg className="h-4 w-4 shrink-0 transition-transform duration-200" style={{ color: 'rgba(255,255,255,0.3)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
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
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconGuests() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

export default function BookingForm({
  onSubmit,
  submitting = false,
  defaultDate = '',
  defaultTime = '',
  defaultGuests = 2,
  minDate = '',
  timeSlots = null,
}) {
  const resolvedDefault = timeSlots?.length
    ? (defaultTime && timeSlots.includes(defaultTime) ? defaultTime : timeSlots[0])
    : defaultTime;

  const [selectedTime, setSelectedTime] = useState(resolvedDefault);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit({
      date: fd.get('date'),
      time: selectedTime,          // use state value — hidden input keeps FormData in sync
      guests: Number(fd.get('guests')),
    });
  };

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(212,175,55,0.14)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div className="flex">
        <div className="w-1 shrink-0" style={{ background: 'linear-gradient(180deg, #d4af37 0%, rgba(212,175,55,0.05) 100%)' }} />

        <form onSubmit={handleSubmit} className="flex-1 space-y-0 p-7">
          {/* Hidden input keeps time value accessible via FormData if needed */}
          <input type="hidden" name="time" value={selectedTime} readOnly />

          {/* Date + Time grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Date */}
            <div>
              <label htmlFor="date" className="mb-2 flex items-center gap-2 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-luxury-gold/55">
                <IconCalendar /> Date
              </label>
              <input
                id="date" name="date" type="date" required
                min={minDate || undefined} defaultValue={defaultDate}
                className={fieldBase} style={{ colorScheme: 'dark' }}
              />
            </div>

            {/* Time — custom portal dropdown */}
            <div>
              <label className="mb-2 flex items-center gap-2 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-luxury-gold/55">
                <IconClock /> Time
              </label>
              {timeSlots?.length ? (
                <TimeSelect value={selectedTime} onChange={setSelectedTime} options={timeSlots} />
              ) : (
                <input
                  id="time" name="time" type="time" required
                  value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}
                  className={fieldBase} style={{ colorScheme: 'dark' }}
                />
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="py-5">
            <div className="h-px" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.12), transparent)' }} />
          </div>

          {/* Guests */}
          <div>
            <label htmlFor="guests" className="mb-2 flex items-center gap-2 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-luxury-gold/55">
              <IconGuests /> Number of guests
            </label>
            <input
              id="guests" name="guests" type="number" min={1} max={50} required
              defaultValue={defaultGuests} className={fieldBase} placeholder="2"
            />
            <p className="mt-2 font-sans text-xs text-white/20">Up to 50 guests per reservation</p>
          </div>

          {/* Divider */}
          <div className="py-5">
            <div className="h-px" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.08), transparent)' }} />
          </div>

          {/* Submit */}
          <button
            type="submit" disabled={submitting}
            className="w-full rounded-xl py-4 font-sans text-base font-semibold text-[#0a0a0a] transition-all duration-300 hover:brightness-110 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: submitting ? 'rgba(212,175,55,0.5)' : 'linear-gradient(135deg, #c9a84c 0%, #f5e6a3 50%, #c9a84c 100%)',
              boxShadow: submitting ? 'none' : '0 0 32px rgba(212,175,55,0.3), 0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Confirming reservation…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Confirm Reservation
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            )}
          </button>

          <p className="mt-4 text-center font-sans text-xs text-white/20">
            Free cancellation · Instant confirmation
          </p>
        </form>
      </div>
    </div>
  );
}
