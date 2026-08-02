/**
 * /api/restaurant-dashboard/* — Partner Console Routes
 * Input sanitization applied to table management and settings updates.
 */
import { Router } from 'express';
import {
  getDashboardStats,
  getTables,
  createTable,
  updateTable,
  deleteTable,
  getBookings,
  updateBookingStatus,
  getAnalytics,
  getSettings,
  updateSettings,
} from '../controllers/restaurantDashboardController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { verifyCognitoToken } from '../middleware/verifyCognitoToken.js';
import { requireRole } from '../middleware/requireRole.js';
import { conditionalCsrfProtection } from '../middleware/csrfProtection.js';
import { createSanitizationMiddleware } from '../middleware/inputSanitizer.js';

const router = Router();

// Input sanitization for restaurant data
const sanitizeRestaurant = createSanitizationMiddleware('restaurant');

// Protect routes for admin and restaurant roles
router.use(verifyCognitoToken, requireRole(['admin', 'restaurant']));

// Stats
router.get('/stats', asyncHandler(getDashboardStats));

// Tables & Seating Capacity - CSRF + sanitization
router.get('/tables', asyncHandler(getTables));
router.post('/tables', conditionalCsrfProtection, sanitizeRestaurant, asyncHandler(createTable));
router.put('/tables/:id', conditionalCsrfProtection, sanitizeRestaurant, asyncHandler(updateTable));
router.delete('/tables/:id', conditionalCsrfProtection, asyncHandler(deleteTable));

// Bookings Management - CSRF protection
router.get('/bookings', asyncHandler(getBookings));
router.put('/bookings/:id/status', conditionalCsrfProtection, asyncHandler(updateBookingStatus));

// Token Fee & Analytics
router.get('/analytics', asyncHandler(getAnalytics));

// Settings & Operating Rules - CSRF + sanitization
router.get('/settings', asyncHandler(getSettings));
router.put('/settings', conditionalCsrfProtection, sanitizeRestaurant, asyncHandler(updateSettings));

export default router;
