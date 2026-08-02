import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import api from '../services/api.js';
import toast from '../utils/toast.js';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user, isCustomer } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      setWishlistedIds(new Set());
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/api/wishlist');
      const data = res.data?.data || [];
      setWishlist(data);
      const ids = new Set(data.map((r) => String(r._id)));
      setWishlistedIds(ids);
    } catch (e) {
      // Ignore unauthorized or network silent errors
      setWishlist([]);
      setWishlistedIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = useCallback(
    async (restaurant) => {
      if (!user) {
        toast.error('Please log in to save restaurants to your wishlist');
        return false;
      }
      const rId = typeof restaurant === 'string' ? restaurant : String(restaurant._id);

      // Optimistic update
      const wasWishlisted = wishlistedIds.has(rId);
      const nextIds = new Set(wishlistedIds);
      if (wasWishlisted) {
        nextIds.delete(rId);
        setWishlist((prev) => prev.filter((item) => String(item._id) !== rId));
      } else if (typeof restaurant === 'object') {
        nextIds.add(rId);
        setWishlist((prev) => [restaurant, ...prev]);
      }
      setWishlistedIds(nextIds);

      try {
        const res = await api.post(`/api/wishlist/toggle/${rId}`);
        const { isWishlisted } = res.data;

        if (isWishlisted) {
          toast.success('Saved to Wishlist ❤️');
        } else {
          toast('Removed from Wishlist', { icon: '💔' });
        }
        fetchWishlist();
        return isWishlisted;
      } catch (e) {
        // Revert optimistic update
        fetchWishlist();
        toast.error(e.message || 'Failed to update wishlist');
        return wasWishlisted;
      }
    },
    [user, wishlistedIds, fetchWishlist]
  );

  const isWishlisted = useCallback(
    (restaurantId) => {
      if (!restaurantId) return false;
      const rId = typeof restaurantId === 'string' ? restaurantId : String(restaurantId._id);
      return wishlistedIds.has(rId);
    },
    [wishlistedIds]
  );

  const value = useMemo(
    () => ({
      wishlist,
      wishlistedIds,
      loading,
      wishlistCount: wishlist.length,
      toggleWishlist,
      isWishlisted,
      refreshWishlist: fetchWishlist,
    }),
    [wishlist, wishlistedIds, loading, toggleWishlist, isWishlisted, fetchWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

export default WishlistContext;
