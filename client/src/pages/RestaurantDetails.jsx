/**
 * Single restaurant — gallery, info, booking CTA.
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Loader from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function priceLabel(n) {
  if (n == null || Number.isNaN(Number(n))) return '';
  return '₹'.repeat(Math.min(4, Math.max(1, Number(n))));
}

export default function RestaurantDetails() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [r, setR] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgHovered, setImgHovered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/api/restaurants/${id}`);
        if (!cancelled) setR(data);
      } catch (e) {
        toast.error(e.message || 'Restaurant not found');
        if (!cancelled) setR(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <Loader label="Loading details…" />;

  if (!r) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center font-sans text-white/40">
        We could not load this restaurant.{' '}
        <Link to="/restaurants" className="text-luxury-gold underline">
          Back to list
        </Link>
      </div>
    );
  }

  const gallery = (() => {
    const urls = Array.isArray(r.imageUrls) && r.imageUrls.length ? [...r.imageUrls] : [];
    if (r.imageUrl && !urls.includes(r.imageUrl)) urls.unshift(r.imageUrl);
    return urls.filter(Boolean);
  })();

  const heroImage = gallery[0] || null;

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #0b0b0c 0%, #111111 60%, #1a1a1a 100%)' }}
    >
      {/* ── HERO ── */}
      <section className="mx-auto max-w-6xl px-4 pt-10 md:px-8 md:pt-14">

        {/* Back link */}
        <Link
          to="/restaurants"
          className="mb-8 inline-flex items-center gap-2 font-sans text-sm text-white/35 transition-colors duration-200 hover:text-luxury-gold"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All restaurants
        </Link>

        {/* Two-column hero */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12 xl:grid-cols-[55%_45%]">

          {/* ── LEFT: Image ── */}
          <div
            className="relative overflow-hidden rounded-2xl cursor-pointer"
            style={{
              boxShadow: imgHovered
                ? '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,175,55,0.2)'
                : '0 16px 60px rgba(0,0,0,0.6)',
              transition: 'box-shadow 0.4s ease',
            }}
            onMouseEnter={() => setImgHovered(true)}
            onMouseLeave={() => setImgHovered(false)}
          >
            {heroImage ? (
              <>
                <img
                  src={heroImage}
                  alt={r.name}
                  className="w-full object-cover transition-all duration-700"
                  style={{
                    aspectRatio: '4/3',
                    transform: imgHovered ? 'scale(1.04)' : 'scale(1)',
                    filter: imgHovered ? 'brightness(1.05)' : 'brightness(0.9)',
                  }}
                />
                {/* Overlay gradient */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to top, rgba(10,10,10,0.6) 0%, transparent 50%)',
                  }}
                />
              </>
            ) : (
              <div
                className="flex items-center justify-center"
                style={{
                  aspectRatio: '4/3',
                  background: 'linear-gradient(135deg, #1a1a1a, #0f0f0f)',
                }}
              >
                <span className="font-display text-8xl" style={{ color: 'rgba(212,175,55,0.12)' }}>
                  {r.name?.[0] || 'R'}
                </span>
              </div>
            )}

            {/* Extra gallery thumbnails */}
            {gallery.length > 1 && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                {gallery.slice(1, 4).map((url, i) => (
                  <div
                    key={url}
                    className="h-12 w-16 overflow-hidden rounded-lg"
                    style={{ border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover opacity-80" />
                  </div>
                ))}
                {gallery.length > 4 && (
                  <div
                    className="flex h-12 w-16 items-center justify-center rounded-lg font-sans text-xs text-white/60"
                    style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    +{gallery.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: Content ── */}
          <div className="flex flex-col justify-between py-2">
            <div>
              {/* Location eyebrow */}
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-luxury-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-luxury-gold/70">
                  {r.location}
                </p>
              </div>

              {/* Name */}
              <h1 className="font-display text-4xl font-light leading-tight text-white md:text-5xl lg:text-[3.25rem]">
                {r.name}
              </h1>

              {/* Gold underline */}
              <div
                className="mt-4 h-px w-16"
                style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }}
              />

              {/* Cuisine + rating row */}
              {(r.category || r.rating != null) && (
                <div className="mt-5 flex items-center gap-3">
                  {r.category && (
                    <span
                      className="rounded-full px-3.5 py-1.5 font-sans text-xs font-medium text-white/70"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {r.category}
                    </span>
                  )}
                  {r.rating != null && (
                    <div className="flex items-center gap-1.5">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#d4af37">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="font-sans text-sm font-semibold text-luxury-gold">
                        {Number(r.rating).toFixed(1)}
                      </span>
                      <span className="font-sans text-xs text-white/25">/ 5.0</span>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <p className="mt-6 font-sans text-base leading-[1.8] text-white/45">
                {r.description || 'Experience refined dining in an atmosphere designed for conversation and flavor.'}
              </p>

              {/* Info grid */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { label: 'Price',    value: priceLabel(r.priceRange) || '—' },
                  { label: 'Cuisine',  value: r.category || '—' },
                  { label: 'Location', value: r.location || '—' },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3.5"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <p className="font-sans text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-white/25">
                      {label}
                    </p>
                    <p className="mt-1.5 truncate font-sans text-sm font-medium text-white/80">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8">
              {isAuthenticated ? (
                <Link
                  to={`/restaurants/${id}/book`}
                  className="inline-flex items-center gap-3 rounded-full px-8 py-4 font-sans text-base font-semibold text-[#0a0a0a] transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
                  style={{
                    background: 'linear-gradient(135deg, #c9a84c 0%, #f5e6a3 50%, #c9a84c 100%)',
                    boxShadow: '0 0 40px rgba(212,175,55,0.3), 0 8px 24px rgba(0,0,0,0.4)',
                  }}
                >
                  Reserve a table
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              ) : (
                <Link
                  to="/login"
                  state={{ from: { pathname: `/restaurants/${id}/book` } }}
                  className="inline-flex items-center gap-3 rounded-full px-8 py-4 font-sans text-base font-semibold text-luxury-gold transition-all duration-300 hover:bg-luxury-gold/10 active:scale-[0.97]"
                  style={{
                    border: '1px solid rgba(212,175,55,0.4)',
                    boxShadow: '0 0 24px rgba(212,175,55,0.1)',
                  }}
                >
                  Log in to reserve
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── EXTRA GALLERY (remaining images) ── */}
        {gallery.length > 1 && (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.slice(1, 5).map((url) => (
              <div
                key={url}
                className="group overflow-hidden rounded-xl"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <img
                  src={url}
                  alt=""
                  className="aspect-[4/3] w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
                />
              </div>
            ))}
          </div>
        )}

        <div className="pb-16" />
      </section>
    </div>
  );
}
