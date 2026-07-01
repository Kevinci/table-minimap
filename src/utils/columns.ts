/**
 * Gets display text for a column header.
 */
export function getColumnHeaderText(
  table: HTMLTableElement,
  columnIndex: number,
): string {
  const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
  if (!headerRow) {
    return `Column ${columnIndex + 1}`;
  }

  const headerCells = Array.from(headerRow.querySelectorAll('th, td'));
  const headerText = headerCells[columnIndex]?.textContent?.trim();
  return headerText || `Column ${columnIndex + 1}`;
}

/**
 * Resolves all table cells that visually belong to a logical column index.
 */
export function getCellsForColumnIndex(
  table: HTMLTableElement,
  columnIndex: number,
): HTMLTableCellElement[] {
  const cells: HTMLTableCellElement[] = [];
  const rows = Array.from(table.rows);

  rows.forEach((row) => {
    let cursor = 0;
    const rowCells = Array.from(row.cells);

    for (let i = 0; i < rowCells.length; i++) {
      const cell = rowCells[i];
      const colSpan = Math.max(1, cell.colSpan || 1);
      const start = cursor;
      const end = cursor + colSpan - 1;

      if (columnIndex >= start && columnIndex <= end) {
        cells.push(cell);
        break;
      }

      cursor += colSpan;
    }
  });

  return cells;
}

/**
 * Builds clipboard text for a single column (header + non-empty rows).
 */
export function getColumnClipboardText(
  table: HTMLTableElement,
  columnIndex: number,
): string {
  const header = getColumnHeaderText(table, columnIndex);
  const bodyRows = Array.from(table.querySelectorAll('tbody tr'));
  const rows =
    bodyRows.length > 0
      ? bodyRows
      : Array.from(table.querySelectorAll('tr')).filter((row) => !row.closest('thead'));

  const values = rows
    .map((row) => {
      const cells = Array.from(row.querySelectorAll('th, td'));
      return cells[columnIndex]?.textContent?.trim() ?? '';
    })
    .filter((value) => value.length > 0);

  return [header, ...values].join('\n');
}

/**
 * Writes text to clipboard with a fallback for browsers without navigator.clipboard.
 */
export async function writeClipboardText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  return copied;
}

/**
 * Normalizes column indices to distinct, sorted, in-range values.
 */
export function normalizeColumnIndices(
  input: number[],
  maxColumns: number,
): number[] {
  const max = maxColumns > 0 ? maxColumns : Number.MAX_SAFE_INTEGER;
  const unique = new Set<number>();

  input.forEach((value) => {
    const index = Math.floor(value);
    if (!Number.isFinite(index)) return;
    if (index < 0 || index >= max) return;
    unique.add(index);
  });

  return Array.from(unique).sort((a, b) => a - b);
}

