/**
 * MongoDB connection via Mongoose with retry logic and connection monitoring.
 * Implements exponential backoff for transient failures.
 */
import mongoose from 'mongoose';
import dns from 'node:dns';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('Database');

// Fix querySrv ECONNREFUSED on local ISP / Windows DNS resolvers
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  logger.warn('Failed to set custom DNS servers', { error: err.message });
}

// Connection configuration
const CONNECTION_CONFIG = {
  maxRetries: 5,
  initialRetryDelay: 1000, // 1 second
  maxRetryDelay: 30000, // 30 seconds
  retryMultiplier: 2, // Exponential backoff
  connectionTimeout: 10000, // 10 seconds
};

let isConnected = false;
let reconnectAttempts = 0;

/**
 * Calculate retry delay with exponential backoff
 */
function getRetryDelay(attemptNumber) {
  const delay = Math.min(
    CONNECTION_CONFIG.initialRetryDelay * Math.pow(CONNECTION_CONFIG.retryMultiplier, attemptNumber),
    CONNECTION_CONFIG.maxRetryDelay
  );
  return delay;
}

/**
 * Wait for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Attempt to connect to MongoDB with retry logic
 */
async function attemptConnection(uri, attempt = 1) {
  try {
    logger.info(`Connecting to MongoDB (attempt ${attempt}/${CONNECTION_CONFIG.maxRetries})`);

    mongoose.set('strictQuery', true);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: CONNECTION_CONFIG.connectionTimeout,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    });

    isConnected = true;
    reconnectAttempts = 0;

    logger.info('MongoDB connected successfully', {
      host: mongoose.connection.host,
      database: mongoose.connection.name,
    });

    return true;
  } catch (error) {
    logger.error(`MongoDB connection attempt ${attempt} failed`, {
      error: error.message,
      code: error.code,
    });

    if (attempt >= CONNECTION_CONFIG.maxRetries) {
      logger.error('Max MongoDB connection retries reached');
      throw new Error(`Failed to connect to MongoDB after ${CONNECTION_CONFIG.maxRetries} attempts: ${error.message}`);
    }

    const retryDelay = getRetryDelay(attempt - 1);
    logger.info(`Retrying in ${retryDelay}ms...`);
    await sleep(retryDelay);

    return attemptConnection(uri, attempt + 1);
  }
}

/**
 * Setup MongoDB connection event handlers
 */
function setupEventHandlers() {
  mongoose.connection.on('connected', () => {
    isConnected = true;
    logger.info('MongoDB connection established');
  });

  mongoose.connection.on('error', (err) => {
    isConnected = false;
    logger.error('MongoDB connection error', {
      error: err.message,
      code: err.code,
    });
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('MongoDB disconnected');
    
    // Attempt to reconnect in production
    if (process.env.NODE_ENV === 'production') {
      reconnectWithBackoff();
    }
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    reconnectAttempts = 0;
    logger.info('MongoDB reconnected successfully');
  });

  mongoose.connection.on('close', () => {
    isConnected = false;
    logger.info('MongoDB connection closed');
  });

  // Graceful shutdown handlers
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}

/**
 * Reconnect with exponential backoff
 */
async function reconnectWithBackoff() {
  if (reconnectAttempts >= CONNECTION_CONFIG.maxRetries) {
    logger.error('Max reconnection attempts reached. Manual intervention required.');
    return;
  }

  reconnectAttempts++;
  const delay = getRetryDelay(reconnectAttempts - 1);

  logger.info(`Attempting to reconnect to MongoDB (${reconnectAttempts}/${CONNECTION_CONFIG.maxRetries})`, {
    delayMs: delay,
  });

  await sleep(delay);

  try {
    if (!isConnected) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  } catch (error) {
    logger.error('MongoDB reconnection failed', { error: error.message });
    reconnectWithBackoff();
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal) {
  logger.info(`${signal} received, closing MongoDB connection gracefully`);

  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed gracefully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during MongoDB graceful shutdown', { error: error.message });
    process.exit(1);
  }
}

/**
 * Main connection function
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment');
  }

  // Validate URI format
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error('Invalid MONGODB_URI format. Must start with mongodb:// or mongodb+srv://');
  }

  // Setup event handlers
  setupEventHandlers();

  // Attempt initial connection with retry logic
  await attemptConnection(uri);

  return mongoose.connection;
};

/**
 * Check if database is connected
 */
export function isDatabaseConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

/**
 * Get database connection state
 */
export function getConnectionState() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    state: states[mongoose.connection.readyState] || 'unknown',
    isConnected,
    host: mongoose.connection.host,
    database: mongoose.connection.name,
    reconnectAttempts,
  };
}

/**
 * Database health check
 */
export async function checkDatabaseHealth() {
  if (!isDatabaseConnected()) {
    return {
      status: 'unhealthy',
      message: 'Database not connected',
      state: getConnectionState(),
    };
  }

  try {
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    const latency = Date.now() - start;

    return {
      status: 'healthy',
      latency: `${latency}ms`,
      state: getConnectionState(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error.message,
      state: getConnectionState(),
    };
  }
}

/**
 * Manually close database connection
 */
export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    logger.info('Database connection closed manually');
  }
}

export default connectDB;

