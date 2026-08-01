import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { restaurantApi } from '../services/restaurantApi.js';
import Loader from '../../components/Loader.jsx';

/* ── SVG ICONS (matches Partner Console theme) ──────────────── */
function IconRefresh() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M13 7.5A5.5 5.5 0 012.02 9M2 7.5A5.5 5.5 0 0112.98 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M12.5 3v3h-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 12v-3h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFee() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M9 5v8M6.5 7.5h5M6.5 10.5h5" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M9 5.5V9l2.5 2.5" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCategory() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 4.5h12M3 9h12M3 13.5h7" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconPrice() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2.5" y="4.5" width="13" height="9" rx="2" stroke="#d4af37" strokeWidth="1.4" />
      <circle cx="9" cy="9" r="2" stroke="#d4af37" strokeWidth="1.3" />
    </svg>
  );
}

/* ── STAT CARD (matches Dashboard/Tables/Analytics) ─────────── */
function StatCard({ label, value, sub, Icon, accent = false }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300 group"
      style={{
        background: accent
          ? 'linear-gradient(150deg, #1e1b0f 0%, #181507 60%, #151300 100%)'
          : 'linear-gradient(150deg, #1c1c1c 0%, #161616 55%, #131313 100%)',
        border: accent ? '1px solid rgba(212,175,55,0.28)' : '1px solid rgba(212,175,55,0.13)',
        boxShadow: accent
          ? '0 4px 40px rgba(0,0,0,0.55), 0 0 24px rgba(212,175,55,0.08)'
          : '0 4px 40px rgba(0,0,0,0.55)',
      }}
    >
      {accent && (
        <div
          className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)' }}
        />
      )}
      <div className="flex items-start justify-between mb-4">
        <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted">{label}</p>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.20)' }}
        >
          <Icon />
        </div>
      </div>
      <p className="font-display leading-none text-white font-bold text-2xl truncate">{value}</p>
      {sub && <p className="mt-2 font-sans text-xs text-luxury-muted truncate">{sub}</p>}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, rgba(212,175,55,0.55) 0%, transparent 100%)',
          opacity: accent ? 0.8 : 0.5,
        }}
      />
    </div>
  );
}

export default function RestaurantSettings() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [tokenFee, setTokenFee] = useState(150);
  const [openingHours, setOpeningHours] = useState('11:00 AM - 11:00 PM');
  const [priceRange, setPriceRange] = useState(2);

  const fetchSettings = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await restaurantApi.getSettings();
      const r = res.data.restaurant || {};
      setRestaurant(r);
      setName(r.name || '');
      setLocation(r.location || '');
      setCategory(r.category || 'Multi-cuisine');
      setDescription(r.description || '');
      setTokenFee(r.tokenFee || 150);
      setOpeningHours(r.openingHours || '11:00 AM - 11:00 PM');
      setPriceRange(r.priceRange || 2);
    } catch (err) {
      toast.error(err.message || 'Failed to load restaurant settings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await restaurantApi.updateSettings({
        name,
        location,
        category,
        description,
        tokenFee: Number(tokenFee),
        openingHours,
        priceRange: Number(priceRange),
      });
      toast.success('Restaurant profile updated successfully!');
      fetchSettings(true);
    } catch (err) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* ── Page Header Row ─────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between anim-fade-up">
        <div>
          <h1
            className="font-display leading-none text-luxury-white font-bold"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}
          >
            Settings & Profile
          </h1>
          <p className="mt-2 font-sans text-sm text-luxury-muted">
            Manage operating hours, base token fees per seat, category, and public restaurant branding
          </p>
          <div
            className="mt-4 h-px w-20"
            style={{ background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.15), transparent)' }}
          />
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={refreshing}
            onClick={() => { fetchSettings(true); toast.success('Settings refreshed'); }}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-xs text-luxury-muted hover:text-luxury-gold transition-all duration-200 disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className={refreshing ? 'animate-spin' : ''}><IconRefresh /></span>
            Refresh
          </button>
        </div>
      </div>

      {/* ── 4-KPI Stat Cards Row ───────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard
          label="Base Token Fee"
          value={`₹${tokenFee || 150}`}
          sub="Token fee charged per guest seat"
          Icon={IconFee}
          accent
        />
        <StatCard
          label="Operating Hours"
          value={openingHours ? openingHours.split('-')[0].trim() : '11:00 AM'}
          sub={openingHours || '11:00 AM - 11:00 PM'}
          Icon={IconClock}
        />
        <StatCard
          label="Cuisine Category"
          value={category || 'Multi-cuisine'}
          sub="Public discovery label"
          Icon={IconCategory}
        />
        <StatCard
          label="Price Tier"
          value={'₹'.repeat(priceRange || 2)}
          sub={priceRange === 4 ? 'Ultra Luxury' : priceRange === 3 ? 'Luxury Dining' : 'Fine Dining'}
          Icon={IconPrice}
        />
      </div>

      {/* ── Main Form Container Panel ───────────────────────── */}
      <div
        className="rounded-2xl p-6 sm:p-8"
        style={{
          background: 'linear-gradient(160deg, #181818 0%, #121212 100%)',
          border: '1px solid rgba(212,175,55,0.13)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div className="mb-6 flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-white">
              Restaurant Branding & Pricing
            </h2>
            <p className="mt-0.5 font-sans text-xs text-luxury-muted">
              Configure parameters shown on your public restaurant page and booking flow
            </p>
          </div>
          <span
            className="rounded-full px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-luxury-gold"
            style={{ background: 'rgba(212,175,55,0.10)', border: '1px solid rgba(212,175,55,0.25)' }}
          >
            {restaurant?.approvalStatus === 'approved' ? 'Approved & Live' : 'Pending Review'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block font-sans text-xs uppercase tracking-wider text-luxury-muted mb-2 font-semibold">
                Restaurant Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-sans text-sm text-white placeholder-white/30 outline-none transition-colors duration-200 focus:border-luxury-gold/60"
                required
              />
            </div>

            <div>
              <label className="block font-sans text-xs uppercase tracking-wider text-luxury-muted mb-2 font-semibold">
                Location / City
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-sans text-sm text-white placeholder-white/30 outline-none transition-colors duration-200 focus:border-luxury-gold/60"
                required
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block font-sans text-xs uppercase tracking-wider text-luxury-muted mb-2 font-semibold">
                Cuisine Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Italian Fine Dining, Indian Gourmet"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-sans text-sm text-white placeholder-white/30 outline-none transition-colors duration-200 focus:border-luxury-gold/60"
              />
            </div>

            <div>
              <label className="block font-sans text-xs uppercase tracking-wider text-luxury-muted mb-2 font-semibold">
                Base Token Fee Per Seat (₹)
              </label>
              <input
                type="number"
                min="0"
                value={tokenFee}
                onChange={(e) => setTokenFee(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-sans text-sm text-luxury-gold font-bold outline-none transition-colors duration-200 focus:border-luxury-gold/60"
                required
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block font-sans text-xs uppercase tracking-wider text-luxury-muted mb-2 font-semibold">
                Opening Hours
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="e.g. 11:00 AM - 11:00 PM"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-sans text-sm text-white placeholder-white/30 outline-none transition-colors duration-200 focus:border-luxury-gold/60"
              />
            </div>

            <div>
              <label className="block font-sans text-xs uppercase tracking-wider text-luxury-muted mb-2 font-semibold">
                Price Range Level
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 font-sans text-sm text-white outline-none transition-colors duration-200 focus:border-luxury-gold/60"
              >
                <option value={1}>₹ — Casual / Moderate</option>
                <option value={2}>₹₹ — Fine Dining</option>
                <option value={3}>₹₹₹ — Luxury Dining</option>
                <option value={4}>₹₹₹₹ — Ultra Luxury</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-sans text-xs uppercase tracking-wider text-luxury-muted mb-2 font-semibold">
              Restaurant Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell guests about your dining atmosphere, specialties, and service..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-sans text-sm text-white placeholder-white/30 outline-none transition-colors duration-200 focus:border-luxury-gold/60"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-white/[0.06]">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl px-8 py-3 font-sans text-xs font-bold uppercase tracking-wider text-[#0b0b0c] transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)',
                boxShadow: '0 0 20px rgba(212,175,55,0.25)',
              }}
            >
              {saving ? 'Saving Changes…' : 'Save Restaurant Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
