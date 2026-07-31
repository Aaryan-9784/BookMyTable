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
        visible ? 'bg-black/80 backdrop-blur-md opacity-100' : 'bg-black/0 backdrop-blur-none opacity-0'
      }`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#121216] p-6 shadow-2xl transition-all duration-300 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="font-display text-xl font-semibold text-white">Edit Profile</h2>
          <button
            onClick={handleClose}
            disabled={saving}
            className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
          >
            <IconX />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-6 space-y-4">
          {/* Email (Read only) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/40">
              Email Address (Read Only)
            </label>
            <input
              type="text"
              disabled
              value={email}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-2.5 text-sm text-white/50 cursor-not-allowed"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/40">
              Full Name
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Your Full Name"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#d4af37] focus:outline-none"
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/40">
              Mobile Number (10 digits)
            </label>
            <div className="mt-1.5 flex rounded-lg border border-white/10 bg-white/[0.05] overflow-hidden focus-within:border-[#d4af37]">
              <span className="flex items-center px-3 text-sm text-white/40 border-r border-white/10">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                placeholder="9876543210"
                className="w-full bg-transparent px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none"
              />
            </div>
            {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
          </div>

          {/* Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || saving}
              className="flex items-center gap-2 rounded-lg bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black transition hover:bg-[#e0be48] disabled:opacity-40"
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
