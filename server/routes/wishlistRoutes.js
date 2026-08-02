import express from 'express';
import { verifyCognitoToken } from '../middleware/verifyCognitoToken.js';
import {
  getWishlist,
  toggleWishlist,
  checkWishlistStatus,
  getWishlistStats,
} from '../controllers/wishlistController.js';

const router = express.Router();

// Protected endpoints
router.use(verifyCognitoToken);

router.get('/', getWishlist);
router.post('/toggle/:restaurantId', toggleWishlist);
router.get('/check/:restaurantId', checkWishlistStatus);
router.get('/stats', getWishlistStats);

export default router;
