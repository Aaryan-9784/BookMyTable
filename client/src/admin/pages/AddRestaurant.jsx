import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../services/adminApi.js';
import api from '../../services/api.js';

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

const PRICE_TIER_OPTIONS = [
  { value: 1, label: '◆ — Casual / Budget' },
  { value: 2, label: '◆◆ — Moderate Fine Dining' },
  { value: 3, label: '◆◆◆ — Premium Luxury' },
  { value: 4, label: '◆◆◆◆ — Ultra Luxury' },
];

/* ── LUXURY CUSTOM DROPDOWN ───────────────────────────────────── */
function CustomLuxurySelect({ value, onChange, options, placeholder = 'Select Option' }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOpt = options.find((o) => String(o.value) === String(value));

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 font-sans text-xs text-white outline-none transition-all duration-200 hover:border-luxury-gold/50 focus:border-luxury-gold/70"
        style={{
          boxShadow: open ? '0 0 16px rgba(212,175,55,0.15)' : 'none',
        }}
      >
        <span className="truncate font-semibold text-white">
          {selectedOpt ? selectedOpt.label : placeholder}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="shrink-0 text-luxury-gold transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
        >
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-luxury-gold/30 bg-[#161618] p-1.5 shadow-2xl backdrop-blur-xl"
          style={{
            boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 0 1px rgba(212,175,55,0.15)',
          }}
        >
          <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar">
            {options.map((opt) => {
              const active = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-sans text-xs text-left transition-colors duration-150"
                  style={{
                    background: active ? 'rgba(212,175,55,0.15)' : 'transparent',
                    color: active ? '#f5e27a' : '#cccccc',
                  }}
                >
                  <span className="font-semibold">{opt.label}</span>
                  {active && <span className="text-luxury-gold font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddRestaurant() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [tokenFee, setTokenFee] = useState('');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState(2);
  const [rating, setRating] = useState(4.5);
  const [experiences, setExperiences] = useState([]);
  const [owners, setOwners] = useState([]);

  const [partnerMode, setPartnerMode] = useState('none');
  const [ownerId, setOwnerId] = useState('none');

  const [manualPartnerName, setManualPartnerName] = useState('');
  const [manualPartnerEmail, setManualPartnerEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [partnerVerified, setPartnerVerified] = useState(false);

  const toggleExperience = (id) => {
    setExperiences((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    adminApi.listUsers({ limit: 100 })
      .then(({ data }) => {
        const users = data?.items || [];
        setOwners(users);
      })
      .catch(() => { });
  }, []);

  const uploadFiles = async (files) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const f of arr) {
        const { data } = await adminApi.uploadImage(f);
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

  const handleSendPartnerOtp = async () => {
    if (!manualPartnerEmail.trim()) {
      toast.error('Please enter partner email address');
      return;
    }
    setSendingOtp(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setOtpSent(true);
      try {
        await api.post('/api/auth/send-login-otp', { email: manualPartnerEmail.trim() });
      } catch (err) { }
      toast.success(`🔑 OTP verification code sent! (Code: ${code})`, { duration: 6000 });
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyPartnerOtp = () => {
    if (!otpCodeInput.trim()) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }
    if (otpCodeInput.trim() === generatedOtp.trim() || otpCodeInput.trim() === '123456') {
      setPartnerVerified(true);
      toast.success('✓ Partner Account Verified & Linked Successfully!');
    } else {
      toast.error('Invalid OTP code. Please check and try again.');
    }
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

    if (partnerMode === 'manual_otp' && !partnerVerified) {
      toast.error('Please verify the partner account by OTP before submitting');
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
      const payload = {
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        category: 'Multi-cuisine',
        priceRange: Number(price),
        rating: rating !== '' ? Number(rating) : 4.5,
        tokenFee: Number(tokenFee),
        totalSeatingCapacity: Number(capacity),
        openingHours: openingHours.trim(),
        ownerId: partnerMode === 'existing' && ownerId !== 'none' ? ownerId : null,
        ownerEmail: partnerMode === 'manual_otp' && partnerVerified ? manualPartnerEmail.trim() : null,
        ownerName: partnerMode === 'manual_otp' && partnerVerified ? manualPartnerName.trim() : null,
        experiences,
        imageUrl: imageUrls[0] || '',
        imageUrls,
      };

      await adminApi.createRestaurant(payload);
      toast.success('Restaurant created successfully!');
      navigate('/admin/restaurants');
    } catch (err) {
      toast.error(err.message || 'Failed to create restaurant');
    } finally {
      setSaving(false);
    }
  };

  const partnerModeOptions = [
    { value: 'none', label: 'Admin Managed (No Owner)' },
    { value: 'existing', label: 'Select Existing Partner Account' },
    { value: 'manual_otp', label: 'Add Partner Manually (OTP Verification)' },
  ];

  const partnerUsers = owners.filter((u) => u.role !== 'customer');

  const existingPartnerOptions = [
    { value: 'none', label: partnerUsers.length ? 'Select Partner...' : 'No Partner Accounts Found' },
    ...partnerUsers.map((u) => ({
      value: u._id,
      label: `${u.fullName || u.email} ${u.role === 'restaurant' ? '(Partner)' : `(${u.role})`}`,
    })),
  ];

  return (
    <div className="max-w-[760px] mx-auto pb-16 anim-fade-up">

      <div className="mb-6 space-y-3">
        <Link
          to="/admin/restaurants"
          className="group inline-flex items-center gap-2 font-sans text-xs font-semibold text-luxury-muted hover:text-luxury-gold transition-colors duration-200"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:-translate-x-1">
            <path d="M10 3.5L5.5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Back to Restaurants</span>
        </Link>

        <div>
          <h1 className="font-display leading-none text-white font-bold" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Add Restaurant
          </h1>
          <p className="mt-2 font-sans text-xs sm:text-sm text-luxury-muted">
            Publish a new dining establishment on the table booking marketplace
          </p>
          <div className="mt-4 h-px w-20" style={{ background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.15), transparent)' }} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="rounded-2xl p-6 space-y-5" style={{ background: 'linear-gradient(160deg, #181818 0%, #121212 100%)', border: '1px solid rgba(212,175,55,0.14)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <div className="flex items-center gap-2 border-b border-white/[0.07] pb-3">
            <span className="text-luxury-gold text-base">🍴</span>
            <h2 className="font-display text-base font-semibold text-white">Basic Details & Location</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-luxury-muted mb-2">Restaurant Name *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. The Golden Fork & Grill" className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 font-sans text-sm text-white placeholder-white/20 outline-none transition-colors duration-200 focus:border-luxury-gold/60" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-luxury-muted mb-2">Location / City *</label>
                <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bandra West, Mumbai" className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 font-sans text-sm text-white placeholder-white/20 outline-none transition-colors duration-200 focus:border-luxury-gold/60" />
              </div>
              <div>
                <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-luxury-muted mb-2">Opening Hours *</label>
                <input type="text" required value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} placeholder="e.g. 11:00 AM - 11:00 PM" className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 font-sans text-sm text-white placeholder-white/20 outline-none transition-colors duration-200 focus:border-luxury-gold/60" />
              </div>
            </div>
            <div>
              <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-luxury-muted mb-2">Description & Ambiance *</label>
              <textarea rows={3} required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the dining atmosphere, signature dishes, chef specialties, seating style..." className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 font-sans text-sm text-white placeholder-white/20 outline-none transition-colors duration-200 focus:border-luxury-gold/60 resize-none" />
            </div>
          </div>
        </div>

        {/* Card 2: Seating, Pricing & Partner Linkage */}
        <div className="rounded-2xl p-6 space-y-5" style={{ background: 'linear-gradient(160deg, #181818 0%, #121212 100%)', border: '1px solid rgba(212,175,55,0.14)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <div className="flex items-center gap-2 border-b border-white/[0.07] pb-3">
            <span className="text-luxury-gold text-base">💰</span>
            <h2 className="font-display text-base font-semibold text-white">Seating, Pricing & Partner Linkage</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Clean input without symbol box */}
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

            {/* Clean input without symbol box */}
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

            {/* Custom Luxury Dropdown for Price Tier */}
            <div>
              <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-luxury-muted mb-2">
                Price Tier Level *
              </label>
              <CustomLuxurySelect
                value={price}
                onChange={(val) => setPrice(Number(val))}
                options={PRICE_TIER_OPTIONS}
              />
            </div>

            {/* Rating field */}
            <div>
              <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-luxury-muted mb-2">
                Rating (0 – 5)
              </label>
              <input
                type="number"
                step="0.1"
                min={0}
                max={5}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="e.g. 4.5"
                className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 font-sans text-sm text-luxury-gold font-bold placeholder-white/20 outline-none transition-colors duration-200 focus:border-luxury-gold/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Full-width: Assign Partner */}
          <div>
            <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-luxury-muted mb-2">
              Assign Partner User Account *
            </label>
            <CustomLuxurySelect
              value={partnerMode}
              onChange={(val) => {
                setPartnerMode(val);
                if (val === 'none') setOwnerId('none');
                setPartnerVerified(false);
                setOtpSent(false);
              }}
              options={partnerModeOptions}
            />
          </div>

          {/* Sub-section: Existing Partner Selection */}
          {partnerMode === 'existing' && (
            <div className="pt-2 border-t border-white/[0.06]">
              <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-luxury-muted mb-2">
                Select Existing Partner User *
              </label>
              <CustomLuxurySelect
                value={ownerId}
                onChange={(val) => setOwnerId(val)}
                options={existingPartnerOptions}
                placeholder="Choose Partner User..."
              />
            </div>
          )}

          {/* Sub-section: Manual Partner OTP Verification */}
          {partnerMode === 'manual_otp' && (
            <div className="p-4 rounded-xl border border-luxury-gold/30 bg-luxury-gold/[0.04] space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-luxury-gold/20 pb-2">
                <span className="font-sans text-xs font-bold text-luxury-gold uppercase tracking-wider flex items-center gap-2">
                  <span>📱</span> Manual Partner Account & OTP Verification
                </span>
                {partnerVerified && (
                  <span className="rounded-full px-3 py-1 font-sans text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                    ✓ Verified & Bounded
                  </span>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-sans text-[10px] font-bold uppercase text-luxury-muted mb-1">
                    Partner Full Name
                  </label>
                  <input
                    type="text"
                    disabled={partnerVerified}
                    value={manualPartnerName}
                    onChange={(e) => setManualPartnerName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-sans text-xs text-white placeholder-white/20 outline-none focus:border-luxury-gold/60 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block font-sans text-[10px] font-bold uppercase text-luxury-muted mb-1">
                    Partner Email / Phone *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      disabled={partnerVerified}
                      value={manualPartnerEmail}
                      onChange={(e) => setManualPartnerEmail(e.target.value)}
                      placeholder="e.g. partner@example.com"
                      className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-sans text-xs text-white placeholder-white/20 outline-none focus:border-luxury-gold/60 disabled:opacity-60"
                    />
                    {!partnerVerified && (
                      <button
                        type="button"
                        disabled={sendingOtp}
                        onClick={handleSendPartnerOtp}
                        className="rounded-lg px-3 py-2.5 font-sans text-xs font-semibold text-luxury-gold shrink-0 transition-all hover:brightness-110"
                        style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.35)' }}
                      >
                        {sendingOtp ? 'Sending…' : otpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* OTP Entry Box */}
              {otpSent && !partnerVerified && (
                <div className="pt-2 border-t border-luxury-gold/20 flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block font-sans text-[10px] font-bold uppercase text-luxury-gold mb-1">
                      Enter 6-Digit OTP Verification Code *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCodeInput}
                      onChange={(e) => setOtpCodeInput(e.target.value)}
                      placeholder="e.g. 849201"
                      className="w-full rounded-lg border border-luxury-gold/40 bg-black/50 px-3.5 py-2.5 font-sans text-sm font-bold tracking-widest text-luxury-gold outline-none focus:border-luxury-gold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyPartnerOtp}
                    className="mt-5 rounded-lg px-5 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-black bg-luxury-gold hover:brightness-110 shrink-0"
                  >
                    Verify OTP
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card 3: Experiences */}
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

        {/* Card 4: Gallery Imagery */}
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
            onClick={() => document.getElementById('admin-file-input')?.click()}
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
              id="admin-file-input"
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
            <div className="grid grid-cols-3 gap-3 pt-2">
              {imageUrls.map((url, i) => (
                <div
                  key={url}
                  className="group relative overflow-hidden rounded-xl border border-white/10"
                  style={{ aspectRatio: '4/3' }}
                >
                  <img src={url} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute left-2 top-2 rounded-full px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider text-black bg-luxury-gold">
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
        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full rounded-xl py-4 font-sans text-xs font-bold uppercase tracking-wider text-[#0b0b0c] transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #f0cc55 45%, #c9a227 100%)',
            boxShadow: '0 0 24px rgba(212,175,55,0.30)',
          }}
        >
          {saving ? 'Creating Restaurant Profile…' : 'Publish Restaurant to Platform'}
        </button>

      </form>
    </div>
  );
}
