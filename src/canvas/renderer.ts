import { CANVAS_COLORS } from '../constants';

export interface CanvasMetrics {
  width: number;
  zoom: number;
  numCols: number;
  visibleRatio: number;
  visibleCols: number;
  cellWidth: number;
  panX: number;
  startColFloat: number;
  startCol: number;
  endCol: number;
  xOffset: number;
}

export interface RenderOptions {
  table: HTMLTableElement;
  height: number;
  markedColumns: Set<number>;
  hiddenColumns: Set<number>;
  selectedColumns: Set<number>;
  hoveredColumn: number;
}

/**
 * Draws a rounded-rectangle path for small canvas UI elements.
 */
export function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Draws a modern bookmark badge in the header area for marked columns.
 */
export function drawColumnBookmark(
  ctx: CanvasRenderingContext2D,
  x: number,
  cellWidth: number,
  headerHeight: number,
  fill: string,
  stroke: string,
): void {
  const badgeSize = Math.min(12, Math.max(9, Math.min(cellWidth * 0.24, headerHeight * 0.78)));
  const badgeX = x + cellWidth - badgeSize - 3;
  const badgeY = Math.max(1.5, (headerHeight - badgeSize) / 2 - 0.5);
  const radius = Math.min(3.5, badgeSize * 0.32);

  if (badgeX <= x + 2) return;

  ctx.save();
  drawRoundedRectPath(ctx, badgeX, badgeY, badgeSize, badgeSize, radius);
  ctx.shadowColor = 'rgba(15, 23, 42, 0.24)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 0.7;
  ctx.stroke();

  const iconPadding = Math.max(2, badgeSize * 0.2);
  const iconX = badgeX + iconPadding;
  const iconY = badgeY + iconPadding - 0.2;
  const iconWidth = badgeSize - iconPadding * 2;
  const iconHeight = badgeSize - iconPadding * 1.8;
  const notchY = iconY + iconHeight - Math.max(1.2, iconHeight * 0.2);

  ctx.beginPath();
  ctx.moveTo(iconX, iconY);
  ctx.lineTo(iconX + iconWidth, iconY);
  ctx.lineTo(iconX + iconWidth, notchY);
  ctx.lineTo(iconX + iconWidth / 2, iconY + iconHeight);
  ctx.lineTo(iconX, notchY);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a compact collapse icon for columns hidden from the full table view.
 */
export function drawHiddenColumnBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  cellWidth: number,
  headerHeight: number,
  fill: string,
  stroke: string,
): void {
  const badgeSize = Math.min(10, Math.max(7, Math.min(cellWidth * 0.2, headerHeight * 0.66)));
  const badgeX = x + Math.max(2, Math.min(4, cellWidth * 0.1));
  const badgeY = Math.max(1.2, (headerHeight - badgeSize) / 2);
  const radius = Math.min(2.6, badgeSize * 0.28);

  if (badgeX + badgeSize >= x + cellWidth - 2) return;

  ctx.save();
  drawRoundedRectPath(ctx, badgeX, badgeY, badgeSize, badgeSize, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 0.6;
  ctx.stroke();

  const lineInset = Math.max(1.8, badgeSize * 0.24);
  const lineHeight = Math.max(1.8, badgeSize - lineInset * 2);
  const leftX = badgeX + lineInset + 0.1;
  const rightX = badgeX + badgeSize - lineInset - 0.1;
  const top = badgeY + lineInset;

  ctx.strokeStyle = 'rgba(248, 250, 252, 0.95)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(leftX, top);
  ctx.lineTo(leftX, top + lineHeight);
  ctx.moveTo(rightX, top);
  ctx.lineTo(rightX, top + lineHeight);
  ctx.stroke();
  ctx.restore();
}

/**
 * Renders the visible portion of the table directly onto the canvas.
 */
export function renderTableDirect(
  ctx: CanvasRenderingContext2D,
  metrics: CanvasMetrics,
  options: RenderOptions,
): void {
  const { width, zoom, numCols, cellWidth, startCol, endCol, xOffset } = metrics;
  const { table, height, markedColumns, hiddenColumns, selectedColumns, hoveredColumn } = options;
  const rows = Array.from(table.querySelectorAll('tr'));
  const numRows = rows.length;

  if (numRows === 0 || numCols === 0) return;

  // Base header height
  const baseHeaderHeight = Math.min(height * 0.15, 30);

  // At zoom 1x: fit all rows into available space (tiny cells)
  // At higher zoom: use a readable cell height, not all rows visible
  const minCellHeight = (height - baseHeaderHeight) / numRows; // Fits all rows
  const readableCellHeight = 18; // Target readable height

  // Interpolate between "fit all" and "readable" based on zoom
  const cellHeight = minCellHeight + (readableCellHeight - minCellHeight) * (1 - 1 / zoom);
  const headerHeight = baseHeaderHeight + (40 - baseHeaderHeight) * (1 - 1 / zoom);

  // Font sizes based on actual cell dimensions
  const headerFontSize = Math.min(headerHeight * 0.5, 22);
  const fontSize = Math.min(cellHeight * 0.7, cellWidth * 0.35, 16);

  const colors = CANVAS_COLORS;

  // Clear background
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  // Draw header
  ctx.fillStyle = colors.headerBg;
  ctx.fillRect(0, 0, width, headerHeight);

  const headerRow = table.querySelector('thead tr') || rows[0];
  const headerCells = headerRow ? Array.from(headerRow.querySelectorAll('th, td')) : [];

  ctx.font = `bold ${headerFontSize}px system-ui, sans-serif`;
  ctx.textBaseline = 'middle';

  for (let col = startCol; col < endCol; col++) {
    const x = xOffset + (col - startCol) * cellWidth;
    if (x + cellWidth < 0 || x > width) continue;
    const isMarked = markedColumns.has(col);
    const isHidden = hiddenColumns.has(col);

    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, 0, cellWidth, headerHeight);

    const text = headerCells[col]?.textContent?.trim() || `Col ${col + 1}`;
    ctx.fillStyle = colors.headerText;
    ctx.save();
    ctx.beginPath();
    const iconPadding = (isMarked ? 16 : 0) + (isHidden ? 14 : 0);
    ctx.rect(x + 2, 0, Math.max(cellWidth - 6 - iconPadding, 0), headerHeight);
    ctx.clip();
    ctx.fillText(text, x + 4, headerHeight / 2);
    ctx.restore();

    if (isHidden) {
      drawHiddenColumnBadge(ctx, x, cellWidth, headerHeight, colors.hiddenBadgeFill, colors.hiddenBadgeStroke);
    }

    if (isMarked) {
      drawColumnBookmark(ctx, x, cellWidth, headerHeight, colors.bookmarkFill, colors.bookmarkStroke);
    }
  }

  // Draw hidden overlay
  for (let col = startCol; col < endCol; col++) {
    if (!hiddenColumns.has(col)) continue;
    const x = xOffset + (col - startCol) * cellWidth;
    if (x + cellWidth < 0 || x > width) continue;

    ctx.fillStyle = colors.hiddenOverlay;
    ctx.fillRect(x, 0, cellWidth, height);
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(x + 0.4, 0.4, Math.max(cellWidth - 0.8, 0), Math.max(height - 0.8, 0));
    drawHiddenColumnBadge(ctx, x, cellWidth, headerHeight, colors.hiddenBadgeFill, colors.hiddenBadgeStroke);
  }

  // Draw data rows
  ctx.font = `${fontSize}px system-ui, sans-serif`;

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    if (row.closest('thead')) continue;

    const y = headerHeight + rowIndex * cellHeight;
    if (y + cellHeight < 0 || y > height) continue;

    if (rowIndex % 2 === 1) {
      ctx.fillStyle = colors.altRow;
      ctx.fillRect(0, y, width, cellHeight);
    }

    const cells = Array.from(row.querySelectorAll('th, td'));

    for (let col = startCol; col < endCol; col++) {
      const x = xOffset + (col - startCol) * cellWidth;
      if (x + cellWidth < 0 || x > width) continue;

      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, cellWidth, cellHeight);

      const content = cells[col]?.textContent?.trim();
      if (content) {
        ctx.fillStyle = colors.text;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + 2, y, cellWidth - 4, cellHeight);
        ctx.clip();
        ctx.fillText(content, x + 4, y + cellHeight / 2);
        ctx.restore();
      }
    }
  }

  // Draw selection highlight
  for (let col = startCol; col < endCol; col++) {
    if (!selectedColumns.has(col)) continue;
    const selX = xOffset + (col - startCol) * cellWidth;
    if (selX + cellWidth < 0 || selX > width) continue;

    ctx.fillStyle = colors.selectedFill;
    ctx.fillRect(selX, 0, cellWidth, height);
    ctx.strokeStyle = colors.selectedStroke;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(selX + 0.75, 0.75, cellWidth - 1.5, height - 1.5);

    if (markedColumns.has(col)) {
      drawColumnBookmark(ctx, selX, cellWidth, headerHeight, colors.bookmarkFill, colors.bookmarkStroke);
    }
    if (hiddenColumns.has(col)) {
      drawHiddenColumnBadge(ctx, selX, cellWidth, headerHeight, colors.hiddenBadgeFill, colors.hiddenBadgeStroke);
    }
  }

  // Draw hover highlight
  if (hoveredColumn >= startCol && hoveredColumn < endCol) {
    const hoverX = xOffset + (hoveredColumn - startCol) * cellWidth;
    ctx.fillStyle = colors.hoverFill;
    ctx.fillRect(hoverX, 0, cellWidth, height);
    ctx.strokeStyle = colors.hoverStroke;
    ctx.lineWidth = 1;
    ctx.strokeRect(hoverX, 0, cellWidth, height);

    if (markedColumns.has(hoveredColumn)) {
      drawColumnBookmark(ctx, hoverX, cellWidth, headerHeight, colors.bookmarkFill, colors.bookmarkStroke);
    }

    if (hiddenColumns.has(hoveredColumn)) {
      drawHiddenColumnBadge(ctx, hoverX, cellWidth, headerHeight, colors.hiddenBadgeFill, colors.hiddenBadgeStroke);
    }
  }
}

