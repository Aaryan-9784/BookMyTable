import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../services/adminApi.js';

const CATEGORIES = ['Multi-cuisine', 'Indian', 'Italian', 'Chinese', 'Japanese', 'Continental', 'Cafe', 'Fine dining'];

export default function AddRestaurant() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);

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
      toast.success(`${urls.length} image(s) uploaded to S3`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name')?.trim();
    const location = fd.get('location')?.trim();
    if (!name || !location) {
      toast.error('Name and location are required');
      return;
    }
    setSaving(true);
    try {
      const body = {
        name,
        location,
        description: (fd.get('description') || '').trim(),
        category: fd.get('category') || 'Multi-cuisine',
        priceRange: Number(fd.get('priceRange') || 2),
        rating: Number(fd.get('rating') || 4.2),
        imageUrl: imageUrls[0] || '',
        imageUrls,
      };
      await adminApi.createRestaurant(body);
      toast.success('Restaurant created');
      navigate('/admin/restaurants');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <Link to="/admin/restaurants" className="font-sans text-sm text-luxury-gold hover:underline">
          ← Back to list
        </Link>
        <h1 className="mt-4 font-display text-3xl text-white">Add restaurant</h1>
        <p className="mt-1 font-sans text-sm text-luxury-muted">Upload images to S3, then save the listing.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-luxury-border bg-luxury-surface/50 p-6 font-sans">
        <div>
          <label className="mb-1 block text-sm text-luxury-muted">Name</label>
          <input name="name" required className="w-full rounded border border-luxury-border bg-luxury-bg px-3 py-2 text-white focus:border-luxury-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-luxury-muted">Location</label>
          <input name="location" required className="w-full rounded border border-luxury-border bg-luxury-bg px-3 py-2 text-white focus:border-luxury-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-luxury-muted">Description</label>
          <textarea name="description" rows={4} className="w-full rounded border border-luxury-border bg-luxury-bg px-3 py-2 text-white focus:border-luxury-gold focus:outline-none" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-luxury-muted">Category</label>
            <select name="category" className="w-full rounded border border-luxury-border bg-luxury-bg px-3 py-2 text-white focus:border-luxury-gold focus:outline-none">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-luxury-muted">Price (1–4)</label>
            <select name="priceRange" className="w-full rounded border border-luxury-border bg-luxury-bg px-3 py-2 text-white focus:border-luxury-gold focus:outline-none">
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {'₹'.repeat(n)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-luxury-muted">Rating (0–5)</label>
          <input name="rating" type="number" step="0.1" min={0} max={5} defaultValue={4.2} className="w-full rounded border border-luxury-border bg-luxury-bg px-3 py-2 text-white focus:border-luxury-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-luxury-muted">Images (S3)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(e) => uploadFiles(e.target.files)}
            className="text-sm text-luxury-muted file:mr-3 file:rounded file:border-0 file:bg-luxury-gold file:px-3 file:py-1.5 file:font-sans file:text-sm file:text-luxury-bg"
          />
          {uploading && <p className="mt-2 text-xs text-luxury-muted">Uploading to S3…</p>}
          {imageUrls.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {imageUrls.map((url) => (
                <li key={url} className="relative h-20 w-28 overflow-hidden rounded border border-luxury-border">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full rounded bg-luxury-gold py-3 font-medium text-luxury-bg hover:bg-luxury-golddim disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Create restaurant'}
        </button>
      </form>
    </div>
  );
}
