/**
 * NotificationContext — real-time notification hub.
 *
 * Connects to GET /api/notifications/stream (SSE) once the user is
 * authenticated. Every booking event the server emits is appended as
 * a new unread notification. No hardcoded defaults — zero notifications
 * until a real event fires.
 */
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext.jsx';

const NotificationContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function NotificationProvider({ children }) {
  const { isAuthenticated, idToken } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const esRef = useRef(null);

  /* ── Connect / disconnect SSE based on auth state ────────── */
  useEffect(() => {
    if (!isAuthenticated || !idToken) {
      // Disconnect if logged out
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      setNotifications([]);
      return;
    }

    // Close any stale connection first
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    // SSE doesn't support custom headers, so pass token as query param
    const url = `${API_BASE}/api/notifications/stream?token=${encodeURIComponent(idToken)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (evt) => {
      try {
        const notif = JSON.parse(evt.data);
        setNotifications((prev) => [{ ...notif, id: notif.id || Date.now() }, ...prev]);
      } catch (_) {
        // ignore malformed frames
      }
    };

    es.onerror = () => {
      // EventSource auto-reconnects; nothing extra needed
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [isAuthenticated, idToken]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
}
