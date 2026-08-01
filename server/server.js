/**
 * Entry point: loads env, validates config, connects DB, starts HTTP server.
 */
import './loadEnv.js';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { connectRedis } from './config/redis.js';
import { validateConfiguration, printConfigSummary } from './utils/configValidator.js';
import { createLogger } from './utils/logger.js';
import { handleUnhandledRejection, handleUncaughtException } from './middleware/errorHandler.js';

const logger = createLogger('Server');
const PORT = Number(process.env.PORT) || 5000;

// Setup global error handlers
handleUncaughtException();
handleUnhandledRejection();

// Validate configuration before starting server
logger.info('Validating configuration...');
const configValidation = validateConfiguration();

if (!configValidation.valid) {
  logger.error('Configuration validation failed. Fix the following errors before starting:');
  configValidation.errors.forEach((error, index) => {
    logger.error(`  ${index + 1}. ${error}`);
  });
  process.exit(1);
}

// Print configuration summary
printConfigSummary();

// Connect to database
try {
  await connectDB();
  logger.info('Database connected successfully');
  
  // Create database indexes
  const { createDatabaseIndexes } = await import('./utils/createIndexes.js');
  await createDatabaseIndexes();
} catch (err) {
  logger.error('Database connection failed', { error: err.message });
  // Continue anyway - some features may work without DB
}

// Connect to Redis (optional in development, required in production)
try {
  await connectRedis();
  logger.info('Redis connected successfully');
} catch (err) {
  logger.error('Redis connection failed', { error: err.message });
  if (process.env.NODE_ENV === 'production') {
    logger.error('Redis is required in production. Exiting...');
    process.exit(1);
  } else {
    logger.warn('Continuing without Redis (development mode - using memory fallback)');
  }
}

// Log active services
const services = [];
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  services.push('Supabase Auth');
}
if (process.env.CLOUDINARY_CLOUD_NAME) {
  services.push('Cloudinary CDN');
}
if (process.env.GMAIL_APP_PASSWORD || process.env.RESEND_API_KEY) {
  services.push('Email Service');
}

if (services.length > 0) {
  logger.info(`Active services: ${services.join(', ')}`);
}

// Create HTTP server
const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  logger.info(`BookMyTable API listening on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('Server started successfully');
});
