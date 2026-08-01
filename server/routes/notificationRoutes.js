/**
 * SSE notification route — GET /api/notifications/stream
 * Client connects once; server pushes events in real-time.
 *
 * Because EventSource doesn't support custom headers, the token is
 * accepted as a ?token= query param and injected into Authorization
 * before the standard verifyCognitoToken middleware runs.
 */
import express from 'express';
import { verifyCognitoToken } from '../middleware/verifyCognitoToken.js';
import { addClient, removeClient } from '../utils/sseManager.js';

const router = express.Router();

/**
 * Middleware: lift ?token= query param into Authorization header
 * so verifyCognitoToken can process it normally.
 */
function injectQueryToken(req, res, next) {
  const qToken = req.query.token;
  if (qToken && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${qToken}`;
  }
  next();
}

/**
 * GET /api/notifications/stream
 * Opens a long-lived SSE connection for the authenticated user.
 */
router.get('/stream', injectQueryToken, verifyCognitoToken, (req, res) => {
  const userId = String(req.user._id);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx buffering if proxied
  res.flushHeaders();

  // Send a heartbeat comment every 25s to keep the connection alive
  const heartbeat = setInterval(() => {
    try { res.write(': heartbeat\n\n'); } catch (_) { cleanup(); }
  }, 25_000);

  addClient(userId, res);

  const cleanup = () => {
    clearInterval(heartbeat);
    removeClient(userId, res);
    res.end();
  };

  req.on('close', cleanup);
  req.on('aborted', cleanup);
});

export default router;
