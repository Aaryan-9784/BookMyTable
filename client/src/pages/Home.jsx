/**
 * Landing — hero, featured restaurants, search, category chips.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import RestaurantCard from '../components/RestaurantCard.jsx';
import SearchInput from '../components/SearchInput.jsx';
import { useDebounce } from '../hooks/useDebounce.js';

const CATEGORIES = ['Indian', 'Italian', 'Chinese', 'Japanese', 'Cafe', 'Fine dining'];
const CATEGORY_ICONS = {
  Indian: '🍛', Italian: '🍝', Chinese: '🥢',
  Japanese: '🍣', Cafe: '☕', 'Fine dining': '🕯️',
};

export default function Home() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const debounced = useDebounce(searchInput, 400);
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/api/restaurants', { params: { page: 1, limit: 6, sort: 'rating' } });
        const items = data?.items ?? data;
        if (!cancelled) setFeatured(Array.isArray(items) ? items : []);
      } catch (e) {
        toast.error(e.message);
        if (!cancelled) setFeatured([]);
      } finally {
        if (!cancelled) setLoadingFeatured(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = searchInput.trim();
    navigate(q ? `/restaurants?q=${encodeURIComponent(q)}` : '/restaurants');
  };

  const goDebouncedSearch = () => {
    const q = debounced.trim();
    if (!q) return;
    navigate(`/restaurants?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="overflow-x-hidden">

      {/* ══════════════════════════════════════
          HERO — full viewport, real bg image
      ══════════════════════════════════════ */}
      <section className="relative flex min-h-screen flex-col">

        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1800&auto=format&fit=crop&q=80')",
          }}
        />

        {/* Multi-layer overlay for depth */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.75) 75%, rgba(10,10,10,1) 100%)' }} />
        {/* Subtle gold tint at top */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,175,55,0.07) 0%, transparent 60%)' }} />

        {/* Content — centered vertically, offset for fixed navbar */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-24 pt-32 text-center md:px-8">

          {/* Eyebrow */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.8))' }} />
            <span className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-luxury-gold/90">
              Fine Dining Reservations
            </span>
            <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.8), transparent)' }} />
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl font-display text-5xl font-light leading-[1.06] tracking-tight text-white md:text-6xl lg:text-7xl xl:text-8xl"
            style={{ textShadow: '0 4px 32px rgba(0,0,0,0.5)' }}>
            The table you want,{' '}
            <span className="italic" style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #f5e6c4 50%, #d4af37 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              when
            </span>
            {' '}you want it.
          </h1>

          <p className="mt-6 max-w-lg font-sans text-base leading-relaxed text-white/55 md:text-lg">
            Discover and reserve the finest restaurants — from intimate bistros to grand dining rooms.
          </p>

          {/* Search bar */}
          <div className="mt-10 w-full max-w-2xl">
            <form
              onSubmit={submitSearch}
              className="flex items-stretch gap-0"
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: '9999px',
                padding: '5px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
              }}
            >
              <SearchInput
                id="home-search"
                variant="hero"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search restaurant, location, cuisine…"
                pending={searchInput !== debounced && Boolean(searchInput.trim())}
                className="min-w-0 flex-1"
                inputClassName="bg-transparent border-0 focus:ring-0 rounded-full text-white placeholder:text-white/35 text-base"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full px-7 py-3 font-sans text-sm font-semibold text-[#0a0a0a] transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)',
                  boxShadow: '0 0 24px rgba(212,175,55,0.4)',
                }}
              >
                Search
              </button>
            </form>

            {debounced.trim().length >= 2 && (
              <button type="button" onClick={goDebouncedSearch}
                className="mt-3 font-sans text-sm text-luxury-gold/70 transition hover:text-luxury-gold">
                Open results for &quot;{debounced.trim()}&quot;
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="mt-10">
            <p className="mb-4 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-white/35">
              Browse by cuisine
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {CATEGORIES.map((c) => (
                <Link
                  key={c}
                  to={`/restaurants?category=${encodeURIComponent(c)}`}
                  className="flex items-center gap-2 rounded-full px-4 py-2 font-sans text-sm text-white/65 transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,175,55,0.15)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.45)'; e.currentTarget.style.color = '#d4af37'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <span>{CATEGORY_ICONS[c]}</span>
                  {c}
                </Link>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex flex-col items-center gap-2 opacity-40">
            <span className="font-sans text-[0.6rem] uppercase tracking-widest text-white">Scroll</span>
            <div className="flex h-8 w-5 items-start justify-center rounded-full border border-white/30 p-1">
              <div className="h-1.5 w-1 animate-bounce rounded-full bg-white" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════ */}
      <div style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)', borderTop: '1px solid rgba(212,175,55,0.08)' }}>
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-0 divide-x divide-white/[0.06] px-4 py-8">
          {[['500+', 'Curated restaurants'], ['50k+', 'Happy guests'], ['4.9 ★', 'Average rating'], ['Instant', 'Confirmation']].map(([val, label]) => (
            <div key={label} className="flex flex-col items-center gap-1 px-8 py-2">
              <span className="font-display text-2xl font-light text-luxury-gold">{val}</span>
              <span className="font-sans text-xs text-white/30">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          FEATURED SECTION
      ══════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(180deg, #111111 0%, #141414 100%)' }}>
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">

          {/* Header */}
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-3 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-luxury-gold/70">
                Top rated
              </p>
              <h2 className="font-display text-4xl font-light text-white md:text-5xl">
                Featured for you
              </h2>
              <div className="mt-4 h-px w-16" style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
            </div>
            <Link
              to="/restaurants?sort=rating"
              className="flex items-center gap-2 rounded-full border px-5 py-2.5 font-sans text-sm text-luxury-gold/70 transition-all duration-200 hover:text-luxury-gold"
              style={{ borderColor: 'rgba(212,175,55,0.2)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'; e.currentTarget.style.background = 'rgba(212,175,55,0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'; e.currentTarget.style.background = 'transparent'; }}
            >
              See all venues
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Cards */}
          {loadingFeatured ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-[22px]" style={{ background: '#1a1a1a', aspectRatio: '3/4' }}>
                  <div className="h-full w-full" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' }} />
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="mb-4 font-display text-6xl text-luxury-gold/15">B</span>
              <p className="font-sans text-white/25">No restaurants yet — check back soon.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((r) => <RestaurantCard key={r._id} restaurant={r} />)}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #141414 0%, #0b0b0c 100%)', borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        {/* Gold glow */}
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(212,175,55,0.06) 0%, transparent 70%)' }} />

        <div className="relative mx-auto max-w-3xl px-4 py-28 text-center md:px-8">
          <p className="mb-4 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-luxury-gold/60">
            Ready to dine?
          </p>
          <h3 className="font-display text-4xl font-light text-white md:text-5xl lg:text-6xl">
            Explore every venue
          </h3>
          <div className="mx-auto mt-5 h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }} />
          <p className="mx-auto mt-6 max-w-md font-sans text-base leading-relaxed text-white/35">
            Browse our full collection of restaurants, filter by cuisine, price, and rating.
          </p>
          <Link
            to="/restaurants"
            className="mt-10 inline-flex items-center gap-3 rounded-full px-10 py-4 font-sans text-base font-semibold text-[#0a0a0a] transition-all duration-300 hover:brightness-110 hover:scale-[1.02] active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 50%, #c9a84c 100%)',
              boxShadow: '0 0 48px rgba(212,175,55,0.25), 0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            Browse all restaurants
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>

          {/* View full directory link */}
          <p className="mt-6 font-sans text-sm text-white/25">
            <Link to="/restaurants" className="text-luxury-gold/60 transition hover:text-luxury-gold hover:underline">
              View full directory
            </Link>
            <span className="mx-2 text-white/10">·</span>
            <span>All venues and filters</span>
          </p>
        </div>
      </section>

    </div>
  );
}
