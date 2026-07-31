import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { restaurantApi } from '../services/restaurantApi.js';
import Loader from '../../components/Loader.jsx';
import ConfirmModal from '../../admin/components/ConfirmModal.jsx';

export default function TablesManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form states
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [zone, setZone] = useState('Main Hall');
  const [status, setStatus] = useState('Available');
  const [tokenFee, setTokenFee] = useState(150);
  const [saving, setSaving] = useState(false);

  const fetchTables = async () => {
    try {
      const res = await restaurantApi.getTables();
      setTables(res.data.tables || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleOpenAdd = () => {
    setEditItem(null);
    setTableNumber(`T-${String(tables.length + 1).padStart(2, '0')}`);
    setCapacity(4);
    setZone('Main Hall');
    setStatus('Available');
    setTokenFee(150);
    setShowModal(true);
  };

  const handleOpenEdit = (t) => {
    setEditItem(t);
    setTableNumber(t.tableNumber);
    setCapacity(t.capacity);
    setZone(t.zone);
    setStatus(t.status);
    setTokenFee(t.tokenFee || 150);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tableNumber.trim() || !capacity) {
      toast.error('Please specify table number and capacity.');
      return;
    }

    setSaving(true);
    try {
      if (editItem) {
        await restaurantApi.updateTable(editItem._id, { tableNumber, capacity, zone, status, tokenFee });
        toast.success(`Table "${tableNumber}" updated!`);
      } else {
        await restaurantApi.createTable({ tableNumber, capacity, zone, status, tokenFee });
        toast.success(`Table "${tableNumber}" added successfully!`);
      }
      setShowModal(false);
      fetchTables();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to save table');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await restaurantApi.deleteTable(deleteId);
      toast.success('Table deleted successfully');
      setDeleteId(null);
      fetchTables();
    } catch (err) {
      toast.error(err.message || 'Failed to delete table');
    }
  };

  if (loading) return <Loader label="Loading Tables & Capacity…" />;

  const totalCapacity = tables.reduce((acc, t) => acc + (t.capacity || 0), 0);

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-[#d4af37] font-bold mb-1">
            Seating Infrastructure
          </p>
          <h1 className="font-display text-white text-3xl">Tables & Capacity Management</h1>
          <p className="mt-1 text-sm text-[#aaa]">
            Configure seating layouts, capacity numbers, zones, and availability for your restaurant.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="rounded-full bg-gradient-to-r from-[#c9a84c] via-[#f0d060] to-[#c9a84c] px-6 py-3 font-sans text-xs font-bold uppercase tracking-wider text-black shadow-lg hover:shadow-[0_0_24px_rgba(212,175,55,0.4)] transition-all"
        >
          + Add New Table
        </button>
      </div>

      {/* Overview Stats Bar */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#121218] p-5 text-center">
          <p className="text-xs text-[#888] uppercase tracking-wider">Total Tables</p>
          <p className="text-2xl font-bold font-display text-white mt-1">{tables.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#121218] p-5 text-center">
          <p className="text-xs text-[#888] uppercase tracking-wider">Total Seating Capacity</p>
          <p className="text-2xl font-bold font-display text-[#f5e27a] mt-1">{totalCapacity} Seats</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#121218] p-5 text-center">
          <p className="text-xs text-[#888] uppercase tracking-wider">Avg Seats / Table</p>
          <p className="text-2xl font-bold font-display text-[#4caf50] mt-1">
            {tables.length ? (totalCapacity / tables.length).toFixed(1) : 0} Seats
          </p>
        </div>
      </div>

      {/* Table Cards Grid */}
      {tables.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#121218] p-12 text-center">
          <p className="text-base text-[#aaa] mb-4">No tables created yet for this restaurant.</p>
          <button
            onClick={handleOpenAdd}
            className="rounded-full bg-[#d4af37] px-6 py-2.5 text-xs font-bold text-black uppercase"
          >
            Create First Table
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((t) => (
            <div
              key={t._id}
              className="rounded-2xl border border-white/10 bg-[#121218] p-6 hover:border-[rgba(212,175,55,0.4)] transition-all group relative"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-xl font-bold text-white group-hover:text-[#f5e27a] transition-colors">
                  {t.tableNumber}
                </span>
                <span
                  className={`px-3 py-1 text-[11px] rounded-full font-bold uppercase tracking-wider ${
                    t.status === 'Available'
                      ? 'bg-[rgba(76,175,80,0.15)] text-[#4caf50] border border-[rgba(76,175,80,0.3)]'
                      : t.status === 'Reserved'
                      ? 'bg-[rgba(212,175,55,0.15)] text-[#f5e27a] border border-[rgba(212,175,55,0.3)]'
                      : 'bg-white/10 text-[#888] border border-white/20'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-[#ccc] mb-6">
                <p className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#888]">Capacity:</span>
                  <strong className="text-white font-semibold">{t.capacity} Guests</strong>
                </p>
                <p className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#888]">Dining Zone:</span>
                  <span className="text-[#d4af37]">{t.zone}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-[#888]">Token Fee:</span>
                  <span className="text-[#f5e27a]">₹{t.tokenFee || 150} / seat</span>
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-semibold text-[#ddd] hover:border-[#d4af37] hover:text-[#d4af37] transition-all"
                >
                  Edit Table
                </button>
                <button
                  onClick={() => setDeleteId(t._id)}
                  className="rounded-xl border border-[rgba(229,115,115,0.3)] bg-[rgba(229,115,115,0.1)] px-3.5 py-2 text-xs font-semibold text-[#e57373] hover:bg-[#e57373] hover:text-white transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[rgba(212,175,55,0.35)] bg-[#121218] p-6 shadow-2xl">
            <h3 className="font-display text-xl text-white mb-4">
              {editItem ? `Edit Table ${editItem.tableNumber}` : 'Add New Table'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#aaa] mb-1">
                  Table Number / ID
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. T-01, VIP-01"
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#aaa] mb-1">
                  Seating Capacity (Guests)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#aaa] mb-1">
                  Dining Zone
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#121218] px-4 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="Main Hall">Main Hall</option>
                  <option value="Outdoor Terrace">Outdoor Terrace</option>
                  <option value="VIP Private Dining">VIP Private Dining</option>
                  <option value="Rooftop">Rooftop</option>
                  <option value="Bar Counter">Bar Counter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#aaa] mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#121218] px-4 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#aaa] mb-1">
                  Token Fee Per Seat (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={tokenFee}
                  onChange={(e) => setTokenFee(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-white/15 px-5 py-2.5 text-xs text-[#aaa] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#d4af37] px-6 py-2.5 text-xs font-bold text-black uppercase hover:bg-[#f5e27a]"
                >
                  {saving ? 'Saving…' : editItem ? 'Update Table' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deleteId && (
        <ConfirmModal
          title="Delete Table"
          message="Are you sure you want to remove this table from seating capacity?"
          confirmText="Delete Table"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
