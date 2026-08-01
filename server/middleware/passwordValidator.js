/**
 * Password Validation Middleware — Enforces strong password requirements.
 * Implements industry-standard password complexity rules (NIST guidelines).
 */

/**
 * Password complexity requirements
 */
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+{}[]|:;<>,.?/~`-=',
};

/**
 * Common weak passwords to reject (top 100 most common passwords)
 */
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
  'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
  'qazwsx', 'michael', 'football', 'welcome', 'jesus', 'ninja', 'mustang',
  'password1', 'password123', 'admin', 'root', 'toor', 'pass', 'test',
  '123456789', '12345', '1234', '12345678910', 'admin123', 'welcome123',
  'Password1', 'Password123', 'Password1!', 'Welcome1', 'Welcome123',
]);

/**
 * Validates password against complexity requirements
 * @param {string} password - Password to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validatePasswordComplexity(password) {
  const errors = [];

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { valid: false, errors };
  }

  // Check length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`);
  }

  // Check for uppercase letters
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letters
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special characters
  if (PASSWORD_REQUIREMENTS.requireSpecialChars) {
    const specialCharsRegex = new RegExp(`[${PASSWORD_REQUIREMENTS.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
    if (!specialCharsRegex.test(password)) {
      errors.push(`Password must contain at least one special character (${PASSWORD_REQUIREMENTS.specialChars})`);
    }
  }

  // Check against common passwords
  const passwordLower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(passwordLower)) {
    errors.push('This password is too common. Please choose a more unique password');
  }

  // Check for sequential characters (123, abc, etc.)
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    errors.push('Password should not contain sequential characters (e.g., abc, 123)');
  }

  // Check for repeated characters (aaa, 111, etc.)
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters (e.g., aaa, 111)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Express middleware to validate password in request body
 * Can be used with express-validator or standalone
 */
export function passwordValidationMiddleware(req, res, next) {
  const password = req.body?.password;

  if (!password) {
    // If password not provided, let other validators handle it
    return next();
  }

  const validation = validatePasswordComplexity(password);

  if (!validation.valid) {
    return res.status(400).json({
      message: 'Password does not meet security requirements',
      errors: validation.errors,
      requirements: {
        minLength: PASSWORD_REQUIREMENTS.minLength,
        requireUppercase: PASSWORD_REQUIREMENTS.requireUppercase,
        requireLowercase: PASSWORD_REQUIREMENTS.requireLowercase,
        requireNumbers: PASSWORD_REQUIREMENTS.requireNumbers,
        requireSpecialChars: PASSWORD_REQUIREMENTS.requireSpecialChars,
      },
    });
  }

  next();
}

/**
 * Check if password has been compromised in known breaches
 * Uses k-anonymity with Have I Been Pwned API (optional feature)
 * @param {string} password - Password to check
 * @returns {Promise<boolean>} - true if compromised, false otherwise
 */
export async function checkPasswordBreach(password) {
  try {
    const crypto = await import('crypto');
    const https = await import('https');

    // Hash the password using SHA-1
    const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    return new Promise((resolve) => {
      // Query HIBP API with k-anonymity (only send first 5 chars of hash)
      https.get(`https://api.pwnedpasswords.com/range/${prefix}`, { timeout: 3000 }, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          // Check if our hash suffix appears in the response
          const found = data.split('\n').some((line) => {
            const [hashSuffix] = line.split(':');
            return hashSuffix === suffix;
          });
          resolve(found);
        });
      }).on('error', () => {
        // On error, don't block the user (fail open)
        resolve(false);
      });
    });
  } catch (err) {
    // On any error, don't block the user
    return false;
  }
}

/**
 * Enhanced middleware that also checks against known breaches
 * Note: This makes an external API call and may add latency
 */
export async function passwordValidationWithBreachCheck(req, res, next) {
  const password = req.body?.password;

  if (!password) {
    return next();
  }

  // First check complexity
  const validation = validatePasswordComplexity(password);

  if (!validation.valid) {
    return res.status(400).json({
      message: 'Password does not meet security requirements',
      errors: validation.errors,
      requirements: {
        minLength: PASSWORD_REQUIREMENTS.minLength,
        requireUppercase: PASSWORD_REQUIREMENTS.requireUppercase,
        requireLowercase: PASSWORD_REQUIREMENTS.requireLowercase,
        requireNumbers: PASSWORD_REQUIREMENTS.requireNumbers,
        requireSpecialChars: PASSWORD_REQUIREMENTS.requireSpecialChars,
      },
    });
  }

  // Then check if password has been breached (optional)
  if (process.env.CHECK_PASSWORD_BREACH === 'true') {
    const isBreached = await checkPasswordBreach(password);
    if (isBreached) {
      return res.status(400).json({
        message: 'This password has been found in known data breaches and is not secure',
        errors: ['Password appears in breach databases. Please choose a different password.'],
      });
    }
  }

  next();
}

/**
 * Password strength meter (returns score 0-4)
 * 0 = Very Weak, 1 = Weak, 2 = Fair, 3 = Good, 4 = Strong
 */
export function getPasswordStrength(password) {
  let score = 0;

  if (!password) return 0;

  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Penalize common patterns
  if (/(.)\1{2,}/.test(password)) score--;
  if (/(?:abc|123|qwe|asd|zxc)/i.test(password)) score--;
  if (COMMON_PASSWORDS.has(password.toLowerCase())) score -= 2;

  return Math.max(0, Math.min(4, Math.floor(score / 2)));
}

export default {
  validatePasswordComplexity,
  passwordValidationMiddleware,
  passwordValidationWithBreachCheck,
  checkPasswordBreach,
  getPasswordStrength,
  PASSWORD_REQUIREMENTS,
};
