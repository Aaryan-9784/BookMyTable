/** Half-hour slots typical for lunch/dinner reservations. */
export function restaurantTimeSlots() {
  const out = [];
  for (let h = 11; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) break;
      out.push(`${String(h).padStart(2, '0')}:${m === 0 ? '00' : '30'}`);
    }
  }
  return out;
}
