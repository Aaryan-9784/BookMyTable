/**
 * EditProfileModal — luxury glassmorphism edit profile modal.
 * Updates profile fields (fullName, phone) + syncs to backend DB.
 */
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { STORAGE_ID_TOKEN } from '../utils/constants.js';
import { useAuth } from '../context/AuthContext.jsx';

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
  const { profile, patchProfile } = useAuth();
  const [form, setForm]       = useState({ fullName: '', phone: '' });
  const [email, setEmail]     = useState('');
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [visible, setVisible] = useState(false);

  /* ── Animate in/out ── */
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  /* ── Load current user attributes when modal opens ── */
  useEffect(() => {
    if (!isOpen) return;
    setErrors({});

    const initialName = profile?.fullName || profile?.name || localStorage.getItem('bookmytable_full_name') || '';
    const initialEmail = profile?.email || localStorage.getItem('bookmytable_email') || '';
    const rawPhone = profile?.phone || '';
    const phoneDigits = rawPhone.startsWith('+91') ? rawPhone.slice(3) : rawPhone.replace(/^\+\d{1,3}/, '');

    setEmail(initialEmail);
    setForm({ fullName: initialName, phone: phoneDigits });
  }, [isOpen, profile]);

  /* ── Validation ── */
  const validate = useCallback(() => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
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
      const phoneE164 = form.phone.trim() ? `+91${form.phone.trim()}` : '';

      /* Sync name to MongoDB via backend API */
      const token = localStorage.getItem(STORAGE_ID_TOKEN);
      if (token) {
        await api.patch('/api/users/profile', {
          name: form.fullName.trim(),
          fullName: form.fullName.trim(),
          ...(phoneE164 ? { phone: phoneE164 } : {}),
        });
        
        localStorage.setItem('bookmytable_full_name', form.fullName.trim());
        patchProfile({
          name: form.fullName.trim(),
          fullName: form.fullName.trim(),
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

  if (!isOpen && !visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        visible ? 'bg-black/85 backdrop-blur-md opacity-100' : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
      }`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-2xl p-6 md:p-8 transition-all duration-300 ${
          visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-2'
        }`}
        style={{
          background: 'rgba(18, 18, 22, 0.96)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(212, 175, 55, 0.22)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.8), 0 0 32px rgba(212, 175, 55, 0.08)',
        }}
      >
        {/* Top gold shimmer bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, transparent 0%, #d4af37 50%, transparent 100%)' }}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'rgba(212, 175, 55, 0.15)' }}>
          <div>
            <h2 className="font-display text-2xl font-light text-white">Edit Profile</h2>
            <div className="mt-1 h-0.5 w-8" style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition-all duration-200 hover:scale-110 hover:text-luxury-gold active:scale-95 disabled:opacity-50"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
          >
            <IconX />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-6 space-y-5">
          {/* Email (Read only) */}
          <div>
            <label className="block font-sans text-[0.65rem] font-bold uppercase tracking-[0.20em] text-white/40">
              Email Address (Read Only)
            </label>
            <input
              type="text"
              disabled
              value={email}
              className="mt-2 w-full rounded-xl border px-4 py-3 font-sans text-xs text-white/40 cursor-not-allowed select-none"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.07)',
              }}
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block font-sans text-[0.65rem] font-bold uppercase tracking-[0.20em] text-white/40">
              Full Name
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Your Full Name"
              className="mt-2 w-full rounded-xl border px-4 py-3 font-sans text-xs text-white placeholder-white/20 transition-all duration-200 focus:outline-none"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderColor: errors.fullName ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.10)',
              }}
              onFocus={(e) => {
                if (!errors.fullName) {
                  e.target.style.borderColor = 'rgba(212, 175, 55, 0.6)';
                  e.target.style.boxShadow = '0 0 16px rgba(212, 175, 55, 0.2)';
                }
              }}
              onBlur={(e) => {
                if (!errors.fullName) {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.10)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            />
            {errors.fullName && <p className="mt-1.5 font-sans text-xs text-red-400">{errors.fullName}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block font-sans text-[0.65rem] font-bold uppercase tracking-[0.20em] text-white/40">
              Mobile Number (10 digits)
            </label>
            <div
              className="mt-2 flex rounded-xl border overflow-hidden transition-all duration-200"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderColor: errors.phone ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.10)',
              }}
              onFocusCapture={(e) => {
                if (!errors.phone) {
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(212, 175, 55, 0.2)';
                }
              }}
              onBlurCapture={(e) => {
                if (!errors.phone) {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.10)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <span className="flex items-center px-4 font-sans text-xs font-semibold text-luxury-gold/80 border-r border-white/10">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                placeholder="9876543210"
                className="w-full bg-transparent px-4 py-3 font-sans text-xs text-white placeholder-white/20 focus:outline-none"
              />
            </div>
            {errors.phone && <p className="mt-1.5 font-sans text-xs text-red-400">{errors.phone}</p>}
          </div>

          {/* Buttons */}
          <div className="mt-8 flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="rounded-full border px-5 py-2.5 font-sans text-xs font-semibold text-white/60 transition-all duration-200 hover:border-white/25 hover:text-white active:scale-95 disabled:opacity-50"
              style={{ borderColor: 'rgba(255, 255, 255, 0.12)', background: 'rgba(255, 255, 255, 0.03)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || saving}
              className="flex items-center gap-2 rounded-full px-6 py-2.5 font-sans text-xs font-bold text-[#0b0b0c] transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)',
                boxShadow: '0 0 24px rgba(212,175,55,0.3)',
              }}
            >
              {saving ? <Spinner /> : null}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
