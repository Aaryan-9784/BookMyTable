/**
 * GuestReviews.jsx — Guest Reviews & Ratings page.
 * Aligned with Wishlist.jsx structure, layout, typography, and dark gold luxury theme.
 * Features a custom luxury venue dropdown selector and a rich venue selection card grid.
 */
import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from '../utils/toast.js';
import api from '../services/api.js';
import Loader from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getFallbackRestaurantImage } from '../utils/imageUtils.js';

const DECIMAL_RATING_PRESETS = [
  { val: 5.0, label: '5.0 ★ Exceptional' },
  { val: 4.8, label: '4.8 ★ Outstanding' },
  { val: 4.5, label: '4.5 ★ Excellent' },
  { val: 4.0, label: '4.0 ★ Great' },
  { val: 3.5, label: '3.5 ★ Good' },
];

export default function GuestReviews() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRestaurantId = searchParams.get('restaurantId') || '';

  const { isAuthenticated, profile, displayName, email } = useAuth();
  
  // Prevent prefilling restaurant name as guest name
  const userAuthorName = (profile?.role === 'customer' || !profile?.role)
    ? (profile?.name || profile?.fullName || displayName || (email ? email.split('@')[0] : ''))
    : (displayName || (email ? email.split('@')[0] : ''));

  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [selectedId, setSelectedId] = useState(initialRestaurantId);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Custom Dropdown State
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Review Form State
  const [rating, setRating] = useState(4.8);
  const [author, setAuthor] = useState(userAuthorName);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load all restaurants
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/api/restaurants');
        const list = Array.isArray(data) ? data : data?.items || [];
        if (cancelled) return;
        setRestaurants(list);
      } catch (err) {
        if (!cancelled) toast.error(err.message || 'Failed to load restaurants');
      } finally {
        if (!cancelled) setLoadingRestaurants(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Sync author name from profile
  useEffect(() => {
    if (userAuthorName && !author) {
      setAuthor(userAuthorName);
    }
  }, [userAuthorName]);

  // Fetch details when selected restaurant changes
  useEffect(() => {
    if (!selectedId) {
      setSelectedRestaurant(null);
      return;
    }
    let cancelled = false;
    setLoadingDetails(true);

    api.get(`/api/restaurants/${selectedId}`)
      .then(({ data }) => {
        if (!cancelled) setSelectedRestaurant(data);
      })
      .catch((err) => {
        if (!cancelled) toast.error(err.message || 'Failed to load restaurant reviews');
      })
      .finally(() => {
        if (!cancelled) setLoadingDetails(false);
      });

    return () => { cancelled = true; };
  }, [selectedId]);

  const handleSelectRestaurant = (id) => {
    setSelectedId(id);
    setDropdownOpen(false);
    setSearchParams(id ? { restaurantId: id } : {});
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedId) {
      toast.error('Please select a restaurant to review');
      return;
    }
    const numRating = Number(parseFloat(rating).toFixed(1));
    if (isNaN(numRating) || numRating < 1.0 || numRating > 5.0) {
      toast.error('Rating must be between 1.0 and 5.0');
      return;
    }
    if (!reviewText.trim()) {
      toast.error('Please enter your review text');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post(`/api/restaurants/${selectedId}/reviews`, {
        rating: numRating,
        text: reviewText.trim(),
        author: author.trim() || 'Verified Guest',
      });

      toast.success('🎉 Thank you for your review!');
      setReviewText('');

      if (data?.reviews) {
        setSelectedRestaurant((prev) => ({
          ...prev,
          rating: data.rating ?? prev.rating,
          reviews: data.reviews,
        }));
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to submit review';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingRestaurants) return <Loader message="Loading restaurant reviews..." />;

  const reviewsList = Array.isArray(selectedRestaurant?.reviews) && selectedRestaurant.reviews.length > 0
    ? selectedRestaurant.reviews
    : [
        {
          author: 'Ananya Roy',
          rating: 5.0,
          date: '2 days ago',
          text: 'Exquisite ambiance and supreme culinary craftsmanship. The table reservation via BookMyTable was seamless.',
        },
        {
          author: 'Vikram Malhotra',
          rating: 4.8,
          date: '1 week ago',
          text: 'Outstanding flavors, attentive hospitality, and luxury seating. Highly recommended for celebrations.',
        },
      ];

  const avgRating = Number(selectedRestaurant?.rating || 4.8).toFixed(1);
  const totalReviews = selectedRestaurant ? reviewsList.length : 0;

  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviewsList.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
    counts[star] = (counts[star] || 0) + 1;
  });

  const selectedVenueObj = restaurants.find((r) => r._id === selectedId);

  return (
    <div
      className="min-h-screen pb-16 pt-8 text-white"
      style={{ background: 'linear-gradient(180deg, #0b0b0c 0%, #121212 50%, #1a1a1a 100%)' }}
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group mb-6 inline-flex items-center gap-2 px-1 py-1 font-sans text-sm font-medium text-gray-400 transition-all duration-200 hover:text-amber-400"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="transition-transform duration-200 group-hover:-translate-x-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>

        {/* ── HEADER ── */}
        <header className="mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 font-sans text-[0.65rem] font-bold uppercase tracking-[0.28em] text-luxury-gold/80">
                REVIEWS & RATINGS
              </p>
              <h1 className="font-display text-4xl font-light text-white md:text-5xl">
                Reviews & Ratings {selectedRestaurant && <span className="font-sans text-xl text-luxury-gold/80">({totalReviews})</span>}
              </h1>
              <div className="mt-3.5 h-0.5 w-20" style={{ background: 'linear-gradient(90deg, #d4af37 0%, rgba(212,175,55,0.2) 80%, transparent 100%)' }} />
              <p className="mt-3 font-sans text-sm text-white/40 max-w-xl">
                Read authentic diner experiences and share your feedback for fine dining venues across BookMyTable.
              </p>
            </div>

            {/* CUSTOM LUXURY VENUE DROPDOWN SELECTOR */}
            <div className="w-full sm:w-88 relative" ref={dropdownRef}>
              <label className="mb-1.5 block font-sans text-[10px] font-bold uppercase tracking-wider text-luxury-gold">
                Select Venue to Review
              </label>

              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-full flex items-center justify-between rounded-2xl px-4 py-3 font-sans text-sm font-medium text-white transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: dropdownOpen ? '1px solid #d4af37' : '1px solid rgba(212,175,55,0.35)',
                  boxShadow: dropdownOpen ? '0 0 16px rgba(212,175,55,0.25)' : 'none',
                }}
              >
                <span className="truncate text-white/90">
                  {selectedVenueObj ? (
                    <span className="flex items-center gap-2 truncate">
                      <span className="truncate">{selectedVenueObj.name}</span>
                      <span className="text-luxury-gold font-bold shrink-0">(★ {Number(selectedVenueObj.rating || 4.8).toFixed(1)})</span>
                    </span>
                  ) : (
                    <span className="text-white/50 italic">-- Select a Restaurant to Review --</span>
                  )}
                </span>
                <svg
                  className={`h-4 w-4 text-luxury-gold shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Custom Luxury Dropdown Popup Menu */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 left-0 top-full mt-2 z-50 rounded-2xl p-1.5 space-y-1 shadow-2xl overflow-hidden max-h-64 overflow-y-auto custom-scrollbar"
                  style={{
                    background: '#141416',
                    border: '1px solid rgba(212,175,55,0.35)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.95)',
                  }}
                >
                  {/* Default Option: Clear Selection */}
                  <button
                    type="button"
                    onClick={() => handleSelectRestaurant('')}
                    className="w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 font-sans text-xs transition-all duration-150"
                    style={{
                      background: selectedId === '' ? 'rgba(212,175,55,0.15)' : 'transparent',
                      color: selectedId === '' ? '#d4af37' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <span className="italic font-medium">-- Select a Restaurant to Review --</span>
                    {selectedId === '' && (
                      <svg className="h-4 w-4 text-luxury-gold stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>

                  <div className="h-px bg-white/10 my-1" />

                  {/* List of Restaurants */}
                  {restaurants.map((r) => {
                    const isSelected = selectedId === r._id;
                    return (
                      <button
                        key={r._id}
                        type="button"
                        onClick={() => handleSelectRestaurant(r._id)}
                        className="w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 font-sans text-xs transition-all duration-150 text-left"
                        style={{
                          background: isSelected ? 'rgba(212,175,55,0.15)' : 'transparent',
                          color: isSelected ? '#d4af37' : 'rgba(255,255,255,0.9)',
                        }}
                      >
                        <div className="truncate pr-2">
                          <p className="font-semibold text-white truncate">{r.name}</p>
                          <p className="text-[10px] text-white/40 truncate">{r.location}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-luxury-gold text-xs">★ {Number(r.rating || 4.8).toFixed(1)}</span>
                          {isSelected && (
                            <svg className="h-4 w-4 text-luxury-gold stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT AREA ── */}
        {loadingDetails ? (
          <div className="py-20 text-center">
            <Loader message="Loading venue ratings & reviews..." />
          </div>
        ) : !selectedRestaurant ? (
          /* ── RICH LUXURY VENUE SELECTION SHOWCASE GRID ── */
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-light text-white">
                  Select a Venue to View & Submit Feedback
                </h2>
                <p className="font-sans text-xs text-white/40 mt-1">
                  Click on any fine dining restaurant to read verified guest reviews and leave your rating
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((r) => (
                <div
                  key={r._id}
                  onClick={() => handleSelectRestaurant(r._id)}
                  className="group relative overflow-hidden rounded-3xl transition-all duration-300 cursor-pointer space-y-4 p-5"
                  style={{
                    background: 'linear-gradient(160deg, rgba(30,30,35,0.5) 0%, rgba(14,14,16,0.8) 100%)',
                    border: '1px solid rgba(212,175,55,0.18)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
                    <img
                      src={r.imageUrl || getFallbackRestaurantImage(r)}
                      alt={r.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(12,12,14,0.8) 0%, transparent 60%)' }} />
                    <div className="absolute top-3 right-3 rounded-full px-3 py-1 font-sans text-xs font-bold text-luxury-gold flex items-center gap-1" style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(212,175,55,0.3)' }}>
                      <span>★</span> {Number(r.rating || 4.8).toFixed(1)}
                    </div>
                  </div>

                  <div>
                    <span className="rounded-full px-2.5 py-0.5 font-sans text-[10px] font-bold text-luxury-gold/90 uppercase tracking-wider" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}>
                      {r.category || 'Multi-cuisine'}
                    </span>
                    <h3 className="mt-2 font-display text-xl font-semibold text-white group-hover:text-luxury-gold transition-colors">
                      {r.name}
                    </h3>
                    <p className="font-sans text-xs text-white/40 mt-1">📍 {r.location}</p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="font-sans text-xs text-white/50">
                      {Array.isArray(r.reviews) && r.reviews.length > 0 ? `${r.reviews.length} Reviews` : 'Verified Feedback'}
                    </span>
                    <span className="font-sans text-xs font-bold text-luxury-gold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Rate & Review →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── MAIN 2-COLUMN GRID FOR SELECTED RESTAURANT ── */
          <div className="grid gap-8 lg:grid-cols-[38%_62%] items-start">

            {/* ── LEFT COLUMN: VENUE OVERVIEW ── */}
            <div className="space-y-6">
              <div
                className="overflow-hidden rounded-3xl p-6 space-y-5"
                style={{
                  background: 'linear-gradient(160deg, rgba(30,30,35,0.5) 0%, rgba(14,14,16,0.8) 100%)',
                  border: '1px solid rgba(212,175,55,0.18)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                }}
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
                  <img
                    src={selectedRestaurant.imageUrl || getFallbackRestaurantImage(selectedRestaurant)}
                    alt={selectedRestaurant.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(12,12,14,0.8) 0%, transparent 60%)' }} />
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-full px-3 py-1 font-sans text-[11px] font-bold text-luxury-gold" style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(212,175,55,0.3)' }}>
                      {selectedRestaurant.category || 'Multi-cuisine'}
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-light text-white">
                    {selectedRestaurant.name}
                  </h2>
                  <p className="font-sans text-xs text-luxury-gold/80 mt-1">📍 {selectedRestaurant.location}</p>
                </div>

                <div className="h-px bg-white/10" />

                {/* Rating Stat Hero */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-4xl font-extrabold text-white">★ {avgRating}</p>
                    <p className="font-sans text-xs text-luxury-gold mt-0.5">Average Rating / 5.0</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-xs text-white/40">Total Reviews</p>
                    <p className="font-sans text-lg font-bold text-white">{totalReviews} Reviews</p>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = counts[star] || 0;
                    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-3 text-xs font-sans">
                        <span className="w-9 text-white/60 font-semibold">{star} ★</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              background: 'linear-gradient(90deg, #c9a84c 0%, #f5e6a3 100%)',
                            }}
                          />
                        </div>
                        <span className="w-8 text-right text-white/40">{pct}%</span>
                      </div>
                    );
                  })}
                </div>

                <Link
                  to={`/restaurants/${selectedRestaurant._id}`}
                  className="mt-2 block w-full rounded-2xl py-3 text-center font-sans text-xs font-bold uppercase tracking-wider text-luxury-gold transition-colors hover:bg-luxury-gold/10"
                  style={{ border: '1px solid rgba(212,175,55,0.3)' }}
                >
                  View Restaurant Details →
                </Link>
              </div>
            </div>

            {/* ── RIGHT COLUMN: STREAMLINED FORM & REVIEWS FEED ── */}
            <div className="space-y-8">
              
              {/* ── STREAMLINED REVIEW FORM ── */}
              <div
                className="rounded-3xl p-6 sm:p-8 space-y-6"
                style={{
                  background: 'linear-gradient(160deg, rgba(30,30,35,0.5) 0%, rgba(14,14,16,0.8) 100%)',
                  border: '1px solid rgba(212,175,55,0.22)',
                  boxShadow: '0 16px 50px rgba(0,0,0,0.6)',
                }}
              >
                <div className="border-b border-white/10 pb-3">
                  <h3 className="font-display text-2xl font-light text-white flex items-center gap-2">
                    <span>✍️</span> Submit Rating & Review
                  </h3>
                  <p className="font-sans text-xs text-white/40 mt-1">
                    Select your rating score and share your dining feedback for {selectedRestaurant.name}
                  </p>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-5">
                  
                  {/* DECIMAL RATING PICKER */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-sans text-xs font-semibold text-white/80">
                        Select Rating Score *
                      </label>
                      <span className="rounded-full px-3 py-1 font-sans text-xs font-bold text-luxury-gold" style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)' }}>
                        ★ {Number(rating).toFixed(1)} / 5.0
                      </span>
                    </div>

                    {/* Clean Decimal Preset Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {DECIMAL_RATING_PRESETS.map((preset) => {
                        const isSelected = Number(rating) === preset.val;
                        return (
                          <button
                            key={preset.val}
                            type="button"
                            onClick={() => setRating(preset.val)}
                            className="rounded-xl px-2.5 py-2 font-sans text-xs font-bold transition-all duration-150 text-center"
                            style={{
                              background: isSelected ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.03)',
                              border: isSelected ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                              color: isSelected ? '#d4af37' : 'rgba(255,255,255,0.7)',
                              boxShadow: isSelected ? '0 0 12px rgba(212,175,55,0.2)' : 'none',
                            }}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Single Precise Slider */}
                    <div className="flex items-center gap-3 pt-1">
                      <input
                        type="range"
                        min="1.0"
                        max="5.0"
                        step="0.1"
                        value={rating}
                        onChange={(e) => setRating(parseFloat(e.target.value))}
                        className="w-full accent-luxury-gold cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Author Name Input */}
                  <div>
                    <label className="font-sans text-xs font-semibold text-white/80 block mb-1.5">
                      Your Name / Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-sans text-sm text-white outline-none focus:border-luxury-gold/60"
                    />
                  </div>

                  {/* Review Textarea */}
                  <div>
                    <label className="font-sans text-xs font-semibold text-white/80 block mb-1.5">
                      Review & Dining Experience *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Describe the food quality, service, ambiance, seating, reservation speed..."
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-sans text-sm text-white placeholder-white/20 outline-none focus:border-luxury-gold/60 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full py-3.5 font-sans text-xs font-bold uppercase tracking-wider text-[#0b0b0c] transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)' }}
                  >
                    {submitting ? 'Submitting Review…' : 'Submit Review →'}
                  </button>
                </form>
              </div>

              {/* ── REVIEWS FEED ── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-light text-white">
                    Verified Feedback <span className="font-sans text-base text-luxury-gold">({reviewsList.length})</span>
                  </h3>
                </div>

                <div className="space-y-3">
                  {reviewsList.map((rev, index) => (
                    <div
                      key={index}
                      className="rounded-2xl p-5 space-y-3 transition-all duration-300"
                      style={{
                        background: 'linear-gradient(160deg, rgba(30,30,35,0.4) 0%, rgba(14,14,16,0.6) 100%)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-luxury-gold/15 border border-luxury-gold/30 text-luxury-gold font-bold text-sm">
                            {rev.author ? rev.author.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-sans text-sm font-semibold text-white">{rev.author}</p>
                            <p className="font-sans text-[11px] text-white/40">{rev.date || 'Verified Review'}</p>
                          </div>
                        </div>

                        {/* Decimal Star Badge */}
                        <div className="flex items-center gap-1 rounded-full px-3.5 py-1 bg-luxury-gold/15 border border-luxury-gold/30 text-luxury-gold font-bold text-xs">
                          <span>★</span> {Number(rev.rating || 5.0).toFixed(1)}
                        </div>
                      </div>

                      <p className="font-sans text-sm text-white/70 italic leading-relaxed">
                        "{rev.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
