import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { signUp, confirmSignUp, login, loading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [cognitoUsername, setCognitoUsername] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const result = await signUp(email.trim(), password, fullName.trim());
      if (result?.cognitoUsername) setCognitoUsername(result.cognitoUsername);
      if (result?.userConfirmed === false) {
        setNeedsConfirm(true);
        toast.success('Check your email for the verification code');
      } else {
        // Auto-confirm case — log in directly
        await login(email.trim(), password);
        toast.success(`Welcome, ${fullName.trim()}!`);
        navigate('/', { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Sign up failed');
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!cognitoUsername) {
      toast.error('Session expired — please sign up again');
      return;
    }
    try {
      await confirmSignUp(cognitoUsername, code.trim());
      // Auto-login after verification
      await login(email.trim(), password);
      toast.success(`Welcome, ${fullName.trim()}!`);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Confirmation failed');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0a]">

      {/* ── LEFT: Form panel ── */}
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
            {needsConfirm ? 'One last step' : 'Get started'}
          </p>
          <h1 className="font-display text-4xl font-light text-white">
            {needsConfirm ? 'Verify email' : 'Create account'}
          </h1>
          <p className="mt-2 font-sans text-sm text-white/40">
            {needsConfirm
              ? `Code sent to ${email}`
              : <>Already registered?{' '}
                  <Link to="/login" className="text-[#d4af37] hover:underline">Sign in</Link>
                </>
            }
          </p>

          {!needsConfirm ? (
            <form onSubmit={handleSignUp} className="mt-10 space-y-5">
              {/* Full name */}
              <div className="space-y-1.5">
                <label htmlFor="su-name" className="block font-sans text-xs font-medium uppercase tracking-widest text-white/35">
                  Full name
                </label>
                <input
                  id="su-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3.5 font-sans text-sm text-white placeholder:text-white/20 transition focus:border-[#d4af37]/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-[#d4af37]/20"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="su-email" className="block font-sans text-xs font-medium uppercase tracking-widest text-white/35">
                  Email address
                </label>
                <input
                  id="su-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3.5 font-sans text-sm text-white placeholder:text-white/20 transition focus:border-[#d4af37]/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-[#d4af37]/20"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="su-password" className="block font-sans text-xs font-medium uppercase tracking-widest text-white/35">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="su-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* CTA */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-lg py-3.5 font-sans text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)',
                  boxShadow: '0 0 32px rgba(212,175,55,0.25)',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating account…
                  </span>
                ) : 'Create free account'}
              </button>

              <p className="text-center font-sans text-xs text-white/20">
                By signing up you agree to our Terms of Service
              </p>
            </form>
          ) : (
            /* ── Verify step ── */
            <form onSubmit={handleConfirm} className="mt-10 space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="su-code" className="block font-sans text-xs font-medium uppercase tracking-widest text-white/35">
                  6-digit code
                </label>
                <input
                  id="su-code"
                  type="text"
                  inputMode="numeric"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="• • • • • •"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-4 text-center font-sans text-2xl tracking-[0.5em] text-white placeholder:text-white/15 transition focus:border-[#d4af37]/50 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/20"
                />
                <p className="text-center font-sans text-xs text-white/25">
                  Check your inbox and spam folder
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg py-3.5 font-sans text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)',
                  boxShadow: '0 0 32px rgba(212,175,55,0.25)',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Verifying…
                  </span>
                ) : 'Verify & continue'}
              </button>

              <button
                type="button"
                onClick={() => { setNeedsConfirm(false); setCognitoUsername(''); }}
                className="w-full rounded-lg border border-white/8 py-3 font-sans text-sm text-white/35 transition hover:border-[#d4af37]/30 hover:text-[#d4af37]"
              >
                ← Back
              </button>
            </form>
          )}
        </div>

        {/* Bottom */}
        <p className="text-center font-sans text-xs text-white/20">
          © {new Date().getFullYear()} BookMyTable. All rights reserved.
        </p>
      </div>

      {/* ── RIGHT: Image panel (hidden on mobile) ── */}
      <div className="relative hidden flex-1 lg:block">
        <img
          src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1400&auto=format&fit=crop&q=85"
          alt="Elegant restaurant interior"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute bottom-12 left-10 right-10">
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(10,10,10,0.55)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p className="font-display text-xl font-light italic text-white leading-relaxed">
              "Join thousands of food lovers who book their perfect table every day."
            </p>
            <div className="mt-4 flex gap-8">
              {[['500+', 'Restaurants'], ['50k+', 'Guests'], ['4.9★', 'Rating']].map(([val, label]) => (
                <div key={label}>
                  <p className="font-display text-lg text-[#d4af37]">{val}</p>
                  <p className="font-sans text-xs text-white/40">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
