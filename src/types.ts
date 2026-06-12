/**
 * Configuration options for the TableMinimap component
 */
export interface TableMinimapOptions {
  /**
   * Rendering mode for the minimap
   * - "columns": Simple column-based visualization (default)
   * - "canvas": VS Code-like compressed pixel preview
   */
  mode?: 'columns' | 'canvas';

  /**
   * Height of the minimap in pixels
   * @default 40
   */
  height?: number;

  /**
   * Position of the minimap relative to the table
   * - "top": Above the table
   * - "bottom": Below the table
   * - "fixed": Floating overlay at bottom-right corner of the table
   * @default "bottom"
   */
  position?: 'top' | 'bottom' | 'fixed';

  /**
   * Width of the minimap when using position: 'fixed'
   * @default 300
   */
  fixedWidth?: number;

  /**
   * Corner position when using position: 'fixed'
   * @default "bottom-right"
   */
  fixedPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /**
   * Enable compact floating mode for fixed minimaps.
   * When enabled, the minimap collapses into a small dot handle in the
   * bottom-right corner and expands on hover/focus/click.
   * @default false
   */
  compact?: boolean;

  /**
   * Enable drag navigation on the viewport indicator
   * @default true
   */
  draggable?: boolean;

  /**
   * Show the viewport indicator
   * @default true
   */
  showViewport?: boolean;

  /**
   * Enable zoom functionality in canvas mode (scroll wheel to zoom)
   * @default false
   */
  zoomable?: boolean;

  /**
   * Minimum zoom level (1 = no zoom, showing full table)
   * @default 1
   */
  minZoom?: number;

  /**
   * Maximum zoom level
   * @default 10
   */
  maxZoom?: number;

  /**
   * Zoom speed multiplier (higher = faster zoom)
   * @default 0.1
   */
  zoomSpeed?: number;
}

/**
 * Zoom state information
 */
export interface ZoomState {
  /** Current zoom level (1 = no zoom) */
  level: number;
  /** @deprecated Pan offset is now derived from scroll position */
  panX: number;
  /** Whether zoom is at minimum (showing full overview) */
  isMinZoom: boolean;
  /** Whether zoom is at maximum */
  isMaxZoom: boolean;
}

/**
 * Internal representation of a table column
 */
export interface ColumnInfo {
  /** Zero-based index of the column */
  index: number;
  /** Width of the column in pixels */
  width: number;
  /** Percentage width relative to total table width */
  widthPercent: number;
}

/**
 * Scroll state information
 */
export interface ScrollState {
  /** Current horizontal scroll position */
  scrollLeft: number;
  /** Maximum scrollable width */
  scrollWidth: number;
  /** Visible width of the container */
  clientWidth: number;
  /** Viewport width as a ratio (0-1) */
  viewportRatio: number;
  /** Viewport position as a ratio (0-1) */
  positionRatio: number;
}

/**
 * Cell data for canvas rendering
 */
export interface CellData {
  /** Row index */
  row: number;
  /** Column index */
  col: number;
  /** Whether the cell has content */
  hasContent: boolean;
  /** Content density (0-1) for color intensity */
  density: number;
}

/**
 * Required default options
 */
export type RequiredOptions = Required<TableMinimapOptions>;

/**
 * Table element selector type
 */
export type TableSelector = string | HTMLTableElement;

