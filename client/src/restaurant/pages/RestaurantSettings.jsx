import { useEffect, useState, useCallback } from 'react';
import toast from '../../utils/toast.js';
import { restaurantApi } from '../services/restaurantApi.js';

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
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [tokenFee, setTokenFee] = useState('150');
  const [capacity, setCapacity] = useState('40');
  const [openingHours, setOpeningHours] = useState('11:00 AM - 11:00 PM');
  const [priceRange, setPriceRange] = useState(2);
  const [category, setCategory] = useState('Multi-cuisine');
  const [experiences, setExperiences] = useState(['Fine Dining', 'Outdoor Terrace']);
  const [imageUrls, setImageUrls] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

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
      setTokenFee(String(r.tokenFee ?? 150));
      setCapacity(String(r.totalSeatingCapacity ?? 40));
      setOpeningHours(r.openingHours || '11:00 AM - 11:00 PM');
      setPriceRange(r.priceRange || 2);
      setExperiences(Array.isArray(r.experiences) && r.experiences.length ? r.experiences : ['Fine Dining', 'Outdoor Terrace']);
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

    if (!experiences.length) {
      toast.error('Please select at least 1 seating & dining experience option');
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
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between anim-fade-up">
        <div>
          <h1
            className="font-display leading-none text-luxury-white font-bold"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}
          >
            Settings & Profile
          </h1>
          <p className="mt-2 font-sans text-sm text-luxury-muted">
            Manage seating capacity, base token fees per seat, operating hours, and photo gallery
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
          <span
            className="rounded-full px-3.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-luxury-gold"
            style={{ background: 'rgba(212,175,55,0.10)', border: '1px solid rgba(212,175,55,0.25)' }}
          >
            {restaurant?.approvalStatus === 'approved' ? 'Approved & Live' : 'Pending Review'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Section 1: Basic Identity */}
          <div className="space-y-4">
            <h3 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-luxury-gold flex items-center gap-2">
              <span>🍴</span> Basic Details & Location
            </h3>
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className="block font-sans text-[10px] uppercase tracking-[0.16em] text-luxury-muted mb-2 font-bold">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-sans text-sm text-white outline-none focus:border-luxury-gold/60"
                  required
                />
              </div>

              <div>
                <label className="block font-sans text-[10px] uppercase tracking-[0.16em] text-luxury-muted mb-2 font-bold">
                  Location / Address *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-sans text-sm text-white outline-none focus:border-luxury-gold/60"
                  required
                />
              </div>

              <div>
                <label className="block font-sans text-[10px] uppercase tracking-[0.16em] text-luxury-muted mb-2 font-bold">
                  Cuisine / Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 font-sans text-sm text-white outline-none focus:border-luxury-gold/60"
                >
                  {['Multi-cuisine', 'Indian', 'North Indian', 'South Indian', 'Italian', 'Chinese', 'Japanese', 'Continental', 'Cafe', 'Fine dining', 'Mexican', 'Thai', 'Mediterranean', 'Bakery & Desserts'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Seating & Economics */}
          <div className="space-y-4 pt-2">
            <h3 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-luxury-gold flex items-center gap-2">
              <span>💰</span> Seating & Platform Economics
            </h3>
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className="block font-sans text-[10px] uppercase tracking-[0.16em] text-luxury-muted mb-2 font-bold">
                  Token Fee Per Seat (₹) *
                </label>
                <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden">
                  <span className="px-3 font-sans font-bold text-luxury-gold">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={tokenFee}
                    onChange={(e) => setTokenFee(e.target.value)}
                    onBlur={() => {
                      if (!tokenFee || isNaN(Number(tokenFee))) setTokenFee('150');
                      else setTokenFee(String(Math.max(0, parseInt(tokenFee, 10))));
                    }}
                    className="w-full bg-transparent py-3 font-sans text-sm font-bold text-luxury-gold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-[10px] uppercase tracking-[0.16em] text-luxury-muted mb-2 font-bold">
                  Total Seating Capacity *
                </label>
                <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden">
                  <span className="px-3 text-luxury-muted">🪑</span>
                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    onBlur={() => {
                      if (!capacity || isNaN(Number(capacity))) setCapacity('40');
                      else setCapacity(String(Math.max(1, parseInt(capacity, 10))));
                    }}
                    className="w-full bg-transparent py-3 font-sans text-sm font-bold text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-[10px] uppercase tracking-[0.16em] text-luxury-muted mb-2 font-bold">
                  Opening Hours *
                </label>
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  placeholder="e.g. 11:00 AM - 11:00 PM"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-sans text-sm text-white outline-none focus:border-luxury-gold/60"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Dining Tier */}
          <div className="space-y-4 pt-2">
            <h3 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-luxury-gold flex items-center gap-2">
              <span>⭐</span> Price Tier Level
            </h3>
            <div>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 font-sans text-sm text-white outline-none focus:border-luxury-gold/60"
              >
                <option value={1}>Casual / Budget</option>
                <option value={2}>Moderate Fine Dining</option>
                <option value={3}>Premium Luxury</option>
                <option value={4}>Ultra Luxury</option>
              </select>
            </div>
          </div>

          {/* Section 4: Experiences & Seating */}
          <div className="space-y-4 pt-2">
            <h3 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-luxury-gold flex items-center gap-2">
              <span>🥂</span> Reserve Tables By Experiences & Seating
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {EXPERIENCE_OPTIONS.map((exp) => {
                const active = experiences.includes(exp.id);
                return (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => toggleExperience(exp.id)}
                    className="flex items-center gap-2 rounded-full px-4 py-2.5 font-sans text-xs font-semibold transition-all duration-200"
                    style={
                      active
                        ? {
                            background: 'linear-gradient(135deg, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.08) 100%)',
                            border: '1px solid rgba(212,175,55,0.60)',
                            color: '#ffffff',
                            boxShadow: '0 0 16px rgba(212,175,55,0.18)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.09)',
                            color: '#a0a0a0',
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

          {/* Section 5: Gallery & Photos */}
          <div className="space-y-4 pt-2">
            <h3 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-luxury-gold flex items-center gap-2">
              <span>🖼️</span> Restaurant Imagery & Gallery
            </h3>

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => document.getElementById('partner-file-input')?.click()}
              className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl py-7 px-4 text-center transition-all duration-200"
              style={{
                border: imageUrls.length ? '1.5px dashed rgba(212,175,55,0.40)' : '1.5px dashed rgba(212,175,55,0.25)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <p className="font-sans text-xs font-semibold text-white">
                {uploading ? 'Uploading imagery…' : 'Drop photos here or click to upload gallery images'}
              </p>
              <p className="mt-1 font-sans text-[11px] text-luxury-muted">
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
              <span className="absolute bg-[#141414] px-3 font-sans text-[10px] font-bold uppercase tracking-widest text-luxury-muted">
                OR
              </span>
            </div>

            {/* Add via URL option */}
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Paste direct image URL (https://...)"
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 font-sans text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="rounded-xl px-4 py-2.5 font-sans text-xs font-semibold text-luxury-gold transition-colors shrink-0"
                style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}
              >
                Add URL
              </button>
            </div>

            {/* Preview grid */}
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
                        Cover Photo
                      </span>
                    )}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      style={{ background: 'rgba(0,0,0,0.60)' }}
                    >
                      <button
                        type="button"
                        onClick={() => setImageUrls((prev) => prev.filter((u) => u !== url))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-500/20"
                        style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 6: Description */}
          <div className="space-y-4 pt-2">
            <h3 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-luxury-gold flex items-center gap-2">
              <span>📜</span> Restaurant Overview & Ambiance
            </h3>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell guests about your dining atmosphere, chef specialties, seating style, and service..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-sans text-sm text-white placeholder-white/30 outline-none focus:border-luxury-gold/60 resize-none"
              required
            />
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-white/[0.06]">
            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full rounded-2xl py-4 font-sans text-xs font-bold uppercase tracking-wider text-[#0b0b0c] transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
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
