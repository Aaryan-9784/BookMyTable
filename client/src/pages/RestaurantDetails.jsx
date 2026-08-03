/**
 * Single restaurant details — rich info grid, gallery switcher, Google Maps, experiences, reviews, booking CTA.
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Loader from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { getFallbackRestaurantImage } from '../utils/imageUtils.js';

import { getZoneTokenFee, DINING_ZONES_META } from '../utils/zoneFeeUtils.js';

function priceLabel(n) {
  if (n == null || Number.isNaN(Number(n))) return 'Moderate Fine Dining';
  const labels = { 1: 'Casual / Budget', 2: 'Moderate Fine Dining', 3: 'Premium Luxury', 4: 'Ultra Luxury' };
  return labels[Number(n)] || 'Moderate Fine Dining';
}

function formatHours(str) {
  if (!str) return '11:00 AM – 11:00 PM';
  return str.replace(/\s+to\s+/gi, ' – ').replace(/\s*-\s*/g, ' – ');
}

const EXPERIENCE_ICONS = {
  'Fine Dining': '🕯️',
  'Outdoor Terrace': '🌿',
  'Rooftop Dining': '🌆',
  'VIP Dining': '👑',
  'Bar & Lounge': '🍸',
  'Gourmet Cuisine': '🍲',
  'Private Dining': '🍷',
  'Live Music': '🎵',
};

export default function RestaurantDetails() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(id);
  const [r, setR] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imgHovered, setImgHovered] = useState(false);
  const [failedImages, setFailedImages] = useState({});

  /* Dining Zone & Guests Selection State */
  const [selectedZone, setSelectedZone] = useState('Fine Dining');
  const [selectedGuests, setSelectedGuests] = useState(2);
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);

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

  if (loading) {
    return <Loader />;
  }

  if (!r) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center font-sans text-white/40">
        We could not load this restaurant.{' '}
        <Link to="/restaurants" className="text-luxury-gold underline">
          Back to all restaurants
        </Link>
      </div>
    );
  }

  const cleanUrl = (url) => {
    if (typeof url !== 'string') return url;
    return url.replace(/&#x2F;/g, '/').replace(/&amp;/g, '&');
  };

  const gallery = (() => {
    const rawUrls = Array.isArray(r?.imageUrls) && r.imageUrls.length ? [...r.imageUrls] : [];
    if (r?.imageUrl && !rawUrls.includes(r.imageUrl)) rawUrls.unshift(r.imageUrl);
    const valid = rawUrls.map(cleanUrl).filter(Boolean);
    if (valid.length === 0) {
      valid.push(getFallbackRestaurantImage(r));
    }
    return valid;
  })();

  const activeHeroImage = failedImages[selectedImageIndex]
    ? getFallbackRestaurantImage(r)
    : (gallery[selectedImageIndex] || gallery[0] || getFallbackRestaurantImage(r));

  const experiences = Array.isArray(r.experiences) && r.experiences.length > 0
    ? r.experiences
    : ['Fine Dining', 'Outdoor Terrace', 'Private Dining', 'Live Music'];

  const defaultReviews = [
    {
      author: 'Ananya Roy',
      rating: 5,
      date: '2 days ago',
      text: 'Exquisite ambiance and impeccable service. The booking process via BookMyTable was flawless.',
    },
    {
      author: 'Vikram Malhotra',
      rating: 4.8,
      date: '1 week ago',
      text: 'Outstanding flavors and premium hospitality. Highly recommended for special occasions.',
    },
  ];

  const reviewsList = Array.isArray(r.reviews) && r.reviews.length > 0 ? r.reviews : defaultReviews;

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(180deg, #0b0b0c 0%, #111111 50%, #171717 100%)' }}
    >
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-20 md:px-8 md:pt-12">

        {/* ── BACK LINK ── */}
        <Link
          to="/restaurants"
          className="mb-6 inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wider text-white/40 transition-colors duration-200 hover:text-luxury-gold"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to all restaurants
        </Link>

        {/* ── MAIN HERO HEADER GRID ── */}
        <div className="grid gap-8 lg:grid-cols-[55%_45%] lg:gap-12 items-start">

          {/* ── LEFT: IMAGE & THUMBNAIL GALLERY SWITCHER ── */}
          <div className="space-y-4">
            <div
              className="relative overflow-hidden rounded-3xl cursor-pointer"
              style={{
                boxShadow: imgHovered
                  ? '0 24px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(212,175,55,0.3)'
                  : '0 16px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.08)',
                transition: 'box-shadow 0.4s ease',
              }}
              onMouseEnter={() => setImgHovered(true)}
              onMouseLeave={() => setImgHovered(false)}
            >
              <img
                src={activeHeroImage}
                alt={r.name}
                onError={() => setFailedImages((prev) => ({ ...prev, [selectedImageIndex]: true }))}
                className="w-full object-cover transition-all duration-700"
                style={{
                  aspectRatio: '4/3',
                  transform: imgHovered ? 'scale(1.03)' : 'scale(1)',
                  filter: imgHovered ? 'brightness(1.03)' : 'brightness(0.92)',
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.7) 0%, transparent 60%)' }}
              />
            </div>

            {/* Thumbnail switcher gallery */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {gallery.map((url, index) => {
                  const isActive = index === selectedImageIndex;
                  return (
                    <button
                      key={url + index}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl transition-all duration-200"
                      style={{
                        border: isActive ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.12)',
                        boxShadow: isActive ? '0 0 16px rgba(212,175,55,0.4)' : 'none',
                        opacity: isActive ? 1 : 0.65,
                      }}
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT: TITLE, KEY STATS & PRIMARY CTA ── */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              {/* Location Eyebrow */}
              <div className="mb-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-luxury-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <p className="font-sans text-xs font-bold uppercase tracking-[0.25em] text-luxury-gold">
                  {r.location}
                </p>
              </div>

              {/* Title */}
              <h1 className="font-display text-4xl font-light leading-tight text-white md:text-5xl lg:text-[3.25rem]">
                {r.name}
              </h1>

              {/* Gold Divider */}
              <div
                className="mt-4 h-px w-20"
                style={{ background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.2), transparent)' }}
              />

              {/* Rating + Cuisine Row */}
              <div className="mt-5 flex flex-wrap items-center gap-4">
                {r.rating != null && (
                  <div
                    className="flex items-center gap-2 rounded-full px-4 py-1.5"
                    style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)' }}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#d4af37">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="font-sans text-sm font-bold text-luxury-gold">
                      {Number(r.rating).toFixed(1)}
                    </span>
                    <span className="font-sans text-xs text-white/40">/ 5.0</span>
                  </div>
                )}

                <span className="font-sans text-xs font-medium text-white/50">
                  {r.category || 'Multi-cuisine'}
                </span>
              </div>

              {/* Description */}
              <p className="mt-6 font-sans text-base leading-relaxed text-white/60">
                {r.description || 'Experience refined dining in an atmosphere designed for conversation, elegance, and supreme culinary craftsmanship.'}
              </p>
            </div>

            {/* ── ULTRA-SLEEK COMPACT RESERVATION CTA BOX ── */}
            {(() => {
              const zoneTokenFee = getZoneTokenFee(r, selectedZone);
              const numGuests = Math.max(1, Number(selectedGuests) || 1);
              const totalDeposit = zoneTokenFee * numGuests;
              const selectedZoneMeta = DINING_ZONES_META.find((z) => z.id === selectedZone) || { icon: '🕯️', label: selectedZone };

              return (
                <div
                  className="rounded-2xl p-5 space-y-4"
                  style={{
                    background: 'linear-gradient(160deg, rgba(26,26,30,0.95) 0%, rgba(14,14,16,0.98) 100%)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(212,175,55,0.06)',
                  }}
                >
                  {/* 2-Column Grid: DINING ZONE & GUESTS (Side-by-side to save space) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    {/* DINING ZONE */}
                    <div className="space-y-1.5 relative">
                      <label className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-luxury-gold block">
                        DINING ZONE
                      </label>
                      
                      <button
                        type="button"
                        onClick={() => setZoneDropdownOpen((prev) => !prev)}
                        className="w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 font-sans text-xs font-semibold text-white transition-all duration-200"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: zoneDropdownOpen ? '1px solid #d4af37' : '1px solid rgba(212,175,55,0.35)',
                          boxShadow: zoneDropdownOpen ? '0 0 12px rgba(212,175,55,0.2)' : 'none',
                        }}
                      >
                        <span className="flex items-center gap-2 truncate text-white">
                          <span className="text-sm">{selectedZoneMeta.icon}</span>
                          <span className="truncate">{selectedZone}</span>
                        </span>
                        <svg
                          className={`h-3.5 w-3.5 text-luxury-gold shrink-0 transition-transform duration-200 ${zoneDropdownOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Custom Dropdown List */}
                      {zoneDropdownOpen && (
                        <div
                          className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl p-1.5 space-y-0.5 shadow-2xl overflow-hidden max-h-56 overflow-y-auto"
                          style={{
                            background: '#141416',
                            border: '1px solid rgba(212,175,55,0.35)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 16px 40px rgba(0,0,0,0.95)',
                          }}
                        >
                          {experiences.map((zoneName) => {
                            const meta = DINING_ZONES_META.find((z) => z.id === zoneName) || { icon: EXPERIENCE_ICONS[zoneName] || '🕯️', label: zoneName };
                            const isSelected = selectedZone === zoneName;
                            const fee = getZoneTokenFee(r, zoneName);

                            return (
                              <button
                                key={zoneName}
                                type="button"
                                onClick={() => {
                                  setSelectedZone(zoneName);
                                  setZoneDropdownOpen(false);
                                }}
                                className="w-full flex items-center justify-between rounded-lg px-3 py-2 font-sans text-xs font-medium transition-all duration-150"
                                style={{
                                  background: isSelected ? 'rgba(212,175,55,0.15)' : 'transparent',
                                  color: isSelected ? '#d4af37' : 'rgba(255,255,255,0.85)',
                                }}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span>{meta.icon}</span>
                                  <span className="truncate">{zoneName}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] text-white/40 font-normal">₹{fee}/guest</span>
                                  {isSelected && (
                                    <svg className="h-3.5 w-3.5 text-luxury-gold stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                    {/* NUMBER OF GUESTS */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-luxury-gold">
                          GUESTS
                        </label>
                        <span className="font-sans text-[11px] font-bold text-white">
                          {numGuests} {numGuests === 1 ? 'Guest' : 'Guests'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedGuests((g) => Math.max(1, (Number(g) || 1) - 1))}
                          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-base font-bold text-white transition-all hover:bg-white/10 active:scale-95"
                        >
                          –
                        </button>

                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={selectedGuests}
                          onChange={(e) => setSelectedGuests(Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)))}
                          className="w-full h-[38px] text-center rounded-xl border border-white/10 bg-white/[0.04] px-2 font-sans text-sm font-bold text-white outline-none focus:border-luxury-gold/60"
                        />

                        <button
                          type="button"
                          onClick={() => setSelectedGuests((g) => Math.min(50, (Number(g) || 1) + 1))}
                          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-base font-bold text-white transition-all hover:bg-white/10 active:scale-95"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* COMPACT REFUNDABLE TOKEN DEPOSIT BANNER */}
                  <div
                    className="rounded-xl p-3 flex items-center justify-between gap-3"
                    style={{
                      background: 'rgba(212,175,55,0.06)',
                      border: '1px solid rgba(212,175,55,0.25)',
                    }}
                  >
                    <div>
                      <p className="font-sans text-[9px] font-bold uppercase tracking-[0.18em] text-luxury-gold">
                        REFUNDABLE TOKEN DEPOSIT
                      </p>
                      <p className="font-sans text-xl font-extrabold text-white mt-0.5">
                        ₹{zoneTokenFee} <span className="text-xs font-normal text-white/50">/ guest ({selectedZone})</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] uppercase font-semibold text-white/40 tracking-wider">Total Payable</p>
                      <p className="font-sans text-lg font-bold text-luxury-gold">₹{totalDeposit}</p>
                    </div>
                  </div>

                  {/* RESERVE BUTTON & WISHLIST */}
                  <div className="flex items-center gap-2.5">
                    {isAuthenticated ? (
                      <Link
                        to={`/restaurants/${id}/book?zone=${encodeURIComponent(selectedZone)}&guests=${selectedGuests}`}
                        className="flex flex-1 items-center justify-center gap-2.5 rounded-xl py-3.5 font-sans text-sm font-bold text-[#0a0a0a] transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
                        style={{
                          background: 'linear-gradient(135deg, #c9a84c 0%, #f5e6a3 50%, #c9a84c 100%)',
                          boxShadow: '0 0 25px rgba(212,175,55,0.3), 0 4px 15px rgba(0,0,0,0.4)',
                        }}
                      >
                        Reserve a Table Now
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    ) : (
                      <Link
                        to="/login"
                        state={{ from: { pathname: `/restaurants/${id}/book`, search: `?zone=${encodeURIComponent(selectedZone)}&guests=${selectedGuests}` } }}
                        className="flex flex-1 items-center justify-center gap-2.5 rounded-xl py-3.5 font-sans text-sm font-bold text-luxury-gold transition-all duration-300 hover:bg-luxury-gold/10 active:scale-[0.98]"
                        style={{
                          border: '1px solid rgba(212,175,55,0.4)',
                          boxShadow: '0 0 15px rgba(212,175,55,0.1)',
                        }}
                      >
                        Log in to Reserve
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleWishlist(r)}
                      className="flex h-[46px] shrink-0 items-center justify-center gap-2 rounded-xl px-3.5 font-sans text-xs font-bold transition-all duration-300 active:scale-95"
                      style={{
                        background: wishlisted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: wishlisted ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                        color: wishlisted ? '#f87171' : '#ffffff',
                      }}
                      title={wishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                    >
                      <svg
                        className={`h-4 w-4 transition-transform duration-300 ${wishlisted ? 'scale-110 fill-red-500 stroke-red-500' : 'fill-none stroke-current'}`}
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </svg>
                      <span className="hidden sm:inline">{wishlisted ? 'Saved' : 'Wishlist'}</span>
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>

        {/* ── SECTION: COMPLETE VENUE HIGHLIGHTS GRID ── */}
        <div className="mt-14 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">Venue Specifications & Highlights</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              {
                icon: '🏛️',
                label: 'PRICE TIER',
                value: priceLabel(r.priceRange),
              },
              {
                icon: '🍲',
                label: 'CUISINE',
                value: r.category || 'Multi-cuisine',
              },
              {
                icon: '📍',
                label: 'LOCATION',
                value: r.location || '—',
              },
              {
                icon: '🕒',
                label: 'HOURS',
                value: formatHours(r.openingHours),
              },
              {
                icon: '🪑',
                label: 'CAPACITY',
                value: `${(r.tables && r.tables.length > 0 ? r.tables.reduce((sum, t) => sum + (t.capacity || 0), 0) : (r.totalSeatingCapacity || 40))} Seats`,
              },
              {
                icon: '💳',
                label: 'TOKEN DEPOSIT',
                value: `₹${getZoneTokenFee(r, selectedZone)} / Seat (${selectedZone})`,
              },
            ].map(({ icon, label, value }) => (
              <div
                key={label}
                className="rounded-2xl p-4 transition-all duration-300 hover:border-luxury-gold/40 flex flex-col justify-between"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-lg">{icon}</span>
                  <span className="font-sans text-[9px] font-bold uppercase tracking-[0.18em] text-luxury-gold">
                    {label}
                  </span>
                </div>
                <p className="font-sans text-xs sm:text-sm font-semibold text-white/90 leading-normal break-words">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION: DINING EXPERIENCES & AMBIANCE TAGS ── */}
        {experiences.length > 0 && (
          <div className="mt-12 space-y-4">
            <h2 className="font-display text-2xl font-semibold text-white">Dining Experiences & Ambiance</h2>
            <div className="flex flex-wrap gap-3">
              {experiences.map((exp) => (
                <div
                  key={exp}
                  className="flex items-center gap-2 rounded-2xl px-5 py-3 font-sans text-sm font-semibold text-white/80 transition-all duration-300 hover:border-luxury-gold/50"
                  style={{
                    background: 'rgba(212,175,55,0.06)',
                    border: '1px solid rgba(212,175,55,0.2)',
                  }}
                >
                  <span>{EXPERIENCE_ICONS[exp] || '✨'}</span>
                  <span>{exp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SECTION: LOCATION & GOOGLE MAPS ── */}
        <div className="mt-14 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">Location & Map Directions</h2>
              <p className="font-sans text-xs text-white/40 mt-1">📍 {r.name} • {r.location}</p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' ' + r.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-xs font-bold text-luxury-gold transition-all duration-200 hover:bg-luxury-gold/10"
              style={{ border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.06)' }}
            >
              <span>Get Directions</span>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>

          <div
            className="overflow-hidden rounded-2xl"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            <iframe
              title={`Google Map for ${r.name}`}
              width="100%"
              height="350"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(1.2)' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(r.name + ' ' + r.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
        </div>

        {/* ── SECTION: REVIEWS & GUEST FEEDBACK ── */}
        <div className="mt-14 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-white">Guest Reviews & Ratings</h2>
            <div className="flex items-center gap-1.5 text-luxury-gold font-sans text-sm font-bold">
              ★ {Number(r.rating || 4.8).toFixed(1)} / 5.0
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {reviewsList.map((rev, idx) => (
              <div
                key={rev.author + idx}
                className="rounded-2xl p-5 space-y-3"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full font-sans font-bold text-luxury-gold"
                      style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)' }}
                    >
                      {rev.author?.[0] || 'G'}
                    </div>
                    <div>
                      <p className="font-sans text-sm font-bold text-white">{rev.author}</p>
                      <p className="font-sans text-xs text-white/30">{rev.date || 'Verified Guest'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-sans text-xs font-bold text-luxury-gold">
                    ★ {rev.rating || 5}
                  </div>
                </div>
                <p className="font-sans text-sm leading-relaxed text-white/60 italic">
                  "{rev.text}"
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
