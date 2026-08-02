import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext.jsx';
import RestaurantCard from '../components/RestaurantCard.jsx';
import SearchInput from '../components/SearchInput.jsx';
import Loader from '../components/Loader.jsx';

export default function Wishlist() {
  const { wishlist, loading, wishlistCount } = useWishlist();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = wishlist.filter((r) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase().trim();
    return (
      r.name?.toLowerCase().includes(term) ||
      r.location?.toLowerCase().includes(term) ||
      r.category?.toLowerCase().includes(term)
    );
  });

  return (
    <div
      className="min-h-screen pb-16 pt-8"
      style={{ background: 'linear-gradient(180deg, #0b0b0c 0%, #121212 50%, #1a1a1a 100%)' }}
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
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

        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 font-sans text-[0.65rem] font-bold uppercase tracking-[0.28em] text-luxury-gold/80">
                SAVED VENUES
              </p>
              <h1 className="font-display text-4xl font-light text-white md:text-5xl">
                My Wishlist <span className="font-sans text-xl text-luxury-gold/80">({wishlistCount})</span>
              </h1>
              <div className="mt-3 h-px w-20" style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
              <p className="mt-3 font-sans text-sm text-white/40">
                Quickly access and book tables at your favorite fine dining destinations
              </p>
            </div>

            {wishlist.length > 0 && (
              <div className="w-full sm:w-72">
                <SearchInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter saved venues..."
                  showClear
                />
              </div>
            )}
          </div>
        </header>

        {loading ? (
          <div className="py-20 text-center">
            <Loader message="Loading your saved venues..." />
          </div>
        ) : wishlist.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-3xl p-12 text-center"
            style={{
              background: 'linear-gradient(160deg, rgba(30,30,35,0.5) 0%, rgba(14,14,16,0.8) 100%)',
              border: '1px solid rgba(212,175,55,0.18)',
            }}
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-luxury-gold/10 text-3xl text-luxury-gold">
              ❤️
            </div>
            <h2 className="font-display text-2xl text-white">Your Wishlist is Empty</h2>
            <p className="mt-2 max-w-md font-sans text-sm text-white/50">
              Explore our curated selection of luxury restaurants and tap the heart icon on any venue to save it here.
            </p>
            <button
              type="button"
              onClick={() => navigate('/restaurants')}
              className="mt-6 rounded-full px-6 py-3 font-sans text-xs font-bold uppercase tracking-wider text-[#0b0b0c] transition-all hover:brightness-110 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)' }}
            >
              Explore Restaurants →
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-white/50">
            No saved restaurants match "<span className="text-white">{search}</span>".
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
