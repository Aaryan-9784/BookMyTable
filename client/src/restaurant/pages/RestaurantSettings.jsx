import { useEffect, useState, useCallback } from 'react';
import toast from '../../utils/toast.js';
import { restaurantApi } from '../services/restaurantApi.js';
import LuxurySelect from '../../components/LuxurySelect.jsx';
import RestaurantHeader from '../components/RestaurantHeader.jsx';

const EXPERIENCE_OPTIONS = [
  { id: 'Fine Dining', label: 'Fine Dining', icon: '🕯️' },
  { id: 'Outdoor Terrace', label: 'Outdoor Terrace', icon: '🌿' },
  { id: 'Rooftop Dining', label: 'Rooftop Dining', icon: '🌆' },
  { id: 'VIP Dining', label: 'VIP Dining', icon: '👑' },
  { id: 'Bar & Lounge', label: 'Bar & Lounge', icon: '🍸' },
  { id: 'Gourmet Cuisine', label: 'Gourmet Cuisine', icon: '🍲' },
  { id: 'Private Dining', label: 'Private Dining', icon: '🍷' },
  { id: 'Live Music', label: 'Live Music', icon: '🎵' },
];

const CATEGORIES = [
  'Multi-cuisine', 'Indian', 'North Indian', 'South Indian',
  'Italian', 'Chinese', 'Japanese', 'Continental', 'Cafe',
  'Fine dining', 'Mexican', 'Thai', 'Mediterranean', 'Bakery & Desserts',
];

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c }));

const PRICE_TIER_OPTIONS = [
  { value: 1, label: 'Casual / Budget' },
  { value: 2, label: 'Moderate Fine Dining' },
  { value: 3, label: 'Premium Luxury' },
  { value: 4, label: 'Ultra Luxury' },
];

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

function IconCapacity() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 14v-3a2 2 0 012-2h6a2 2 0 012 2v3M9 6a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
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
  const cachedSettingsRes = restaurantApi.getCache('settings_default')?.data;
  const initialRest = cachedSettingsRes?.restaurant || restaurantApi.getActiveRestaurant() || null;

  const [restaurant, setRestaurant] = useState(initialRest);
  const [loading, setLoading] = useState(() => !initialRest);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form fields
  const [name, setName] = useState(initialRest?.name || '');
  const [location, setLocation] = useState(initialRest?.location || '');
  const [description, setDescription] = useState(initialRest?.description || '');
  const [tokenFee, setTokenFee] = useState(String(initialRest?.tokenFee ?? 150));
  const [capacity, setCapacity] = useState(String(initialRest?.totalSeatingCapacity ?? 40));
  const [openingHours, setOpeningHours] = useState(initialRest?.openingHours || '11:00 AM - 11:00 PM');
  const [priceRange, setPriceRange] = useState(initialRest?.priceRange || 2);
  const [category, setCategory] = useState(initialRest?.category || 'Multi-cuisine');
  const [experiences, setExperiences] = useState(Array.isArray(initialRest?.experiences) && initialRest.experiences.length ? initialRest.experiences : ['Fine Dining', 'Outdoor Terrace', 'Private Dining', 'Live Music']);
  const [imageUrls, setImageUrls] = useState(Array.isArray(initialRest?.imageUrls) && initialRest.imageUrls.length ? initialRest.imageUrls : initialRest?.imageUrl ? [initialRest.imageUrl] : []);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const fetchSettings = useCallback(async (silent = false) => {
    if (!silent && !restaurantApi.getCache('settings_default')) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await restaurantApi.getSettings();
      const r = res.data.restaurant || {};
      setRestaurant(r);
      setName(r.name || '');
      setLocation(r.location || '');
      setCategory(r.category || 'Multi-cuisine');
      setDescription(r.description || '');
      setTokenFee(String(r.tokenFee ?? 150));
      setCapacity(String(r.totalSeatingCapacity ?? 40));
      setOpeningHours(r.openingHours || '11:00 AM - 11:00 PM');
      setPriceRange(r.priceRange || 2);
      setExperiences(Array.isArray(r.experiences) && r.experiences.length ? r.experiences : ['Fine Dining', 'Outdoor Terrace', 'Private Dining', 'Live Music']);
      setImageUrls(Array.isArray(r.imageUrls) && r.imageUrls.length ? r.imageUrls : r.imageUrl ? [r.imageUrl] : []);
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

  const toggleExperience = (id) => {
    setExperiences((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const uploadFiles = async (files) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const f of arr) {
        const { data } = await restaurantApi.uploadImage(f);
        if (data?.url) urls.push(data.url);
      }
      setImageUrls((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`);
    } catch (e) {
      toast.error(e.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;
    const url = imageUrlInput.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast.error('Please enter a valid image URL starting with http:// or https://');
      return;
    }
    setImageUrls((prev) => [...prev, url]);
    setImageUrlInput('');
    toast.success('Image URL added');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !location.trim() || !description.trim() || !openingHours.trim()) {
      toast.error('Please fill in all mandatory text fields');
      return;
    }

    if (!tokenFee || isNaN(Number(tokenFee)) || Number(tokenFee) < 0) {
      toast.error('Please enter a valid Token Fee per seat (₹)');
      return;
    }

    if (!capacity || isNaN(Number(capacity)) || Number(capacity) < 1) {
      toast.error('Please enter a valid Total Seating Capacity');
      return;
    }

    if (!experiences.length) {
      toast.error('Please select at least 1 seating experience option');
      return;
    }

    if (!imageUrls.length) {
      toast.error('Please upload or add at least 1 restaurant photo');
      return;
    }

    setSaving(true);
    try {
      await restaurantApi.updateSettings({
        name: name.trim(),
        location: location.trim(),
        category: category || 'Multi-cuisine',
        description: description.trim(),
        tokenFee: Number(tokenFee) || 150,
        totalSeatingCapacity: Number(capacity) || 40,
        openingHours: openingHours.trim(),
        priceRange: Number(priceRange),
        experiences,
        imageUrl: imageUrls[0] || '',
        imageUrls,
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
    <div className="max-w-[1100px] mx-auto pb-16">
      {/* ── Page Header Row ─────────────────────────────────── */}
      <RestaurantHeader
        restaurant={restaurant}
        title="Restaurant Settings"
        description="Manage seating capacity, base token fees per seat, operating hours, and photo gallery"
        extraMeta={
          <>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1.5 text-white/90 font-medium">
              <span className="text-luxury-gold">⏰</span> Hours:{' '}
              <strong className="text-white font-medium">{openingHours || '11:00 AM to 11:00 PM'}</strong>
            </span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1.5 text-white/90 font-medium">
              <span className="text-luxury-gold">💎</span> Base Token Fee:{' '}
              <strong className="text-luxury-gold font-bold">₹{tokenFee || 200}</strong>
            </span>
          </>
        }
        actions={
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
        }
      />

      {/* ── 4-KPI Stat Cards Row ───────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard
          label="Base Token Fee"
          value={`₹${tokenFee || 150}`}
          sub="Booking fee per guest seat"
          Icon={IconFee}
          accent
        />
        <StatCard
          label="Total Guest Capacity"
          value={`🪑 ${capacity || 40}`}
          sub="Maximum seating capacity"
          Icon={IconCapacity}
        />
        <StatCard
          label="Operating Hours"
          value={openingHours ? openingHours.split('-')[0].trim() : '11:00 AM'}
          sub={openingHours || '11:00 AM - 11:00 PM'}
          Icon={IconClock}
        />
        <StatCard
          label="Price Tier"
          value={priceRange === 4 ? 'Ultra Luxury' : priceRange === 3 ? 'Premium Luxury' : priceRange === 2 ? 'Moderate Fine Dining' : 'Casual / Budget'}
          sub="Tier Level"
          Icon={IconPrice}
        />
      </div>

      {/* ── Main Form Container Panel ───────────────────────── */}
      <div
        className="rounded-3xl p-7 sm:p-10 space-y-8"
        style={{
          background: 'linear-gradient(160deg, #181818 0%, #121212 100%)',
          border: '1px solid rgba(212,175,55,0.14)',
          boxShadow: '0 16px 60px rgba(0,0,0,0.65)',
        }}
      >
        <div className="mb-2 flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-white">
              Restaurant Branding & Platform Rules
            </h2>
            <p className="mt-0.5 font-sans text-xs text-luxury-muted">
              Configure parameters shown on your public restaurant marketplace listing
            </p>
          </div>
          {restaurant?.approvalStatus === 'approved' ? (
            <span
              className="rounded-full px-3.5 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-emerald-400"
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.15)',
              }}
            >
              Approved & Live
            </span>
          ) : restaurant?.approvalStatus === 'rejected' ? (
            <span
              className="rounded-full px-3.5 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-red-400"
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                boxShadow: '0 0 16px rgba(239, 68, 68, 0.15)',
              }}
            >
              Rejected
            </span>
          ) : (
            <span
              className="rounded-full px-3.5 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-amber-400"
              style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                boxShadow: '0 0 16px rgba(245, 158, 11, 0.15)',
              }}
            >
              Pending Review
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Basic Details & Location (Matched with Admin Create/Edit) */}
          <div
            className="rounded-2xl p-6 space-y-5"
            style={{
              background: 'linear-gradient(160deg, #181818 0%, #121212 100%)',
              border: '1px solid rgba(212,175,55,0.14)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div className="flex items-center gap-2 border-b border-white/[0.07] pb-3">
              <span className="text-luxury-gold text-base">🍴</span>
              <h2 className="font-display text-base font-semibold text-white">
                Basic Details & Location
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-luxury-muted mb-2">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. The Golden Fork & Grill"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 font-sans text-sm text-white placeholder-white/20 outline-none transition-colors duration-200 focus:border-luxury-gold/60"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-luxury-muted mb-2">
                    Location / Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bandra West, Mumbai"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 font-sans text-sm text-white placeholder-white/20 outline-none transition-colors duration-200 focus:border-luxury-gold/60"
                  />
                </div>

                <div>
                  <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-luxury-muted mb-2">
                    Cuisine / Category *
                  </label>
                  <LuxurySelect
                    value={category}
                    onChange={(val) => setCategory(val)}
                    options={CATEGORY_OPTIONS}
                    placeholder="Select Cuisine"
                  />
                </div>

                <div>
                  <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-luxury-muted mb-2">
                    Opening Hours *
                  </label>
                  <input
                    type="text"
                    required
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="e.g. 11:00 AM - 11:00 PM"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 font-sans text-sm text-white placeholder-white/20 outline-none transition-colors duration-200 focus:border-luxury-gold/60"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-luxury-muted mb-2">
                  Description & Ambiance *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the dining atmosphere, signature dishes, chef specialties, seating style..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 font-sans text-sm text-white placeholder-white/20 outline-none transition-colors duration-200 focus:border-luxury-gold/60 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Seating & Platform Economics (Matched with Admin Create/Edit) */}
          <div
            className="rounded-2xl p-6 space-y-5"
            style={{
              background: 'linear-gradient(160deg, #181818 0%, #121212 100%)',
              border: '1px solid rgba(212,175,55,0.14)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div className="flex items-center gap-2 border-b border-white/[0.07] pb-3">
              <span className="text-luxury-gold text-base">💰</span>
              <h2 className="font-display text-base font-semibold text-white">
                Seating & Platform Economics
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-luxury-muted mb-2">
                  Token Fee Per Seat (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  maxLength={5}
                  required
                  value={tokenFee}
                  onChange={(e) => setTokenFee(e.target.value.slice(0, 5))}
                  onBlur={() => {
                    if (tokenFee !== '' && !isNaN(Number(tokenFee))) {
                      setTokenFee(String(Math.min(5000, Math.max(0, parseInt(tokenFee, 10)))));
                    }
                  }}
                  placeholder="e.g. 150"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 font-sans text-sm text-white placeholder-white/20 outline-none transition-colors duration-200 focus:border-luxury-gold/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div>
                <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-luxury-muted mb-2">
                  Total Seating Capacity *
                </label>
                <input
                  type="number"
                  min="1"
                  max="2000"
                  maxLength={4}
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value.slice(0, 4))}
                  onBlur={() => {
                    if (capacity !== '' && !isNaN(Number(capacity))) {
                      setCapacity(String(Math.min(2000, Math.max(1, parseInt(capacity, 10)))));
                    }
                  }}
                  placeholder="e.g. 40"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 font-sans text-sm text-white placeholder-white/20 outline-none transition-colors duration-200 focus:border-luxury-gold/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div>
                <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-luxury-muted mb-2">
                  Price Tier Level *
                </label>
                <LuxurySelect
                  value={priceRange}
                  onChange={(val) => setPriceRange(Number(val))}
                  options={PRICE_TIER_OPTIONS}
                  placeholder="Select Price Tier"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Seating & Dining Experiences (Matched with Admin Create/Edit) */}
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{
              background: 'linear-gradient(160deg, #181818 0%, #121212 100%)',
              border: '1px solid rgba(212,175,55,0.14)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-luxury-gold text-base">🥂</span>
                <h2 className="font-display text-base font-semibold text-white">
                  Seating & Dining Experiences
                </h2>
              </div>
              <span className="font-sans text-[11px] text-luxury-gold font-semibold">
                {experiences.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {EXPERIENCE_OPTIONS.map((exp) => {
                const active = experiences.includes(exp.id);
                return (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => toggleExperience(exp.id)}
                    className="flex items-center gap-2 rounded-full px-3.5 py-2 font-sans text-xs font-medium transition-all duration-200"
                    style={
                      active
                        ? {
                            background: 'linear-gradient(135deg, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.08) 100%)',
                            border: '1px solid rgba(212,175,55,0.50)',
                            color: '#ffffff',
                            boxShadow: '0 0 14px rgba(212,175,55,0.15)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#999',
                          }
                    }
                  >
                    <span>{exp.icon}</span>
                    <span>{exp.label}</span>
                    {active && <span className="ml-1 text-[11px] font-bold text-luxury-gold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 4: Restaurant Imagery & Gallery (Matched with Admin Create/Edit) */}
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{
              background: 'linear-gradient(160deg, #181818 0%, #121212 100%)',
              border: '1px solid rgba(212,175,55,0.14)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-luxury-gold text-base">🖼️</span>
                <h2 className="font-display text-base font-semibold text-white">
                  Photo Gallery
                </h2>
              </div>
              <span className="font-sans text-[11px] text-luxury-gold font-semibold">
                {imageUrls.length} photo{imageUrls.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Upload Drop Zone */}
            <div
              onClick={() => document.getElementById('partner-file-input')?.click()}
              className="group flex cursor-pointer flex-col items-center justify-center rounded-xl py-6 px-4 text-center transition-all duration-200 hover:border-luxury-gold/50"
              style={{
                border: imageUrls.length ? '1.5px dashed rgba(212,175,55,0.35)' : '1.5px dashed rgba(212,175,55,0.20)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <p className="font-sans text-xs font-semibold text-white">
                {uploading ? 'Uploading imagery…' : 'Click or drop photos here to upload gallery images *'}
              </p>
              <p className="mt-1 font-sans text-[10px] text-luxury-muted">
                Supports PNG, JPG, WEBP formats
              </p>
              <input
                id="partner-file-input"
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                className="hidden"
                onChange={(e) => uploadFiles(e.target.files)}
              />
            </div>

            {/* Visual OR Separator Divider */}
            <div className="relative flex items-center justify-center my-1.5">
              <div className="w-full border-t border-white/[0.08]" />
              <span className="absolute bg-[#151515] px-3 font-sans text-[10px] font-bold uppercase tracking-widest text-luxury-muted">
                OR
              </span>
            </div>

            {/* Add via URL */}
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Paste direct image URL (https://...)"
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 font-sans text-xs text-white placeholder-white/20 outline-none focus:border-luxury-gold/60"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="rounded-xl px-4 py-2.5 font-sans text-xs font-semibold text-luxury-gold shrink-0 transition-colors"
                style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}
              >
                Add URL
              </button>
            </div>

            {/* Thumbnail grid */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2">
                {imageUrls.map((url, i) => (
                  <div
                    key={url}
                    className="group relative overflow-hidden rounded-xl border border-white/10"
                    style={{ aspectRatio: '4/3' }}
                  >
                    <img src={url} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                    {i === 0 && (
                      <span className="absolute left-2 top-2 rounded-full px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider text-black bg-luxury-gold font-semibold">
                        Cover
                      </span>
                    )}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      style={{ background: 'rgba(0,0,0,0.60)' }}
                    >
                      <button
                        type="button"
                        onClick={() => setImageUrls((prev) => prev.filter((u) => u !== url))}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-red-400"
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full rounded-xl py-4 font-sans text-xs font-bold uppercase tracking-wider text-[#0b0b0c] transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #f0cc55 45%, #c9a227 100%)',
                boxShadow: '0 0 24px rgba(212,175,55,0.30)',
              }}
            >
              {saving ? 'Saving Restaurant Profile…' : 'Save & Publish Profile Updates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
