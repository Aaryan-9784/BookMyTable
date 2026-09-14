/**
 * Entry point: loads env, validates config, connects DB, starts HTTP server.
 */
import './loadEnv.js';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { connectRedis, isRedisConnected } from './config/redis.js';
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
  if (isRedisConnected()) {
    logger.info('Redis connected successfully');
  }
} catch (err) {
  if (process.env.NODE_ENV === 'production') {
    logger.error('Redis is required in production. Exiting...', { error: err.message });
    process.exit(1);
  }
}

// Log active services
const services = ['MongoDB Auth'];
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

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use by another process (EADDRINUSE).`);
    logger.info(`Run 'npx kill-port ${PORT}' or terminate the process on port ${PORT}.`);
  } else {
    logger.error('Server failed to start', { error: err.message });
  }
  process.exit(1);
});

server.listen(PORT, '0.0.0.0', () => {
  const innerWidth = 58;
  const lEmpty = '║' + ' '.repeat(innerWidth) + '║';
  const lTitle = '║  🚀 BookMyTable Backend API Running Successfully!        ║';
  const urlText = `• Server URL:    http://localhost:${PORT}`;
  const envText = `• Environment:   ${process.env.NODE_ENV || 'development'}`;
  const lUrl = '║  ' + urlText + ' '.repeat(Math.max(0, innerWidth - 2 - urlText.length)) + '║';
  const lEnv = '║  ' + envText + ' '.repeat(Math.max(0, innerWidth - 2 - envText.length)) + '║';

  console.log([
    '',
    '╔' + '═'.repeat(innerWidth) + '╗',
    lEmpty,
    lTitle,
    lEmpty,
    lUrl,
    lEnv,
    lEmpty,
    '╚' + '═'.repeat(innerWidth) + '╝',
    '',
  ].join('\n'));

  logger.info(`BookMyTable API listening on port ${PORT}`);
});
