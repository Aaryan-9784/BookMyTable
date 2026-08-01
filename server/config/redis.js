/**
 * Redis Client Configuration
 * 
 * Provides connection to Redis for caching, session management, and OTP storage.
 * Falls back gracefully when Redis is unavailable (development mode).
 */

import Redis from 'ioredis';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('Redis');

let redisClient = null;
let isConnected = false;

/**
 * Create Redis client with configuration
 */
function createRedisClient() {
  const redisUrl = process.env.REDIS_URL;
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = Number(process.env.REDIS_PORT) || 6379;
  const redisPassword = process.env.REDIS_PASSWORD;
  const redisDb = Number(process.env.REDIS_DB) || 0;

  // If Redis URL is provided, use it (production/cloud)
  if (redisUrl) {
    logger.info('Connecting to Redis using URL');
    return new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });
  }

  // Otherwise use host/port configuration (local development)
  logger.info('Connecting to Redis', { host: redisHost, port: redisPort });
  return new Redis({
    host: redisHost,
    port: redisPort,
    password: redisPassword || undefined,
    db: redisDb,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      logger.warn(`Redis retry attempt ${times}, waiting ${delay}ms`);
      return delay;
    },
  });
}

/**
 * Initialize Redis connection
 */
export async function connectRedis() {
  if (redisClient) {
    return redisClient;
  }

  // Skip Redis connection in development if no Redis URL is configured
  const redisUrl = process.env.REDIS_URL;
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (isDevelopment && !redisUrl) {
    logger.info('Redis not configured - using in-memory storage for development');
    redisClient = null;
    isConnected = false;
    return null;
  }

  try {
    redisClient = createRedisClient();

    // Set up event handlers
    redisClient.on('connect', () => {
      logger.info('Redis client connecting...');
    });

    redisClient.on('ready', () => {
      isConnected = true;
      logger.info('Redis client ready');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error', { error: err.message });
      isConnected = false;
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
      isConnected = false;
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
    });

    // Attempt to connect
    await redisClient.connect();
    
    // Test connection
    await redisClient.ping();
    
    logger.info('Redis connected successfully');
    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis', { error: error.message });
    
    // In development, allow app to continue without Redis
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('Running without Redis in development mode');
      redisClient = null;
      isConnected = false;
      return null;
    }
    
    // In production, Redis is required for proper operation
    throw error;
  }
}

/**
 * Get Redis client instance
 */
export function getRedisClient() {
  if (!redisClient) {
    logger.warn('Redis client not initialized');
  }
  return redisClient;
}

/**
 * Check if Redis is connected
 */
export function isRedisConnected() {
  return isConnected && redisClient !== null;
}

/**
 * Close Redis connection
 */
export async function disconnectRedis() {
  if (redisClient) {
    logger.info('Closing Redis connection');
    await redisClient.quit();
    redisClient = null;
    isConnected = false;
  }
}

/**
 * Redis health check
 */
export async function checkRedisHealth() {
  if (!redisClient || !isConnected) {
    return {
      status: 'disconnected',
      message: 'Redis is not connected',
    };
  }

  try {
    const start = Date.now();
    await redisClient.ping();
    const latency = Date.now() - start;

    return {
      status: 'healthy',
      latency: `${latency}ms`,
      connected: true,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      connected: false,
    };
  }
}

export default {
  connectRedis,
  getRedisClient,
  isRedisConnected,
  disconnectRedis,
  checkRedisHealth,
};
