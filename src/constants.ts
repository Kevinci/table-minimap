import type { RequiredOptions } from './types';

/**
 * Default configuration options
 */
export const DEFAULT_OPTIONS: RequiredOptions = {
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
  canvasColumnMarking: false,
  canvasMarkColumnLabel: 'Mark column',
  canvasUnmarkColumnLabel: 'Unmark column',
  canvasUnmarkAllColumnsLabel: 'Unmark all columns',
  canvasColumnHiding: false,
  canvasHideColumnLabel: 'Collapse column',
  canvasShowColumnLabel: 'Expand column',
  canvasShowAllColumnsLabel: 'Expand all columns',
  collapsedColumnWidth: 10,
  canvasColumnSelection: false,
  markedColumns: [],
  hiddenColumns: [],
  selectedColumns: [],
  onMarkedColumnsChange: () => {},
  onHiddenColumnsChange: () => {},
  onSelectedColumnsChange: () => {},
};

/** CSS class applied to collapsed cells inside the real table */
export const COLLAPSED_TABLE_CELL_CLASS = 'tm-table-cell--collapsed';

/** Compact floating minimap handle size in pixels */
export const COMPACT_HANDLE_SIZE = 24;

/** Visible dot size inside the compact handle in pixels */
export const COMPACT_DOT_SIZE = 5;

/** Delay before compact mode collapses after pointer leave */
export const COMPACT_COLLAPSE_DELAY = 180;

/** Delay used to distinguish single click navigation from double-click repositioning */
export const DOUBLE_CLICK_DELAY = 180;

/** Suppression window to ignore synthetic click after a viewport drag ends */
export const DRAG_CLICK_SUPPRESS_MS = 220;

/** Fixed corner positions used when cycling the minimap by double-click */
export const FIXED_POSITIONS: RequiredOptions['fixedPosition'][] = [
  'bottom-right',
  'bottom-left',
  'top-left',
  'top-right',
];

/** Pixels before a canvas pointer interaction is treated as panning instead of click */
export const CANVAS_PAN_THRESHOLD = 3;

/** Multiplier for canvas drag-to-scroll movement; lower values feel smoother */
export const CANVAS_PAN_SENSITIVITY = 0.85;

/** Double-tap threshold in milliseconds */
export const DOUBLE_TAP_THRESHOLD = 300;

/** Maximum distance in pixels for a double-tap to register */
export const DOUBLE_TAP_DISTANCE = 30;

/** Single tap delay before treating as navigation tap */
export const SINGLE_TAP_DELAY = 280;

/** Long-press threshold in milliseconds for context menu on mobile */
export const LONG_PRESS_THRESHOLD = 500;

/** Maximum movement in pixels before a long-press is cancelled */
export const LONG_PRESS_MOVE_TOLERANCE = 10;

/** Canvas rendering colors */
export const CANVAS_COLORS = {
  bg: '#ffffff',
  headerBg: '#f1f5f9',
  border: '#e2e8f0',
  text: '#334155',
  headerText: '#1e293b',
  altRow: '#f8fafc',
  hoverFill: 'rgba(59, 130, 246, 0.08)',
  hoverStroke: 'rgba(59, 130, 246, 0.3)',
  selectedFill: 'rgba(59, 130, 246, 0.18)',
  selectedStroke: 'rgba(59, 130, 246, 0.5)',
  bookmarkFill: '#f59e0b',
  bookmarkStroke: '#b45309',
  hiddenOverlay: 'rgba(15, 23, 42, 0.38)',
  hiddenBadgeFill: '#0f172a',
  hiddenBadgeStroke: '#334155',
} as const;

