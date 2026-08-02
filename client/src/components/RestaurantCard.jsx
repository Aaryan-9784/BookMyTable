/**
 * Restaurant preview card — image, name, location; links to detail page.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getFallbackRestaurantImage } from '../utils/imageUtils.js';
import { useWishlist } from '../context/WishlistContext.jsx';

function priceLabel(n) {
  if (n == null || Number.isNaN(Number(n))) return null;
  const labels = { 1: 'Casual', 2: 'Moderate', 3: 'Premium', 4: 'Ultra Luxury' };
  return labels[Number(n)] || null;
}

export default function RestaurantCard({ restaurant }) {
  const { _id, name, location, description, imageUrl, rating, priceRange, category } = restaurant;
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(_id);
  const [imgFailed, setImgFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(restaurant);
  };

  const fallbackUrl = getFallbackRestaurantImage(restaurant);
  const currentImageUrl = (!imageUrl || imgFailed) ? fallbackUrl : imageUrl;
  const showPlaceholder = (!imageUrl && fallbackFailed) || (imgFailed && fallbackFailed);

  return (
    <article
      className="group relative overflow-hidden rounded-[22px] transition-all duration-500 cursor-pointer"
      style={{
        boxShadow: hovered
          ? '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,175,55,0.3)'
          : '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
        transform: hovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
        background: '#0f0f0f',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/restaurants/${_id}`} className="block">

        {/* ── Full image with overlay content ── */}
        <div className="relative" style={{ aspectRatio: '3/4' }}>

          {/* Image */}
          {!showPlaceholder ? (
            <img
              src={currentImageUrl}
              alt={name}
              onError={() => {
                if (!imgFailed && imageUrl) {
                  setImgFailed(true);
                } else {
                  setFallbackFailed(true);
                }
              }}
              className="absolute inset-0 h-full w-full object-cover transition-all duration-700"
              style={{
                transform: hovered ? 'scale(1.08)' : 'scale(1)',
                filter: hovered ? 'brightness(0.75)' : 'brightness(0.6)',
              }}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(160deg, #1c1a14 0%, #0a0a0a 100%)' }}
            >
              <span
                className="font-display text-8xl font-light"
                style={{ color: 'rgba(212,175,55,0.12)' }}
              >
                {name?.[0] || 'B'}
              </span>
            </div>
          )}

          {/* Full gradient overlay — heavy at bottom for text legibility */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.75) 65%, rgba(0,0,0,0.97) 100%)',
            }}
          />

          {/* ── Wishlist Heart Button — top left ── */}
          <button
            type="button"
            onClick={handleWishlistClick}
            className="absolute left-4 top-4 z-[5] flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 active:scale-90"
            style={{
              background: wishlisted ? 'rgba(239, 68, 68, 0.25)' : 'rgba(8,8,8,0.7)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: wishlisted ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.18)',
              boxShadow: wishlisted ? '0 0 16px rgba(239, 68, 68, 0.4)' : 'none',
            }}
            title={wishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
            aria-label={wishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
          >
            <svg
              className={`h-4 w-4 transition-all duration-300 ${
                wishlisted ? 'scale-110 fill-red-500 stroke-red-500' : 'fill-none stroke-white/80 hover:stroke-white'
              }`}
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>

          {/* ── Rating badge — top right ── */}
          {rating != null && (
            <div
              className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-300"
              style={{
                background: hovered ? 'rgba(212,175,55,0.2)' : 'rgba(8,8,8,0.7)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(212,175,55,0.35)',
                boxShadow: hovered ? '0 0 16px rgba(212,175,55,0.25)' : 'none',
              }}
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="#d4af37">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="font-sans text-xs font-bold text-luxury-gold">
                {Number(rating).toFixed(1)}
              </span>
            </div>
          )}



          {/* ── Content overlay — bottom of image ── */}
          <div className="absolute inset-x-0 bottom-0 p-5">

            {/* Location eyebrow */}
            <div className="mb-2 flex items-center gap-1.5">
              <svg className="h-3 w-3 shrink-0" style={{ color: 'rgba(212,175,55,0.7)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <p className="font-sans text-[0.6rem] font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgba(212,175,55,0.75)' }}>
                {location}
              </p>
            </div>

            {/* Name */}
            <h3
              className="font-display text-2xl font-semibold leading-tight text-white transition-all duration-300"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              {name}
            </h3>

            {/* Cuisine + price row */}
            {(category || priceLabel(priceRange)) && (
              <p className="mt-1.5 font-sans text-xs text-white/45">
                {[category, priceLabel(priceRange)].filter(Boolean).join('  ·  ')}
              </p>
            )}

            {/* Description — slides in on hover */}
            {description && (
              <div
                className="overflow-hidden transition-all duration-400"
                style={{
                  maxHeight: hovered ? '3rem' : '0',
                  opacity: hovered ? 1 : 0,
                  marginTop: hovered ? '8px' : '0',
                }}
              >
                <p className="line-clamp-2 font-sans text-xs leading-relaxed text-white/40">
                  {description}
                </p>
              </div>
            )}

            {/* Divider + CTA */}
            <div className="mt-4 flex items-center justify-between">
              <div
                className="h-px flex-1 mr-4 transition-all duration-300"
                style={{
                  background: hovered
                    ? 'linear-gradient(90deg, rgba(212,175,55,0.4), transparent)'
                    : 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)',
                }}
              />
              <span
                className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 font-sans text-xs font-semibold transition-all duration-300"
                style={hovered ? {
                  background: 'linear-gradient(135deg, #c9a84c, #f5e6a3)',
                  color: '#0a0a0a',
                  boxShadow: '0 0 20px rgba(212,175,55,0.4)',
                } : {
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                Reserve
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </div>
          </div>
        </div>

      </Link>
    </article>
  );
}
