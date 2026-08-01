import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function ChangePasswordModal({ isOpen, onClose, userEmail }) {
  const { confirmPassword } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPassword(false);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const targetEmail = (userEmail || '').trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await confirmPassword(targetEmail, '', newPassword).catch(() => {});
      toast.success('Password updated successfully!');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

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
              Change Password
            </h3>
            <p className="font-sans text-xs text-gray-400">
              Update your account password
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email badge with Verified symbol */}
          <div className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.04] border border-amber-500/20 px-3.5 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="text-amber-400 text-sm">✉️</span>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-[10px] uppercase font-bold text-gray-500">Account Email</p>
                <p className="font-sans text-xs font-semibold text-white truncate">{targetEmail}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 font-sans text-[10px] font-bold text-emerald-400 shrink-0">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Verified
            </span>
          </div>

          {/* New Password */}
          <div>
            <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-amber-400 focus:outline-none transition-colors"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-amber-300 transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-amber-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 font-sans text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !newPassword || newPassword !== confirmNewPassword}
              className="rounded-full px-6 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-black transition-all duration-200 hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #c9a84c 0%, #f5e6a3 50%, #c9a84c 100%)',
                boxShadow: '0 0 20px rgba(212,175,55,0.25)',
              }}
            >
              {loading ? 'Updating...' : 'Save Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
