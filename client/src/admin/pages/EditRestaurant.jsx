import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import { adminApi } from '../services/adminApi.js';
import Loader from '../../components/Loader.jsx';

const CATEGORIES = ['Multi-cuisine', 'Indian', 'Italian', 'Chinese', 'Japanese', 'Continental', 'Cafe', 'Fine dining'];

export default function EditRestaurant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initial, setInitial] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/api/restaurants/${id}`);
        if (!cancelled) {
          setInitial(data);
          const urls = Array.isArray(data.imageUrls) && data.imageUrls.length ? data.imageUrls : data.imageUrl ? [data.imageUrl] : [];
          setImageUrls(urls);
        }
      } catch (e) {
        toast.error(e.message);
        if (!cancelled) setInitial(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

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
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await adminApi.updateRestaurant(id, {
        name: fd.get('name')?.trim(),
        location: fd.get('location')?.trim(),
        description: (fd.get('description') || '').trim(),
        category: fd.get('category'),
        priceRange: Number(fd.get('priceRange')),
        rating: Number(fd.get('rating')),
        imageUrl: imageUrls[0] || '',
        imageUrls,
      });
      toast.success('Restaurant updated');
      navigate('/admin/restaurants');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading restaurant…" />;
  if (!initial) {
    return (
      <div className="font-sans text-luxury-muted">
        Not found.{' '}
        <Link to="/admin/restaurants" className="text-luxury-gold underline">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/admin/restaurants" className="font-sans text-sm text-luxury-gold hover:underline">
        ← Back to list
      </Link>
      <h1 className="mt-4 font-display text-3xl text-white">Edit {initial.name}</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-xl border border-luxury-border bg-luxury-surface/50 p-6 font-sans">
        <div>
          <label className="mb-1 block text-sm text-luxury-muted">Name</label>
          <input name="name" required defaultValue={initial.name} className="w-full rounded border border-luxury-border bg-luxury-bg px-3 py-2 text-white focus:border-luxury-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-luxury-muted">Location</label>
          <input name="location" required defaultValue={initial.location} className="w-full rounded border border-luxury-border bg-luxury-bg px-3 py-2 text-white focus:border-luxury-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-luxury-muted">Description</label>
          <textarea name="description" rows={4} defaultValue={initial.description || ''} className="w-full rounded border border-luxury-border bg-luxury-bg px-3 py-2 text-white focus:border-luxury-gold focus:outline-none" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-luxury-muted">Category</label>
            <select name="category" defaultValue={initial.category || 'Multi-cuisine'} className="w-full rounded border border-luxury-border bg-luxury-bg px-3 py-2 text-white focus:border-luxury-gold focus:outline-none">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-luxury-muted">Price (1–4)</label>
            <select name="priceRange" defaultValue={initial.priceRange ?? 2} className="w-full rounded border border-luxury-border bg-luxury-bg px-3 py-2 text-white focus:border-luxury-gold focus:outline-none">
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {'₹'.repeat(n)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-luxury-muted">Rating</label>
          <input name="rating" type="number" step="0.1" min={0} max={5} defaultValue={initial.rating ?? 4.2} className="w-full rounded border border-luxury-border bg-luxury-bg px-3 py-2 text-white focus:border-luxury-gold focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-luxury-muted">Add images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(e) => uploadFiles(e.target.files)}
            className="text-sm text-luxury-muted file:mr-3 file:rounded file:border-0 file:bg-luxury-gold file:px-3 file:py-1.5 file:font-sans file:text-sm file:text-luxury-bg"
          />
          {uploading && <p className="mt-2 text-xs text-luxury-muted">Uploading…</p>}
          {imageUrls.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {imageUrls.map((url) => (
                <li key={url} className="relative h-20 w-28 overflow-hidden rounded border border-luxury-border">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded bg-black/70 px-1.5 text-xs text-white hover:bg-red-900"
                    onClick={() => setImageUrls((prev) => prev.filter((u) => u !== url))}
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" disabled={saving || uploading} className="w-full rounded bg-luxury-gold py-3 font-medium text-luxury-bg hover:bg-luxury-golddim disabled:opacity-50">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
