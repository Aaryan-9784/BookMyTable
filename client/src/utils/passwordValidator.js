/**
 * Client-side Password Validation Utilities
 * Provides real-time password strength feedback to users
 */

/**
 * Password requirements (must match server-side)
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+{}[]|:;<>,.?/~`-=',
};

/**
 * Validate password complexity (client-side check)
 * @param {string} password
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePasswordComplexity(password) {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
    return { valid: false, errors };
  }

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`At least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter (A-Z)');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('At least one lowercase letter (a-z)');
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('At least one number (0-9)');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*()_+{}[\]|:;<>,.?/~`\-=]/.test(password)) {
    errors.push('At least one special character (!@#$%...)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate password strength score (0-4)
 * 0 = Very Weak, 1 = Weak, 2 = Fair, 3 = Good, 4 = Strong
 * @param {string} password
 * @returns {number} Score from 0-4
 */
export function getPasswordStrength(password) {
  if (!password) return 0;

  let score = 0;

  // Length bonuses
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Penalties for weak patterns
  if (/(.)\1{2,}/.test(password)) score--; // Repeated chars
  if (/(?:abc|123|qwe|asd|zxc)/i.test(password)) score--; // Common sequences

  return Math.max(0, Math.min(4, Math.floor(score / 2)));
}

/**
 * Get password strength label
 * @param {number} score - Score from 0-4
 * @returns {string} Strength label
 */
export function getStrengthLabel(score) {
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return labels[score] || 'Very Weak';
}

/**
 * Get password strength color for UI
 * @param {number} score - Score from 0-4
 * @returns {string} Color class or hex
 */
export function getStrengthColor(score) {
  const colors = {
    0: '#ef4444', // red-500
    1: '#f97316', // orange-500
    2: '#eab308', // yellow-500
    3: '#22c55e', // green-500
    4: '#10b981', // emerald-500
  };
  return colors[score] || colors[0];
}

/**
 * Get password strength percentage for progress bar
 * @param {number} score - Score from 0-4
 * @returns {number} Percentage (0-100)
 */
export function getStrengthPercentage(score) {
  return (score / 4) * 100;
}

/**
 * Check individual requirements
 * @param {string} password
 * @returns {Object} Object with boolean values for each requirement
 */
export function checkRequirements(password) {
  return {
    minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+{}[\]|:;<>,.?/~`\-=]/.test(password),
  };
}

export default {
  PASSWORD_REQUIREMENTS,
  validatePasswordComplexity,
  getPasswordStrength,
  getStrengthLabel,
  getStrengthColor,
  getStrengthPercentage,
  checkRequirements,
};
