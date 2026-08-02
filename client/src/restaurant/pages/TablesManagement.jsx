import { useEffect, useState, useCallback } from 'react';
import toast from '../../utils/toast.js';
import { restaurantApi } from '../services/restaurantApi.js';
import Loader from '../../components/Loader.jsx';
import ConfirmModal from '../../admin/components/ConfirmModal.jsx';
import { downloadCSV, fmt, today } from '../utils/exportCSV.js';

/* ── ICONS ──────────────────────────────────────────────────── */
function IconTable() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="4" width="14" height="9" rx="2" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M4 13v3M14 13v3M5 1.5v2.5M13 1.5v2.5" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconSeating() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M5 7V4a1 1 0 011-1h6a1 1 0 011 1v3" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="2" y="7" width="14" height="5" rx="1.5" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M4 12v4M14 12v4" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconCapacity() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="6" cy="6" r="3" stroke="#d4af37" strokeWidth="1.4" />
      <circle cx="12" cy="6" r="3" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M1 16c0-3 2.2-5 5-5h6c2.8 0 5 2 5 5" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconRefresh() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M13 7.5A5.5 5.5 0 012.02 9M2 7.5A5.5 5.5 0 0112.98 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M12.5 3v3h-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 12v-3h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M9.5 1.5l2 2-8 8H1.5v-2l8-8z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1.5 3.5h10M5 3.5V2h3v1.5M2.5 3.5l.8 7.5h4.4l.8-7.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconBulk() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1.5 4h11M1.5 7h11M1.5 10h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M11 2l2 2-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── STAT CARD (matches Dashboard) ─────────────────────────── */
function StatCard({ line1, line2, label, value, sub, Icon, accent = false }) {
  let l1 = line1;
  let l2 = line2;
  if (!l1 && label) {
    const parts = label.trim().split(/\s+/);
    if (parts.length >= 2) {
      l1 = parts[0];
      l2 = parts.slice(1).join(' ');
    } else {
      l1 = label;
      l2 = '';
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300 group"
      style={{
        background: accent
          ? 'linear-gradient(150deg, #1e1b0f 0%, #181507 60%, #151300 100%)'
          : 'linear-gradient(150deg, #1c1c1c 0%, #161616 55%, #131313 100%)',
        border: accent ? '1px solid rgba(212,175,55,0.28)' : '1px solid rgba(212,175,55,0.13)',
        boxShadow: accent
          ? '0 4px 40px rgba(0,0,0,0.55), 0 0 24px rgba(212,175,55,0.08)'
          : '0 4px 40px rgba(0,0,0,0.55)',
      }}
    >
      {accent && (
        <div
          className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)' }}
        />
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted font-semibold leading-[1.3] flex flex-col justify-center min-h-[2.4rem]">
          <span>{l1}</span>
          {l2 && <span>{l2}</span>}
        </div>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.20)' }}
        >
          <Icon />
        </div>
      </div>
      <p className="font-display leading-none text-white font-bold" style={{ fontSize: '2.6rem' }}>{value}</p>
      {sub && <p className="mt-2 font-sans text-xs text-luxury-muted">{sub}</p>}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, rgba(212,175,55,0.55) 0%, transparent 100%)',
          opacity: accent ? 0.8 : 0.5,
        }}
      />
    </div>
  );
}

/* ── MODAL WRAPPER (shared style) ───────────────────────────── */
function Modal({ onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1a1a1a 0%, #141414 100%)',
          border: '1px solid rgba(212,175,55,0.2)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ── FORM FIELD HELPERS ─────────────────────────────────────── */
const inputCls =
  'w-full rounded-xl border bg-black/40 px-4 py-2.5 text-sm text-white outline-none transition-colors duration-200 focus:border-luxury-gold/60 placeholder:text-white/20';
const inputStyle = { borderColor: 'rgba(255,255,255,0.1)' };

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-luxury-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

function ModalHeader({ title, sub, onClose }) {
  return (
    <div className="px-6 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 h-0.5 w-8" style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
          <h3 className="font-display text-xl font-bold text-white">{title}</h3>
          {sub && <p className="mt-1 font-sans text-xs text-luxury-muted">{sub}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/30 transition-all duration-200 hover:text-white hover:bg-white/08"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ModalFooter({ onCancel, submitLabel, loading, danger }) {
  return (
    <div
      className="flex items-center justify-end gap-3 px-6 py-4"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl px-5 py-2.5 font-sans text-xs text-luxury-muted transition-all duration-200 hover:text-white"
        style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl px-6 py-2.5 font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 hover:brightness-110"
        style={
          danger
            ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff' }
            : { background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)', color: '#0b0b0c' }
        }
      >
        {loading ? 'Saving…' : submitLabel}
      </button>
    </div>
  );
}

/* ── TABLE STATUS BADGE ─────────────────────────────────────── */
function TableStatusBadge({ status }) {
  const cfgs = {
    Available:   { bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.25)',  color: '#4ade80' },
    Reserved:    { bg: 'rgba(212,175,55,0.10)', border: 'rgba(212,175,55,0.28)', color: '#d4af37' },
    Maintenance: { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.22)', color: '#f87171' },
  };
  const cfg = cfgs[status] || { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: '#888' };
  return (
    <span
      className="inline-block rounded-full px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wider"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      {status}
    </span>
  );
}

/* ── ZONE CHIP ──────────────────────────────────────────────── */
const ZONE_COLORS = {
  'Main Hall':          { bg: 'rgba(99,102,241,0.10)', color: '#a5b4fc' },
  'Outdoor Terrace':    { bg: 'rgba(34,197,94,0.08)',  color: '#6ee7b7' },
  'VIP Private Dining': { bg: 'rgba(212,175,55,0.10)', color: '#f5e27a' },
  'Rooftop':            { bg: 'rgba(244,63,94,0.10)',  color: '#fb7185' },
  'Bar Counter':        { bg: 'rgba(249,115,22,0.10)', color: '#fdba74' },
};

function ZoneChip({ zone }) {
  const cfg = ZONE_COLORS[zone] || { bg: 'rgba(255,255,255,0.06)', color: '#aaa' };
  return (
    <span
      className="rounded-full px-2.5 py-0.5 font-sans text-[10px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {zone}
    </span>
  );
}

/* ── SELECT HELPER ──────────────────────────────────────────── */
function StyledSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border px-4 py-2.5 font-sans text-sm text-white outline-none transition-colors duration-200 focus:border-luxury-gold/60"
      style={{ background: '#101010', borderColor: 'rgba(255,255,255,0.1)' }}
    >
      {children}
    </select>
  );
}

/* ── MAIN COMPONENT ─────────────────────────────────────────── */
export default function TablesManagement() {
  const [tables,     setTables]     = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* Table modal */
  const [showTableModal, setShowTableModal] = useState(false);
  const [editTableItem,  setEditTableItem]  = useState(null);
  const [deleteTableId,  setDeleteTableId]  = useState(null);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity,    setCapacity]    = useState(4);
  const [zone,        setZone]        = useState('Main Hall');
  const [status,      setStatus]      = useState('Available');
  const [tokenFee,    setTokenFee]    = useState(150);
  const [savingTable, setSavingTable] = useState(false);

  /* Bulk modal */
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCount,     setBulkCount]     = useState(4);
  const [bulkCapacity,  setBulkCapacity]  = useState(4);
  const [bulkZone,      setBulkZone]      = useState('Main Hall');
  const [bulkTokenFee,  setBulkTokenFee]  = useState(150);

  /* Restaurant modal */
  const [showRestModal, setShowRestModal] = useState(false);
  const [restForm, setRestForm] = useState({
    name: '', location: '', category: 'Multi-cuisine',
    description: '', tokenFee: 150, openingHours: '11:00 AM - 11:00 PM',
  });
  const [savingRest, setSavingRest] = useState(false);

  /* ── Data fetching ── */
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [tRes, sRes] = await Promise.all([
        restaurantApi.getTables(),
        restaurantApi.getStats(),
      ]);
      setTables(tRes.data.tables || []);
      const rData = sRes.data.restaurant || {};
      setRestaurant(rData);
      setRestForm({
        name:         rData.name         || '',
        location:     rData.location     || '',
        category:     rData.category     || 'Multi-cuisine',
        description:  rData.description  || '',
        tokenFee:     rData.tokenFee     || 150,
        openingHours: rData.openingHours || '11:00 AM - 11:00 PM',
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Table modal handlers ── */
  const openAddTable = () => {
    setEditTableItem(null);
    setTableNumber(`T-${String(tables.length + 1).padStart(2, '0')}`);
    setCapacity(4); setZone('Main Hall'); setStatus('Available');
    setTokenFee(restaurant?.tokenFee || 150);
    setShowTableModal(true);
  };
  const openEditTable = (t) => {
    setEditTableItem(t);
    setTableNumber(t.tableNumber); setCapacity(t.capacity);
    setZone(t.zone); setStatus(t.status);
    setTokenFee(t.tokenFee || restaurant?.tokenFee || 150);
    setShowTableModal(true);
  };

  const handleTableSubmit = async (e) => {
    e.preventDefault();
    if (!tableNumber.trim() || !capacity) { toast.error('Table number and capacity are required.'); return; }
    setSavingTable(true);
    try {
      const payload = { tableNumber, capacity: Number(capacity), zone, status, tokenFee: Number(tokenFee) };
      if (editTableItem) {
        await restaurantApi.updateTable(editTableItem._id, payload);
        toast.success(`Table "${tableNumber}" updated!`);
      } else {
        await restaurantApi.createTable(payload);
        toast.success(`Table "${tableNumber}" added!`);
      }
      setShowTableModal(false);
      fetchData(true);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to save table');
    } finally {
      setSavingTable(false);
    }
  };

  /* ── Bulk handler ── */
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setSavingTable(true);
    try {
      const count = Number(bulkCount) || 1;
      const cap   = Number(bulkCapacity) || 4;
      const fee   = Number(bulkTokenFee) || 150;
      let created = 0;
      for (let i = 1; i <= count; i++) {
        try {
          await restaurantApi.createTable({
            tableNumber: `T-${cap}S-${String(tables.length + i).padStart(2, '0')}`,
            capacity: cap, zone: bulkZone, status: 'Available', tokenFee: fee,
          });
          created++;
        } catch { /* ignore duplicate */ }
      }
      toast.success(`Generated ${created} new ${cap}-seater table(s)!`);
      setShowBulkModal(false);
      fetchData(true);
    } catch (err) {
      toast.error(err.message || 'Failed to generate bulk tables');
    } finally {
      setSavingTable(false);
    }
  };

  /* ── Restaurant settings handler ── */
  const handleRestSubmit = async (e) => {
    e.preventDefault();
    setSavingRest(true);
    try {
      await restaurantApi.updateSettings(restForm);
      toast.success('Restaurant profile updated & sent for Admin Review!');
      setShowRestModal(false);
      fetchData(true);
    } catch (err) {
      toast.error(err.message || 'Failed to update restaurant profile');
    } finally {
      setSavingRest(false);
    }
  };

  /* ── Delete handler ── */
  const handleDeleteTable = async () => {
    if (!deleteTableId) return;
    try {
      await restaurantApi.deleteTable(deleteTableId);
      toast.success('Table removed successfully');
      setDeleteTableId(null);
      fetchData(true);
    } catch (err) {
      toast.error(err.message || 'Failed to delete table');
    }
  };

  /* ── Derived stats ── */
  const totalCapacity  = tables.reduce((s, t) => s + (t.capacity || 0), 0);
  const capacityCounts = tables.reduce((acc, t) => {
    const k = `${t.capacity}-Seater`;
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const approvalStatus = restaurant?.approvalStatus || 'pending';

  return (
    <div className="max-w-[1100px] mx-auto">

      {/* ── Page Header Row ─────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between anim-fade-up">
        <div>
          <h1
            className="font-display leading-none text-luxury-white font-bold"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}
          >
            {restaurant?.name || 'Add Tables'}
          </h1>
          <p className="mt-2 font-sans text-sm text-luxury-muted flex items-center gap-2 flex-wrap">
            <span>📍 {restaurant?.location || 'Set location'}</span>
            <span className="text-white/20">·</span>
            <span>{restaurant?.category || 'Category'}</span>
            <span className="text-white/20">·</span>
            <span>
              Base Token Fee:{' '}
              <strong className="text-luxury-gold/80">₹{restaurant?.tokenFee || 150}</strong>
            </span>
          </p>
          <div
            className="mt-4 h-px w-20"
            style={{ background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.15), transparent)' }}
          />
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={refreshing}
            onClick={() => { fetchData(true); toast.success('Data refreshed'); }}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-xs text-luxury-muted hover:text-luxury-gold transition-all duration-200 disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className={refreshing ? 'animate-spin' : ''}><IconRefresh /></span>
            Refresh
          </button>

          <button
            type="button"
            onClick={() => {
              downloadCSV(
                `${(restaurant?.name || 'restaurant').replace(/\s+/g, '_')}_tables_${today()}.csv`,
                [
                  {
                    title: 'Restaurant Profile',
                    headers: ['Field', 'Value'],
                    rows: [
                      ['Approval Status', restaurant?.approvalStatus || '—'],
                      ['Opening Hours',   restaurant?.openingHours  || '—'],
                      ['Base Token Fee',  fmt(restaurant?.tokenFee || 150)],
                      ['Description',     restaurant?.description   || '—'],
                    ],
                  },
                  {
                    title: 'Table Inventory',
                    headers: ['Table Number', 'Capacity', 'Zone', 'Status', 'Token Fee'],
                    rows: tables.map((t) => [
                      t.tableNumber,
                      `${t.capacity}-Seater (${t.capacity} Guests)`,
                      t.zone,
                      t.status,
                      fmt(t.tokenFee || restaurant?.tokenFee || 150),
                    ]),
                  },
                  {
                    title: 'Seating Summary',
                    headers: ['Metric', 'Value'],
                    rows: [
                      ['Total Tables',    tables.length],
                      ['Total Capacity',  tables.reduce((s, t) => s + (t.capacity || 0), 0) + ' Guests'],
                      ['Available',       tables.filter((t) => t.status === 'Available').length],
                      ['Reserved',        tables.filter((t) => t.status === 'Reserved').length],
                      ['Maintenance',     tables.filter((t) => t.status === 'Maintenance').length],
                    ],
                  },
                ],
                {
                  Restaurant: restaurant?.name     || '—',
                  Location:   restaurant?.location || '—',
                  Category:   restaurant?.category || '—',
                },
              );
              toast.success('Table inventory exported!');
            }}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-xs font-semibold text-[#0b0b0c] transition-all duration-200 hover:brightness-110 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)', boxShadow: '0 0 18px rgba(212,175,55,0.25)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5v7M4.5 6.5L7 9l2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1.5 10.5v1a1 1 0 001 1h9a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Export Analytics
          </button>
        </div>
      </div>

      {/* ── 3-KPI Stat Cards ────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-3 mb-8">
        <StatCard
          label="Total Restaurant Tables"
          value={tables.length}
          sub="Configured in seating layout"
          Icon={IconTable}
        />
        <StatCard
          label="Total Seating Capacity"
          value={`${totalCapacity}`}
          sub="Guests across all zones"
          Icon={IconSeating}
          accent
        />
        <StatCard
          label="Capacity Types Offered"
          value={Object.keys(capacityCounts).length}
          sub={
            Object.keys(capacityCounts).length === 0
              ? 'No tables created yet'
              : Object.entries(capacityCounts)
                  .map(([k, v]) => `${v}× ${k}`)
                  .join(' · ')
          }
          Icon={IconCapacity}
        />
      </div>

      {/* ── Table Grid ──────────────────────────────────────── */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">
            Table-Wise Capacities & Token Fees
          </h2>
          <p className="mt-0.5 font-sans text-xs text-luxury-muted">
            Manage individual table configurations, zones, and token fees
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="rounded-full px-3 py-1 font-sans text-[11px] font-semibold text-luxury-muted"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {tables.length} Table{tables.length !== 1 ? 's' : ''}
          </span>

          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-xs text-white/70 hover:text-white transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <IconBulk />
            Bulk Add
          </button>

          <button
            type="button"
            onClick={openAddTable}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-xs font-semibold text-[#0b0b0c] transition-all duration-200 hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #f0d060 55%, #c9a84c 100%)' }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1.5v10M1.5 6.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add Table
          </button>
        </div>
      </div>

      {tables.length === 0 ? (
        /* Empty state */
        <div
          className="flex flex-col items-center justify-center rounded-2xl py-20 gap-4 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(212,175,55,0.2)' }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.14)' }}
          >
            <IconTable />
          </div>
          <div>
            <p className="font-display text-white/60 font-light text-lg">No tables created yet</p>
            <p className="mt-1 font-sans text-xs text-luxury-muted">
              Start by adding tables to configure your seating layout
            </p>
          </div>
          <button
            type="button"
            onClick={openAddTable}
            className="mt-2 rounded-full px-6 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-[#0b0b0c] transition-all duration-200 hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #c9a84c, #f0d060)' }}
          >
            Create First Table
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((t) => (
            <div
              key={t._id}
              className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(150deg, #1a1a1a 0%, #151515 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.border = '1px solid rgba(212,175,55,0.25)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'; }}
            >
              {/* Gold left accent stripe */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(180deg, #f5e27a, #d4af37 50%, rgba(212,175,55,0.1))' }}
              />

              {/* Header row */}
              <div className="flex items-center justify-between mb-4 pl-2">
                <span
                  className="font-display text-xl font-bold text-white group-hover:text-luxury-gold transition-colors duration-200"
                >
                  {t.tableNumber}
                </span>
                <TableStatusBadge status={t.status} />
              </div>

              {/* Info rows */}
              <div className="space-y-2.5 pl-2 mb-5">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[11px] text-luxury-muted">Seating</span>
                  <span className="font-sans text-xs font-semibold text-white">
                    {t.capacity} Guests ({t.capacity}-Seater)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[11px] text-luxury-muted">Zone</span>
                  <ZoneChip zone={t.zone} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[11px] text-luxury-muted">Token Fee</span>
                  <span className="font-sans text-sm font-bold text-emerald-400">
                    ₹{t.tokenFee || restaurant?.tokenFee || 150}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="mx-2 mb-4 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

              {/* Action buttons */}
              <div className="flex items-center gap-2 pl-2">
                <button
                  type="button"
                  onClick={() => openEditTable(t)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 font-sans text-xs font-semibold text-luxury-muted hover:text-luxury-gold transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'; e.currentTarget.style.background = 'rgba(212,175,55,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                >
                  <IconEdit />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTableId(t._id)}
                  className="flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 font-sans text-xs font-semibold text-red-400/70 hover:text-red-400 transition-all duration-200"
                  style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)'; }}
                >
                  <IconTrash />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL: Add / Edit Table
      ════════════════════════════════════════════════════════ */}
      {showTableModal && (
        <Modal onClose={() => setShowTableModal(false)}>
          <ModalHeader
            title={editTableItem ? `Edit Table ${editTableItem.tableNumber}` : 'Add New Table'}
            sub={editTableItem ? 'Update table capacity, zone, and token fee' : 'Configure a new seating position'}
            onClose={() => setShowTableModal(false)}
          />
          <form onSubmit={handleTableSubmit}>
            <div className="space-y-4 px-6 py-5">
              <Field label="Table Number / ID">
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. T-01, VIP-01"
                  className={inputCls}
                  style={inputStyle}
                  required
                />
              </Field>

              <Field label="Seating Capacity">
                <StyledSelect value={capacity} onChange={(e) => setCapacity(e.target.value)}>
                  <option value={2}>2-Seater (Couple / Cozy Table)</option>
                  <option value={4}>4-Seater (Family / Standard Table)</option>
                  <option value={6}>6-Seater (Group Table)</option>
                  <option value={8}>8-Seater (VIP Dining)</option>
                  <option value={10}>10-Seater (Large Party)</option>
                  <option value={12}>12-Seater (Executive Banquet)</option>
                </StyledSelect>
              </Field>

              <Field label="Dining Zone">
                <StyledSelect value={zone} onChange={(e) => setZone(e.target.value)}>
                  <option>Main Hall</option>
                  <option>Outdoor Terrace</option>
                  <option>VIP Private Dining</option>
                  <option>Rooftop</option>
                  <option>Bar Counter</option>
                </StyledSelect>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Table Status">
                  <StyledSelect value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option>Available</option>
                    <option>Reserved</option>
                    <option>Maintenance</option>
                  </StyledSelect>
                </Field>

                <Field label="Token Fee (₹)">
                  <input
                    type="number"
                    min="0"
                    value={tokenFee}
                    onChange={(e) => setTokenFee(e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>
              </div>

              <p className="font-sans text-[10px] text-luxury-muted">
                Token fee is charged per guest at the time of reservation for this table.
              </p>
            </div>
            <ModalFooter
              onCancel={() => setShowTableModal(false)}
              submitLabel={editTableItem ? 'Update Table' : 'Create Table'}
              loading={savingTable}
            />
          </form>
        </Modal>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL: Bulk Add Tables
      ════════════════════════════════════════════════════════ */}
      {showBulkModal && (
        <Modal onClose={() => setShowBulkModal(false)}>
          <ModalHeader
            title="Bulk Add Tables"
            sub="Generate multiple tables of the same configuration at once"
            onClose={() => setShowBulkModal(false)}
          />
          <form onSubmit={handleBulkSubmit}>
            <div className="space-y-4 px-6 py-5">
              <Field label="Number of Tables to Create">
                <input
                  type="number" min="1" max="20"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(e.target.value)}
                  className={inputCls} style={inputStyle} required
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Seating Capacity">
                  <StyledSelect value={bulkCapacity} onChange={(e) => setBulkCapacity(e.target.value)}>
                    <option value={2}>2-Seater</option>
                    <option value={4}>4-Seater</option>
                    <option value={6}>6-Seater</option>
                    <option value={8}>8-Seater (VIP)</option>
                    <option value={10}>10-Seater</option>
                  </StyledSelect>
                </Field>

                <Field label="Token Fee (₹)">
                  <input
                    type="number" min="0"
                    value={bulkTokenFee}
                    onChange={(e) => setBulkTokenFee(e.target.value)}
                    className={inputCls} style={inputStyle}
                  />
                </Field>
              </div>

              <Field label="Dining Zone">
                <StyledSelect value={bulkZone} onChange={(e) => setBulkZone(e.target.value)}>
                  <option>Main Hall</option>
                  <option>Outdoor Terrace</option>
                  <option>VIP Private Dining</option>
                  <option>Rooftop</option>
                  <option>Bar Counter</option>
                </StyledSelect>
              </Field>

              <div
                className="flex items-start gap-3 rounded-xl p-3.5"
                style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}
              >
                <svg width="14" height="14" className="mt-0.5 shrink-0 text-luxury-gold/60" fill="none" viewBox="0 0 14 14">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M7 5.5v1.5l1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <p className="font-sans text-[11px] text-luxury-muted leading-relaxed">
                  Tables will be auto-numbered as <strong className="text-white/60">T-{bulkCapacity}S-XX</strong>. Duplicates are automatically skipped.
                </p>
              </div>
            </div>
            <ModalFooter
              onCancel={() => setShowBulkModal(false)}
              submitLabel={`Generate ${bulkCount} Table${bulkCount > 1 ? 's' : ''}`}
              loading={savingTable}
            />
          </form>
        </Modal>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL: Edit Restaurant Profile
      ════════════════════════════════════════════════════════ */}
      {showRestModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        >
          <div
            className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            style={{
              background: 'linear-gradient(160deg, #1a1a1a 0%, #141414 100%)',
              border: '1px solid rgba(212,175,55,0.2)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <ModalHeader
              title="Restaurant Profile"
              sub="Update your restaurant details — submitted for Admin review on save"
              onClose={() => setShowRestModal(false)}
            />
            <form onSubmit={handleRestSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="space-y-4 overflow-y-auto px-6 py-5 flex-1">
                <Field label="Restaurant Name *">
                  <input
                    type="text" required
                    value={restForm.name}
                    onChange={(e) => setRestForm({ ...restForm, name: e.target.value })}
                    placeholder="e.g. Royal Spice Bistro"
                    className={inputCls} style={inputStyle}
                  />
                </Field>

                <Field label="Location / Address *">
                  <input
                    type="text" required
                    value={restForm.location}
                    onChange={(e) => setRestForm({ ...restForm, location: e.target.value })}
                    placeholder="e.g. Bandra West, Mumbai"
                    className={inputCls} style={inputStyle}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Cuisine Category">
                    <input
                      type="text"
                      value={restForm.category}
                      onChange={(e) => setRestForm({ ...restForm, category: e.target.value })}
                      placeholder="e.g. Fine Dining, Italian"
                      className={inputCls} style={inputStyle}
                    />
                  </Field>

                  <Field label="Base Token Fee (₹)">
                    <input
                      type="number" min="0"
                      value={restForm.tokenFee}
                      onChange={(e) => setRestForm({ ...restForm, tokenFee: e.target.value })}
                      className={inputCls} style={inputStyle}
                    />
                  </Field>
                </div>

                <Field label="Opening Hours">
                  <input
                    type="text"
                    value={restForm.openingHours}
                    onChange={(e) => setRestForm({ ...restForm, openingHours: e.target.value })}
                    placeholder="e.g. 11:00 AM - 11:00 PM"
                    className={inputCls} style={inputStyle}
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    rows={3}
                    value={restForm.description}
                    onChange={(e) => setRestForm({ ...restForm, description: e.target.value })}
                    placeholder="Describe your ambiance, menu specialties, and dining experience…"
                    className={inputCls + ' resize-none'} style={inputStyle}
                  />
                </Field>
              </div>

              <ModalFooter
                onCancel={() => setShowRestModal(false)}
                submitLabel="Save & Submit for Review"
                loading={savingRest}
              />
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {deleteTableId && (
        <ConfirmModal
          title="Delete Table"
          message="Are you sure you want to permanently remove this table from the seating layout?"
          confirmText="Delete Table"
          onConfirm={handleDeleteTable}
          onCancel={() => setDeleteTableId(null)}
        />
      )}
    </div>
  );
}
