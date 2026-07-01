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
   * Double-click fixed minimaps to cycle to the next corner.
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

  /**
   * Enable right-click context menu in canvas mode to copy a column to clipboard
   * @default false
   */
  canvasClipboard?: boolean;

  /**
   * Label text used for the canvas clipboard action (useful for i18n)
   * @default "Copy column to clipboard"
   */
  canvasClipboardLabel?: string;

  /**
   * Enable right-click context menu action to mark/unmark canvas columns
   * @default false
   */
  canvasColumnMarking?: boolean;

  /**
   * Label text used for the mark action in the canvas context menu
   * @default "Mark column"
   */
  canvasMarkColumnLabel?: string;

  /**
   * Label text used for the unmark action in the canvas context menu
   * @default "Unmark column"
   */
  canvasUnmarkColumnLabel?: string;

  /**
   * Label text used for the unmark-all action in the canvas context menu
   * @default "Unmark all columns"
   */
  canvasUnmarkAllColumnsLabel?: string;

  /**
   * Enable right-click context menu action to collapse/expand table columns
   * @default false
   */
  canvasColumnHiding?: boolean;

  /**
   * Label text used for the hide action in the canvas context menu
   * @default "Collapse column"
   */
  canvasHideColumnLabel?: string;

  /**
   * Label text used for the show action in the canvas context menu
   * @default "Expand column"
   */
  canvasShowColumnLabel?: string;

  /**
   * Label text used for the show-all action in the canvas context menu
   * @default "Expand all columns"
   */
  canvasShowAllColumnsLabel?: string;

  /**
   * Width in pixels for collapsed table columns
   * @default 10
   */
  collapsedColumnWidth?: number;

  /**
   * Enable Finder-like selection of canvas columns
   * Single click selects one column, shift-click selects a range,
   * command/control-click toggles individual columns
   * @default false
   */
  canvasColumnSelection?: boolean;

  /**
   * Initially marked canvas column indices
   * @default []
   */
  markedColumns?: number[];

  /**
   * Initially collapsed canvas column indices
   * @default []
   */
  hiddenColumns?: number[];

  /**
   * Initially selected canvas column indices
   * @default []
   */
  selectedColumns?: number[];

  /**
   * Called whenever marked canvas columns change
   */
  onMarkedColumnsChange?: (details: CanvasMarkedColumnsChangeDetails) => void;

  /**
   * Called whenever collapsed canvas columns change
   */
  onHiddenColumnsChange?: (details: CanvasHiddenColumnsChangeDetails) => void;

  /**
   * Called whenever selected canvas columns change
   */
  onSelectedColumnsChange?: (details: CanvasSelectedColumnsChangeDetails) => void;
}

/**
 * Payload emitted when canvas column marks are changed.
 */
export interface CanvasMarkedColumnsChangeDetails {
  /** Current list of marked column indices (sorted ascending) */
  markedColumns: number[];
  /** Column changed by the latest action, if available */
  changedColumnIndex: number | null;
  /** New marked state of changedColumnIndex, if available */
  isMarked: boolean | null;
  /** Header labels for marked columns (same order as markedColumns) */
  headers: string[];
  /** Source table element */
  table: HTMLTableElement;
}

/**
 * Payload emitted when canvas column collapsed state changes.
 */
export interface CanvasHiddenColumnsChangeDetails {
  /** Current list of collapsed column indices (sorted ascending) */
  hiddenColumns: number[];
  /** Column changed by the latest action, if available */
  changedColumnIndex: number | null;
  /** New collapsed state of changedColumnIndex, if available */
  isHidden: boolean | null;
  /** Header labels for collapsed columns (same order as hiddenColumns) */
  headers: string[];
  /** Source table element */
  table: HTMLTableElement;
}

/**
 * Payload emitted when canvas column selection changes.
 */
export interface CanvasSelectedColumnsChangeDetails {
  /** Current list of selected column indices (sorted ascending) */
  selectedColumns: number[];
  /** Column changed by the latest action, if available */
  changedColumnIndex: number | null;
  /** New selected state of changedColumnIndex, if available */
  isSelected: boolean | null;
  /** Header labels for selected columns (same order as selectedColumns) */
  headers: string[];
  /** Source table element */
  table: HTMLTableElement;
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
 * Required default options
 */
export type RequiredOptions = Required<TableMinimapOptions>;

/**
 * Table element selector type
 */
export type TableSelector = string | HTMLTableElement;
