import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { restaurantApi } from '../services/restaurantApi.js';
import Loader from '../../components/Loader.jsx';

export default function RestaurantBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await restaurantApi.getBookings();
      setBookings(res.data.bookings || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await restaurantApi.updateBookingStatus(id, status);
      toast.success(`Booking status updated to ${status.toUpperCase()}`);
      fetchBookings();
    } catch (err) {
      toast.error(err.message || 'Failed to update booking status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loader label="Loading Reservations…" />;

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'confirmed') return b.status === 'confirmed';
    if (filter === 'cancelled') return b.status === 'cancelled';
    if (filter === 'completed') return b.status === 'completed';
    return true;
  });

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-[#d4af37] font-bold mb-1">
            Reservations Control
          </p>
          <h1 className="font-display text-white text-3xl">Manage Table Bookings</h1>
          <p className="mt-1 text-sm text-[#aaa]">
            Approve, manage, and track table reservations for your restaurant guests.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5">
          {['all', 'confirmed', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                filter === tab
                  ? 'bg-[#d4af37] text-black shadow-md'
                  : 'text-[#aaa] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#121218] p-12 text-center">
          <p className="text-base text-[#aaa]">No reservations found matching "{filter}".</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border border-white/10 bg-[#121218]">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="border-b border-white/10 bg-black/40 text-[11px] uppercase tracking-wider text-[#888]">
                <tr>
                  <th className="px-6 py-4">Guest Info</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Guests</th>
                  <th className="px-6 py-4">Token Fee</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#ddd]">
                {filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-medium text-white">
                      <div>{b.userId?.name || 'Guest User'}</div>
                      <div className="text-xs text-[#777]">{b.userId?.email || b.userId?.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{b.date}</div>
                      <div className="text-xs text-[#d4af37]">{b.time}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {b.guests} Person(s)
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#f5e27a]">
                      ₹{(b.guests || 1) * (b.tokenFee || 150)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 text-[11px] rounded-full font-bold uppercase tracking-wider ${
                          b.status === 'confirmed'
                            ? 'bg-[rgba(76,175,80,0.15)] text-[#4caf50] border border-[rgba(76,175,80,0.3)]'
                            : b.status === 'completed'
                            ? 'bg-[rgba(33,150,243,0.15)] text-[#2196f3] border border-[rgba(33,150,243,0.3)]'
                            : 'bg-[rgba(229,115,115,0.15)] text-[#e57373] border border-[rgba(229,115,115,0.3)]'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {b.status !== 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(b._id, 'confirmed')}
                            disabled={updatingId === b._id}
                            className="rounded-lg border border-[rgba(76,175,80,0.3)] bg-[rgba(76,175,80,0.1)] px-3 py-1.5 text-xs text-[#4caf50] hover:bg-[#4caf50] hover:text-black transition-all"
                          >
                            Approve
                          </button>
                        )}
                        {b.status !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(b._id, 'completed')}
                            disabled={updatingId === b._id}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#2196f3] hover:bg-[#2196f3] hover:text-white transition-all"
                          >
                            Completed
                          </button>
                        )}
                        {b.status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusChange(b._id, 'cancelled')}
                            disabled={updatingId === b._id}
                            className="rounded-lg border border-[rgba(229,115,115,0.3)] bg-[rgba(229,115,115,0.1)] px-3 py-1.5 text-xs text-[#e57373] hover:bg-[#e57373] hover:text-white transition-all"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
