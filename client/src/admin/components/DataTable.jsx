/**
 * Simple responsive table wrapper for admin lists.
 */
export default function DataTable({ columns, rows, emptyMessage = 'No data' }) {
  if (!rows?.length) {
    return <p className="rounded-lg border border-dashed border-luxury-border p-8 text-center text-luxury-muted">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-luxury-border">
      <table className="w-full min-w-[640px] text-left font-sans text-sm">
        <thead className="border-b border-luxury-border bg-luxury-bg/80">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-medium text-luxury-gold">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.key ?? i} className="border-b border-luxury-border/50 hover:bg-luxury-surface/40">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 text-luxury-muted">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
