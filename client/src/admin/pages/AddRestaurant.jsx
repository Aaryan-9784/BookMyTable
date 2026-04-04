import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../services/adminApi.js';

const CATEGORIES = [
  'Multi-cuisine', 'Indian', 'Italian', 'Chinese',
  'Japanese', 'Continental', 'Cafe', 'Fine dining',
];

/* ─────────────────────────────────────────────────────────────
   SHARED INPUT STYLE HELPERS
───────────────────────────────────────────────────────────── */
const inputBase = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.10)',
  color: '#f0f0f0',
  transition: 'border-color 0.22s ease, box-shadow 0.22s ease',
};
const inputFocus = {
  borderColor: 'rgba(212,175,55,0.55)',
  boxShadow: '0 0 0 3px rgba(212,175,55,0.08), 0 0 20px rgba(212,175,55,0.06)',
  outline: 'none',
};
const inputBlur = {
  borderColor: 'rgba(255,255,255,0.10)',
  boxShadow: 'none',
};

function applyFocus(e)  { Object.assign(e.currentTarget.style, inputFocus); }
function applyBlur(e)   { Object.assign(e.currentTarget.style, inputBlur);  }

/* ─────────────────────────────────────────────────────────────
   FIELD LABEL
───────────────────────────────────────────────────────────── */
function Label({ children, required }) {
  return (
    <label className="mb-2 flex items-center gap-1 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-luxury-muted">
      {children}
      {required && <span style={{ color: '#d4af37' }}>*</span>}
    </label>
  );
}

/* ─────────────────────────────────────────────────────────────
   PREMIUM INPUT
───────────────────────────────────────────────────────────── */
function PremiumInput({ name, placeholder, required, icon, type = 'text', defaultValue }) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-luxury-muted">
          {icon}
        </span>
      )}
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete="off"
        className="w-full rounded-xl py-3 font-sans text-sm placeholder:text-luxury-muted/60"
        style={{ ...inputBase, paddingLeft: icon ? '2.75rem' : '1rem', paddingRight: '1rem' }}
        onFocus={applyFocus}
        onBlur={applyBlur}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CATEGORY SELECT — custom glass dropdown
───────────────────────────────────────────────────────────── */
function CategorySelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* close on outside click */
  const handleBlur = (e) => {
    if (!ref.current?.contains(e.relatedTarget)) setOpen(false);
  };

  return (
    <div ref={ref} className="relative" onBlur={handleBlur} tabIndex={-1}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 font-sans text-sm text-white"
        style={{
          ...inputBase,
          borderColor: open ? 'rgba(212,175,55,0.45)' : 'rgba(255,255,255,0.10)',
          boxShadow: open ? '0 0 0 3px rgba(212,175,55,0.08)' : 'none',
        }}
      >
        <span>{value}</span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}
        >
          <path d="M2 4l4 4 4-4" stroke="#888" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-xl py-1"
          style={{
            background: 'rgba(20,20,20,0.98)',
            border: '1px solid rgba(212,175,55,0.14)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.65)',
            backdropFilter: 'blur(20px)',
            animation: 'fadeUp 0.15s ease forwards',
          }}
        >
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { onChange(c); setOpen(false); }}
              className="flex w-full items-center justify-between px-4 py-2.5 font-sans text-sm"
              style={{
                color: c === value ? '#d4af37' : '#9a9a9a',
                background: c === value ? 'rgba(212,175,55,0.08)' : 'transparent',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => { if (c !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={(e) => { if (c !== value) e.currentTarget.style.background = 'transparent'; }}
            >
              {c}
              {c === value && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PRICE PILLS
───────────────────────────────────────────────────────────── */
function PricePills({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4].map((n) => {
        const active = value === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="flex-1 rounded-xl py-2.5 font-sans text-sm font-semibold"
            style={
              active
                ? {
                    background: 'rgba(212,175,55,0.15)',
                    border: '1px solid rgba(212,175,55,0.40)',
                    color: '#d4af37',
                    boxShadow: '0 0 14px rgba(212,175,55,0.14)',
                    transition: 'all 0.18s ease',
                  }
                : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#666',
                    transition: 'all 0.18s ease',
                  }
            }
            onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(212,175,55,0.06)'; e.currentTarget.style.color = '#aaa'; } }}
            onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#666'; } }}
          >
            {'₹'.repeat(n)}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STAR RATING
───────────────────────────────────────────────────────────── */
function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || Math.round(value);

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="text-2xl leading-none"
            style={{
              color: star <= display ? '#d4af37' : 'rgba(255,255,255,0.12)',
              textShadow: star <= display ? '0 0 8px rgba(212,175,55,0.5)' : 'none',
              transition: 'color 0.15s ease, text-shadow 0.15s ease',
            }}
          >
            ★
          </button>
        ))}
      </div>
      <span className="font-sans text-sm text-luxury-muted">
        {value.toFixed(1)} / 5.0
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   IMAGE UPLOAD ZONE
───────────────────────────────────────────────────────────── */
function ImageUploadZone({ imageUrls, uploading, onFiles, onRemove }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    onFiles(e.dataTransfer.files);
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl py-10 text-center"
        style={{
          border: dragging
            ? '1.5px dashed rgba(212,175,55,0.70)'
            : '1.5px dashed rgba(212,175,55,0.25)',
          background: dragging
            ? 'rgba(212,175,55,0.06)'
            : 'rgba(255,255,255,0.02)',
          boxShadow: dragging ? '0 0 24px rgba(212,175,55,0.10)' : 'none',
          transition: 'all 0.22s ease',
        }}
      >
        {/* Upload icon */}
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.18)',
          }}
        >
          {uploading ? (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="#d4af37" strokeWidth="3" />
              <path className="opacity-80" fill="#d4af37" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 13V4M6 8l4-4 4 4" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>

        <p className="font-sans text-sm font-medium text-luxury-mutedlt">
          {uploading ? 'Uploading to S3…' : 'Drop images here or click to browse'}
        </p>
        <p className="mt-1 font-sans text-[11px] text-luxury-muted">
          PNG, JPG, WEBP — multiple files supported
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>

      {/* Preview grid */}
      {imageUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {imageUrls.map((url, i) => (
            <div
              key={url}
              className="group relative overflow-hidden rounded-xl"
              style={{ aspectRatio: '4/3' }}
            >
              <img src={url} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
              {/* Overlay on hover */}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"
                style={{
                  background: 'rgba(0,0,0,0.55)',
                  transition: 'opacity 0.18s ease',
                }}
              >
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(url); }}
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.35)',
                    color: '#f87171',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              {/* Primary badge */}
              {i === 0 && (
                <span
                  className="absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-wide"
                  style={{ background: 'rgba(212,175,55,0.85)', color: '#0b0b0c' }}
                >
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION DIVIDER
───────────────────────────────────────────────────────────── */
function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted">{label}</span>
      <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LOCATION ICON
───────────────────────────────────────────────────────────── */
function LocationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 1.5C4.8 1.5 3 3.3 3 5.5c0 3 4 7 4 7s4-4 4-7c0-2.2-1.8-4-4-4z"
        stroke="#666" strokeWidth="1.2" />
      <circle cx="7" cy="5.5" r="1.2" stroke="#666" strokeWidth="1.2" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function AddRestaurant() {
  const navigate   = useNavigate();
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [category,  setCategory]  = useState('Multi-cuisine');
  const [price,     setPrice]     = useState(2);
  const [rating,    setRating]    = useState(4);

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
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd   = new FormData(e.currentTarget);
    const name = fd.get('name')?.trim();
    const location = fd.get('location')?.trim();
    if (!name || !location) {
      toast.error('Name and location are required');
      return;
    }
    setSaving(true);
    try {
      await adminApi.createRestaurant({
        name,
        location,
        description: (fd.get('description') || '').trim(),
        category,
        priceRange: price,
        rating,
        imageUrl:  imageUrls[0] || '',
        imageUrls,
      });
      toast.success('Restaurant created');
      navigate('/admin/restaurants');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[680px] mx-auto anim-fade-up">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="mb-10">
        <Link
          to="/admin/restaurants"
          className="inline-flex items-center gap-1.5 font-sans text-[12px] text-luxury-muted"
          style={{ transition: 'color 0.18s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#d4af37'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to restaurants
        </Link>

        <h1
          className="mt-5 font-display text-white leading-none"
          style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', letterSpacing: '0.01em' }}
        >
          Add Restaurant
        </h1>
        <p className="mt-2 font-sans text-sm text-luxury-muted">
          Create and publish a premium dining experience
        </p>
        <div
          className="mt-4 h-px w-16"
          style={{ background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.15), transparent)' }}
        />
      </div>

      {/* ── Form card ────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-7 md:p-9"
        style={{
          background: 'linear-gradient(160deg, #1c1c1c 0%, #161616 100%)',
          border: '1px solid rgba(212,175,55,0.10)',
          boxShadow: '0 8px 56px rgba(0,0,0,0.55)',
        }}
      >
        {/* ── Basic info ─────────────────────────────────── */}
        <SectionDivider label="Basic Info" />
        <div className="mt-5 space-y-5">

          {/* Name */}
          <div>
            <Label required>Restaurant Name</Label>
            <PremiumInput
              name="name"
              required
              placeholder="e.g. The Golden Fork"
            />
          </div>

          {/* Location */}
          <div>
            <Label required>Location</Label>
            <PremiumInput
              name="location"
              required
              placeholder="e.g. Mumbai, Maharashtra"
              icon={<LocationIcon />}
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <textarea
              name="description"
              rows={4}
              placeholder="Describe the dining experience, ambiance, specialties…"
              className="w-full resize-none rounded-xl px-4 py-3 font-sans text-sm placeholder:text-luxury-muted/60"
              style={{ ...inputBase, color: '#f0f0f0' }}
              onFocus={applyFocus}
              onBlur={applyBlur}
            />
          </div>
        </div>

        {/* ── Details ────────────────────────────────────── */}
        <div className="mt-8">
          <SectionDivider label="Details" />
        </div>
        <div className="mt-5 space-y-5">

          {/* Category */}
          <div>
            <Label>Cuisine Category</Label>
            <CategorySelect value={category} onChange={setCategory} />
          </div>

          {/* Price range */}
          <div>
            <Label>Price Range</Label>
            <PricePills value={price} onChange={setPrice} />
            <p className="mt-1.5 font-sans text-[11px] text-luxury-muted">
              ₹ = Budget &nbsp;·&nbsp; ₹₹ = Moderate &nbsp;·&nbsp; ₹₹₹ = Premium &nbsp;·&nbsp; ₹₹₹₹ = Luxury
            </p>
          </div>

          {/* Rating */}
          <div>
            <Label>Initial Rating</Label>
            <StarRating value={rating} onChange={setRating} />
          </div>
        </div>

        {/* ── Images ─────────────────────────────────────── */}
        <div className="mt-8">
          <SectionDivider label="Images" />
        </div>
        <div className="mt-5">
          <Label>Restaurant Photos</Label>
          <ImageUploadZone
            imageUrls={imageUrls}
            uploading={uploading}
            onFiles={uploadFiles}
            onRemove={(url) => setImageUrls((prev) => prev.filter((u) => u !== url))}
          />
        </div>

        {/* ── Submit ─────────────────────────────────────── */}
        <div className="mt-10">
          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full rounded-full py-3.5 font-sans text-sm font-semibold text-luxury-bg disabled:opacity-50"
            style={{
              background: saving
                ? 'rgba(212,175,55,0.6)'
                : 'linear-gradient(135deg, #d4af37 0%, #f0cc55 45%, #c9a227 100%)',
              boxShadow: saving ? 'none' : '0 0 28px rgba(212,175,55,0.30)',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease',
            }}
            onMouseEnter={(e) => { if (!saving && !uploading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 36px rgba(212,175,55,0.45)'; e.currentTarget.style.filter = 'brightness(1.06)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = saving ? 'none' : '0 0 28px rgba(212,175,55,0.30)'; e.currentTarget.style.filter = 'brightness(1)'; }}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Creating…
              </span>
            ) : (
              'Create Restaurant'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
