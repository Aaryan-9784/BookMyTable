function StatusBadge({ value }) {
  const v = String(value).toLowerCase();

  if (v === 'confirmed') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold tracking-wide"
        style={{
          background: 'rgba(212,175,55,0.10)',
          border: '1px solid rgba(212,175,55,0.28)',
          color: '#d4af37',
          boxShadow: '0 0 10px rgba(212,175,55,0.08)',
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{ background: '#d4af37', boxShadow: '0 0 5px rgba(212,175,55,0.8)' }}
        />
        Confirmed
      </span>
    );
  }

  if (v === 'cancelled') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-semibold tracking-wide"
        style={{
          background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.22)',
          color: '#f87171',
          boxShadow: '0 0 10px rgba(220,38,38,0.06)',
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{ background: '#f87171', boxShadow: '0 0 5px rgba(248,113,113,0.7)' }}
        />
        Cancelled
      </span>
    );
  }

  return (
    <span className="font-sans text-xs text-luxury-muted capitalize">{value}</span>
  );
}

export default function DataTable({ columns, rows, emptyMessage = 'No data' }) {
  if (!rows?.length) {
    return (
      <div
        className="rounded-2xl p-14 text-center font-sans text-sm text-luxury-muted"
        style={{
          background: 'rgba(18,18,18,0.8)',
          border: '1px dashed rgba(212,175,55,0.13)',
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-2xl"
      style={{
        background: 'linear-gradient(160deg, #1b1b1b 0%, #151515 100%)',
        border: '1px solid rgba(212,175,55,0.10)',
        boxShadow: '0 4px 48px rgba(0,0,0,0.55)',
      }}
    >
      <table className="w-full min-w-[680px] text-left font-sans">
        {/* Header */}
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
            {columns.map((c) => (
              <th
                key={c.key}
                className="px-6 py-4 font-sans text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: 'rgba(212,175,55,0.55)' }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.key ?? i}
              className="admin-row"
              style={{
                borderBottom:
                  i < rows.length - 1
                    ? '1px solid rgba(255,255,255,0.035)'
                    : 'none',
              }}
            >
              {columns.map((c) => {
                const val = c.render ? c.render(row) : row[c.key];

                if (c.key === 'status') {
                  return (
                    <td key={c.key} className="px-6 py-4">
                      <StatusBadge value={val} />
                    </td>
                  );
                }

                if (c.key === 'when') {
                  return (
                    <td key={c.key} className="px-6 py-4">
                      <span className="row-when font-sans text-[13px] font-medium text-luxury-mutedlt transition-colors duration-200">
                        {val}
                      </span>
                    </td>
                  );
                }

                if (c.key === 'restaurant') {
                  return (
                    <td key={c.key} className="px-6 py-4">
                      <span className="font-sans text-[13px] font-semibold text-luxury-white">
                        {val}
                      </span>
                    </td>
                  );
                }

                if (c.key === 'guests') {
                  return (
                    <td key={c.key} className="px-6 py-4">
                      <span
                        className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md px-2 font-sans text-[12px] font-semibold"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          color: '#b8b8b8',
                        }}
                      >
                        {val}
                      </span>
                    </td>
                  );
                }

                // user / default
                return (
                  <td key={c.key} className="px-6 py-4">
                    <span className="font-sans text-[12px] text-luxury-muted">
                      {val}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
