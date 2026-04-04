/**
 * Entry point: loads env, connects DB, starts HTTP server.
 * Keeps listen logic separate from app.js for easier testing.
 */
import './loadEnv.js';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { logSesEnvironmentStatus } from './utils/awsSes.js';

const PORT = Number(process.env.PORT) || 5000;

// Fail fast if critical Cognito config is missing (JWT verification needs these)
if (!process.env.COGNITO_USER_POOL_ID || !process.env.AWS_REGION) {
  console.warn(
    '[BookMyTable] Warning: COGNITO_USER_POOL_ID or AWS_REGION missing — auth will fail until configured.'
  );
}

await connectDB();

logSesEnvironmentStatus();

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`BookMyTable API listening on port ${PORT}`);
});
