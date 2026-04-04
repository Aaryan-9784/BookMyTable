/**
 * Restaurants — filters, sort, pagination (extended API); plain list when no query params (legacy).
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import RestaurantCard from '../components/RestaurantCard.jsx';
import Loader from '../components/Loader.jsx';
import SearchInput from '../components/SearchInput.jsx';
import { useDebounce } from '../hooks/useDebounce.js';

/* ─────────────────────────────────────────
   LuxurySelect — portal-rendered dropdown.
   Menu is appended to document.body so it
   escapes ALL parent overflow/z-index traps.
───────────────────────────────────────── */
function LuxurySelect({ value, onChange, options, placeholder = 'Any' }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // Position menu under trigger using getBoundingClientRect
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setMenuStyle({
      position: 'fixed',
      top: r.bottom + 6,
      left: r.left,
      width: r.width,
      zIndex: 9999,
    });
  }, [open]);

  // Close on outside click or scroll
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) setOpen(false);
    };
    const closeOnScroll = () => setOpen(false);
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', closeOnScroll, true);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', closeOnScroll, true);
    };
  }, [open]);

  const selected = options.find((o) => String(o.value) === String(value));
  const label = selected ? selected.label : placeholder;

  const menu = open ? createPortal(
    <div
      ref={menuRef}
      style={{
        ...menuStyle,
        background: '#111113',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(212,175,55,0.06)',
        overflow: 'hidden',
        paddingTop: '3px',
        paddingBottom: '3px',
      }}
    >
      {options.map((opt) => {
        const isActive = String(opt.value) === String(value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => { onChange(opt.value); setOpen(false); }}
            className="flex w-full items-center justify-between px-4 py-2 font-sans text-sm transition-all duration-150"
            style={{
              background: isActive ? 'rgba(212,175,55,0.12)' : 'transparent',
              color: isActive ? '#d4af37' : 'rgba(255,255,255,0.7)',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(212,175,55,0.07)';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              }
            }}
          >
            <span>{opt.label}</span>
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
        className="flex h-11 w-full items-center justify-between rounded-xl px-4 font-sans text-sm transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: open ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(255,255,255,0.08)',
          color: selected ? '#ffffff' : 'rgba(255,255,255,0.35)',
          boxShadow: open ? '0 0 0 3px rgba(212,175,55,0.08)' : 'none',
        }}
      >
        <span>{label}</span>
        <svg
          className="h-4 w-4 shrink-0 transition-transform duration-200"
          style={{ color: 'rgba(255,255,255,0.3)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {menu}
    </div>
  );
}

/* ── Option sets ── */
const PRICE_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '1', label: '₹' },
  { value: '2', label: '₹₹' },
  { value: '3', label: '₹₹₹' },
  { value: '4', label: '₹₹₹₹' },
];
const RATING_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '3', label: '3+ ★' },
  { value: '4', label: '4+ ★' },
  { value: '4.5', label: '4.5+ ★' },
];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];
const CATEGORY_OPTIONS = [
  { value: '', label: 'All cuisines' },
  ...['Indian','Italian','Chinese','Japanese','Continental','Cafe','Fine dining','Multi-cuisine']
    .map((c) => ({ value: c, label: c })),
];

const inputClass =
  'h-11 w-full min-w-0 rounded-xl border border-white/8 bg-white/[0.04] pl-10 pr-4 font-sans text-sm text-white placeholder:text-white/25 transition focus:border-luxury-gold/50 focus:outline-none focus:ring-1 focus:ring-luxury-gold/20 hover:border-white/15';

function sortLabel(v) {
  const m = { newest: 'Newest', rating: 'Top rated', price_asc: 'Price ↑', price_desc: 'Price ↓' };
  return m[v] || v;
}
function priceTicks(n) {
  const x = Number(n);
  if (!x || x < 1) return '';
  return '₹'.repeat(Math.min(4, x));
}

export default function Restaurants() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page      = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const sort      = searchParams.get('sort') || 'newest';
  const category  = searchParams.get('category') || '';
  const location  = searchParams.get('location') || '';
  const minRating = searchParams.get('minRating') || '';
  const minPrice  = searchParams.get('minPrice') || '';
  const maxPrice  = searchParams.get('maxPrice') || '';
  const qParam    = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(qParam);
  const debouncedQ = useDebounce(searchInput, 400);

  useEffect(() => { setSearchInput(qParam); }, [qParam]);

  useEffect(() => {
    const next = debouncedQ.trim();
    const cur  = (qParam || '').trim();
    if (next === cur) return;
    setSearchParams((prev) => {
      const n = new URLSearchParams(prev);
      if (next) n.set('q', next); else n.delete('q');
      n.set('page', '1');
      return n;
    }, { replace: true });
  }, [debouncedQ, qParam, setSearchParams]);

  const [data, setData]       = useState({ items: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = {
          page, limit: 12, sort,
          ...(category.trim()  ? { category: category.trim() } : {}),
          ...(location.trim()  ? { location: location.trim() } : {}),
          ...(minRating        ? { minRating }                  : {}),
          ...(minPrice         ? { minPrice }                   : {}),
          ...(maxPrice         ? { maxPrice }                   : {}),
          ...(qParam.trim()    ? { q: qParam.trim() }           : {}),
        };
        const { data: body } = await api.get('/api/restaurants', { params });
        if (cancelled) return;
        if (Array.isArray(body)) {
          setData({ items: body, total: body.length, totalPages: 1 });
        } else {
          setData({ items: body.items || [], total: body.total ?? 0, totalPages: body.totalPages ?? 1 });
        }
      } catch (e) {
        toast.error(e.message || 'Could not load restaurants');
        if (!cancelled) setData({ items: [], total: 0, totalPages: 1 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page, sort, category, location, minRating, minPrice, maxPrice, qParam]);

  const setFilter = (key, value) => {
    setSearchParams((prev) => {
      const n = new URLSearchParams(prev);
      if (value === '' || value == null) n.delete(key); else n.set(key, String(value));
      n.set('page', '1');
      return n;
    });
  };

  const searchPending = searchInput.trim() !== (qParam || '').trim();

  const removeChip = (key) => {
    if (key === 'q') setSearchInput('');
    setSearchParams((prev) => {
      const n = new URLSearchParams(prev);
      n.delete(key);
      n.set('page', '1');
      return n;
    });
  };

  const resetAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const activeChips = [];
  if (qParam.trim())   activeChips.push({ key: 'q',         label: `"${qParam.trim()}"` });
  if (location.trim()) activeChips.push({ key: 'location',  label: location.trim() });
  if (minPrice)        activeChips.push({ key: 'minPrice',  label: `Min ${priceTicks(minPrice)}` });
  if (maxPrice)        activeChips.push({ key: 'maxPrice',  label: `Max ${priceTicks(maxPrice)}` });
  if (minRating)       activeChips.push({ key: 'minRating', label: `${minRating}+ ★` });
  if (sort !== 'newest') activeChips.push({ key: 'sort',    label: sortLabel(sort) });
  if (category)        activeChips.push({ key: 'category',  label: category });

  const hasFilters = activeChips.length > 0 || page > 1;

  if (loading && !data.items.length) return <Loader label="Loading venues…" />;

  const list = data.items || [];

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #0b0b0c 0%, #121212 40%, #1a1a1a 100%)' }}
    >
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">

        {/* ── PAGE HEADER ── */}
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-luxury-gold/70">
              Curated Collection
            </p>
            <h1 className="font-display text-4xl font-light text-white md:text-5xl lg:text-6xl">
              Restaurants
            </h1>
            <div className="mt-3 h-px w-12" style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
          </div>
          {!loading && (
            <div
              className="flex items-center gap-2 self-start rounded-full px-4 py-2 md:self-auto"
              style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-luxury-gold/60" />
              <span className="font-sans text-sm text-luxury-gold/80">
                <span className="font-semibold text-luxury-gold">{data.total}</span>
                {data.total === 1 ? ' venue' : ' venues'}
              </span>
            </div>
          )}
        </header>

        {/* ── FILTER CARD ── */}
        <div
          className="rounded-2xl font-sans"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(212,175,55,0.12)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <div className="divide-y divide-white/[0.05]">

            {/* Search row */}
            <div className="p-5 md:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="font-sans text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-white/30">Search</p>
                {hasFilters && (
                  <button type="button" onClick={resetAllFilters}
                    className="font-sans text-xs text-luxury-gold/60 transition hover:text-luxury-gold hover:underline">
                    Reset all filters
                  </button>
                )}
              </div>
              <SearchInput
                id="restaurants-search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name, location, category…"
                pending={searchPending}
                inputClassName="rounded-xl border-white/8 bg-white/[0.04] text-white placeholder:text-white/25 focus:border-luxury-gold/50 focus:ring-luxury-gold/20 hover:border-white/15"
              />
              {activeChips.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="font-sans text-[0.6rem] font-semibold uppercase tracking-widest text-white/25">Active</span>
                  {activeChips.map(({ key, label }) => (
                    <button
                      key={`${key}-${label}`}
                      type="button"
                      onClick={() => removeChip(key)}
                      className="group inline-flex items-center gap-1.5 rounded-full py-1 pl-3 pr-2 font-sans text-xs text-white/60 transition-all hover:text-white"
                      style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,175,55,0.15)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; }}
                    >
                      <span>{label}</span>
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-white/40 group-hover:bg-white/20 group-hover:text-white" aria-hidden>×</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Narrow results */}
            <div className="p-5 md:p-6">
              <p className="mb-5 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-white/30">Narrow results</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {/* Location */}
                <div>
                  <label htmlFor="filter-location" className="mb-2 block font-sans text-[0.6rem] font-semibold uppercase tracking-widest text-luxury-gold/50">
                    Location
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-white/25" aria-hidden>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </span>
                    <input
                      id="filter-location"
                      placeholder="City or area"
                      value={location}
                      onChange={(e) => setFilter('location', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Min price */}
                <div>
                  <p className="mb-2 font-sans text-[0.6rem] font-semibold uppercase tracking-widest text-luxury-gold/50">Min price</p>
                  <LuxurySelect
                    value={minPrice}
                    onChange={(v) => setFilter('minPrice', v)}
                    options={PRICE_OPTIONS}
                    placeholder="Any"
                  />
                </div>

                {/* Max price */}
                <div>
                  <p className="mb-2 font-sans text-[0.6rem] font-semibold uppercase tracking-widest text-luxury-gold/50">Max price</p>
                  <LuxurySelect
                    value={maxPrice}
                    onChange={(v) => setFilter('maxPrice', v)}
                    options={PRICE_OPTIONS}
                    placeholder="Any"
                  />
                </div>

                {/* Min rating */}
                <div>
                  <p className="mb-2 font-sans text-[0.6rem] font-semibold uppercase tracking-widest text-luxury-gold/50">Min rating</p>
                  <LuxurySelect
                    value={minRating}
                    onChange={(v) => setFilter('minRating', v)}
                    options={RATING_OPTIONS}
                    placeholder="Any"
                  />
                </div>
              </div>
            </div>

            {/* Sort & category */}
            <div className="p-5 md:p-6">
              <p className="mb-5 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-white/30">Sort & category</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 font-sans text-[0.6rem] font-semibold uppercase tracking-widest text-luxury-gold/50">Sort by</p>
                  <LuxurySelect
                    value={sort}
                    onChange={(v) => setFilter('sort', v)}
                    options={SORT_OPTIONS}
                    placeholder="Newest"
                  />
                </div>
                <div>
                  <p className="mb-2 font-sans text-[0.6rem] font-semibold uppercase tracking-widest text-luxury-gold/50">Cuisine</p>
                  <LuxurySelect
                    value={category}
                    onChange={(v) => setFilter('category', v)}
                    options={CATEGORY_OPTIONS}
                    placeholder="All cuisines"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── RESULTS ── */}
        {list.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <svg className="h-8 w-8 text-luxury-gold/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="font-display text-2xl font-light text-white">No venues found</h3>
            <p className="mt-2 max-w-sm font-sans text-sm text-white/35">
              No curated dining experiences match your filters.
            </p>
            {hasFilters && (
              <button type="button" onClick={resetAllFilters}
                className="mt-6 rounded-full px-6 py-2.5 font-sans text-sm font-semibold text-[#0b0b0c] transition hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #c9a84c, #f0d060)' }}>
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            {loading && (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-white/[0.05]"
                    style={{ background: 'linear-gradient(145deg, #1a1a1a, #141414)' }}>
                    <div className="aspect-[16/10]" style={{ background: 'rgba(255,255,255,0.04)' }} />
                    <div className="space-y-3 p-5">
                      <div className="h-5 w-2/3 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      <div className="h-4 w-1/2 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((r) => <RestaurantCard key={r._id} restaurant={r} />)}
              </div>
            )}
            {data.totalPages > 1 && (
              <div className="mt-12 flex flex-wrap items-center justify-center gap-3 font-sans text-sm">
                <button type="button" disabled={page <= 1} onClick={() => setFilter('page', String(page - 1))}
                  className="flex items-center gap-2 rounded-full border px-5 py-2.5 text-white/50 transition-all hover:text-white disabled:opacity-30"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <div className="rounded-full px-5 py-2.5"
                  style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <span className="text-luxury-gold">{page}</span>
                  <span className="text-white/25"> / {data.totalPages}</span>
                </div>
                <button type="button" disabled={page >= data.totalPages} onClick={() => setFilter('page', String(page + 1))}
                  className="flex items-center gap-2 rounded-full border px-5 py-2.5 text-white/50 transition-all hover:text-white disabled:opacity-30"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                  Next
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
