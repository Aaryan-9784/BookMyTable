/**
 * Restaurant Partner / Vendor Dashboard Controller.
 * Handles table & seating capacity management, booking administration, token fee analysis, and restaurant settings.
 */
import Restaurant from '../models/Restaurant.js';
import Table from '../models/Table.js';
import Booking from '../models/Booking.js';
import Wishlist from '../models/Wishlist.js';
import User from '../models/User.js';
import { pushToUser } from '../utils/sseManager.js';

/**
 * Helper to retrieve active restaurant ID or default to user's assigned restaurant
 */
async function getTargetRestaurant(req) {
  const reqRestaurantId = req.query.restaurantId || req.body.restaurantId;
  if (reqRestaurantId) {
    const found = await Restaurant.findById(reqRestaurantId);
    if (found) return found;
  }

  // 1. Check if authenticated user owns a restaurant
  if (req.user?._id) {
    const owned = await Restaurant.findOne({ ownerId: req.user._id });
    if (owned) return owned;
  }

  // 2. Fallback to first available restaurant or create default partner restaurant
  let target = await Restaurant.findOne().sort({ createdAt: 1 });
  if (!target) {
    target = await Restaurant.create({
      name: 'BookMyTable Partner Restaurant',
      location: 'Downtown Gourmet Hub',
      category: 'Multi-cuisine',
      description: 'Welcome to your restaurant partner console. Configure tables, seating capacity, and bookings here.',
      tokenFee: 150,
      openingHours: '11:00 AM - 11:00 PM',
      rating: 4.8,
      ...(req.user?._id ? { ownerId: req.user._id } : {}),
    });
  } else if (req.user?._id && !target.ownerId) {
    target.ownerId = req.user._id;
    await target.save();
  }

  return target;
}

/**
 * Auto-seed initial tables if none exist for the restaurant
 */
async function ensureDefaultTables(restaurantId, tokenFee = 150) {
  const count = await Table.countDocuments({ restaurantId });
  if (count === 0) {
    const defaultTables = [
      { restaurantId, tableNumber: 'T-01', capacity: 2, zone: 'Fine Dining', status: 'Available', tokenFee },
      { restaurantId, tableNumber: 'T-02', capacity: 2, zone: 'Fine Dining', status: 'Reserved', tokenFee },
      { restaurantId, tableNumber: 'T-03', capacity: 4, zone: 'Fine Dining', status: 'Available', tokenFee },
      { restaurantId, tableNumber: 'T-04', capacity: 4, zone: 'Outdoor Terrace', status: 'Available', tokenFee },
      { restaurantId, tableNumber: 'T-05', capacity: 6, zone: 'Outdoor Terrace', status: 'Available', tokenFee },
      { restaurantId, tableNumber: 'VIP-01', capacity: 8, zone: 'VIP Dining', status: 'Reserved', tokenFee: tokenFee * 1.5 },
      { restaurantId, tableNumber: 'VIP-02', capacity: 10, zone: 'VIP Dining', status: 'Available', tokenFee: tokenFee * 2 },
      { restaurantId, tableNumber: 'RT-01', capacity: 4, zone: 'Rooftop Dining', status: 'Available', tokenFee },
      { restaurantId, tableNumber: 'BAR-01', capacity: 2, zone: 'Bar & Lounge', status: 'Available', tokenFee },
      { restaurantId, tableNumber: 'PD-01', capacity: 6, zone: 'Private Dining', status: 'Available', tokenFee: tokenFee * 1.5 },
      { restaurantId, tableNumber: 'LM-01', capacity: 4, zone: 'Live Music', status: 'Available', tokenFee },
    ];
    await Table.insertMany(defaultTables);
  }
}

const DEFAULT_RESTAURANT_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';

function formatRestaurantResponse(r, calculatedCapacity) {
  if (!r) return null;
  const img = r.imageUrl || (Array.isArray(r.imageUrls) && r.imageUrls[0]) || DEFAULT_RESTAURANT_IMAGE;
  const imgList = Array.isArray(r.imageUrls) && r.imageUrls.length ? r.imageUrls : [img];
  const cap = calculatedCapacity !== undefined ? calculatedCapacity : (r.totalSeatingCapacity || 40);
  return {
    id: r._id,
    _id: r._id,
    name: r.name || 'The Grand Thakar',
    location: r.location || 'Odhav, Ahmedabad',
    category: r.category || 'Multi-cuisine',
    description: r.description || '',
    imageUrl: img,
    imageUrls: imgList,
    tokenFee: r.tokenFee || 200,
    openingHours: r.openingHours || '11:00 AM - 11:00 PM',
    totalSeatingCapacity: cap,
    priceRange: r.priceRange || 2,
    experiences: Array.isArray(r.experiences) && r.experiences.length ? r.experiences : ['Fine Dining', 'Outdoor Terrace', 'Private Dining', 'Live Music'],
    approvalStatus: 'approved',
  };
}

async function syncRestaurantCapacity(restaurantId) {
  try {
    const tables = await Table.find({ restaurantId });
    const total = tables.reduce((acc, t) => acc + (t.capacity || 0), 0);
    await Restaurant.findByIdAndUpdate(restaurantId, { totalSeatingCapacity: total });
    return total;
  } catch (err) {
    return 0;
  }
}

/**
 * GET /api/restaurant-dashboard/stats
 */
export async function getDashboardStats(req, res) {
  const restaurant = await getTargetRestaurant(req);
  if (!restaurant) {
    return res.status(444).json({ ok: false, error: 'No restaurant found in system.' });
  }

  await ensureDefaultTables(restaurant._id, restaurant.tokenFee || 150);

  const tables = await Table.find({ restaurantId: restaurant._id });
  const totalTables = tables.length;
  const totalCapacity = tables.reduce((acc, t) => acc + (t.capacity || 0), 0);

  // Sync DB
  await Restaurant.findByIdAndUpdate(restaurant._id, { totalSeatingCapacity: totalCapacity });

  const bookings = await Booking.find({ restaurantId: restaurant._id })
    .populate('userId', 'name email phone')
    .sort({ date: -1, time: -1, createdAt: -1 });

  const activeConfirmedBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'checked-in' || b.status === 'completed'
  );
  const activeBookings = activeConfirmedBookings.length;

  const totalGuestsInBookings = activeConfirmedBookings.reduce((acc, b) => acc + (b.guests || 1), 0);

  const tokenFeeRate = restaurant.tokenFee || 150;
  const totalTokenFees = activeConfirmedBookings.reduce(
    (sum, b) => sum + (b.totalAmount || (b.guests || 1) * tokenFeeRate),
    0
  );

  const availableCount = tables.filter((t) => t.status === 'Available').length;
  const reservedCount = tables.filter((t) => t.status === 'Reserved').length;

  const wishlistCount = await Wishlist.countDocuments({ restaurantId: restaurant._id });
  const allRestaurants = await Restaurant.find().select('_id name location category approvalStatus').lean();

  res.json({
    ok: true,
    restaurant: formatRestaurantResponse(restaurant, totalCapacity),
    allRestaurants,
    stats: {
      totalTables,
      totalCapacity,
      totalSeatingCapacity: totalCapacity,
      activeBookings,
      totalBookings: bookings.length,
      totalGuestsInBookings,
      totalTokenFees,
      availableCount,
      reservedCount,
      wishlistCount,
    },
    recentBookings: bookings.slice(0, 8),
  });
}

/**
 * GET /api/restaurant-dashboard/tables
 */
export async function getTables(req, res) {
  const restaurant = await getTargetRestaurant(req);
  if (!restaurant) return res.status(404).json({ ok: false, error: 'Restaurant not found' });

  await ensureDefaultTables(restaurant._id, restaurant.tokenFee || 150);

  const tables = await Table.find({ restaurantId: restaurant._id }).sort({ tableNumber: 1 });
  const trueTotalCapacity = tables.reduce((sum, t) => sum + (t.capacity || 0), 0);
  await Restaurant.findByIdAndUpdate(restaurant._id, { totalSeatingCapacity: trueTotalCapacity });

  res.json({ ok: true, restaurant: formatRestaurantResponse(restaurant, trueTotalCapacity), tables });
}

/**
 * POST /api/restaurant-dashboard/tables
 */
export async function createTable(req, res) {
  const restaurant = await getTargetRestaurant(req);
  if (!restaurant) return res.status(404).json({ ok: false, error: 'Restaurant not found' });

  const { tableNumber, capacity, zone, status, tokenFee } = req.body;
  if (!tableNumber || !capacity) {
    return res.status(400).json({ ok: false, error: 'Table number and seating capacity are required.' });
  }

  const existing = await Table.findOne({ restaurantId: restaurant._id, tableNumber: tableNumber.trim() });
  if (existing) {
    return res.status(400).json({ ok: false, error: `Table "${tableNumber}" already exists.` });
  }

  const newTable = await Table.create({
    restaurantId: restaurant._id,
    tableNumber: tableNumber.trim(),
    capacity: Number(capacity),
    zone: zone || 'Fine Dining',
    status: status || 'Available',
    tokenFee: tokenFee !== undefined ? Number(tokenFee) : restaurant.tokenFee || 150,
  });

  await syncRestaurantCapacity(restaurant._id);

  res.status(201).json({ ok: true, table: newTable });
}

/**
 * PUT /api/restaurant-dashboard/tables/:id
 */
export async function updateTable(req, res) {
  const { id } = req.params;
  const { tableNumber, capacity, zone, status, tokenFee } = req.body;

  const table = await Table.findById(id);
  if (!table) return res.status(404).json({ ok: false, error: 'Table not found' });

  if (tableNumber) table.tableNumber = tableNumber.trim();
  if (capacity !== undefined) table.capacity = Number(capacity);
  if (zone) table.zone = zone;
  if (status) table.status = status;
  if (tokenFee !== undefined) table.tokenFee = Number(tokenFee);

  await table.save();
  await syncRestaurantCapacity(table.restaurantId);

  res.json({ ok: true, table });
}

/**
 * DELETE /api/restaurant-dashboard/tables/:id
 */
export async function deleteTable(req, res) {
  const { id } = req.params;
  const table = await Table.findByIdAndDelete(id);
  if (!table) return res.status(404).json({ ok: false, error: 'Table not found' });

  await syncRestaurantCapacity(table.restaurantId);

  res.json({ ok: true, message: 'Table deleted successfully.' });
}

/**
 * GET /api/restaurant-dashboard/bookings
 */
export async function getBookings(req, res) {
  const restaurant = await getTargetRestaurant(req);
  if (!restaurant) return res.status(404).json({ ok: false, error: 'Restaurant not found' });

  const bookings = await Booking.find({ restaurantId: restaurant._id })
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 });

  res.json({
    ok: true,
    restaurant: formatRestaurantResponse(restaurant),
    bookings,
  });
}

function formatMinutes(mins) {
  if (!mins || mins <= 0) return '0 mins';
  const hours = Math.floor(mins / 60);
  const remainingMins = Math.round(mins % 60);
  if (hours > 0 && remainingMins > 0) {
    return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMins} min${remainingMins > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  return `${remainingMins} min${remainingMins > 1 ? 's' : ''}`;
}

/**
 * PUT /api/restaurant-dashboard/bookings/:id/status
 */
export async function updateBookingStatus(req, res) {
  const { id } = req.params;
  const { status, checkInTime, checkOutTime, timeSpentMinutes, timeSpentFormatted } = req.body;

  if (!['confirmed', 'checked-in', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ ok: false, error: 'Invalid booking status' });
  }

  const booking = await Booking.findById(id).populate('restaurantId');
  if (!booking) return res.status(404).json({ ok: false, error: 'Booking not found' });

  booking.status = status;

  if (status === 'checked-in') {
    booking.checkInTime = checkInTime ? new Date(checkInTime) : (booking.checkInTime || new Date());
  } else if (status === 'completed') {
    if (checkInTime) booking.checkInTime = new Date(checkInTime);
    if (!booking.checkInTime) booking.checkInTime = new Date(Date.now() - 60 * 60 * 1000); // default fallback 1hr ago
    booking.checkOutTime = checkOutTime ? new Date(checkOutTime) : new Date();

    if (timeSpentFormatted) {
      booking.timeSpentFormatted = timeSpentFormatted;
      if (timeSpentMinutes) booking.timeSpentMinutes = Number(timeSpentMinutes);
    } else {
      const diffMs = Math.max(0, new Date(booking.checkOutTime) - new Date(booking.checkInTime));
      const mins = Math.max(1, Math.round(diffMs / 60000));
      booking.timeSpentMinutes = timeSpentMinutes ? Number(timeSpentMinutes) : mins;
      booking.timeSpentFormatted = formatMinutes(booking.timeSpentMinutes);
    }
  }

  await booking.save();

  // Push real-time SSE notification to the customer
  if (booking.userId) {
    const restName = booking.restaurantId?.name || 'Restaurant';
    const statusTitle =
      status === 'confirmed'
        ? 'Reservation Confirmed ✓'
        : status === 'checked-in'
        ? 'Checked In at Restaurant 🍽️'
        : status === 'completed'
        ? 'Reservation Completed 🎉'
        : 'Reservation Cancelled ⚠️';
    const statusDesc =
      status === 'completed' && booking.timeSpentFormatted
        ? `Your visit at ${restName} is completed. Total time spent: ${booking.timeSpentFormatted}. Thank you for dining with us!`
        : `Your reservation at ${restName} on ${booking.date} at ${booking.time} was updated to "${status.toUpperCase()}".`;

    pushToUser(String(booking.userId), {
      id: Date.now(),
      type: `booking_${status}`,
      title: statusTitle,
      desc: statusDesc,
      time: 'Just now',
      unread: true,
    });
  }

  res.json({ ok: true, booking });
}

/**
 * GET /api/restaurant-dashboard/analytics
 */
export async function getAnalytics(req, res) {
  const restaurant = await getTargetRestaurant(req);
  if (!restaurant) return res.status(404).json({ ok: false, error: 'Restaurant not found' });

  await ensureDefaultTables(restaurant._id, restaurant.tokenFee || 150);

  const bookings = await Booking.find({ restaurantId: restaurant._id })
    .populate('userId', 'fullName name email phone')
    .sort({ createdAt: -1 });
  const tables = await Table.find({ restaurantId: restaurant._id }).sort({ tableNumber: 1 });

  const validBookings = bookings.filter((b) => ['confirmed', 'checked-in', 'completed'].includes(b.status));
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  const totalGuests = validBookings.reduce((acc, b) => acc + (b.guests || 1), 0);
  const tokenFeeRate = restaurant.tokenFee || 150;
  
  // Calculate total token fees using finalPayable or guests * rate
  const totalTokenRevenue = validBookings.reduce((acc, b) => {
    if (b.finalPayable && b.finalPayable > 0) return acc + b.finalPayable;
    const tableFee = b.tokenFee || tokenFeeRate;
    return acc + (b.guests || 1) * tableFee;
  }, 0);

  const avgTokenFeePerBooking = validBookings.length ? Math.round(totalTokenRevenue / validBookings.length) : 0;
  const avgGuestsPerBooking = validBookings.length ? (totalGuests / validBookings.length).toFixed(1) : '0';

  // Group ALL bookings by table for multi-status filtering
  const tableStatsAll = {};
  const tableStatsConfirmed = {};
  const tableStatsCancelled = {};
  const tableBookingsMap = {};

  tables.forEach((t) => {
    tableStatsAll[String(t._id)] = { count: 0, revenue: 0 };
    tableStatsConfirmed[String(t._id)] = { count: 0, revenue: 0 };
    tableStatsCancelled[String(t._id)] = { count: 0, revenue: 0 };
    tableBookingsMap[String(t._id)] = [];
  });

  const capacityTableMap = {};
  tables.forEach((t) => {
    if (!capacityTableMap[t.capacity]) capacityTableMap[t.capacity] = [];
    capacityTableMap[t.capacity].push(t);
  });

  const sortedCapacities = Object.keys(capacityTableMap).map(Number).sort((a, b) => a - b);
  let autoAssignCounter = 0;

  for (const b of bookings) {
    const bookingRevenue = (b.finalPayable && b.finalPayable > 0)
      ? b.finalPayable
      : (b.guests || 1) * (b.tokenFee || tokenFeeRate);

    let matchedTable = null;

    if (b.tableId && tableStatsAll[String(b.tableId)]) {
      matchedTable = tables.find((t) => String(t._id) === String(b.tableId));
    } else if (b.tableNumber && b.tableNumber !== 'Auto-Assigned' && tableStatsAll[b.tableNumber]) {
      matchedTable = tables.find((t) => t.tableNumber === b.tableNumber);
    }

    if (!matchedTable && tables.length > 0) {
      const targetCap = sortedCapacities.find((cap) => cap >= (b.guests || 1)) || sortedCapacities[sortedCapacities.length - 1];
      const candidateTables = capacityTableMap[targetCap] || tables;
      matchedTable = candidateTables[autoAssignCounter % candidateTables.length];
      autoAssignCounter++;

      // Link booking in database to physical table
      if (b.tableNumber === 'Auto-Assigned' || !b.tableNumber || !b.tableId) {
        b.tableId = matchedTable._id;
        b.tableNumber = matchedTable.tableNumber;
        b.tableCapacity = matchedTable.capacity;
        b.tableZone = matchedTable.zone;
        await b.save().catch(() => {});
      }
    }

    if (matchedTable) {
      const tId = String(matchedTable._id);
      tableStatsAll[tId].count += 1;
      tableStatsAll[tId].revenue += bookingRevenue;

      if (['confirmed', 'checked-in', 'completed'].includes(b.status)) {
        tableStatsConfirmed[tId].count += 1;
        tableStatsConfirmed[tId].revenue += bookingRevenue;
      } else if (b.status === 'cancelled') {
        tableStatsCancelled[tId].count += 1;
        tableStatsCancelled[tId].revenue += bookingRevenue;
      }

      tableBookingsMap[tId].push({
        id: b._id,
        customerName: b.userId?.fullName || b.userId?.name || 'Guest Diner',
        customerEmail: b.userId?.email || 'N/A',
        guests: b.guests,
        date: b.date,
        time: b.time,
        status: b.status,
        amount: bookingRevenue,
      });
    }
  }

  // Capacity Breakdown (e.g. 2-seater, 4-seater, etc.)
  const capacityBreakdown = tables.reduce((acc, t) => {
    const key = `${t.capacity}-Seater`;
    if (!acc[key]) {
      acc[key] = { count: 0, totalCapacity: 0, avgTokenFee: 0, totalTokenFee: 0 };
    }
    acc[key].count += 1;
    acc[key].totalCapacity += t.capacity;
    acc[key].totalTokenFee += (t.tokenFee || tokenFeeRate);
    return acc;
  }, {});

  Object.keys(capacityBreakdown).forEach((key) => {
    const item = capacityBreakdown[key];
    item.avgTokenFee = Math.round(item.totalTokenFee / item.count);
  });

  const zoneBreakdown = tables.reduce((acc, t) => {
    if (typeof acc[t.zone] === 'object' && acc[t.zone] !== null) {
      acc[t.zone].tableCount += 1;
      acc[t.zone].seats += (t.capacity || 0);
    } else {
      acc[t.zone] = { tableCount: 1, seats: (t.capacity || 0) };
    }
    return acc;
  }, {});

  // Table leaderboard with multi-status stats & assigned guest bookings
  const tableLeaderboard = tables.map((t) => {
    const tId = String(t._id);
    const confirmedStat = tableStatsConfirmed[tId] || { count: 0, revenue: 0 };
    const allStat = tableStatsAll[tId] || { count: 0, revenue: 0 };
    const cancelledStat = tableStatsCancelled[tId] || { count: 0, revenue: 0 };
    const assignedBookingsList = tableBookingsMap[tId] || [];

    let currentStatus = t.status;
    if (confirmedStat.count > 0 && currentStatus === 'Available') {
      currentStatus = 'Reserved';
    }

    return {
      id: t._id,
      tableNumber: t.tableNumber,
      capacity: t.capacity,
      zone: t.zone,
      tokenFee: t.tokenFee || tokenFeeRate,
      status: currentStatus,
      bookingCount: confirmedStat.count,
      earnedRevenue: confirmedStat.revenue,
      allBookingCount: allStat.count,
      allRevenue: allStat.revenue,
      cancelledBookingCount: cancelledStat.count,
      cancelledRevenue: cancelledStat.revenue,
      assignedBookings: assignedBookingsList,
    };
  });

  // Financial transactions log (all bookings with details)
  const recentTransactions = bookings.map((b) => ({
    id: b._id,
    customerName: b.userId?.fullName || b.userId?.name || 'Guest Diner',
    customerEmail: b.userId?.email || 'N/A',
    date: b.date,
    time: b.time,
    guests: b.guests,
    tableNumber: b.tableNumber || 'Assigned Table',
    tableZone: b.tableZone || 'Main Hall',
    status: b.status,
    amount: b.finalPayable || (b.guests || 1) * (b.tokenFee || tokenFeeRate),
    createdAt: b.createdAt,
  }));

  res.json({
    ok: true,
    restaurant: formatRestaurantResponse(restaurant),
    analytics: {
      tokenFeeRate,
      totalTokenRevenue,
      totalConfirmedBookings: validBookings.length,
      totalCancelledBookings: cancelledBookings.length,
      totalGuestsServed: totalGuests,
      avgTokenFeePerBooking,
      avgGuestsPerBooking,
      zoneBreakdown,
      capacityBreakdown,
      tableLeaderboard,
      recentTransactions,
      totalTables: tables.length,
      totalSeatingCapacity: tables.reduce((acc, t) => acc + (t.capacity || 0), 0),
    },
  });
}

/**
 * GET /api/restaurant-dashboard/settings
 */
export async function getSettings(req, res) {
  const restaurant = await getTargetRestaurant(req);
  if (!restaurant) return res.status(404).json({ ok: false, error: 'Restaurant not found' });

  res.json({ ok: true, restaurant: formatRestaurantResponse(restaurant) });
}

/**
 * PUT /api/restaurant-dashboard/settings
 */
export async function updateSettings(req, res) {
  const restaurant = await getTargetRestaurant(req);
  if (!restaurant) return res.status(404).json({ ok: false, error: 'Restaurant not found' });

  const {
    name,
    location,
    category,
    description,
    tokenFee,
    totalSeatingCapacity,
    openingHours,
    priceRange,
    experiences,
    imageUrl,
    imageUrls,
  } = req.body;

  if (name) restaurant.name = name.trim();
  if (location) restaurant.location = location.trim();
  if (category) restaurant.category = category.trim();
  if (description !== undefined) restaurant.description = description.trim();
  if (tokenFee !== undefined) restaurant.tokenFee = Number(tokenFee);
  if (totalSeatingCapacity !== undefined) restaurant.totalSeatingCapacity = Number(totalSeatingCapacity);
  if (openingHours) restaurant.openingHours = openingHours.trim();
  if (priceRange) restaurant.priceRange = Number(priceRange);
  if (Array.isArray(experiences)) restaurant.experiences = experiences;
  if (imageUrl !== undefined) restaurant.imageUrl = imageUrl;
  if (Array.isArray(imageUrls)) restaurant.imageUrls = imageUrls;

  await restaurant.save();

  res.json({ ok: true, restaurant });
}
