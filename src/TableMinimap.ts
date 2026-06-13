import type {
  TableMinimapOptions,
  RequiredOptions,
  ColumnInfo,
  ScrollState,
  TableSelector,
  ZoomState,
} from './types';

/**
 * Default configuration options
 */
const DEFAULT_OPTIONS: RequiredOptions = {
  mode: 'columns',
  height: 40,
  position: 'bottom',
  fixedWidth: 300,
  fixedPosition: 'bottom-right',
  compact: false,
  draggable: true,
  showViewport: true,
  zoomable: false,
  minZoom: 1,
  maxZoom: 10,
  zoomSpeed: 0.1,
  canvasClipboard: false,
  canvasClipboardLabel: 'Copy column to clipboard',
};

/** Compact floating minimap handle size in pixels */
const COMPACT_HANDLE_SIZE = 24;

/** Visible dot size inside the compact handle in pixels */
const COMPACT_DOT_SIZE = 5;

/** Delay before compact mode collapses after pointer leave */
const COMPACT_COLLAPSE_DELAY = 180;

/** Delay used to distinguish single click navigation from double-click repositioning */
const DOUBLE_CLICK_DELAY = 180;

/** Fixed corner positions used when cycling the minimap by double-click */
const FIXED_POSITIONS: RequiredOptions['fixedPosition'][] = [
  'bottom-right',
  'bottom-left',
  'top-left',
  'top-right',
];

/** Pixels before a canvas pointer interaction is treated as panning instead of click */
const CANVAS_PAN_THRESHOLD = 3;

/** Multiplier for canvas drag-to-scroll movement; lower values feel smoother */
const CANVAS_PAN_SENSITIVITY = 0.85;

/**
 * TableMinimap - A framework-agnostic minimap component for large HTML tables
 *
 * @example
 * ```ts
 * import { TableMinimap } from 'table-minimap';
 * import 'table-minimap/style.css';
 *
 * const minimap = new TableMinimap('#my-table');
 *
 * // Or with options
 * const minimap = new TableMinimap('#my-table', {
 *   mode: 'canvas',
 *   height: 50,
 *   position: 'top'
 * });
 *
 * // Cleanup
 * minimap.destroy();
 * ```
 */
export class TableMinimap {
  /** The target table element */
  private readonly table: HTMLTableElement;

  /** Configuration options */
  private readonly options: RequiredOptions;

  /** Whether compact fixed-overlay behavior is enabled */
  private readonly isCompactMode: boolean;

  /** Whether the compact minimap is currently collapsed */
  private isCompactCollapsed = false;

  /** Whether the compact minimap is currently expanding (transition in progress) */
  private isCompactExpanding = false;

  /** Timeout used to collapse compact mode after pointer leave */
  private compactCollapseTimer: number | null = null;

  /** Timeout used to delay fixed minimap click navigation until double-click is ruled out */
  private minimapClickTimer: number | null = null;

  /** The scrollable container (parent of table) */
  private scrollContainer: HTMLElement | null = null;

  /** Main minimap container element */
  private minimapEl: HTMLDivElement | null = null;

  /** Columns container for columns mode */
  private columnsEl: HTMLDivElement | null = null;

  /** Canvas element for canvas mode */
  private canvasEl: HTMLCanvasElement | null = null;

  /** Canvas 2D rendering context */
  private canvasCtx: CanvasRenderingContext2D | null = null;

  /** Canvas context menu for clipboard copy */
  private canvasContextMenuEl: HTMLDivElement | null = null;

  /** Copy action text inside the canvas context menu */
  private canvasContextCopyActionEl: HTMLDivElement | null = null;

  /** Status line inside the canvas context menu */
  private canvasContextStatusEl: HTMLDivElement | null = null;

  /** Selected canvas column index for context menu actions */
  private canvasContextColumnIndex = -1;


  /** Viewport indicator element */
  private viewportEl: HTMLDivElement | null = null;

  /** Detected column information */
  private columns: ColumnInfo[] = [];

  /** Current scroll state */
  private scrollState: ScrollState = {
    scrollLeft: 0,
    scrollWidth: 0,
    clientWidth: 0,
    viewportRatio: 1,
    positionRatio: 0,
  };

  /** Current zoom state */
  private zoomState: ZoomState = {
    level: 1,
    panX: 0,
    isMinZoom: true,
    isMaxZoom: false,
  };

  /** Is the viewport being dragged */
  private isDragging = false;

  /** Is the canvas being panned (when zoomed) */
  private isPanning = false;

  /** Was just panning (to prevent click after pan) */
  private wasPanning = false;

  /** Pan start position */
  private panStartX = 0;

  /** Last pointer X waiting to be applied during canvas panning */
  private pendingPanClientX: number | null = null;

  /** Currently hovered column index (-1 = none) */
  private hoveredColumn = -1;

  /** Drag start X position */
  private dragStartX = 0;

  /** Drag start scroll position */
  private dragStartScrollLeft = 0;

  /** ResizeObserver instance */
  private resizeObserver: ResizeObserver | null = null;

  /** MutationObserver instance */
  private mutationObserver: MutationObserver | null = null;

  /** Bound event handlers for cleanup */
  private boundHandlers: {
    onScroll: () => void;
    onPointerDown: (e: PointerEvent) => void;
    onPointerMove: (e: PointerEvent) => void;
    onPointerUp: (e: PointerEvent) => void;
    onMinimapClick: (e: MouseEvent) => void;
    onMinimapDoubleClick: (e: MouseEvent) => void;
    onWheel: (e: WheelEvent) => void;
    onCanvasPointerDown: (e: PointerEvent) => void;
    onCanvasContextMenu: (e: MouseEvent) => void;
    onCanvasMouseMove: (e: MouseEvent) => void;
    onCanvasMouseLeave: () => void;
    onCompactFocusIn: () => void;
    onCompactFocusOut: () => void;
    onCompactKeyDown: (e: KeyboardEvent) => void;
    onDocumentClick: (e: MouseEvent) => void;
    onDocumentKeyDown: (e: KeyboardEvent) => void;
  };

  /** Animation frame ID for throttling */
  private rafId: number | null = null;

  /** Animation frame ID for throttling canvas panning */
  private canvasPanRafId: number | null = null;

  /** Whether the instance has been destroyed */
  private isDestroyed = false;

  /**
   * Creates a new TableMinimap instance
   *
   * @param selector - CSS selector string or HTMLTableElement
   * @param options - Configuration options
   * @throws Error if table element is not found or invalid
   */
  constructor(selector: TableSelector, options: TableMinimapOptions = {}) {
    this.table = this.resolveTable(selector);
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.isCompactMode = this.options.compact && this.options.position === 'fixed';

    // Bind event handlers
    this.boundHandlers = {
      onScroll: this.onScroll.bind(this),
      onPointerDown: this.onPointerDown.bind(this),
      onPointerMove: this.onPointerMove.bind(this),
      onPointerUp: this.onPointerUp.bind(this),
      onMinimapClick: this.onMinimapClick.bind(this),
      onMinimapDoubleClick: this.onMinimapDoubleClick.bind(this),
      onWheel: this.onWheel.bind(this),
      onCanvasPointerDown: this.onCanvasPointerDown.bind(this),
      onCanvasContextMenu: this.onCanvasContextMenu.bind(this),
      onCanvasMouseMove: this.onCanvasMouseMove.bind(this),
      onCanvasMouseLeave: this.onCanvasMouseLeave.bind(this),
      onCompactFocusIn: this.onCompactFocusIn.bind(this),
      onCompactFocusOut: this.onCompactFocusOut.bind(this),
      onCompactKeyDown: this.onCompactKeyDown.bind(this),
      onDocumentClick: this.onDocumentClick.bind(this),
      onDocumentKeyDown: this.onDocumentKeyDown.bind(this),
    };

    this.init();
  }

  /**
   * Resolves the table element from a selector or element
   *
   * @param selector - CSS selector or HTMLTableElement
   * @returns The resolved table element
   * @throws Error if element is not found or not a table
   */
  private resolveTable(selector: TableSelector): HTMLTableElement {
    let element: HTMLTableElement | null;

    if (typeof selector === 'string') {
      element = document.querySelector<HTMLTableElement>(selector);
      if (!element) {
        throw new Error(
          `TableMinimap: No element found for selector "${selector}"`
        );
      }
    } else if (selector instanceof HTMLTableElement) {
      element = selector;
    } else {
      throw new Error(
        'TableMinimap: Selector must be a CSS selector string or an HTMLTableElement'
      );
    }

    if (element.tagName !== 'TABLE') {
      throw new Error(
        `TableMinimap: Element must be a <table>, got <${element.tagName.toLowerCase()}>`
      );
    }

    return element;
  }

  /**
   * Initializes the minimap
   */
  private init(): void {
    this.scrollContainer = this.findScrollContainer();
    this.detectColumns();
    this.createMinimapElement();
    this.updateScrollState();
    this.render();
    this.attachEventListeners();
    this.setupObservers();
  }

  /**
   * Finds the nearest scrollable parent container
   *
   * @returns The scrollable container or the table's parent
   */
  private findScrollContainer(): HTMLElement {
    let parent = this.table.parentElement;

    while (parent) {
      const style = getComputedStyle(parent);
      const overflowX = style.overflowX;
      const overflowY = style.overflow;

      if (
        overflowX === 'auto' ||
        overflowX === 'scroll' ||
        overflowY === 'auto' ||
        overflowY === 'scroll'
      ) {
        return parent;
      }

      // Check if content overflows
      if (parent.scrollWidth > parent.clientWidth) {
        return parent;
      }

      parent = parent.parentElement;
    }

    // Fallback to table's parent or body
    return this.table.parentElement || document.body;
  }

  /**
   * Detects table columns from thead or first row
   */
  private detectColumns(): void {
    this.columns = [];

    // Try thead th first
    const theadCells = this.table.querySelectorAll<HTMLTableCellElement>(
      'thead th, thead td'
    );

    let cells: NodeListOf<HTMLTableCellElement> | HTMLTableCellElement[];

    if (theadCells.length > 0) {
      cells = theadCells;
    } else {
      // Fallback to first row cells
      const firstRow = this.table.querySelector('tr');
      if (firstRow) {
        cells = firstRow.querySelectorAll<HTMLTableCellElement>('th, td');
      } else {
        cells = [];
      }
    }

    const tableWidth = this.table.offsetWidth || 1;

    Array.from(cells).forEach((cell) => {
      // Handle colspan
      const colspan = cell.colSpan || 1;
      const cellWidth = cell.offsetWidth;

      for (let i = 0; i < colspan; i++) {
        const width = cellWidth / colspan;
        this.columns.push({
          index: this.columns.length,
          width,
          widthPercent: (width / tableWidth) * 100,
        });
      }
    });

    // Ensure at least one column
    if (this.columns.length === 0) {
      this.columns.push({
        index: 0,
        width: tableWidth,
        widthPercent: 100,
      });
    }
  }

  /**
   * Creates the minimap DOM element
   */
  private createMinimapElement(): void {
    // Create main container
    this.minimapEl = document.createElement('div');
    this.minimapEl.className = `tm-minimap tm-minimap--${this.options.position}`;
    this.minimapEl.style.setProperty('--tm-minimap-height', `${this.options.height}px`);

    // Set width and position class for fixed position
    if (this.options.position === 'fixed') {
      this.minimapEl.style.setProperty('--tm-minimap-width', `${this.options.fixedWidth}px`);
      this.minimapEl.title = 'Double-click to move minimap to the next corner';
    }

    if (this.isCompactMode) {
      this.minimapEl.classList.add('tm-minimap--compact', 'tm-minimap--compact-collapsed');
      this.minimapEl.style.setProperty('--tm-compact-dot-size', `${COMPACT_DOT_SIZE}px`);
      this.isCompactCollapsed = true;
      this.applyCompactDimensions(true);
      this.minimapEl.setAttribute('aria-expanded', 'false');
    } else {
      this.minimapEl.setAttribute('aria-expanded', 'true');
    }
    
    this.minimapEl.setAttribute('role', 'slider');
    this.minimapEl.setAttribute('aria-label', 'Table minimap navigation');
    this.minimapEl.setAttribute('aria-valuemin', '0');
    this.minimapEl.setAttribute('aria-valuemax', '100');
    this.minimapEl.setAttribute('tabindex', '0');

    // Create content based on mode
    if (this.options.mode === 'canvas') {
      this.createCanvasContent();
    } else {
      this.createColumnsContent();
    }

    // Create viewport indicator
    if (this.options.showViewport) {
      this.createViewportIndicator();
    }

    // Insert minimap
    this.insertMinimap();
  }

  /**
   * Creates columns-mode content
   */
  private createColumnsContent(): void {
    if (!this.minimapEl) return;

    this.columnsEl = document.createElement('div');
    this.columnsEl.className = 'tm-columns';

    this.columns.forEach(() => {
      const colEl = document.createElement('div');
      colEl.className = 'tm-column';
      this.columnsEl!.appendChild(colEl);
    });

    this.minimapEl.appendChild(this.columnsEl);
  }

  /**
   * Creates canvas-mode content
   */
  private createCanvasContent(): void {
    if (!this.minimapEl) return;

    this.canvasEl = document.createElement('canvas');
    this.canvasEl.className = 'tm-canvas';
    this.canvasCtx = this.canvasEl.getContext('2d');

    this.minimapEl.appendChild(this.canvasEl);
  }

  /**
   * Creates the viewport indicator element
   */
  private createViewportIndicator(): void {
    if (!this.minimapEl) return;

    this.viewportEl = document.createElement('div');
    this.viewportEl.className = 'tm-viewport';

    if (!this.options.draggable) {
      this.viewportEl.classList.add('tm-viewport--disabled');
    }

    this.minimapEl.appendChild(this.viewportEl);
  }

  /**
   * Inserts the minimap into the DOM
   */
  private insertMinimap(): void {
    if (!this.minimapEl || !this.scrollContainer) return;

    const parent = this.scrollContainer.parentElement;

    if (this.options.position === 'fixed') {
      // Fixed position: create a wrapper with relative positioning
      // Insert minimap after scroll container, but style it to overlay
      if (parent) {
        // Ensure parent has relative positioning for our fixed overlay
        const parentStyle = getComputedStyle(parent);
        if (parentStyle.position === 'static') {
          parent.style.position = 'relative';
        }

        // Insert after scroll container
        const nextSibling = this.scrollContainer.nextSibling;
        if (nextSibling) {
          parent.insertBefore(this.minimapEl, nextSibling);
        } else {
          parent.appendChild(this.minimapEl);
        }

        // Apply fixed positioning styles based on fixedPosition
        this.minimapEl.style.position = 'absolute';
        this.applyFixedPosition();
      }
    } else if (this.options.position === 'top') {
      // Insert before the scroll container (outside, above it)
      if (parent) {
        parent.insertBefore(this.minimapEl, this.scrollContainer);
      } else {
        // Fallback: insert as first child of scroll container
        this.scrollContainer.insertBefore(this.minimapEl, this.scrollContainer.firstChild);
      }
    } else {
      // Insert after the scroll container (outside, below it)
      if (parent) {
        const nextSibling = this.scrollContainer.nextSibling;
        if (nextSibling) {
          parent.insertBefore(this.minimapEl, nextSibling);
        } else {
          parent.appendChild(this.minimapEl);
        }
      } else {
        this.scrollContainer.appendChild(this.minimapEl);
      }
    }
  }

  /**
   * Applies the configured fixed corner position to the minimap element.
   */
  private applyFixedPosition(): void {
    if (!this.minimapEl || this.options.position !== 'fixed') return;

    const offset = this.isCompactMode ? 8 : 12;
    const pos = this.options.fixedPosition;

    FIXED_POSITIONS.forEach((fixedPosition) => {
      this.minimapEl!.classList.remove(`tm-minimap--${fixedPosition}`);
    });
    this.minimapEl.classList.add(`tm-minimap--${pos}`);

    // Reset all positions first
    this.minimapEl.style.top = '';
    this.minimapEl.style.bottom = '';
    this.minimapEl.style.left = '';
    this.minimapEl.style.right = '';
    this.minimapEl.style.marginTop = '0';

    // Apply position based on fixedPosition option
    if (pos === 'top-left') {
      this.minimapEl.style.top = `${offset}px`;
      this.minimapEl.style.left = `${offset}px`;
    } else if (pos === 'top-right') {
      this.minimapEl.style.top = `${offset}px`;
      this.minimapEl.style.right = `${offset}px`;
    } else if (pos === 'bottom-left') {
      this.minimapEl.style.bottom = `${offset}px`;
      this.minimapEl.style.left = `${offset}px`;
    } else {
      // bottom-right (default)
      this.minimapEl.style.bottom = `${offset}px`;
      this.minimapEl.style.right = `${offset}px`;
    }
  }

  /**
   * Moves fixed minimaps to the next configured corner.
   */
  private cycleFixedPosition(): void {
    if (this.options.position !== 'fixed') return;

    const currentIndex = FIXED_POSITIONS.indexOf(this.options.fixedPosition);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % FIXED_POSITIONS.length : 0;
    this.options.fixedPosition = FIXED_POSITIONS[nextIndex];
    this.applyFixedPosition();
  }

  /**
   * Updates the scroll state from the container
   */
  private updateScrollState(): void {
    if (!this.scrollContainer) return;

    const { scrollLeft, scrollWidth, clientWidth } = this.scrollContainer;

    this.scrollState = {
      scrollLeft,
      scrollWidth,
      clientWidth,
      viewportRatio: clientWidth / Math.max(scrollWidth, 1),
      positionRatio: scrollLeft / Math.max(scrollWidth - clientWidth, 1),
    };

    // Clamp values
    this.scrollState.viewportRatio = Math.min(1, Math.max(0, this.scrollState.viewportRatio));
    this.scrollState.positionRatio = Math.min(1, Math.max(0, this.scrollState.positionRatio));

    // Update ARIA values
    if (this.minimapEl) {
      this.minimapEl.setAttribute(
        'aria-valuenow',
        String(Math.round(this.scrollState.positionRatio * 100))
      );
    }
  }

  /**
   * Renders the minimap
   */
  private render(): void {
    if (this.isDestroyed) return;

    if (this.isCompactMode && this.isCompactCollapsed) return;

    this.updateViewport();

    if (this.options.mode === 'canvas') {
      this.renderCanvas();
    }
  }

  /**
   * Canvas metrics for calculations - cached values to avoid repeated computations
   */
  private getCanvasMetrics() {
    const width = this.minimapEl?.offsetWidth ?? 0;
    const zoom = this.zoomState.level;
    const numCols = this.columns.length;
    const visibleRatio = 1 / zoom;
    const visibleCols = numCols * visibleRatio;
    const cellWidth = visibleCols > 0 ? width / visibleCols : 0;

    // Calculate panX based on scroll position
    let panX = 0;
    if (zoom > 1 && this.scrollContainer) {
      const { scrollLeft, scrollWidth, clientWidth } = this.scrollContainer;
      const maxScroll = Math.max(scrollWidth - clientWidth, 1);
      const scrollRatio = scrollLeft / maxScroll;
      panX = scrollRatio * (1 - visibleRatio);
    }

    const startColFloat = panX * numCols;
    const startCol = Math.floor(startColFloat);
    const endCol = Math.min(Math.ceil(startColFloat + visibleCols) + 1, numCols);
    const xOffset = -(startColFloat - startCol) * cellWidth;

    return {
      width,
      zoom,
      numCols,
      visibleRatio,
      visibleCols,
      cellWidth,
      panX,
      startColFloat,
      startCol,
      endCol,
      xOffset,
    };
  }

  /**
   * Calculates column index from mouse X position
   */
  private getColumnAtX(mouseX: number): number {
    const { width, numCols, panX, visibleRatio } = this.getCanvasMetrics();
    if (numCols === 0 || width === 0) return -1;

    const relativeX = mouseX / width;
    const tableX = panX + relativeX * visibleRatio;
    const colIndex = Math.floor(tableX * numCols);

    return Math.max(0, Math.min(numCols - 1, colIndex));
  }

  /**
   * Updates the viewport indicator position and size
   * Shows the visible portion of the table (columns mode only)
   */
  private updateViewport(): void {
    if (!this.viewportEl || !this.minimapEl) return;

    // No viewport in canvas mode
    if (this.options.mode === 'canvas') {
      this.viewportEl.style.display = 'none';
      return;
    }

    const minimapWidth = this.minimapEl.offsetWidth;
    
    // Columns mode: viewport showing visible area
    const viewportWidth = Math.max(minimapWidth * this.scrollState.viewportRatio, 20);
    const maxLeft = minimapWidth - viewportWidth;
    const viewportLeft = maxLeft * this.scrollState.positionRatio;
    this.viewportEl.style.cssText = `width:${viewportWidth}px;left:${viewportLeft}px;display:block`;
  }

  /**
   * Renders the canvas-mode visualization with table preview
   */
  private renderCanvas(): void {
    if (!this.canvasEl || !this.canvasCtx || !this.minimapEl) return;

    const metrics = this.getCanvasMetrics();
    const height = this.options.height;
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size with HiDPI support
    this.canvasEl.width = metrics.width * dpr;
    this.canvasEl.height = height * dpr;
    this.canvasEl.style.width = `${metrics.width}px`;
    this.canvasEl.style.height = `${height}px`;

    // Scale for HiDPI
    this.canvasCtx.scale(dpr, dpr);

    // Render table
    this.renderTableDirect(metrics, height);
  }

  /**
   * Renders the visible portion of the table directly onto the canvas
   */
  private renderTableDirect(
    metrics: ReturnType<typeof this.getCanvasMetrics>,
    height: number
  ): void {
    if (!this.canvasCtx) return;

    const ctx = this.canvasCtx;
    const { width, numCols, cellWidth, startCol, endCol, xOffset } = metrics;
    const rows = Array.from(this.table.querySelectorAll('tr'));
    const numRows = rows.length;

    if (numRows === 0 || numCols === 0) return;

    // Calculate dimensions
    const headerHeight = Math.min(height * 0.15, 30);
    const cellHeight = (height - headerHeight) / numRows;
    const fontSize = Math.min(cellHeight * 0.6, cellWidth * 0.15, 14);
    const headerFontSize = Math.min(headerHeight * 0.6, cellWidth * 0.15, 14);

    // Colors
    const colors = {
      bg: '#ffffff',
      headerBg: '#f1f5f9',
      border: '#e2e8f0',
      text: '#334155',
      headerText: '#1e293b',
      altRow: '#f8fafc',
      hoverFill: 'rgba(59, 130, 246, 0.08)',
      hoverStroke: 'rgba(59, 130, 246, 0.3)',
    };

    // Clear background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, width, height);

    // Draw header
    ctx.fillStyle = colors.headerBg;
    ctx.fillRect(0, 0, width, headerHeight);

    const headerRow = this.table.querySelector('thead tr') || rows[0];
    const headerCells = headerRow ? Array.from(headerRow.querySelectorAll('th, td')) : [];

    ctx.font = `bold ${headerFontSize}px system-ui, sans-serif`;
    ctx.textBaseline = 'middle';

    for (let col = startCol; col < endCol; col++) {
      const x = xOffset + (col - startCol) * cellWidth;
      if (x + cellWidth < 0 || x > width) continue;

      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, 0, cellWidth, headerHeight);

      const text = headerCells[col]?.textContent?.trim() || `Col ${col + 1}`;
      ctx.fillStyle = colors.headerText;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + 2, 0, cellWidth - 4, headerHeight);
      ctx.clip();
      ctx.fillText(text, x + 4, headerHeight / 2);
      ctx.restore();
    }

    // Draw data rows
    ctx.font = `${fontSize}px system-ui, sans-serif`;

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      if (row.closest('thead')) continue;

      const y = headerHeight + rowIndex * cellHeight;
      if (y + cellHeight < 0 || y > height) continue;

      // Alternate row background
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

    // Draw hover highlight
    if (this.hoveredColumn >= startCol && this.hoveredColumn < endCol) {
      const hoverX = xOffset + (this.hoveredColumn - startCol) * cellWidth;
      ctx.fillStyle = colors.hoverFill;
      ctx.fillRect(hoverX, 0, cellWidth, height);
      ctx.strokeStyle = colors.hoverStroke;
      ctx.lineWidth = 1;
      ctx.strokeRect(hoverX, 0, cellWidth, height);
    }
  }




  /**
   * Attaches event listeners
   */
  private attachEventListeners(): void {
    if (!this.scrollContainer || !this.minimapEl) return;

    // Scroll event on container
    this.scrollContainer.addEventListener('scroll', this.boundHandlers.onScroll, {
      passive: true,
    });

    // Click on minimap to jump
    this.minimapEl.addEventListener('click', this.boundHandlers.onMinimapClick);
    this.minimapEl.addEventListener('dblclick', this.boundHandlers.onMinimapDoubleClick);

    if (this.isCompactMode) {
      this.minimapEl.addEventListener('focusin', this.boundHandlers.onCompactFocusIn);
      this.minimapEl.addEventListener('focusout', this.boundHandlers.onCompactFocusOut);
      this.minimapEl.addEventListener('keydown', this.boundHandlers.onCompactKeyDown);
    }

    document.addEventListener('click', this.boundHandlers.onDocumentClick);
    document.addEventListener('keydown', this.boundHandlers.onDocumentKeyDown);

    // Drag events on viewport
    if (this.options.draggable && this.viewportEl) {
      this.viewportEl.addEventListener('pointerdown', this.boundHandlers.onPointerDown);
    }

    // Zoom events on canvas (wheel) - also listen on viewport so zoom works when hovering over it
    if (this.options.zoomable && this.options.mode === 'canvas' && this.canvasEl) {
      this.canvasEl.addEventListener('wheel', this.boundHandlers.onWheel, { passive: false });
      this.canvasEl.addEventListener('pointerdown', this.boundHandlers.onCanvasPointerDown);
      this.canvasEl.style.cursor = this.zoomState.level > 1 ? 'grab' : 'pointer';

      // Also listen on viewport for wheel events
      if (this.viewportEl) {
        this.viewportEl.addEventListener('wheel', this.boundHandlers.onWheel, { passive: false });
      }
    }

    // Hover events on canvas for column highlighting
    if (this.options.mode === 'canvas' && this.canvasEl) {
      this.canvasEl.addEventListener('mousemove', this.boundHandlers.onCanvasMouseMove);
      this.canvasEl.addEventListener('mouseleave', this.boundHandlers.onCanvasMouseLeave);

      if (this.options.canvasClipboard) {
        this.canvasEl.addEventListener('contextmenu', this.boundHandlers.onCanvasContextMenu);
      }
    }

    // Global pointer events for dragging
    document.addEventListener('pointermove', this.boundHandlers.onPointerMove);
    document.addEventListener('pointerup', this.boundHandlers.onPointerUp);
  }

  /**
   * Handles scroll events on the container
   */
  private onScroll(): void {
    if (this.isDragging) return;

    // Throttle with requestAnimationFrame
    if (this.rafId !== null) return;

    this.rafId = requestAnimationFrame(() => {
      this.updateScrollState();
      this.updateViewport();

      // Re-render canvas
      if (this.options.mode === 'canvas') {
        this.render();
      }

      this.rafId = null;
    });
  }

  /**
   * Handles click on the minimap to jump to position
   *
   * @param e - Mouse event
   */
  private onMinimapClick(e: MouseEvent): void {
    if (!this.minimapEl || !this.scrollContainer) return;

    if (this.isCompactMode && (this.isCompactCollapsed || this.isCompactExpanding)) {
      e.preventDefault();
      this.clearMinimapClickTimer();

      if (this.isCompactCollapsed) {
        this.expandCompact();
      }
      return;
    }

    if (this.options.position === 'fixed') {
      if (e.detail > 1) return;

      const clientX = e.clientX;
      this.clearMinimapClickTimer();
      this.minimapClickTimer = window.setTimeout(() => {
        this.minimapClickTimer = null;
        this.handleMinimapClick(clientX);
      }, DOUBLE_CLICK_DELAY);
      return;
    }

    this.handleMinimapClick(e.clientX);
  }

  /**
   * Handles double-click on fixed minimaps to move them to the next corner.
   *
   * @param e - Mouse event
   */
  private onMinimapDoubleClick(e: MouseEvent): void {
    if (this.options.position !== 'fixed') return;

    e.preventDefault();
    e.stopPropagation();
    this.clearMinimapClickTimer();
    this.cycleFixedPosition();
  }

  /**
   * Clears a pending delayed minimap click.
   */
  private clearMinimapClickTimer(): void {
    if (this.minimapClickTimer === null) return;

    clearTimeout(this.minimapClickTimer);
    this.minimapClickTimer = null;
  }

  /**
   * Handles single-click minimap navigation.
   *
   * @param clientX - Click position in viewport coordinates
   */
  private handleMinimapClick(clientX: number): void {
    if (!this.minimapEl || !this.scrollContainer) return;

    this.closeCanvasContextMenu();

    if (this.isCompactMode && this.isCompactCollapsed) {
      this.expandCompact();
      return;
    }

    // Ignore clicks during expansion transition, dragging, panning
    if (this.isCompactExpanding || this.isDragging || this.isPanning || this.wasPanning) return;

    const { scrollWidth, clientWidth } = this.scrollContainer;
    const maxScroll = scrollWidth - clientWidth;

    // Get click position relative to minimap
    const rect = this.minimapEl.getBoundingClientRect();
    const clickX = clientX - rect.left;

    // Canvas mode: scroll to center the clicked column
    if (this.options.mode === 'canvas') {
      const clickedColumn = this.getColumnAtX(clickX);

      if (clickedColumn >= 0) {
        const numCols = this.columns.length;
        const colWidth = scrollWidth / numCols;
        const colCenter = (clickedColumn + 0.5) * colWidth;
        const targetScroll = colCenter - clientWidth / 2;

        this.scrollContainer.scrollTo({
          left: Math.max(0, Math.min(maxScroll, targetScroll)),
          behavior: 'smooth',
        });
      }
      return;
    }

    // Columns mode: scroll to clicked position (percentage-based)
    const clickRatio = clickX / rect.width;
    const targetScroll = clickRatio * maxScroll;
    
    this.scrollContainer.scrollTo({
      left: Math.max(0, Math.min(maxScroll, targetScroll)),
      behavior: 'smooth',
    });
  }

  /**
   * Handles pointer down on viewport for drag start
   *
   * @param e - Pointer event
   */
  private onPointerDown(e: PointerEvent): void {
    if (!this.viewportEl || !this.scrollContainer) return;

    e.preventDefault();
    e.stopPropagation();

    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartScrollLeft = this.scrollContainer.scrollLeft;

    this.viewportEl.classList.add('tm-viewport--dragging');
    this.viewportEl.setPointerCapture(e.pointerId);
  }

  /**
   * Handles pointer move during drag
   *
   * @param e - Pointer event
   */
  private onPointerMove(e: PointerEvent): void {
    // Check if we should start panning (threshold check for potential pan)
    if (this.isPotentialPan && !this.isPanning && this.canvasEl && this.zoomState.level > 1) {
      const deltaX = Math.abs(e.clientX - this.panStartX);

      if (deltaX > CANVAS_PAN_THRESHOLD) {
        this.isPanning = true;
        this.canvasEl.style.cursor = 'grabbing';
      }
    }

    // Handle canvas dragging (scrolls the table)
    if (this.isPanning && this.canvasEl && this.minimapEl && this.scrollContainer) {
      e.preventDefault();
      this.pendingPanClientX = e.clientX;
      this.scheduleCanvasPan();
      return;
    }


    // Handle viewport dragging
    if (!this.isDragging || !this.minimapEl || !this.scrollContainer) return;

    e.preventDefault();

    const { scrollWidth, clientWidth } = this.scrollContainer;
    const minimapWidth = this.minimapEl.offsetWidth;
    const maxScroll = scrollWidth - clientWidth;

    // Scroll based on drag delta
    const deltaX = e.clientX - this.dragStartX;
    const scrollDelta = (deltaX / minimapWidth) * maxScroll;
    const newScrollLeft = this.dragStartScrollLeft + scrollDelta;

    this.scrollContainer.scrollLeft = Math.max(0, Math.min(maxScroll, newScrollLeft));
    this.updateScrollState();
    this.updateViewport();
  }

  /**
   * Schedules canvas panning work for the next animation frame.
   */
  private scheduleCanvasPan(): void {
    if (this.canvasPanRafId !== null) return;

    this.canvasPanRafId = requestAnimationFrame(() => {
      this.canvasPanRafId = null;
      this.applyCanvasPan();
    });
  }

  /**
   * Applies pending canvas pan movement using a dampened scroll ratio.
   */
  private applyCanvasPan(): void {
    if (
      !this.isPanning ||
      this.pendingPanClientX === null ||
      !this.minimapEl ||
      !this.scrollContainer
    ) {
      return;
    }

    const deltaX = this.panStartX - this.pendingPanClientX;
    const minimapWidth = Math.max(this.minimapEl.offsetWidth, 1);
    const { scrollWidth, clientWidth } = this.scrollContainer;
    const maxScroll = Math.max(scrollWidth - clientWidth, 0);
    const visibleRatio = 1 / Math.max(this.zoomState.level, 1);

    // In zoomed canvas mode the minimap represents only the visible slice.
    // Invert pointer delta so dragging left/right moves the table in the same perceived direction.
    // Scaling by visibleRatio makes left/right panning much less jumpy at high zoom levels.
    const scrollDelta =
      (deltaX / minimapWidth) * maxScroll * visibleRatio * CANVAS_PAN_SENSITIVITY;

    this.scrollContainer.scrollLeft = Math.max(
      0,
      Math.min(maxScroll, this.dragStartScrollLeft + scrollDelta)
    );

    this.updateScrollState();
    this.updateViewport();
    this.render();
  }

  /**
   * Cancels any pending canvas pan frame.
   */
  private clearCanvasPanFrame(): void {
    if (this.canvasPanRafId === null) return;

    cancelAnimationFrame(this.canvasPanRafId);
    this.canvasPanRafId = null;
  }

  /**
   * Handles pointer up to end drag
   *
   * @param e - Pointer event
   */
  private onPointerUp(e: PointerEvent): void {
    // Handle potential pan that was actually a click
    if (this.isPotentialPan && !this.isPanning && this.canvasEl && this.minimapEl && e.button === 0) {
      this.isPotentialPan = false;
      this.pendingPanClientX = null;

      if (this.canvasEl.hasPointerCapture(e.pointerId)) {
        this.canvasEl.releasePointerCapture(e.pointerId);
      }

      // Simulate a click on the minimap at this position
      const clickEvent = new MouseEvent('click', {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: true,
      });
      this.minimapEl.dispatchEvent(clickEvent);
      return;
    }

    this.isPotentialPan = false;

    // End canvas panning
    if (this.isPanning && this.canvasEl) {
      this.applyCanvasPan();
      this.clearCanvasPanFrame();
      this.pendingPanClientX = null;
      this.isPanning = false;
      this.wasPanning = true;

      if (this.canvasEl.hasPointerCapture(e.pointerId)) {
        this.canvasEl.releasePointerCapture(e.pointerId);
      }

      this.canvasEl.style.cursor = this.zoomState.level > 1 ? 'grab' : 'pointer';

      // Reset wasPanning after a short delay to allow click event to be ignored
      setTimeout(() => {
        this.wasPanning = false;
      }, 100);
    }

    // End viewport dragging
    if (this.isDragging) {
      this.isDragging = false;

      if (this.viewportEl) {
        this.viewportEl.classList.remove('tm-viewport--dragging');
        this.viewportEl.releasePointerCapture(e.pointerId);
      }
    }
  }

  /**
   * Handles wheel events for zoom
   *
   * @param e - Wheel event
   */
  private onWheel(e: WheelEvent): void {
    if (!this.options.zoomable || this.options.mode !== 'canvas') return;
    if (!this.canvasEl || !this.scrollContainer || !this.minimapEl) return;

    e.preventDefault();

    const oldZoom = this.zoomState.level;
    const delta = -e.deltaY * this.options.zoomSpeed;
    const newZoom = Math.max(
      this.options.minZoom,
      Math.min(this.options.maxZoom, oldZoom + delta)
    );

    if (newZoom === oldZoom) return;

    // Get mouse position relative to canvas
    const rect = this.canvasEl.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const width = this.minimapEl.offsetWidth;
    const relativeX = mouseX / width; // 0-1 position in canvas

    // Calculate the table position (0-1) under the mouse BEFORE zoom
    const oldVisibleRatio = 1 / oldZoom;
    const { scrollLeft, scrollWidth, clientWidth } = this.scrollContainer;
    const maxScroll = Math.max(scrollWidth - clientWidth, 1);
    const oldScrollRatio = scrollLeft / maxScroll;
    const oldPanX = oldZoom > 1 ? oldScrollRatio * (1 - oldVisibleRatio) : 0;
    const tableX = oldPanX + relativeX * oldVisibleRatio; // Position in table (0-1)

    // Update zoom level
    this.zoomState = {
      level: newZoom,
      panX: 0,
      isMinZoom: newZoom <= this.options.minZoom,
      isMaxZoom: newZoom >= this.options.maxZoom,
    };

    // Calculate new scroll position to keep tableX under the mouse
    const newVisibleRatio = 1 / newZoom;

    if (newZoom > 1) {
      // newPanX + relativeX * newVisibleRatio = tableX
      // newPanX = tableX - relativeX * newVisibleRatio
      // newScrollRatio * (1 - newVisibleRatio) = newPanX
      // newScrollRatio = newPanX / (1 - newVisibleRatio)
      const newPanX = tableX - relativeX * newVisibleRatio;
      const newScrollRatio = newPanX / (1 - newVisibleRatio);
      const newScrollLeft = Math.max(0, Math.min(maxScroll, newScrollRatio * maxScroll));

      this.scrollContainer.scrollLeft = newScrollLeft;
    }

    this.updateScrollState();
    this.render();
  }

  /** Whether we started a potential pan (waiting to see if it's a click or drag) */
  private isPotentialPan = false;

  /**
   * Handles pointer down on canvas for drag start (scrolls table when zoomed)
   *
   * @param e - Pointer event
   */
  private onCanvasPointerDown(e: PointerEvent): void {
    if (!this.canvasEl || !this.scrollContainer) return;

    // Keep right-click free for the canvas context menu.
    if (e.button !== 0) return;

    // At any zoom level, track potential pan/click
    this.isPotentialPan = true;
    this.panStartX = e.clientX;
    this.dragStartScrollLeft = this.scrollContainer.scrollLeft;

    // Only capture for panning at zoom > 1
    if (this.zoomState.level > 1) {
      e.preventDefault();
      this.canvasEl.setPointerCapture(e.pointerId);
    }
  }

  /**
   * Handles mouse move on canvas for column hover highlighting
   */
  private onCanvasMouseMove(e: MouseEvent): void {
    if (!this.canvasEl || this.isPanning) return;

    const rect = this.canvasEl.getBoundingClientRect();
    const newHoveredColumn = this.getColumnAtX(e.clientX - rect.left);

    if (newHoveredColumn !== this.hoveredColumn) {
      this.hoveredColumn = newHoveredColumn;
      this.canvasEl.style.cursor = newHoveredColumn >= 0 ? 'pointer' : (this.zoomState.level > 1 ? 'grab' : 'default');
      this.render();
    }
  }

  /**
   * Handles mouse leave on canvas to clear hover state
   */
  private onCanvasMouseLeave(): void {
    if (this.hoveredColumn !== -1) {
      this.hoveredColumn = -1;
      if (this.canvasEl) {
        this.canvasEl.style.cursor = this.zoomState.level > 1 ? 'grab' : 'default';
      }
      this.render();
    }
  }

  /**
   * Handles context menu opening on a canvas column.
   */
  private onCanvasContextMenu(e: MouseEvent): void {
    if (!this.canvasEl || !this.options.canvasClipboard) return;

    e.preventDefault();

    const rect = this.canvasEl.getBoundingClientRect();
    const columnIndex = this.getColumnAtX(e.clientX - rect.left);
    if (columnIndex < 0) return;

    this.hoveredColumn = columnIndex;
    this.render();
    this.openCanvasContextMenu(e.clientX, e.clientY, columnIndex);
  }

  /**
   * Creates the canvas clipboard context menu element on demand.
   */
  private ensureCanvasContextMenu(): void {
    if (this.canvasContextMenuEl) return;

    const menu = document.createElement('div');
    menu.className = 'tm-canvas-context-menu';
    menu.style.display = 'none';

    const copyAction = document.createElement('div');
    copyAction.className = 'tm-canvas-context-menu__action';
    copyAction.textContent = this.options.canvasClipboardLabel;
    copyAction.setAttribute('role', 'button');
    copyAction.setAttribute('tabindex', '0');

    const status = document.createElement('div');
    status.className = 'tm-canvas-context-menu__status';
    status.setAttribute('aria-live', 'polite');

    copyAction.addEventListener('click', () => {
      if (this.canvasContextColumnIndex < 0) return;
      void this.copyColumnToClipboard(this.canvasContextColumnIndex);
    });

    copyAction.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      if (this.canvasContextColumnIndex < 0) return;
      void this.copyColumnToClipboard(this.canvasContextColumnIndex);
    });

    menu.appendChild(copyAction);
    menu.appendChild(status);
    document.body.appendChild(menu);

    this.canvasContextMenuEl = menu;
    this.canvasContextCopyActionEl = copyAction;
    this.canvasContextStatusEl = status;
  }

  /**
   * Opens the canvas clipboard context menu near the pointer.
   */
  private openCanvasContextMenu(clientX: number, clientY: number, columnIndex: number): void {
    this.ensureCanvasContextMenu();
    if (!this.canvasContextMenuEl || !this.canvasContextStatusEl) return;

    this.canvasContextColumnIndex = columnIndex;
    const header = this.getColumnHeaderText(columnIndex);
    this.canvasContextStatusEl.textContent = `Column: ${header}`;

    this.canvasContextMenuEl.style.display = 'block';
    this.canvasContextMenuEl.style.visibility = 'hidden';

    const menuWidth = this.canvasContextMenuEl.offsetWidth;
    const menuHeight = this.canvasContextMenuEl.offsetHeight;
    const maxLeft = Math.max(8, window.innerWidth - menuWidth - 8);
    const maxTop = Math.max(8, window.innerHeight - menuHeight - 8);
    const left = Math.max(8, Math.min(clientX, maxLeft));
    const top = Math.max(8, Math.min(clientY, maxTop));

    this.canvasContextMenuEl.style.left = `${left}px`;
    this.canvasContextMenuEl.style.top = `${top}px`;
    this.canvasContextMenuEl.style.visibility = 'visible';
    this.canvasContextCopyActionEl?.focus();
  }

  /**
   * Closes the canvas clipboard context menu.
   */
  private closeCanvasContextMenu(): void {
    if (!this.canvasContextMenuEl) return;

    this.canvasContextMenuEl.style.display = 'none';
    this.canvasContextMenuEl.style.visibility = 'hidden';
    this.canvasContextColumnIndex = -1;
  }

  /**
   * Gets display text for a column header.
   */
  private getColumnHeaderText(columnIndex: number): string {
    const headerRow = this.table.querySelector('thead tr') || this.table.querySelector('tr');
    if (!headerRow) {
      return `Column ${columnIndex + 1}`;
    }

    const headerCells = Array.from(headerRow.querySelectorAll('th, td'));
    const headerText = headerCells[columnIndex]?.textContent?.trim();
    return headerText || `Column ${columnIndex + 1}`;
  }

  /**
   * Builds clipboard text for a single column (header + non-empty rows).
   */
  private getColumnClipboardText(columnIndex: number): string {
    const header = this.getColumnHeaderText(columnIndex);
    const bodyRows = Array.from(this.table.querySelectorAll('tbody tr'));
    const rows =
      bodyRows.length > 0
        ? bodyRows
        : Array.from(this.table.querySelectorAll('tr')).filter((row) => !row.closest('thead'));

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
  private async writeClipboardText(text: string): Promise<boolean> {
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
   * Copies the selected column content to the clipboard.
   */
  private async copyColumnToClipboard(columnIndex: number): Promise<void> {
    if (!this.canvasContextStatusEl) return;

    const text = this.getColumnClipboardText(columnIndex);

    try {
      const copied = await this.writeClipboardText(text);
      this.canvasContextStatusEl.textContent = copied
        ? 'Column copied to clipboard.'
        : 'Copy failed in this browser.';
    } catch {
      this.canvasContextStatusEl.textContent = 'Clipboard access denied.';
      return;
    }

    window.setTimeout(() => {
      this.closeCanvasContextMenu();
    }, 180);
  }

  /**
   * Expands the compact minimap and clears any pending collapse.
   */
  private expandCompact(): void {
    if (!this.isCompactMode || !this.minimapEl || this.isCompactExpanding) return;

    this.clearCompactCollapseTimer();
    this.isCompactExpanding = true;
    this.applyCompactDimensions(false);
    
    // Wait for CSS transition to complete before rendering
    // This ensures correct dimensions are used for viewport calculation
    setTimeout(() => {
      this.isCompactExpanding = false;
      if (!this.isDestroyed && !this.isCompactCollapsed) {
        this.updateScrollState();
        this.render();
      }
    }, 200); // Slightly longer than transition duration (180ms)
  }

  /**
   * Collapses the compact minimap to the small dot handle.
   */
  private collapseCompact(): void {
    if (!this.isCompactMode || !this.minimapEl) return;

    this.applyCompactDimensions(true);
  }

  /**
   * Applies compact sizing/state to the minimap.
   */
  private applyCompactDimensions(collapsed: boolean): void {
    if (!this.minimapEl || !this.isCompactMode) return;

    this.isCompactCollapsed = collapsed;

    if (collapsed) {
      this.minimapEl.classList.add('tm-minimap--compact-collapsed');
      this.minimapEl.classList.remove('tm-minimap--compact-expanded');
      this.minimapEl.style.setProperty('--tm-minimap-width', `${COMPACT_HANDLE_SIZE}px`);
      this.minimapEl.style.setProperty('--tm-minimap-height', `${COMPACT_HANDLE_SIZE}px`);
      this.minimapEl.setAttribute('aria-expanded', 'false');
      return;
    }

    this.minimapEl.classList.remove('tm-minimap--compact-collapsed');
    this.minimapEl.classList.add('tm-minimap--compact-expanded');
    this.minimapEl.style.setProperty('--tm-minimap-width', `${this.options.fixedWidth}px`);
    this.minimapEl.style.setProperty('--tm-minimap-height', `${this.options.height}px`);
    this.minimapEl.setAttribute('aria-expanded', 'true');
  }

  /**
   * Clears a pending compact collapse timer.
   */
  private clearCompactCollapseTimer(): void {
    if (this.compactCollapseTimer === null) return;

    clearTimeout(this.compactCollapseTimer);
    this.compactCollapseTimer = null;
  }

  /**
   * Schedules the compact minimap to collapse.
   */
  private scheduleCompactCollapse(delay = COMPACT_COLLAPSE_DELAY): void {
    if (!this.isCompactMode) return;

    this.clearCompactCollapseTimer();
    this.compactCollapseTimer = window.setTimeout(() => {
      this.collapseCompact();
      this.compactCollapseTimer = null;
    }, delay);
  }

  /**
   * Handles document click for closing compact mode when clicking outside.
   */
  private onDocumentClick(e: MouseEvent): void {
    const target = e.target as Node | null;

    if (
      this.canvasContextMenuEl &&
      this.canvasContextMenuEl.style.display !== 'none' &&
      target &&
      !this.canvasContextMenuEl.contains(target)
    ) {
      this.closeCanvasContextMenu();
    }

    if (!this.isCompactMode || !this.minimapEl || this.isCompactCollapsed || !target) return;

    // Check if click is outside the minimap
    if (!this.minimapEl.contains(target)) {
      this.collapseCompact();
    }
  }

  /**
   * Handles global Escape to close the canvas context menu.
   */
  private onDocumentKeyDown(e: KeyboardEvent): void {
    if (e.key !== 'Escape') return;

    if (this.canvasContextMenuEl && this.canvasContextMenuEl.style.display !== 'none') {
      e.preventDefault();
      this.closeCanvasContextMenu();
    }
  }

  /**
   * Handles focus entering compact mode.
   */
  private onCompactFocusIn(): void {
    if (!this.isCompactMode) return;

    this.expandCompact();
  }

  /**
   * Handles focus leaving compact mode.
   */
  private onCompactFocusOut(): void {
    if (!this.isCompactMode) return;

    this.scheduleCompactCollapse(0);
  }

  /**
   * Keyboard interactions for compact mode.
   */
  private onCompactKeyDown(e: KeyboardEvent): void {
    if (!this.isCompactMode) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.collapseCompact();
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (this.isCompactCollapsed) {
        this.expandCompact();
      } else {
        this.collapseCompact();
      }
    }
  }

  /**
   * Sets up ResizeObserver and MutationObserver
   */
  private setupObservers(): void {
    // ResizeObserver for responsive updates
    this.resizeObserver = new ResizeObserver(() => {
      this.onResize();
    });

    if (this.scrollContainer) {
      this.resizeObserver.observe(this.scrollContainer);
    }
    this.resizeObserver.observe(this.table);

    // MutationObserver for table structure changes
    this.mutationObserver = new MutationObserver((mutations) => {
      const hasStructuralChanges = mutations.some(
        (m) => m.type === 'childList' || m.attributeName === 'colspan'
      );

      if (hasStructuralChanges) {
        this.onTableMutation();
      }
    });

    this.mutationObserver.observe(this.table, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['colspan'],
    });
  }

  /**
   * Handles resize events
   */
  private onResize(): void {
    if (this.isDestroyed) return;

    // Debounce resize handling
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }

    this.rafId = requestAnimationFrame(() => {
      this.detectColumns();
      this.updateScrollState();

      this.render();

      // Rebuild columns if in columns mode
      if (this.options.mode === 'columns' && this.columnsEl && this.minimapEl) {
        this.columnsEl.innerHTML = '';
        this.columns.forEach(() => {
          const colEl = document.createElement('div');
          colEl.className = 'tm-column';
          this.columnsEl!.appendChild(colEl);
        });
      }

      this.rafId = null;
    });
  }

  /**
   * Handles table mutation events
   */
  private onTableMutation(): void {
    if (this.isDestroyed) return;

    this.detectColumns();
    this.updateScrollState();

    this.render();

    // Rebuild columns if in columns mode
    if (this.options.mode === 'columns' && this.columnsEl) {
      this.columnsEl.innerHTML = '';
      this.columns.forEach(() => {
        const colEl = document.createElement('div');
        colEl.className = 'tm-column';
        this.columnsEl!.appendChild(colEl);
      });
    }
  }

  /**
   * Gets the current scroll state
   *
   * @returns Current scroll state
   */
  public getScrollState(): ScrollState {
    return { ...this.scrollState };
  }

  /**
   * Gets the detected columns
   *
   * @returns Array of column information
   */
  public getColumns(): ColumnInfo[] {
    return [...this.columns];
  }

  /**
   * Scrolls to a specific column
   *
   * @param columnIndex - Zero-based column index
   * @param smooth - Use smooth scrolling
   */
  public scrollToColumn(columnIndex: number, smooth = true): void {
    if (!this.scrollContainer || columnIndex < 0 || columnIndex >= this.columns.length) {
      return;
    }

    const cellsBefore = this.columns.slice(0, columnIndex);
    const offsetLeft = cellsBefore.reduce((sum, col) => sum + col.width, 0);

    this.scrollContainer.scrollTo({
      left: offsetLeft,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }

  /**
   * Forces a refresh of the minimap
   */
  public refresh(): void {
    if (this.isDestroyed) return;

    this.scrollContainer = this.findScrollContainer();
    this.detectColumns();
    this.updateScrollState();

    this.render();

    if (this.options.mode === 'columns' && this.columnsEl) {
      this.columnsEl.innerHTML = '';
      this.columns.forEach(() => {
        const colEl = document.createElement('div');
        colEl.className = 'tm-column';
        this.columnsEl!.appendChild(colEl);
      });
    }
  }

  /**
   * Gets the current zoom state (canvas mode only)
   *
   * @returns Current zoom state
   */
  public getZoomState(): ZoomState {
    return { ...this.zoomState };
  }

  /**
   * Sets the zoom level programmatically (canvas mode only)
   *
   * @param level - Zoom level (1 = no zoom)
   * @param panX - Optional pan position (0-1), controls which part of table is visible
   */
  public setZoom(level: number, panX?: number): void {
    if (this.isDestroyed || this.options.mode !== 'canvas' || !this.scrollContainer) return;

    const newZoom = Math.max(
      this.options.minZoom,
      Math.min(this.options.maxZoom, level)
    );

    const visibleRange = 1 / newZoom;
    const maxPanX = 1 - visibleRange;

    let newPanX = panX !== undefined ? panX : 0;
    newPanX = Math.max(0, Math.min(maxPanX, newPanX));

    this.zoomState = {
      level: newZoom,
      panX: 0, // Not used - panX is derived from scroll position
      isMinZoom: newZoom <= this.options.minZoom,
      isMaxZoom: newZoom >= this.options.maxZoom,
    };

    // Set scroll position to match the desired panX
    if (newZoom > 1 && newPanX > 0) {
      const { scrollWidth, clientWidth } = this.scrollContainer;
      const maxScroll = Math.max(scrollWidth - clientWidth, 1);
      // panX = scrollRatio * (1 - visibleRatio)
      // scrollRatio = panX / (1 - visibleRatio)
      const scrollRatio = newPanX / (1 - visibleRange);
      this.scrollContainer.scrollLeft = Math.max(0, Math.min(maxScroll, scrollRatio * maxScroll));
    } else if (newZoom <= 1) {
      this.scrollContainer.scrollLeft = 0;
    }

    this.updateScrollState();
    this.render();
  }

  /**
   * Resets zoom to default (shows full table overview)
   */
  public resetZoom(): void {
    this.setZoom(1, 0);
  }

  /**
   * Zooms to a specific column range (canvas mode only)
   *
   * @param startCol - Start column index
   * @param endCol - End column index
   */
  public zoomToColumns(startCol: number, endCol: number): void {
    if (this.isDestroyed || this.options.mode !== 'canvas') return;

    const numCols = this.columns.length;
    if (numCols === 0) return;

    // Clamp column indices
    const start = Math.max(0, Math.min(numCols - 1, startCol));
    const end = Math.max(start + 1, Math.min(numCols, endCol));

    const colRange = end - start;
    const zoom = numCols / colRange;
    const panX = start / numCols;

    this.setZoom(zoom, panX);
  }

  /**
   * Destroys the minimap instance and cleans up resources
   */
  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    this.clearCompactCollapseTimer();
    this.clearMinimapClickTimer();
    this.clearCanvasPanFrame();
    this.pendingPanClientX = null;

    // Cancel any pending animation frame
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Remove event listeners
    if (this.scrollContainer) {
      this.scrollContainer.removeEventListener('scroll', this.boundHandlers.onScroll);
    }

    if (this.minimapEl) {
      this.minimapEl.removeEventListener('click', this.boundHandlers.onMinimapClick);
      this.minimapEl.removeEventListener('dblclick', this.boundHandlers.onMinimapDoubleClick);
      this.minimapEl.removeEventListener('focusin', this.boundHandlers.onCompactFocusIn);
      this.minimapEl.removeEventListener('focusout', this.boundHandlers.onCompactFocusOut);
      this.minimapEl.removeEventListener('keydown', this.boundHandlers.onCompactKeyDown);
    }

    document.removeEventListener('click', this.boundHandlers.onDocumentClick);
    document.removeEventListener('keydown', this.boundHandlers.onDocumentKeyDown);

    if (this.viewportEl) {
      this.viewportEl.removeEventListener('pointerdown', this.boundHandlers.onPointerDown);
      this.viewportEl.removeEventListener('wheel', this.boundHandlers.onWheel);
    }

    if (this.canvasEl) {
      this.canvasEl.removeEventListener('wheel', this.boundHandlers.onWheel);
      this.canvasEl.removeEventListener('pointerdown', this.boundHandlers.onCanvasPointerDown);
      this.canvasEl.removeEventListener('mousemove', this.boundHandlers.onCanvasMouseMove);
      this.canvasEl.removeEventListener('mouseleave', this.boundHandlers.onCanvasMouseLeave);
      this.canvasEl.removeEventListener('contextmenu', this.boundHandlers.onCanvasContextMenu);
    }

    if (this.canvasContextMenuEl) {
      this.canvasContextMenuEl.remove();
      this.canvasContextMenuEl = null;
      this.canvasContextCopyActionEl = null;
      this.canvasContextStatusEl = null;
      this.canvasContextColumnIndex = -1;
    }

    document.removeEventListener('pointermove', this.boundHandlers.onPointerMove);
    document.removeEventListener('pointerup', this.boundHandlers.onPointerUp);

    // Disconnect observers
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    // Remove DOM elements
    if (this.minimapEl && this.minimapEl.parentNode) {
      this.minimapEl.parentNode.removeChild(this.minimapEl);
    }

    // Clear references
    this.minimapEl = null;
    this.columnsEl = null;
    this.canvasEl = null;
    this.canvasCtx = null;
    this.viewportEl = null;
    this.scrollContainer = null;
    this.columns = [];
  }
}
