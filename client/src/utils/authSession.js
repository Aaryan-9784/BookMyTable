/**
 * Clears persisted JWT when the API returns 401; notifies AuthProvider to sync React state.
 */
import { STORAGE_EMAIL, STORAGE_ID_TOKEN } from './constants.js';

export const SESSION_INVALID_EVENT = 'bookmytable:session-invalid';

export function clearStoredAuthTokens() {
  localStorage.removeItem(STORAGE_ID_TOKEN);
  localStorage.removeItem(STORAGE_EMAIL);
}
