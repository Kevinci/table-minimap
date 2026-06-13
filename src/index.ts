/**
 * Table Minimap - A framework-agnostic minimap component for large HTML tables
 *
 * @packageDocumentation
 */

export { TableMinimap } from './TableMinimap';
export type {
  TableMinimapOptions,
  ColumnInfo,
  ScrollState,
  CellData,
  TableSelector,
  ZoomState,
} from './types';

// Auto-inject styles into DOM
import styles from './styles.css?inline';

let stylesInjected = false;

export function injectStyles(): void {
  if (stylesInjected || typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.id = 'table-minimap-styles';
  style.textContent = styles;
  document.head.appendChild(style);
  stylesInjected = true;
}

// Auto-inject on import (can be tree-shaken if not used)
injectStyles();
