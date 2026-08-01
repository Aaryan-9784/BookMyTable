/**
 * OTP Service - Redis-backed with in-memory fallback
 * 
 * Stores OTP codes securely in Redis with automatic expiration.
 * Falls back to in-memory storage in development when Redis is unavailable.
 */

import { getRedisClient, isRedisConnected } from '../config/redis.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('OTPService');

// In-memory fallback for development (when Redis unavailable)
const memoryStore = new Map();

// OTP configuration
const OTP_EXPIRY_SECONDS = 600; // 10 minutes
const MAX_ATTEMPTS = 3;

/**
 * Generate 6-digit OTP code
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Get Redis key for OTP
 */
function getOTPKey(email) {
  return `otp:${email.toLowerCase()}`;
}

/**
 * Get Redis key for OTP attempts
 */
function getAttemptsKey(email) {
  return `otp:attempts:${email.toLowerCase()}`;
}

/**
 * Store OTP in Redis or memory
 */
export async function storeOTP(email, otp) {
  const key = getOTPKey(email);
  const attemptsKey = getAttemptsKey(email);

  try {
    if (isRedisConnected()) {
      const redis = getRedisClient();
      
      // Store OTP with expiration
      await redis.setex(key, OTP_EXPIRY_SECONDS, otp);
      
      // Reset attempts counter
      await redis.setex(attemptsKey, OTP_EXPIRY_SECONDS, '0');
      
      logger.info('OTP stored in Redis', { email });
      return { stored: true, method: 'redis', expiresIn: OTP_EXPIRY_SECONDS };
    } else {
      // Fallback to memory
      const expiryTime = Date.now() + (OTP_EXPIRY_SECONDS * 1000);
      memoryStore.set(key, { otp, expiryTime, attempts: 0 });
      
      logger.warn('OTP stored in memory (Redis unavailable)', { email });
      return { stored: true, method: 'memory', expiresIn: OTP_EXPIRY_SECONDS };
    }
  } catch (error) {
    logger.error('Failed to store OTP', { email, error: error.message });
    throw new Error('Failed to store OTP');
  }
}

/**
 * Retrieve OTP from Redis or memory
 */
export async function getOTP(email) {
  const key = getOTPKey(email);

  try {
    if (isRedisConnected()) {
      const redis = getRedisClient();
      const otp = await redis.get(key);
      
      if (otp) {
        const ttl = await redis.ttl(key);
        logger.info('OTP retrieved from Redis', { email, ttl });
        return { otp, ttl };
      }
      
      return null;
    } else {
      // Fallback to memory
      const stored = memoryStore.get(key);
      
      if (stored && stored.expiryTime > Date.now()) {
        const ttl = Math.floor((stored.expiryTime - Date.now()) / 1000);
        logger.info('OTP retrieved from memory', { email, ttl });
        return { otp: stored.otp, ttl };
      }
      
      // Clean up expired entry
      if (stored) {
        memoryStore.delete(key);
      }
      
      return null;
    }
  } catch (error) {
    logger.error('Failed to retrieve OTP', { email, error: error.message });
    return null;
  }
}

/**
 * Verify OTP and increment attempts
 */
export async function verifyOTP(email, providedOTP) {
  const key = getOTPKey(email);
  const attemptsKey = getAttemptsKey(email);

  try {
    if (isRedisConnected()) {
      const redis = getRedisClient();
      
      // Get stored OTP
      const storedOTP = await redis.get(key);
      
      if (!storedOTP) {
        logger.warn('OTP not found or expired', { email });
        return { valid: false, reason: 'OTP not found or expired' };
      }
      
      // Increment attempts
      const attempts = await redis.incr(attemptsKey);
      await redis.expire(attemptsKey, OTP_EXPIRY_SECONDS);
      
      // Check max attempts
      if (attempts > MAX_ATTEMPTS) {
        logger.warn('Max OTP attempts exceeded', { email, attempts });
        await redis.del(key);
        await redis.del(attemptsKey);
        return { valid: false, reason: 'Maximum attempts exceeded', attemptsExceeded: true };
      }
      
      // Verify OTP
      if (storedOTP === providedOTP) {
        logger.info('OTP verified successfully', { email });
        // Delete OTP after successful verification
        await redis.del(key);
        await redis.del(attemptsKey);
        return { valid: true, email };
      } else {
        logger.warn('Invalid OTP provided', { email, attempts });
        return { valid: false, reason: 'Invalid OTP', attemptsRemaining: MAX_ATTEMPTS - attempts };
      }
    } else {
      // Fallback to memory
      const stored = memoryStore.get(key);
      
      if (!stored || stored.expiryTime <= Date.now()) {
        logger.warn('OTP not found or expired (memory)', { email });
        memoryStore.delete(key);
        return { valid: false, reason: 'OTP not found or expired' };
      }
      
      // Increment attempts
      stored.attempts++;
      
      // Check max attempts
      if (stored.attempts > MAX_ATTEMPTS) {
        logger.warn('Max OTP attempts exceeded (memory)', { email });
        memoryStore.delete(key);
        return { valid: false, reason: 'Maximum attempts exceeded', attemptsExceeded: true };
      }
      
      // Verify OTP
      if (stored.otp === providedOTP) {
        logger.info('OTP verified successfully (memory)', { email });
        memoryStore.delete(key);
        return { valid: true, email };
      } else {
        logger.warn('Invalid OTP provided (memory)', { email, attempts: stored.attempts });
        return { valid: false, reason: 'Invalid OTP', attemptsRemaining: MAX_ATTEMPTS - stored.attempts };
      }
    }
  } catch (error) {
    logger.error('Failed to verify OTP', { email, error: error.message });
    throw new Error('Failed to verify OTP');
  }
}

/**
 * Delete OTP (for manual cleanup or after use)
 */
export async function deleteOTP(email) {
  const key = getOTPKey(email);
  const attemptsKey = getAttemptsKey(email);

  try {
    if (isRedisConnected()) {
      const redis = getRedisClient();
      await redis.del(key);
      await redis.del(attemptsKey);
      logger.info('OTP deleted from Redis', { email });
    } else {
      memoryStore.delete(key);
      logger.info('OTP deleted from memory', { email });
    }
    
    return true;
  } catch (error) {
    logger.error('Failed to delete OTP', { email, error: error.message });
    return false;
  }
}

/**
 * Check if OTP exists for email
 */
export async function hasOTP(email) {
  const key = getOTPKey(email);

  try {
    if (isRedisConnected()) {
      const redis = getRedisClient();
      const exists = await redis.exists(key);
      return exists === 1;
    } else {
      const stored = memoryStore.get(key);
      return stored && stored.expiryTime > Date.now();
    }
  } catch (error) {
    logger.error('Failed to check OTP existence', { email, error: error.message });
    return false;
  }
}

/**
 * Get remaining attempts for email
 */
export async function getRemainingAttempts(email) {
  const attemptsKey = getAttemptsKey(email);

  try {
    if (isRedisConnected()) {
      const redis = getRedisClient();
      const attempts = await redis.get(attemptsKey);
      return MAX_ATTEMPTS - (parseInt(attempts) || 0);
    } else {
      const stored = memoryStore.get(getOTPKey(email));
      return MAX_ATTEMPTS - (stored?.attempts || 0);
    }
  } catch (error) {
    logger.error('Failed to get remaining attempts', { email, error: error.message });
    return MAX_ATTEMPTS;
  }
}

/**
 * Clean up expired OTPs from memory (only needed for memory fallback)
 */
export function cleanupExpiredOTPs() {
  if (isRedisConnected()) {
    // Redis handles expiration automatically
    return;
  }

  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of memoryStore.entries()) {
    if (value.expiryTime <= now) {
      memoryStore.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.info(`Cleaned up ${cleaned} expired OTPs from memory`);
  }
}

// Schedule cleanup every 5 minutes (only for memory fallback)
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

export default {
  generateOTP,
  storeOTP,
  getOTP,
  verifyOTP,
  deleteOTP,
  hasOTP,
  getRemainingAttempts,
  cleanupExpiredOTPs,
};
