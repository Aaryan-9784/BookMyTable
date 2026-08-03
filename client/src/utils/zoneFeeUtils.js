/**
 * zoneFeeUtils.js — Helper functions and metadata for Dining Zone token deposit rates & calculations.
 */

export const DINING_ZONES_META = [
  { id: 'Fine Dining', label: 'Fine Dining', icon: '🕯️', multiplier: 1.0, defaultFee: 200 },
  { id: 'Outdoor Terrace', label: 'Outdoor Terrace', icon: '🌿', multiplier: 0.9, defaultFee: 180 },
  { id: 'Rooftop Dining', label: 'Rooftop Dining', icon: '🌆', multiplier: 1.25, defaultFee: 250 },
  { id: 'VIP Dining', label: 'VIP Dining', icon: '👑', multiplier: 2.0, defaultFee: 400 },
  { id: 'Bar & Lounge', label: 'Bar & Lounge', icon: '🍸', multiplier: 1.1, defaultFee: 220 },
  { id: 'Gourmet Cuisine', label: 'Gourmet Cuisine', icon: '🍲', multiplier: 1.15, defaultFee: 230 },
  { id: 'Private Dining', label: 'Private Dining', icon: '🍷', multiplier: 1.75, defaultFee: 350 },
  { id: 'Live Music', label: 'Live Music', icon: '🎵', multiplier: 1.2, defaultFee: 240 },
];

export const ZONE_ICONS = DINING_ZONES_META.reduce((acc, item) => {
  acc[item.id] = item.icon;
  return acc;
}, {});

/**
 * Get the per-guest token deposit fee for a restaurant, dining zone, or specific table.
 */
export function getZoneTokenFee(restaurant = {}, zoneName = 'Fine Dining', table = null) {
  if (table && table.tokenFee != null && table.tokenFee > 0) {
    return Number(table.tokenFee);
  }

  const baseFee = Number(restaurant?.tokenFee ?? 200);
  const foundZone = DINING_ZONES_META.find(
    (z) => z.id.toLowerCase() === (zoneName || '').toLowerCase()
  );

  if (foundZone) {
    return Math.round(baseFee * foundZone.multiplier);
  }

  return baseFee;
}

/**
 * Calculate gross deposit amount based on zone token fee rate and guest count.
 */
export function calculateTotalDeposit(restaurant = {}, zoneName = 'Fine Dining', guestCount = 1, table = null) {
  const numGuests = Math.max(1, Number(guestCount) || 1);
  const feePerGuest = getZoneTokenFee(restaurant, zoneName, table);
  return feePerGuest * numGuests;
}
