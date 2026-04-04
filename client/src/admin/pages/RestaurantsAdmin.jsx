import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../services/adminApi.js';
import DataTable from '../components/DataTable.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Loader from '../../components/Loader.jsx';
import SearchInput from '../../components/SearchInput.jsx';

export default function RestaurantsAdmin() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const { data } = await adminApi.listRestaurants({ q: q.trim() || undefined });
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [q]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteRestaurant(deleteId);
      toast.success('Restaurant removed');
      setDeleteId(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !list.length) return <Loader label="Loading restaurants…" />;

  const rows = list.map((r) => ({
    key: r._id,
    name: r.name,
    location: r.location,
    category: r.category || '—',
    actions: r._id,
  }));

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">Restaurants</h1>
        </div>
        <Link
          to="/admin/restaurants/new"
          className="inline-flex rounded bg-luxury-gold px-5 py-2.5 font-sans text-sm font-medium text-luxury-bg hover:bg-luxury-golddim"
        >
          Add restaurant
        </Link>
      </div>

      <div className="mt-6 max-w-md">
        <SearchInput
          id="admin-restaurants-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, location, category…"
        />
      </div>

      <div className="mt-6">
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'location', label: 'Location' },
            { key: 'category', label: 'Category' },
            {
              key: 'actions',
              label: '',
              render: (row) => (
                <div className="flex gap-2">
                  <Link
                    to={`/admin/restaurants/${row.actions}/edit`}
                    className="text-luxury-gold hover:underline"
                  >
                    Edit
                  </Link>
                  <button type="button" className="text-red-400 hover:underline" onClick={() => setDeleteId(row.actions)}>
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          rows={rows}
          emptyMessage="No restaurants found"
        />
      </div>

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete restaurant?"
        message="This removes the restaurant and associated bookings."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
