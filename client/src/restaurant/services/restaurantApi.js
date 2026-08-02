import api from '../../services/api.js';

const base = '/api/restaurant-dashboard';

// In-memory cache for fast fallback
const cache = new Map();

function saveActiveRestaurant(res) {
  if (res?.data?.restaurant) {
    cache.set('active_restaurant', res.data.restaurant);
  }
  return res;
}

export const restaurantApi = {
  getCache: (key) => cache.get(key),
  setCache: (key, data) => cache.set(key, data),
  clearCache: () => cache.clear(),
  getActiveRestaurant: () => cache.get('active_restaurant'),

  getStats: async (restaurantId) => {
    const key = `stats_${restaurantId || 'default'}`;
    const res = await api.get(`${base}/stats`, { params: { restaurantId } });
    cache.set(key, res);
    saveActiveRestaurant(res);
    return res;
  },

  getTables: async (restaurantId) => {
    const key = `tables_${restaurantId || 'default'}`;
    const res = await api.get(`${base}/tables`, { params: { restaurantId } });
    cache.set(key, res);
    saveActiveRestaurant(res);
    return res;
  },

  createTable: async (data) => {
    return api.post(`${base}/tables`, data);
  },

  updateTable: async (id, data) => {
    return api.put(`${base}/tables/${id}`, data);
  },

  deleteTable: async (id) => {
    return api.delete(`${base}/tables/${id}`);
  },

  getBookings: async (restaurantId) => {
    const key = `bookings_${restaurantId || 'default'}`;
    const res = await api.get(`${base}/bookings`, { params: { restaurantId } });
    cache.set(key, res);
    saveActiveRestaurant(res);
    return res;
  },

  updateBookingStatus: async (id, status) => {
    return api.put(`${base}/bookings/${id}/status`, { status });
  },

  getAnalytics: async (restaurantId) => {
    const key = `analytics_${restaurantId || 'default'}`;
    const res = await api.get(`${base}/analytics`, { params: { restaurantId } });
    cache.set(key, res);
    saveActiveRestaurant(res);
    return res;
  },

  getSettings: async (restaurantId) => {
    const key = `settings_${restaurantId || 'default'}`;
    const res = await api.get(`${base}/settings`, { params: { restaurantId } });
    cache.set(key, res);
    saveActiveRestaurant(res);
    return res;
  },

  updateSettings: async (data) => {
    cache.clear();
    return api.put(`${base}/settings`, data);
  },

  uploadImage: async (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post('/api/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
