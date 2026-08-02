import React from 'react';
import { restaurantApi } from '../services/restaurantApi.js';

const DEFAULT_RESTAURANT_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';

/**
 * RestaurantHeader — Executive header banner for all Partner Console pages.
 * Displays restaurant image thumbnail, static branding title, location & category,
 * and page-specific contextual metadata items without flickering on tab switches.
 */
export default function RestaurantHeader({ restaurant, title, description, actions, extraMeta }) {
  const cached = restaurantApi.getActiveRestaurant() || {};
  const r = { ...cached, ...(restaurant || {}) };

  const name         = r.name || 'The Grand Thakar';
  const location     = r.location || 'Odhav, Ahmedabad';
  const category     = r.category || 'Multi-cuisine';
  const tokenFee     = r.tokenFee ?? 200;
  const capacity     = r.totalSeatingCapacity || r.capacity;
  const openingHours = r.openingHours;

  const imageUrl = r.imageUrl || (Array.isArray(r.imageUrls) && r.imageUrls[0]) || DEFAULT_RESTAURANT_IMAGE;

  return (
    <div
      className="mb-8 rounded-2xl p-6 sm:p-7 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(26,26,30,0.95) 0%, rgba(16,16,19,0.98) 100%)',
        border: '1px solid rgba(212,175,55,0.22)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Background ambient gold aura glow */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 min-w-0">
          
          {/* Restaurant Image + Name Heading (Static Header) */}
          <div className="flex items-center gap-4">
            <div
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden shrink-0 relative bg-black/40"
              style={{
                border: '2px solid rgba(212,175,55,0.4)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.6), 0 0 16px rgba(212,175,55,0.15)',
              }}
            >
              <img
                src={imageUrl}
                alt={name}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_RESTAURANT_IMAGE;
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <h1
                className="font-display leading-tight text-white font-bold tracking-wide truncate"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
              >
                {name}
              </h1>

              {/* Key Details Row: First two fixed (Location, Cuisine), remaining page-specific */}
              <div className="mt-2.5 flex items-center gap-x-3 gap-y-1.5 font-sans text-xs text-luxury-muted flex-wrap">
                {/* 1. Location (Fixed First) */}
                <span className="flex items-center gap-1.5 text-white/90 font-medium">
                  <span className="text-luxury-gold">📍</span> {location}
                </span>

                <span className="text-white/20">·</span>

                {/* 2. Cuisine / Category (Fixed Second) */}
                <span className="flex items-center gap-1.5 text-white/90 font-medium">
                  <span className="text-luxury-gold">🍽️</span> {category}
                </span>

                {/* Remaining items (Page requirement specific) */}
                {extraMeta ? (
                  extraMeta
                ) : (
                  <>
                    <span className="text-white/20">·</span>
                    <span className="flex items-center gap-1.5 text-white/90 font-medium">
                      <span className="text-luxury-gold">💎</span> Base Token Fee:{' '}
                      <strong className="text-luxury-gold font-bold">₹{tokenFee}</strong>
                    </span>

                    {capacity ? (
                      <>
                        <span className="text-white/20">·</span>
                        <span className="flex items-center gap-1.5 text-white/90 font-medium">
                          <span className="text-luxury-gold">🪑</span> Seating:{' '}
                          <strong className="text-white font-semibold">{capacity} Guests</strong>
                        </span>
                      </>
                    ) : null}

                    {openingHours ? (
                      <>
                        <span className="text-white/20">·</span>
                        <span className="flex items-center gap-1.5 text-white/90 font-medium">
                          <span className="text-luxury-gold">⏰</span> {openingHours}
                        </span>
                      </>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Current Page Sub-Header */}
          {title && (
            <div
              className="mt-5 pt-4 flex items-center justify-between"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div>
                <h2 className="font-display text-lg sm:text-xl font-semibold text-luxury-gold">
                  {title}
                </h2>
                {description && (
                  <p className="mt-0.5 font-sans text-xs text-luxury-muted">
                    {description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Page Actions */}
        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap shrink-0 self-start lg:self-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
