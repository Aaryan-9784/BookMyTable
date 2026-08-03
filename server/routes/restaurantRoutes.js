/**
 * /api/restaurants — public GETs; POST protected (admin).
 */
import { Router } from 'express';
import {
  listRestaurants,
  getRestaurantById,
  getRestaurantTables,
  createRestaurant,
  createRestaurantValidators,
  addRestaurantReview,
} from '../controllers/restaurantController.js';
import { verifyCognitoToken } from '../middleware/verifyCognitoToken.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createSanitizationMiddleware } from '../middleware/inputSanitizer.js';

const router = Router();

// Apply input sanitization to all restaurant routes
const sanitizeRestaurant = createSanitizationMiddleware('restaurant');

router.get('/', asyncHandler(listRestaurants));
router.get('/:id', asyncHandler(getRestaurantById));
router.get('/:id/tables', asyncHandler(getRestaurantTables));
router.post('/:id/reviews', asyncHandler(addRestaurantReview));
router.post(
  '/',
  verifyCognitoToken,
  requireAdmin,
  sanitizeRestaurant,
  createRestaurantValidators,
  asyncHandler(createRestaurant)
);

export default router;
