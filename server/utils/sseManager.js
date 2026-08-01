/**
 * sseManager.js — in-process SSE broker.
 * Keeps a map of userId → Response so any controller can push a
 * notification to the correct client instantly.
 *
 * Usage:
 *   import { addClient, removeClient, pushToUser, broadcast } from './sseManager.js';
 */

const clients = new Map(); // userId (string) → Set<res>

export function addClient(userId, res) {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId).add(res);
}

export function removeClient(userId, res) {
  const set = clients.get(userId);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) clients.delete(userId);
}

/** Push a notification object to one specific user. */
export function pushToUser(userId, notification) {
  const set = clients.get(String(userId));
  if (!set) return;
  const data = `data: ${JSON.stringify(notification)}\n\n`;
  for (const res of set) {
    try { res.write(data); } catch (_) { /* client gone */ }
  }
}

/** Push to every connected client (admin alerts etc.). */
export function broadcast(notification) {
  const data = `data: ${JSON.stringify(notification)}\n\n`;
  for (const set of clients.values()) {
    for (const res of set) {
      try { res.write(data); } catch (_) {}
    }
  }
}
