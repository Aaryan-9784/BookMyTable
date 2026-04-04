import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../services/adminApi.js';
import DataTable from '../components/DataTable.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Loader from '../../components/Loader.jsx';
import { formatISODate } from '../../utils/formatDate.js';

export default function BookingsAdmin() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const { data: body } = await adminApi.listBookings({ page, limit: 20 });
      setData(body);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteBooking(deleteId);
      toast.success('Booking removed');
      setDeleteId(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !data.items.length) return <Loader label="Loading bookings…" />;

  const rows = (data.items || []).map((b) => ({
    key: b._id,
    when: `${formatISODate(b.date)} · ${b.time}`,
    user: b.userId?.email || '—',
    restaurant: b.restaurantId?.name || '—',
    guests: b.guests,
    status: b.status,
    id: b._id,
  }));

  return (
    <div>
      <h1 className="font-display text-3xl text-white">Bookings</h1>

      <div className="mt-8">
        <DataTable
          columns={[
            { key: 'when', label: 'When' },
            { key: 'user', label: 'User' },
            { key: 'restaurant', label: 'Restaurant' },
            { key: 'guests', label: 'Guests' },
            { key: 'status', label: 'Status' },
            {
              key: 'actions',
              label: '',
              render: (row) => (
                <button type="button" className="text-red-400 hover:underline" onClick={() => setDeleteId(row.id)}>
                  Delete
                </button>
              ),
            },
          ]}
          rows={rows}
          emptyMessage="No bookings"
        />
      </div>

      {data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2 font-sans text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded border border-luxury-border px-3 py-1 text-luxury-muted disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-luxury-muted">
            Page {page} / {data.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border border-luxury-border px-3 py-1 text-luxury-muted disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete booking?"
        message="This permanently removes the reservation."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
