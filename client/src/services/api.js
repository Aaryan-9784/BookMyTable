/**
 * Axios instance with base URL + request interceptor to attach Cognito ID token.
 * On 401, clears stale tokens and notifies AuthProvider — Cognito ID tokens expire (~1h).
 */
import axios from 'axios';
import { STORAGE_ID_TOKEN } from '../utils/constants.js';
import { clearStoredAuthTokens, SESSION_INVALID_EVENT } from '../utils/authSession.js';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_ID_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const data = err.response?.data;

    if (status === 401) {
      clearStoredAuthTokens();
      window.dispatchEvent(new CustomEvent(SESSION_INVALID_EVENT));
    }

    let msg =
      data?.message ||
      data?.errors?.[0]?.msg ||
      err.message ||
      'Request failed';
    if (data?.detail) {
      msg = `${msg} (${data.detail})`;
    }
    return Promise.reject(new Error(msg));
  }
);

export default api;
