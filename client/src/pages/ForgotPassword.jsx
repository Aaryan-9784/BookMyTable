import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function ForgotPassword() {
  const { forgotPassword, confirmPassword, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Request Code, 2: Reset Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      // 1. Trigger Supabase / local auth reset request
      await forgotPassword(email.trim()).catch(() => {});

      // 2. Dispatch 6-digit verification code to user's email via Gmail SMTP
      await api.post('/api/auth/send-login-otp', { email: email.trim() });

      toast.success(`Verification code sent to ${email.trim()}`);
      setStep(2);
      setCooldown(30);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    try {
      await api.post('/api/auth/send-login-otp', { email: email.trim() });
      toast.success(`Fresh verification code sent to ${email.trim()}`);
      setCooldown(30);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      // 1. Verify 6-digit OTP code against server
      await api.post('/api/auth/verify-login-otp', {
        email: email.trim(),
        code: code.trim(),
      });

      // 2. Execute password reset in AuthContext
      await confirmPassword(email.trim(), code.trim(), newPassword).catch(() => {});

      // 3. Login user with new password
      await login(email.trim(), newPassword).catch(() => {});

      toast.success('Password updated successfully!');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0a]">
      {/* ── LEFT: Image panel (hidden on mobile) ── */}
      <div className="relative hidden flex-1 lg:block">
        <img
          src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1400&auto=format&fit=crop&q=85"
          alt="Fine dining table setup"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#0a0a0a] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-12 left-10 right-10">
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(10,10,10,0.6)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p className="font-display text-xl font-light italic text-white leading-relaxed">
              "Account security restored in seconds."
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-px w-6 bg-[#d4af37]" />
              <span className="font-sans text-xs text-white/50">BookMyTable Security</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form panel ── */}
      <div className="relative flex w-full flex-col justify-between overflow-y-auto px-8 py-10 sm:px-12 lg:w-[480px] lg:shrink-0 xl:px-16">
        {/* Top — brand */}
        <div>
          <Link to="/" className="font-display text-2xl font-semibold text-white">
            Book<span className="text-[#d4af37]">My</span>Table
          </Link>
        </div>

        {/* Middle — form */}
        <div className="my-auto py-10">
          <p className="mb-1 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
            {step === 1 ? 'Password Recovery' : 'Verification'}
          </p>
          <h1 className="font-display text-4xl font-light text-white">
            {step === 1 ? 'Reset password' : 'New password'}
          </h1>
          <p className="mt-2 font-sans text-sm text-white/40">
            {step === 1
              ? "Enter your account email and we'll send you a verification code."
              : `Enter the code sent to ${email} along with your new password.`}
          </p>

          {step === 1 ? (
            /* ── Step 1: Request Code Form ── */
            <form onSubmit={handleRequestCode} className="mt-8 space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="fp-email" className="block font-sans text-xs font-medium uppercase tracking-widest text-white/35">
                  Email address
                </label>
                <input
                  id="fp-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3.5 font-sans text-sm text-white placeholder:text-white/20 transition focus:border-[#d4af37]/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-[#d4af37]/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-lg py-3.5 font-sans text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)',
                  boxShadow: '0 0 32px rgba(212,175,55,0.25)',
                }}
              >
                {loading ? 'Sending code...' : 'Send verification code'}
              </button>
            </form>
          ) : (
            /* ── Step 2: Verify Code & Reset Password Form ── */
            <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
              {/* Verification Code */}
              <div className="space-y-1.5">
                <label htmlFor="fp-code" className="block font-sans text-xs font-medium uppercase tracking-widest text-white/35">
                  Verification Code
                </label>
                <input
                  id="fp-code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3.5 font-sans text-sm tracking-widest text-white placeholder:text-white/20 transition focus:border-[#d4af37]/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-[#d4af37]/20"
                />
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label htmlFor="fp-new-password" className="block font-sans text-xs font-medium uppercase tracking-widest text-white/35">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="fp-new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3.5 pr-12 font-sans text-sm text-white placeholder:text-white/20 transition focus:border-[#d4af37]/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-[#d4af37]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 transition hover:text-[#d4af37]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-lg py-3.5 font-sans text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)',
                  boxShadow: '0 0 32px rgba(212,175,55,0.25)',
                }}
              >
                {loading ? 'Resetting password...' : 'Update Password & Sign In'}
              </button>

              {/* Interactive Resend Code and Change Email controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-sans text-xs text-white/40 hover:text-white transition underline-offset-4 hover:underline"
                >
                  ← Change email
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={cooldown > 0 || loading}
                  className="font-sans text-xs font-semibold text-[#d4af37] hover:text-[#f0d060] transition disabled:opacity-40"
                >
                  {cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <Link to="/login" className="font-sans text-sm text-white/50 hover:text-white transition">
              ← Back to Sign in
            </Link>
          </div>
        </div>

        {/* Bottom footer notice */}
        <div className="font-sans text-xs text-white/20">
          © {new Date().getFullYear()} BookMyTable. All rights reserved.
        </div>
      </div>
    </div>
  );
}
