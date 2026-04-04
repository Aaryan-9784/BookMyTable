import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/restaurants';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email.trim(), password);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0a]">

      {/* ── LEFT: Image panel (hidden on mobile) ── */}
      <div className="relative hidden flex-1 lg:block">
        <img
          src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1400&auto=format&fit=crop&q=85"
          alt="Fine dining restaurant"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#0a0a0a] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-black/30" />
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
              "The finest dining experiences, reserved in seconds."
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-px w-6 bg-[#d4af37]" />
              <span className="font-sans text-xs text-white/50">BookMyTable</span>
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
        <div className="my-auto py-12">
          <p className="mb-1 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
            Welcome back
          </p>
          <h1 className="font-display text-4xl font-light text-white">Sign in</h1>
          <p className="mt-2 font-sans text-sm text-white/40">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#d4af37] hover:underline">
              Sign up free
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block font-sans text-xs font-medium uppercase tracking-widest text-white/35">
                Email address
              </label>
              <input
                id="email"
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
              <label htmlFor="password" className="block font-sans text-xs font-medium uppercase tracking-widest text-white/35">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Bottom — footer note */}
        <p className="font-sans text-xs text-white/20 text-center">
          © {new Date().getFullYear()} BookMyTable. All rights reserved.
        </p>
      </div>

    </div>
  );
}
