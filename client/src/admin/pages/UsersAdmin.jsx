import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { adminApi } from '../services/adminApi.js';
import DataTable from '../components/DataTable.jsx';
import Loader from '../../components/Loader.jsx';

export default function UsersAdmin() {
  const { profile, refreshProfile } = useAuth();
  const [data, setData] = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    try {
      const { data: body } = await adminApi.listUsers({ page, limit: 25, q: q.trim() || undefined });
      setData(body);
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
  }, [page, q]);

  const changeRole = async (userId, role) => {
    setUpdatingId(userId);
    try {
      await adminApi.updateUserRole(userId, role);
      toast.success('Role updated');
      if (profile?._id === userId) await refreshProfile();
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !data.items.length) return <Loader label="Loading users…" />;

  const rows = (data.items || []).map((u) => ({
    key: u._id,
    email: u.email,
    role: u.role,
    cognitoId: u.cognitoId ? `${u.cognitoId.slice(0, 8)}…` : '—',
    id: u._id,
  }));

  return (
    <div>
      <h1 className="font-display text-3xl text-white">Users</h1>

      <input
        type="search"
        placeholder="Search by email…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setPage(1);
        }}
        className="mt-6 w-full max-w-md rounded border border-luxury-border bg-luxury-bg px-4 py-2 font-sans text-white placeholder:text-luxury-muted focus:border-luxury-gold focus:outline-none"
      />

      <div className="mt-6">
        <DataTable
          columns={[
            { key: 'email', label: 'Email' },
            { key: 'cognitoId', label: 'Cognito' },
            {
              key: 'role',
              label: 'Role',
              render: (row) => (
                <select
                  value={row.role}
                  disabled={updatingId === row.id}
                  onChange={(e) => changeRole(row.id, e.target.value)}
                  className="rounded border border-luxury-border bg-luxury-bg px-2 py-1 text-sm text-white focus:border-luxury-gold focus:outline-none"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              ),
            },
          ]}
          rows={rows}
          emptyMessage="No users"
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
    </div>
  );
}
