/**
 * EditProfileModal — luxury glassmorphism edit profile modal.
 * Updates Cognito attributes (name, phone_number) + syncs to backend DB.
 */
import { useEffect, useState, useCallback } from 'react';
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { STORAGE_ID_TOKEN } from '../utils/constants.js';
import { useAuth } from '../context/AuthContext.jsx';

/* ── Cognito pool helper ── */
function getPool() {
  const UserPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const ClientId   = import.meta.env.VITE_COGNITO_CLIENT_ID;
  if (!UserPoolId || !ClientId) return null;
  return new CognitoUserPool({ UserPoolId, ClientId });
}

/* ── Phone validation: +[country code][number], e.g. +91XXXXXXXXXX ── */
const PHONE_RE = /^\+[1-9]\d{6,14}$/;

/* ── Icon: X close ── */
function IconX() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

/* ── Icon: spinner ── */
function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export default function EditProfileModal({ isOpen, onClose, onUpdated }) {
  const { patchProfile } = useAuth();
  const [form, setForm]       = useState({ fullName: '', phone: '' });
  const [email, setEmail]     = useState('');
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [visible, setVisible] = useState(false);

  /* ── Animate in/out ── */
  useEffect(() => {
    if (isOpen) {
      // tiny delay so CSS transition fires
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  /* ── Load current Cognito user attributes when modal opens ── */
  useEffect(() => {
    if (!isOpen) return;
    setErrors({});

    const pool = getPool();
    if (!pool) return;

    const cognitoUser = pool.getCurrentUser();
    if (!cognitoUser) return;

    cognitoUser.getSession((err) => {
      if (err) return;
      cognitoUser.getUserAttributes((attrErr, attrs) => {
        if (attrErr || !attrs) return;
        const get = (name) => attrs.find((a) => a.getName() === name)?.getValue() || '';
        setEmail(get('email'));
        const rawPhone = get('phone_number');
        // strip +91 prefix for the digit-only input
        const phoneDigits = rawPhone.startsWith('+91') ? rawPhone.slice(3) : rawPhone.replace(/^\+\d{1,3}/, '');
        setForm({ fullName: get('name'), phone: phoneDigits });
      });
    });
  }, [isOpen]);

  /* ── Validation ── */
  const validate = useCallback(() => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    // phone field stores just the digits after +91
    if (form.phone && !/^\d{10}$/.test(form.phone.trim()))
      errs.phone = 'Enter a valid 10-digit mobile number';
    return errs;
  }, [form]);

  const isValid = !Object.keys(validate()).length && form.fullName.trim();

  /* ── Submit ── */
  async function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const pool = getPool();
      if (!pool) throw new Error('Cognito not configured');

      const cognitoUser = pool.getCurrentUser();
      if (!cognitoUser) throw new Error('No active session');

      /* Refresh session first to ensure token is valid */
      await new Promise((res, rej) =>
        cognitoUser.getSession((err, session) => {
          if (err || !session?.isValid()) rej(new Error('Session expired'));
          else res(session);
        })
      );

      /* Build attribute list — only include phone if provided */
      const phoneE164 = form.phone.trim() ? `+91${form.phone.trim()}` : '';
      const attrsToUpdate = [{ Name: 'name', Value: form.fullName.trim() }];
      if (phoneE164) attrsToUpdate.push({ Name: 'phone_number', Value: phoneE164 });

      /* Update Cognito attributes */
      await new Promise((res, rej) =>
        cognitoUser.updateAttributes(attrsToUpdate, (err, result) => {
          if (err) rej(err); else res(result);
        })
      );

      /* Sync fullName to MongoDB via backend */
      const token = localStorage.getItem(STORAGE_ID_TOKEN);
      if (token) {
        await api.patch('/api/users/profile', {
          fullName: form.fullName.trim(),
          ...(phoneE164 ? { phone: phoneE164 } : {}),
        });
        /* Instantly update React context state — all components re-render immediately */
        localStorage.setItem('bookmytable_full_name', form.fullName.trim());
        patchProfile({
          fullName: form.fullName.trim(),
          name: form.fullName.trim(),
          ...(phoneE164 ? { phone: phoneE164 } : {}),
        });
      }

      toast.success('Profile updated successfully');
      onUpdated?.();
      handleClose();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (saving) return;
    setVisible(false);
    setTimeout(onClose, 200);
  }

  if (!isOpen) return null;

  return (
    /* ── Backdrop ── */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* ── Modal panel ── */}
      <div
        className="relative w-full max-w-md rounded-2xl p-7"
        style={{
          background: 'rgba(15,15,15,0.97)',
          border: '1px solid rgba(212,175,55,0.35)',
          boxShadow: '0 0 60px rgba(212,175,55,0.12), 0 24px 64px rgba(0,0,0,0.7)',
          transform: visible ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 0.2s ease, opacity 0.2s ease',
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Gold top accent line */}
        <div
          className="absolute left-0 right-0 top-0 h-px rounded-t-2xl"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)' }}
        />

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="mb-1 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-luxury-gold/50">
              Account
            </p>
            <h2 className="font-display text-2xl font-light text-white">Edit Profile</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/30 transition-all duration-200 hover:text-white/70"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <IconX />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} noValidate className="space-y-5">

          {/* Full Name */}
          <Field
            label="Full Name"
            id="ep-fullname"
            type="text"
            value={form.fullName}
            placeholder="Your full name"
            hint="Name cannot be changed"
            readOnly
            disabled
            required
          />

          {/* Email — read-only */}
          <Field
            label="Email Address"
            id="ep-email"
            type="email"
            value={email}
            readOnly
            disabled
            hint="Email cannot be changed"
          />



          {/* Divider */}
          <div className="h-px" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.12), transparent)' }} />

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="flex-1 rounded-full py-2.5 font-sans text-sm text-white/40 transition-all duration-200 hover:text-white/70"
              style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled
              className="flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 font-sans text-sm font-semibold transition-all duration-200"
              style={{
                background: 'rgba(212,175,55,0.2)',
                color: 'rgba(212,175,55,0.35)',
                cursor: 'not-allowed',
              }}
            >
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

/* ── Reusable luxury input field ── */
function Field({ label, id, value, onChange, error, hint, readOnly, disabled, required, type = 'text', placeholder }) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? 'rgba(239,68,68,0.5)'
    : focused
    ? 'rgba(212,175,55,0.55)'
    : 'rgba(255,255,255,0.1)';

  const bgColor = readOnly || disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)';

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-sans text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-luxury-gold/50">
        {label}{required && <span className="ml-0.5 text-luxury-gold/40">*</span>}
      </label>

      {type === 'tel' ? (
        /* ── Phone field with flag + country code prefix ── */
        <div
          className="flex items-center rounded-xl px-4 py-3 gap-2.5"
          style={{
            border: `1px solid ${borderColor}`,
            background: bgColor,
            boxShadow: focused && !error ? '0 0 0 3px rgba(212,175,55,0.07)' : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        >
          {/* Flag + dial code */}
          <div className="flex items-center gap-1.5 shrink-0 border-r pr-2.5" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <span className="text-base leading-none">🇮🇳</span>
            <span className="font-sans text-xs text-white/40">+91</span>
          </div>
          <input
            id={id}
            type="tel"
            value={value}
            disabled={disabled}
            placeholder="XXXXXXXXXX"
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1 bg-transparent font-sans text-sm text-white outline-none placeholder:text-white/20 disabled:cursor-not-allowed"
            style={{
              /* Kill browser autofill white background */
              WebkitBoxShadow: `0 0 0px 1000px transparent inset`,
              WebkitTextFillColor: disabled ? 'rgba(255,255,255,0.3)' : 'white',
              caretColor: '#d4af37',
            }}
            autoComplete="off"
          />
        </div>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          readOnly={readOnly}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-xl px-4 py-3 font-sans text-sm outline-none placeholder:text-white/20 disabled:cursor-not-allowed"
          style={{
            border: `1px solid ${borderColor}`,
            background: bgColor,
            boxShadow: focused && !error ? '0 0 0 3px rgba(212,175,55,0.07)' : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            color: readOnly || disabled ? 'rgba(255,255,255,0.3)' : 'white',
            /* Kill browser autofill white background */
            WebkitBoxShadow: `0 0 0px 1000px ${bgColor} inset`,
            WebkitTextFillColor: readOnly || disabled ? 'rgba(255,255,255,0.3)' : 'white',
            caretColor: '#d4af37',
          }}
          autoComplete="off"
        />
      )}

      {error && <p className="mt-1.5 font-sans text-[0.7rem] text-red-400">{error}</p>}
      {hint && !error && (
        <p className="mt-1.5 flex items-center gap-1 font-sans text-[0.7rem] text-white/25">
          <svg className="h-3 w-3 shrink-0 text-luxury-gold/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {hint}
        </p>
      )}
    </div>
  );
}
