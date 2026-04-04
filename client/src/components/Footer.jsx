/**
 * Site footer — luxury editorial redesign.
 */
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #0b0b0c 0%, #080808 100%)',
        borderTop: '1px solid rgba(212,175,55,0.1)',
      }}
    >
      {/* Gold shimmer line */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.5) 40%, rgba(212,175,55,0.5) 60%, transparent 100%)',
        }}
      />

      <div className="mx-auto max-w-6xl px-4 md:px-8">

        {/* ── Main body ── */}
        <div className="flex flex-col items-center gap-10 py-14 md:flex-row md:items-end md:justify-between">

          {/* Left — brand + tagline */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <Link
              to="/"
              className="font-display text-3xl font-semibold tracking-tight text-white transition-opacity duration-300 hover:opacity-75"
            >
              <span>Book</span>
              <span
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
            </Link>

            <p className="max-w-[220px] text-center font-sans text-sm leading-relaxed text-white/30 md:text-left">
              Curated reservations for memorable evenings.
            </p>

            {/* Gold accent line */}
            <div
              className="h-px w-10"
              style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }}
            />
          </div>

          {/* Center — decorative quote */}
          <div className="hidden flex-col items-center gap-3 lg:flex">
            <p
              className="font-display text-lg font-light italic"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.5), rgba(245,230,163,0.7), rgba(212,175,55,0.5))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              "Every great meal begins with a reservation."
            </p>
            <div className="flex items-center gap-2">
              <div className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3))' }} />
              <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-white/20">Fine dining</span>
              <div className="h-px w-8" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }} />
            </div>
          </div>

          {/* Right — social / badge */}
          <div className="flex flex-col items-center gap-4 md:items-end">
            {/* Luxury badge */}
            <div
              className="flex items-center gap-2 rounded-full px-4 py-2"
              style={{
                background: 'rgba(212,175,55,0.06)',
                border: '1px solid rgba(212,175,55,0.18)',
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: '#d4af37', boxShadow: '0 0 6px rgba(212,175,55,0.8)' }}
              />
              <span
                className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.22em]"
                style={{ color: 'rgba(212,175,55,0.7)' }}
              >
                Elite Dining Concierge
              </span>
            </div>

            {/* Star rating decoration */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill={i < 5 ? 'rgba(212,175,55,0.5)' : 'none'}
                  stroke="rgba(212,175,55,0.3)"
                  strokeWidth={1}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
              <span className="ml-1.5 font-sans text-[0.6rem] text-white/20">4.9 · 50k+ guests</span>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="flex flex-col items-center justify-between gap-3 border-t py-5 sm:flex-row"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <p className="font-sans text-xs text-white/20">
            © {new Date().getFullYear()} BookMyTable. All rights reserved.
          </p>
          <p className="font-sans text-xs text-white/15">
            Built for diners who value time and taste.
          </p>
        </div>

      </div>
    </footer>
  );
}
