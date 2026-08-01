/**
 * Password Strength Indicator Component
 * Provides real-time visual feedback on password strength
 */
import { useMemo } from 'react';
import {
  getPasswordStrength,
  getStrengthLabel,
  getStrengthColor,
  getStrengthPercentage,
  checkRequirements,
  PASSWORD_REQUIREMENTS,
} from '../utils/passwordValidator';

export default function PasswordStrengthIndicator({ password, showRequirements = true }) {
  const strength = useMemo(() => getPasswordStrength(password || ''), [password]);
  const label = useMemo(() => getStrengthLabel(strength), [strength]);
  const color = useMemo(() => getStrengthColor(strength), [strength]);
  const percentage = useMemo(() => getStrengthPercentage(strength), [strength]);
  const requirements = useMemo(() => checkRequirements(password || ''), [password]);

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      {/* Strength Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">Password Strength</span>
          <span className="font-medium" style={{ color }}>
            {label}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full transition-all duration-300 ease-out rounded-full"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1 pt-1">
          <p className="text-xs font-medium text-white/40">Password must contain:</p>
          <div className="grid grid-cols-1 gap-1 text-xs">
            <RequirementItem
              met={requirements.minLength}
              label={`At least ${PASSWORD_REQUIREMENTS.minLength} characters`}
            />
            <RequirementItem met={requirements.hasUppercase} label="One uppercase letter (A-Z)" />
            <RequirementItem met={requirements.hasLowercase} label="One lowercase letter (a-z)" />
            <RequirementItem met={requirements.hasNumber} label="One number (0-9)" />
            <RequirementItem
              met={requirements.hasSpecialChar}
              label="One special character (!@#$%...)"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RequirementItem({ met, label }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <svg className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5 flex-shrink-0 text-white/20" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span className={met ? 'text-white/70' : 'text-white/30'}>{label}</span>
    </div>
  );
}
