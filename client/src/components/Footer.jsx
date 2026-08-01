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

      <div className="w-full px-6 md:px-14">

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
              <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-white/20">Table Reservations</span>
              <div className="h-px w-8" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }} />
            </div>
          </div>

          {/* Right — Universal Navigation */}
          <div className="flex flex-col items-center gap-3 md:items-end">
            <p className="font-sans text-[0.65rem] font-bold uppercase tracking-[0.25em] text-luxury-gold/80">
              NAVIGATION
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-sans text-white/50 md:justify-end">
              <Link to="/restaurants" className="transition-colors duration-200 hover:text-luxury-gold">
                Explore Restaurants
              </Link>
              <span className="h-1 w-1 rounded-full bg-luxury-gold/30" />
              <Link to="/profile" className="transition-colors duration-200 hover:text-luxury-gold">
                Account
              </Link>
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
