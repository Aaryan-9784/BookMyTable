/**
 * Load server/.env before any other server modules read process.env (CORS, MongoDB, Cognito, AWS).
 * On Elastic Beanstalk the .env file won't exist — env vars are injected by EB directly, so
 * dotenv silently no-ops (override:false is the default).
 */
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') }); // silent no-op if file absent
