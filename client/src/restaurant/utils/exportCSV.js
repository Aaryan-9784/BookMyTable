/**
 * Shared CSV export utility for BookMyTable Partner Console.
 * Produces Excel-safe UTF-8 CSV with BOM, proper escaping, and clean section headers.
 */

/** Escape a single cell value for CSV */
function escapeCell(val) {
  if (val === null || val === undefined) return '""';
  const s = String(val);
  if (s === '') return '""';
  // Always quote, escape internal quotes
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * Build and download a CSV file.
 *
 * @param {string}    filename   - e.g. "my_report_2026-08-01.csv"
 * @param {Array[]}   sections   - Array of section descriptors:
 *   { title: string, headers: string[], rows: any[][] }
 * @param {Object}    [meta]     - Key-value pairs for the report header block
 */
export function downloadCSV(filename, sections, meta = {}) {
  const lines = [];

  // ── Report title block ──
  const reportTitle = filename.replace(/_/g, ' ').replace(/\.csv$/, '').toUpperCase();
  lines.push(escapeCell(`BookMyTable — ${reportTitle}`));
  // Generated: DD/MM/YYYY, HH:MM:SS AM/PM
  const now = new Date();
  const dd  = String(now.getDate()).padStart(2, '0');
  const mm  = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const timeStr = now.toLocaleTimeString('en-IN');
  lines.push(`${escapeCell('Generated')},${escapeCell(`${dd}/${mm}/${yyyy}, ${timeStr}`)}`);
  lines.push(`${escapeCell('Export Date')},${escapeCell(`${dd}/${mm}/${yyyy}`)}`);
  lines.push(`${escapeCell('Export Time')},${escapeCell(timeStr)}`);

  // ── Meta key-value pairs (e.g. restaurant name, location) ──
  if (Object.keys(meta).length > 0) {
    lines.push('');
    for (const [k, v] of Object.entries(meta)) {
      lines.push(`${escapeCell(k)},${escapeCell(v)}`);
    }
  }

  // ── Sections ──
  for (const section of sections) {
    lines.push('');
    // Section title as a bold-style header row (single cell)
    lines.push(escapeCell(`▸ ${section.title.toUpperCase()}`));

    if (section.headers?.length) {
      lines.push(section.headers.map(escapeCell).join(','));
    }

    for (const row of (section.rows || [])) {
      if (row === null || (Array.isArray(row) && row.length === 0)) {
        lines.push('');
      } else {
        lines.push(row.map(escapeCell).join(','));
      }
    }
  }

  // UTF-8 BOM for Excel compatibility + join
  const csv  = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Format a currency value */
export function fmt(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

/**
 * Today's date as DD-MM-YYYY (used in filenames).
 * Uses hyphens so the filename is valid on all OS.
 */
export function today() {
  const d = new Date();
  const dd   = String(d.getDate()).padStart(2, '0');
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/**
 * Convert any date string or Date to DD/MM/YYYY.
 * Handles ISO strings (YYYY-MM-DD), JS Date objects, and already-formatted dates.
 */
export function fmtDate(raw) {
  if (!raw) return '—';
  // Already DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(String(raw))) return raw;
  // ISO: YYYY-MM-DD or YYYY-MM-DDTHH:mm...
  const d = new Date(raw);
  if (isNaN(d.getTime())) return String(raw);
  const dd   = String(d.getDate()).padStart(2, '0');
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
