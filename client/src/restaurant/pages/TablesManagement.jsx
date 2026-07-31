import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { restaurantApi } from '../services/restaurantApi.js';
import Loader from '../../components/Loader.jsx';
import ConfirmModal from '../../admin/components/ConfirmModal.jsx';

export default function TablesManagement() {
  const [tables, setTables] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Table Modal States
  const [showTableModal, setShowTableModal] = useState(false);
  const [editTableItem, setEditTableItem] = useState(null);
  const [deleteTableId, setDeleteTableId] = useState(null);

  // Table Form inputs
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [zone, setZone] = useState('Main Hall');
  const [status, setStatus] = useState('Available');
  const [tokenFee, setTokenFee] = useState(150);
  const [savingTable, setSavingTable] = useState(false);

  // Bulk Tables Generator Modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCount, setBulkCount] = useState(4);
  const [bulkCapacity, setBulkCapacity] = useState(4);
  const [bulkZone, setBulkZone] = useState('Main Hall');
  const [bulkTokenFee, setBulkTokenFee] = useState(150);

  // Restaurant Setup Modal State
  const [showRestModal, setShowRestModal] = useState(false);
  const [restForm, setRestForm] = useState({
    name: '',
    location: '',
    category: 'Multi-cuisine',
    description: '',
    tokenFee: 150,
    openingHours: '11:00 AM - 11:00 PM',
  });
  const [savingRest, setSavingRest] = useState(false);

  const fetchData = async () => {
    try {
      const [tRes, sRes] = await Promise.all([
        restaurantApi.getTables(),
        restaurantApi.getStats(),
      ]);
      setTables(tRes.data.tables || []);
      const rData = sRes.data.restaurant || {};
      setRestaurant(rData);
      setRestForm({
        name: rData.name || '',
        location: rData.location || '',
        category: rData.category || 'Multi-cuisine',
        description: rData.description || '',
        tokenFee: rData.tokenFee || 150,
        openingHours: rData.openingHours || '11:00 AM - 11:00 PM',
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load restaurant infrastructure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open Add Table Modal
  const handleOpenAddTable = () => {
    setEditTableItem(null);
    setTableNumber(`T-${String(tables.length + 1).padStart(2, '0')}`);
    setCapacity(4);
    setZone('Main Hall');
    setStatus('Available');
    setTokenFee(restaurant?.tokenFee || 150);
    setShowTableModal(true);
  };

  // Open Edit Table Modal
  const handleOpenEditTable = (t) => {
    setEditTableItem(t);
    setTableNumber(t.tableNumber);
    setCapacity(t.capacity);
    setZone(t.zone);
    setStatus(t.status);
    setTokenFee(t.tokenFee || restaurant?.tokenFee || 150);
    setShowTableModal(true);
  };

  // Handle Table Submit
  const handleTableSubmit = async (e) => {
    e.preventDefault();
    if (!tableNumber.trim() || !capacity) {
      toast.error('Table number and capacity are required.');
      return;
    }
    setSavingTable(true);
    try {
      if (editTableItem) {
        await restaurantApi.updateTable(editTableItem._id, {
          tableNumber,
          capacity: Number(capacity),
          zone,
          status,
          tokenFee: Number(tokenFee),
        });
        toast.success(`Table "${tableNumber}" updated!`);
      } else {
        await restaurantApi.createTable({
          tableNumber,
          capacity: Number(capacity),
          zone,
          status,
          tokenFee: Number(tokenFee),
        });
        toast.success(`Table "${tableNumber}" added successfully!`);
      }
      setShowTableModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to save table');
    } finally {
      setSavingTable(false);
    }
  };

  // Handle Bulk Generator Submit
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setSavingTable(true);
    try {
      const count = Number(bulkCount) || 1;
      const cap = Number(bulkCapacity) || 4;
      const fee = Number(bulkTokenFee) || 150;
      let created = 0;

      for (let i = 1; i <= count; i++) {
        const num = `T-${cap}S-${String(tables.length + i).padStart(2, '0')}`;
        try {
          await restaurantApi.createTable({
            tableNumber: num,
            capacity: cap,
            zone: bulkZone,
            status: 'Available',
            tokenFee: fee,
          });
          created++;
        } catch {
          // ignore duplicate errors during bulk
        }
      }
      toast.success(`Generated ${created} new ${cap}-seater table(s)!`);
      setShowBulkModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to generate bulk tables');
    } finally {
      setSavingTable(false);
    }
  };

  // Handle Restaurant Settings Submit
  const handleRestSubmit = async (e) => {
    e.preventDefault();
    setSavingRest(true);
    try {
      await restaurantApi.updateSettings(restForm);
      toast.success('Restaurant profile updated! Sent for Admin Review if required.');
      setShowRestModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to update restaurant profile');
    } finally {
      setSavingRest(false);
    }
  };

  // Handle Delete Table
  const handleDeleteTable = async () => {
    if (!deleteTableId) return;
    try {
      await restaurantApi.deleteTable(deleteTableId);
      toast.success('Table deleted successfully');
      setDeleteTableId(null);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete table');
    }
  };

  if (loading) return <Loader label="Loading Restaurant & Tables Setup…" />;

  const totalCapacity = tables.reduce((acc, t) => acc + (t.capacity || 0), 0);

  // Group table counts by seating capacity
  const capacityCounts = tables.reduce((acc, t) => {
    const key = `${t.capacity}-Seater`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* ── Page Header & Restaurant Info Card ──────────────── */}
      <div className="mb-8 rounded-2xl p-6 bg-[#161616] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-luxury-gold font-bold">
              Restaurant Setup & Seating Infrastructure
            </span>
            {restaurant?.approvalStatus === 'approved' ? (
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] text-emerald-400 font-semibold">
                ✓ Approved & Operational
              </span>
            ) : (
              <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] text-amber-400 font-semibold animate-pulse">
                ⏳ Pending Admin Approval
              </span>
            )}
          </div>

          <h1 className="font-display text-white text-3xl font-bold">
            {restaurant?.name || 'Add Restaurant Details'}
          </h1>
          <p className="mt-1 text-xs text-luxury-muted">
            📍 {restaurant?.location || 'Set location'} • {restaurant?.category || 'Category'} • Base Token Fee: <strong className="text-luxury-gold">₹{restaurant?.tokenFee || 150}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowRestModal(true)}
            className="rounded-xl border border-luxury-gold/40 bg-luxury-gold/10 px-4 py-2.5 text-xs font-semibold text-luxury-gold hover:bg-luxury-gold/20"
          >
            ✏️ Edit Restaurant Details
          </button>
          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10"
          >
            ⚡ Bulk Add Tables
          </button>
          <button
            type="button"
            onClick={handleOpenAddTable}
            className="rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f5e27a] to-[#d4af37] px-5 py-2.5 text-xs font-bold text-black uppercase hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          >
            + Add Single Table
          </button>
        </div>
      </div>

      {/* ── Capacity & Table-Wise Token Fee Overview ────────── */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#121218] p-5">
          <p className="text-xs text-luxury-muted uppercase tracking-wider">Total Restaurant Tables</p>
          <p className="text-3xl font-bold font-display text-white mt-1">{tables.length}</p>
          <p className="text-[11px] text-luxury-gold mt-1">Configured in seating layout</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121218] p-5">
          <p className="text-xs text-luxury-muted uppercase tracking-wider">Total Seating Capacity</p>
          <p className="text-3xl font-bold font-display text-luxury-gold mt-1">{totalCapacity} Guests</p>
          <p className="text-[11px] text-white/50 mt-1">Across all zones</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121218] p-5">
          <p className="text-xs text-luxury-muted uppercase tracking-wider">Different Capacities Offered</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {Object.keys(capacityCounts).length === 0 ? (
              <span className="text-xs text-luxury-muted">No tables created yet</span>
            ) : (
              Object.entries(capacityCounts).map(([cap, count]) => (
                <span key={cap} className="rounded-md bg-white/10 px-2 py-1 text-[11px] text-white font-semibold">
                  {count}x {cap}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Table Grid Listing ───────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl text-white font-semibold">Table-Wise Capacities & Token Fees</h2>
        <span className="text-xs text-luxury-muted">{tables.length} Table(s) Total</span>
      </div>

      {tables.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#121218] p-12 text-center">
          <p className="text-base text-luxury-muted mb-4">No tables created yet for this restaurant.</p>
          <button
            type="button"
            onClick={handleOpenAddTable}
            className="rounded-full bg-luxury-gold px-6 py-2.5 text-xs font-bold text-black uppercase"
          >
            Create First Table
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((t) => (
            <div
              key={t._id}
              className="rounded-2xl border border-white/10 bg-[#121218] p-6 hover:border-luxury-gold/50 transition-all group relative"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-xl font-bold text-white group-hover:text-luxury-gold transition-colors">
                  {t.tableNumber}
                </span>
                <span
                  className={`px-3 py-1 text-[11px] rounded-full font-bold uppercase tracking-wider ${
                    t.status === 'Available'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : t.status === 'Reserved'
                      ? 'bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30'
                      : 'bg-white/10 text-white/50 border border-white/20'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-white/80 mb-6">
                <p className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-luxury-muted">Seating Capacity:</span>
                  <strong className="text-white font-semibold">{t.capacity} Guests ({t.capacity}-Seater)</strong>
                </p>
                <p className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-luxury-muted">Dining Zone:</span>
                  <span className="text-luxury-gold font-semibold">{t.zone}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-luxury-muted">Table Token Fee:</span>
                  <strong className="text-emerald-400 font-bold text-sm">₹{t.tokenFee || restaurant?.tokenFee || 150}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => handleOpenEditTable(t)}
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-semibold text-white hover:border-luxury-gold hover:text-luxury-gold transition-all"
                >
                  Edit Capacity / Fee
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTableId(t._id)}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Table Modal ──────────────────────────── */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-luxury-gold/30 bg-[#121218] p-6 shadow-2xl">
            <h3 className="font-display text-xl text-white font-bold mb-4">
              {editTableItem ? `Edit Table ${editTableItem.tableNumber}` : 'Add New Table'}
            </h3>
            <form onSubmit={handleTableSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1">
                  Table Number / ID
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. T-01, VIP-01"
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-luxury-gold outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1">
                  Seating Capacity (Guests)
                </label>
                <select
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#121218] px-4 py-2.5 text-sm text-white focus:border-luxury-gold outline-none"
                >
                  <option value={2}>2-Seater (Couple / Cozy Table)</option>
                  <option value={4}>4-Seater (Family / Standard Table)</option>
                  <option value={6}>6-Seater (Group Table)</option>
                  <option value={8}>8-Seater (VIP Dining Table)</option>
                  <option value={10}>10-Seater (Large Party Table)</option>
                  <option value={12}>12-Seater (Executive Banquet)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1">
                  Dining Zone
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#121218] px-4 py-2.5 text-sm text-white focus:border-luxury-gold outline-none"
                >
                  <option value="Main Hall">Main Hall</option>
                  <option value="Outdoor Terrace">Outdoor Terrace</option>
                  <option value="VIP Private Dining">VIP Private Dining</option>
                  <option value="Rooftop">Rooftop</option>
                  <option value="Bar Counter">Bar Counter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1">
                  Table Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#121218] px-4 py-2.5 text-sm text-white focus:border-luxury-gold outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1">
                  Table-Wise Token Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={tokenFee}
                  onChange={(e) => setTokenFee(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-luxury-gold outline-none"
                />
                <span className="text-[10px] text-luxury-muted mt-1 block">Custom fee for this specific table capacity</span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="rounded-xl border border-white/15 px-5 py-2.5 text-xs text-luxury-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTable}
                  className="rounded-xl bg-luxury-gold px-6 py-2.5 text-xs font-bold text-black uppercase hover:bg-luxury-gold/90"
                >
                  {savingTable ? 'Saving…' : editTableItem ? 'Update Table' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Bulk Tables Generator Modal ────────────────────── */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-luxury-gold/30 bg-[#121218] p-6 shadow-2xl">
            <h3 className="font-display text-xl text-white font-bold mb-2">Bulk Add Tables</h3>
            <p className="font-sans text-xs text-luxury-muted mb-4">
              Quickly generate multiple tables of a specific seating capacity & token fee.
            </p>
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1">
                  Number of Tables to Create
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-luxury-gold outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1">
                  Seating Capacity per Table
                </label>
                <select
                  value={bulkCapacity}
                  onChange={(e) => setBulkCapacity(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#121218] px-4 py-2.5 text-sm text-white focus:border-luxury-gold outline-none"
                >
                  <option value={2}>2-Seater</option>
                  <option value={4}>4-Seater</option>
                  <option value={6}>6-Seater</option>
                  <option value={8}>8-Seater (VIP)</option>
                  <option value={10}>10-Seater</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1">
                  Dining Zone
                </label>
                <select
                  value={bulkZone}
                  onChange={(e) => setBulkZone(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#121218] px-4 py-2.5 text-sm text-white focus:border-luxury-gold outline-none"
                >
                  <option value="Main Hall">Main Hall</option>
                  <option value="Outdoor Terrace">Outdoor Terrace</option>
                  <option value="VIP Private Dining">VIP Private Dining</option>
                  <option value="Rooftop">Rooftop</option>
                  <option value="Bar Counter">Bar Counter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1">
                  Token Fee Per Table (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={bulkTokenFee}
                  onChange={(e) => setBulkTokenFee(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-luxury-gold outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="rounded-xl border border-white/15 px-5 py-2.5 text-xs text-luxury-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTable}
                  className="rounded-xl bg-luxury-gold px-6 py-2.5 text-xs font-bold text-black uppercase hover:bg-luxury-gold/90"
                >
                  {savingTable ? 'Generating…' : 'Generate Tables'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add / Edit Restaurant Profile Modal ──────────────── */}
      {showRestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-luxury-gold/30 bg-[#121218] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-xl text-white font-bold mb-4">
              Add / Edit Restaurant Profile
            </h3>
            <form onSubmit={handleRestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  value={restForm.name}
                  onChange={(e) => setRestForm({ ...restForm, name: e.target.value })}
                  placeholder="e.g. Royal Spice Bistro"
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-luxury-gold outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1">
                  Location / Address *
                </label>
                <input
                  type="text"
                  value={restForm.location}
                  onChange={(e) => setRestForm({ ...restForm, location: e.target.value })}
                  placeholder="e.g. Bandra West, Mumbai"
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-luxury-gold outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1">
                    Cuisine Category
                  </label>
                  <input
                    type="text"
                    value={restForm.category}
                    onChange={(e) => setRestForm({ ...restForm, category: e.target.value })}
                    placeholder="e.g. Fine Dining, Italian"
                    className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-luxury-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1">
                    Base Token Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={restForm.tokenFee}
                    onChange={(e) => setRestForm({ ...restForm, tokenFee: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-luxury-gold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1">
                  Opening Hours
                </label>
                <input
                  type="text"
                  value={restForm.openingHours}
                  onChange={(e) => setRestForm({ ...restForm, openingHours: e.target.value })}
                  placeholder="e.g. 11:00 AM - 11:00 PM"
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-luxury-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={restForm.description}
                  onChange={(e) => setRestForm({ ...restForm, description: e.target.value })}
                  placeholder="Describe your ambiance, menu specialties, and dining experience..."
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-luxury-gold outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowRestModal(false)}
                  className="rounded-xl border border-white/15 px-5 py-2.5 text-xs text-luxury-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRest}
                  className="rounded-xl bg-luxury-gold px-6 py-2.5 text-xs font-bold text-black uppercase hover:bg-luxury-gold/90"
                >
                  {savingRest ? 'Submitting…' : 'Save & Submit Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Table Modal */}
      {deleteTableId && (
        <ConfirmModal
          title="Delete Table"
          message="Are you sure you want to remove this table?"
          confirmText="Delete Table"
          onConfirm={handleDeleteTable}
          onCancel={() => setDeleteTableId(null)}
        />
      )}
    </div>
  );
}
