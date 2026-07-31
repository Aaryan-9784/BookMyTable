import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { restaurantApi } from '../services/restaurantApi.js';
import Loader from '../../components/Loader.jsx';

export default function RestaurantSettings() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [tokenFee, setTokenFee] = useState(150);
  const [openingHours, setOpeningHours] = useState('11:00 AM - 11:00 PM');
  const [priceRange, setPriceRange] = useState(2);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await restaurantApi.getSettings();
        if (!cancelled) {
          const r = res.data.restaurant || {};
          setRestaurant(r);
          setName(r.name || '');
          setLocation(r.location || '');
          setCategory(r.category || 'Multi-cuisine');
          setDescription(r.description || '');
          setTokenFee(r.tokenFee || 150);
          setOpeningHours(r.openingHours || '11:00 AM - 11:00 PM');
          setPriceRange(r.priceRange || 2);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load restaurant settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await restaurantApi.updateSettings({
        name,
        location,
        category,
        description,
        tokenFee,
        openingHours,
        priceRange,
      });
      toast.success('Restaurant settings updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading Settings…" />;

  return (
    <div className="max-w-[800px] mx-auto">
      {/* Header */}
      <div className="mb-10">
        <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-[#d4af37] font-bold mb-1">
          Restaurant Configuration
        </p>
        <h1 className="font-display text-white text-3xl">Restaurant Profile & Settings</h1>
        <p className="mt-1 text-sm text-[#aaa]">
          Update operating hours, token fee pricing per seat, restaurant branding, and category.
        </p>
        <div
          className="mt-4 h-px w-24"
          style={{ background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.15), transparent)' }}
        />
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-[#121218] p-8 space-y-6 shadow-xl">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#aaa] mb-2 font-semibold">
              Restaurant Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white focus:border-[#d4af37] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#aaa] mb-2 font-semibold">
              Location / City
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white focus:border-[#d4af37] focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#aaa] mb-2 font-semibold">
              Cuisine Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Italian Fine Dining, Indian Gourmet"
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#aaa] mb-2 font-semibold">
              Token Fee Per Seat (₹)
            </label>
            <input
              type="number"
              min="0"
              value={tokenFee}
              onChange={(e) => setTokenFee(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white focus:border-[#d4af37] focus:outline-none font-bold text-[#f5e27a]"
              required
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#aaa] mb-2 font-semibold">
              Opening Hours
            </label>
            <input
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              placeholder="e.g. 11:00 AM - 11:00 PM"
              className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#aaa] mb-2 font-semibold">
              Price Range Level (1 = ₹, 4 = ₹₹₹₹)
            </label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full rounded-xl border border-white/15 bg-[#121218] px-4 py-3 text-sm text-white focus:border-[#d4af37] focus:outline-none"
            >
              <option value={1}>₹ — Casual / Moderate</option>
              <option value={2}>₹₹ — Fine Dining</option>
              <option value={3}>₹₹₹ — Luxury Dining</option>
              <option value={4}>₹₹₹₹ — Ultra Luxury</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[#aaa] mb-2 font-semibold">
            Restaurant Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell guests about your dining atmosphere, specialties, and service..."
            className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white focus:border-[#d4af37] focus:outline-none"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-[#c9a84c] via-[#f0d060] to-[#c9a84c] px-8 py-3 font-sans text-xs font-bold uppercase tracking-wider text-black shadow-lg hover:shadow-[0_0_24px_rgba(212,175,55,0.4)] transition-all"
          >
            {saving ? 'Saving Changes…' : 'Save Restaurant Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
