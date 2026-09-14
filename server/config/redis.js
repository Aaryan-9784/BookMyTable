/**
 * Redis Client Configuration
 * 
 * Provides connection to Redis for caching, session management, and OTP storage.
 * Falls back gracefully to in-memory store when Redis is unavailable (development mode).
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
  const redisUrl = (process.env.REDIS_URL || '').trim();
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = Number(process.env.REDIS_PORT) || 6379;
  const redisPassword = process.env.REDIS_PASSWORD;
  const redisDb = Number(process.env.REDIS_DB) || 0;
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // In development, stop reconnect loops if server is not present
  const retryStrategy = (times) => {
    if (isDevelopment && times > 1) {
      return null; // Stop reconnecting immediately in dev
    }
    return Math.min(times * 50, 2000);
  };

  if (redisUrl) {
    return new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      lazyConnect: true,
      connectTimeout: 2000,
      retryStrategy,
    });
  }

  return new Redis({
    host: redisHost,
    port: redisPort,
    password: redisPassword || undefined,
    db: redisDb,
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    lazyConnect: true,
    connectTimeout: 2000,
    retryStrategy,
  });
}

/**
 * Initialize Redis connection
 */
export async function connectRedis() {
  if (redisClient && isConnected) {
    return redisClient;
  }

  const redisUrl = (process.env.REDIS_URL || '').trim();
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // If in development and REDIS_URL is not set or empty, skip Redis entirely
  if (isDevelopment && (!redisUrl || redisUrl === '')) {
    logger.info('Redis not configured — using fast in-memory fallback for development');
    redisClient = null;
    isConnected = false;
    return null;
  }

  try {
    redisClient = createRedisClient();

    redisClient.on('connect', () => {
      logger.info('Redis client connecting...');
    });

    redisClient.on('ready', () => {
      isConnected = true;
      logger.info('Redis client ready');
    });

    redisClient.on('error', (err) => {
      if (!isDevelopment) {
        logger.error('Redis client error', { error: err.message });
      }
      isConnected = false;
    });

    redisClient.on('close', () => {
      isConnected = false;
    });

    // Attempt connection with timeout
    await redisClient.connect();
    await redisClient.ping();

    isConnected = true;
    logger.info('Redis connected successfully');
    return redisClient;
  } catch (error) {
    // Clean up failed client so it doesn't loop reconnect in background
    if (redisClient) {
      try {
        redisClient.disconnect(false);
      } catch (e) {}
      redisClient = null;
    }
    isConnected = false;

    if (isDevelopment) {
      logger.warn('Local Redis not detected — continuing with in-memory storage fallback');
      return null;
    }

    // In production, Redis is required for multi-server deployments
    logger.error('Failed to connect to Redis in production', { error: error.message });
    throw error;
  }
}

/**
 * Get Redis client instance
 */
export function getRedisClient() {
  return redisClient;
}

/**
 * Check if Redis is connected
 */
export function isRedisConnected() {
  return isConnected && redisClient !== null;
}

/**
 * Disconnect Redis
 */
export async function disconnectRedis() {
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch (err) {
      try {
        redisClient.disconnect(false);
      } catch (e) {}
    } finally {
      redisClient = null;
      isConnected = false;
    }
  }
}

export default {
  connectRedis,
  getRedisClient,
  isRedisConnected,
  disconnectRedis,
};
