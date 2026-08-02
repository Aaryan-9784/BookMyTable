import { useState, useEffect } from 'react';

function toLocalTimeString(dateObj) {
  if (!dateObj) return '';
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return '';
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function TimeSpentModal({ open, booking, onClose, onConfirm, loading }) {
  const [inTime, setInTime] = useState('');
  const [outTime, setOutTime] = useState('');
  const [hoursSpent, setHoursSpent] = useState(1);
  const [minsSpent, setMinsSpent] = useState(30);
  const [useCustomDuration, setUseCustomDuration] = useState(false);

  useEffect(() => {
    if (booking && open) {
      const now = new Date();
      const defaultCheckIn = booking.checkInTime
        ? new Date(booking.checkInTime)
        : new Date(now.getTime() - 90 * 60 * 1000); // 1.5 hrs ago
      
      setInTime(toLocalTimeString(defaultCheckIn));
      setOutTime(toLocalTimeString(now));
      setHoursSpent(1);
      setMinsSpent(30);
    }
  }, [booking, open]);

  if (!open || !booking) return null;

  const customerName = booking.userId?.name || 'Customer';
  const partySize = booking.guests || 1;

  const handleFormSubmit = (e) => {
    e.preventDefault();

    let formattedDuration = '';
    let totalMins = 0;

    if (useCustomDuration) {
      const h = Math.max(0, parseInt(hoursSpent, 10) || 0);
      const m = Math.max(0, parseInt(minsSpent, 10) || 0);
      totalMins = h * 60 + m;
      if (h > 0 && m > 0) {
        formattedDuration = `${h} hr${h > 1 ? 's' : ''} ${m} min${m > 1 ? 's' : ''}`;
      } else if (h > 0) {
        formattedDuration = `${h} hr${h > 1 ? 's' : ''}`;
      } else {
        formattedDuration = `${m} min${m > 1 ? 's' : ''}`;
      }
    } else {
      // Calculate from inTime and outTime string HH:MM
      const nowStr = new Date().toISOString().split('T')[0];
      const checkInDate = inTime ? new Date(`${nowStr}T${inTime}:00`) : new Date(Date.now() - 90 * 60 * 1000);
      const checkOutDate = outTime ? new Date(`${nowStr}T${outTime}:00`) : new Date();

      let diffMs = checkOutDate - checkInDate;
      if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // overnight handling
      totalMins = Math.max(1, Math.round(diffMs / 60000));

      const h = Math.floor(totalMins / 60);
      const m = Math.round(totalMins % 60);
      if (h > 0 && m > 0) {
        formattedDuration = `${h} hr${h > 1 ? 's' : ''} ${m} min${m > 1 ? 's' : ''}`;
      } else if (h > 0) {
        formattedDuration = `${h} hr${h > 1 ? 's' : ''}`;
      } else {
        formattedDuration = `${m} min${m > 1 ? 's' : ''}`;
      }
    }

    onConfirm({
      bookingId: booking._id,
      timeSpentFormatted: formattedDuration || '1 hr 30 mins',
      timeSpentMinutes: totalMins || 90,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl p-6 transition-all duration-300"
        style={{
          background: '#161616',
          border: '1px solid rgba(212,175,55,0.25)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.1)',
        }}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">Record Time Spent</h3>
              <p className="font-sans text-xs text-luxury-muted">Complete reservation for {customerName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-sm">
          {/* Guest detail pill */}
          <div
            className="flex items-center justify-between rounded-xl px-4 py-2.5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-xs text-luxury-muted">Guest & Party Size</span>
            <span className="text-xs font-semibold text-white">
              {customerName} · {partySize} {partySize === 1 ? 'Guest' : 'Guests'}
            </span>
          </div>

          {/* Toggle Calculation Mode */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-xs text-gray-400">Input Mode:</span>
            <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                type="button"
                onClick={() => setUseCustomDuration(false)}
                className={`rounded-md px-3 py-1 text-[11px] font-medium transition-all ${
                  !useCustomDuration ? 'bg-luxury-gold text-black font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                In/Out Timestamps
              </button>
              <button
                type="button"
                onClick={() => setUseCustomDuration(true)}
                className={`rounded-md px-3 py-1 text-[11px] font-medium transition-all ${
                  useCustomDuration ? 'bg-luxury-gold text-black font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Direct Duration
              </button>
            </div>
          </div>

          {!useCustomDuration ? (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-luxury-muted mb-1">
                  Check-In Time
                </label>
                <input
                  type="time"
                  value={inTime}
                  onChange={(e) => setInTime(e.target.value)}
                  required
                  className="w-full rounded-xl px-3 py-2 text-white bg-black/40 border border-white/15 focus:border-luxury-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-luxury-muted mb-1">
                  Check-Out Time
                </label>
                <input
                  type="time"
                  value={outTime}
                  onChange={(e) => setOutTime(e.target.value)}
                  required
                  className="w-full rounded-xl px-3 py-2 text-white bg-black/40 border border-white/15 focus:border-luxury-gold outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-luxury-muted mb-1">
                  Hours Spent
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hoursSpent}
                  onChange={(e) => setHoursSpent(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-white bg-black/40 border border-white/15 focus:border-luxury-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-luxury-muted mb-1">
                  Minutes Spent
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minsSpent}
                  onChange={(e) => setMinsSpent(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-white bg-black/40 border border-white/15 focus:border-luxury-gold outline-none"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-black transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)',
                boxShadow: '0 0 16px rgba(212,175,55,0.25)',
              }}
            >
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
              ) : (
                'Save & Mark Completed ✓'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
