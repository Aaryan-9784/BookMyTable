/**
 * Dynamic time slots generator based on restaurant opening hours.
 */
export function generateSlotsFromOpeningHours(openingHoursStr) {
  if (!openingHoursStr || typeof openingHoursStr !== 'string') {
    return defaultTimeSlots();
  }

  // Parse start time and end time from string e.g. "11:00 AM - 11:00 PM"
  const parts = openingHoursStr.split(/[-–—to]+/i);
  if (parts.length < 2) return defaultTimeSlots();

  const parseTimeInMinutes = (timeStr) => {
    const clean = timeStr.trim();
    const match = clean.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (!match) return null;
    let hour = parseInt(match[1], 10);
    const min = match[2] ? parseInt(match[2], 10) : 0;
    const period = match[3] ? match[3].toUpperCase() : null;

    if (period === 'PM' && hour < 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour * 60 + min;
  };

  const startMin = parseTimeInMinutes(parts[0]);
  const endMin = parseTimeInMinutes(parts[1]);

  if (startMin === null || endMin === null || startMin >= endMin) {
    return defaultTimeSlots();
  }

  const slots = [];
  for (let m = startMin; m <= endMin - 30; m += 30) {
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    const formatted = `${String(hh).padStart(2, '0')}:${mm === 0 ? '00' : '30'}`;
    slots.push(formatted);
  }

  return slots.length ? slots : defaultTimeSlots();
}

export function defaultTimeSlots() {
  const out = [];
  for (let h = 11; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) break;
      out.push(`${String(h).padStart(2, '0')}:${m === 0 ? '00' : '30'}`);
    }
  }
  return out;
}

export function restaurantTimeSlots(openingHoursStr) {
  return generateSlotsFromOpeningHours(openingHoursStr);
}
