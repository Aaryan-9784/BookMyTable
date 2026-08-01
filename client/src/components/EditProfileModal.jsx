import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { STORAGE_ID_TOKEN } from '../utils/constants.js';
import { useAuth } from '../context/AuthContext.jsx';

const COUNTRY_CODES = [
  { code: '+91', country: 'India' },
  { code: '+1',  country: 'United States / Canada' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+971', country: 'UAE' },
  { code: '+61', country: 'Australia' },
  { code: '+65', country: 'Singapore' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+81', country: 'Japan' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+974', country: 'Qatar' },
  { code: '+968', country: 'Oman' },
  { code: '+965', country: 'Kuwait' },
  { code: '+973', country: 'Bahrain' },
  { code: '+60', country: 'Malaysia' },
  { code: '+62', country: 'Indonesia' },
  { code: '+86', country: 'China' },
  { code: '+82', country: 'South Korea' },
  { code: '+39', country: 'Italy' },
  { code: '+34', country: 'Spain' },
  { code: '+55', country: 'Brazil' },
  { code: '+27', country: 'South Africa' },
];

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-black" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export default function EditProfileModal({ isOpen, onClose, onUpdated }) {
  const { profile, patchProfile } = useAuth();
  const [form, setForm] = useState({ fullName: '', countryCode: '+91', phone: '' });
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [codeMenuOpen, setCodeMenuOpen] = useState(false);
  const menuRef = useRef(null);

  /* Close code menu on outside click */
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setCodeMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* Load current user attributes when modal opens */
  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setCodeMenuOpen(false);

    const initialName = profile?.fullName || profile?.name || localStorage.getItem('bookmytable_full_name') || '';
    const initialEmail = profile?.email || localStorage.getItem('bookmytable_email') || '';
    const rawPhone = profile?.phone || localStorage.getItem('bookmytable_phone') || '';

    let detectedCode = '+91';
    let digits = rawPhone;

    const matched = COUNTRY_CODES.find((c) => rawPhone.startsWith(c.code));
    if (matched) {
      detectedCode = matched.code;
      digits = rawPhone.slice(matched.code.length).trim();
    } else {
      digits = rawPhone.replace(/\D/g, '');
    }

    setEmail(initialEmail);
    setForm({ fullName: initialName, countryCode: detectedCode, phone: digits });
  }, [isOpen, profile]);

  if (!isOpen) return null;

  /* Validation */
  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (form.phone && form.phone.trim().length < 6) {
      errs.phone = 'Please enter a valid phone number';
    }
    return errs;
  };

  const isValid = !Object.keys(validate()).length && form.fullName.trim();

  /* Submit */
  async function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const phoneFormatted = form.phone.trim() ? `${form.countryCode} ${form.phone.trim()}` : '';

      /* Sync to backend API */
      const token = localStorage.getItem(STORAGE_ID_TOKEN);
      if (token) {
        await api.patch('/api/users/profile', {
          name: form.fullName.trim(),
          fullName: form.fullName.trim(),
          ...(phoneFormatted ? { phone: phoneFormatted } : {}),
        });

        localStorage.setItem('bookmytable_full_name', form.fullName.trim());
        if (phoneFormatted) localStorage.setItem('bookmytable_phone', phoneFormatted);

        patchProfile({
          name: form.fullName.trim(),
          fullName: form.fullName.trim(),
          ...(phoneFormatted ? { phone: phoneFormatted } : {}),
        });
      }

      toast.success('Profile updated successfully');
      onUpdated?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border transition-all duration-300 select-none"
        style={{
          background: 'linear-gradient(160deg, #18181c 0%, #0e0e11 100%)',
          borderColor: 'rgba(212,175,55,0.25)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.03)',
        }}
      >
        {/* Ambient Top Glow */}
        <div
          className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-32 w-48 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.18) 0%, transparent 70%)' }}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">
              Edit Profile
            </h3>
            <p className="font-sans text-xs text-gray-400">
              Update your account details
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Email badge with Verified symbol */}
          <div className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.04] border border-amber-500/20 px-3.5 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="text-amber-400 text-sm">✉️</span>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-[10px] uppercase font-bold text-gray-500">Account Email</p>
                <p className="font-sans text-xs font-semibold text-white truncate">{email}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 font-sans text-[10px] font-bold text-emerald-400 shrink-0">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Verified
            </span>
          </div>

          {/* Full Name */}
          <div>
            <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Enter your full name"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-amber-400 focus:outline-none transition-colors"
              autoFocus
            />
            {errors.fullName && <p className="mt-1 font-sans text-xs text-red-400">{errors.fullName}</p>}
          </div>

          {/* Mobile Number with Upward Sleek Popover Dropdown */}
          <div className="relative" ref={menuRef}>
            <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Mobile Number
            </label>

            {/* Custom Popover Dropdown Menu (Positioned UPWARDS above field) */}
            {codeMenuOpen && (
              <div className="absolute bottom-full left-0 z-30 mb-2 w-64 max-h-48 overflow-y-auto rounded-xl border border-amber-500/30 bg-[#16161a] p-1.5 shadow-2xl backdrop-blur-xl">
                {COUNTRY_CODES.map(({ code, country }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, countryCode: code });
                      setCodeMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-sans text-xs transition-colors ${
                      form.countryCode === code
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{country}</span>
                    <span className="font-mono text-amber-400 font-bold">{code}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex items-center rounded-xl bg-white/[0.04] border border-white/10 focus-within:border-amber-400 overflow-hidden transition-colors">
              {/* Trigger button showing dial code */}
              <button
                type="button"
                onClick={() => setCodeMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 border-r border-white/10 px-3.5 py-2.5 font-sans text-xs font-bold text-amber-400 hover:bg-white/5 transition-colors shrink-0"
              >
                <span>{form.countryCode}</span>
                <span className="text-[10px] text-gray-400">▾</span>
              </button>

              {/* Phone Digits Input */}
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                placeholder="Enter mobile number"
                className="w-full bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none font-sans"
              />
            </div>

            {errors.phone && <p className="mt-1 font-sans text-xs text-red-400">{errors.phone}</p>}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-full px-5 py-2.5 font-sans text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || saving}
              className="rounded-full px-6 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-black transition-all duration-200 hover:brightness-110 active:scale-[0.97] disabled:opacity-50 flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #c9a84c 0%, #f5e6a3 50%, #c9a84c 100%)',
                boxShadow: '0 0 20px rgba(212,175,55,0.25)',
              }}
            >
              {saving && <Spinner />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
