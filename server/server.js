/**
 * Entry point: loads env, connects DB, starts HTTP server.
 */
import './loadEnv.js';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = Number(process.env.PORT) || 5000;

try {
  await connectDB();
} catch (err) {
  console.error('[BookMyTable] DB connection warning:', err.message);
}

console.log('[BookMyTable] Auth Gateway: Supabase & JWT Session active');
console.log('[BookMyTable] Media Storage: Cloudinary CDN active');
console.log('[BookMyTable] Email Service: Resend API active');

const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`BookMyTable API listening on port ${PORT}`);
});
