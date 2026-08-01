/**
 * /api/admin/* — all routes require Cognito JWT + admin role (MongoDB or ADMIN_EMAILS).
 * Protected with rate limiting to prevent admin endpoint abuse.
 * CSRF protection on all state-changing operations.
 * Input sanitization to prevent XSS in restaurant data.
 */
import { Router } from 'express';
import {
  getDashboardStats,
  listRestaurantsAdmin,
  createRestaurantAdmin,
  updateRestaurantAdmin,
  deleteRestaurantAdmin,
  approveRestaurantAdmin,
  rejectRestaurantAdmin,
  listBookingsAdmin,
  deleteBookingAdmin,
  listUsersAdmin,
  updateUserRole,
  deleteUserAdmin,
  restaurantWriteValidators,
  restaurantUpdateValidators,
  updateRoleValidators,
} from '../controllers/adminController.js';
import { verifyCognitoToken } from '../middleware/verifyCognitoToken.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { adminLimiter } from '../middleware/rateLimiter.js';
import { conditionalCsrfProtection } from '../middleware/csrfProtection.js';
import { createSanitizationMiddleware } from '../middleware/inputSanitizer.js';

const router = Router();

// Apply rate limiting to all admin routes: 100 requests per 15 minutes per user
router.use(adminLimiter, verifyCognitoToken, requireAdmin);

// Input sanitization for different data types
const sanitizeRestaurant = createSanitizationMiddleware('restaurant');
const sanitizeUser = createSanitizationMiddleware('user');

// Safe GET operations - no CSRF needed
router.get('/dashboard/stats', asyncHandler(getDashboardStats));
router.get('/restaurants', asyncHandler(listRestaurantsAdmin));
router.get('/bookings', asyncHandler(listBookingsAdmin));
router.get('/users', asyncHandler(listUsersAdmin));

// State-changing operations - CSRF protection + sanitization in production
router.post('/restaurants', conditionalCsrfProtection, sanitizeRestaurant, restaurantWriteValidators, asyncHandler(createRestaurantAdmin));
router.put('/restaurants/:id', conditionalCsrfProtection, sanitizeRestaurant, restaurantUpdateValidators, asyncHandler(updateRestaurantAdmin));
router.put('/restaurants/:id/approve', conditionalCsrfProtection, asyncHandler(approveRestaurantAdmin));
router.put('/restaurants/:id/reject', conditionalCsrfProtection, asyncHandler(rejectRestaurantAdmin));
router.delete('/restaurants/:id', conditionalCsrfProtection, asyncHandler(deleteRestaurantAdmin));

router.delete('/bookings/:id', conditionalCsrfProtection, asyncHandler(deleteBookingAdmin));

router.put('/users/:id/role', conditionalCsrfProtection, sanitizeUser, updateRoleValidators, asyncHandler(updateUserRole));
router.delete('/users/:id', conditionalCsrfProtection, asyncHandler(deleteUserAdmin));

export default router;
