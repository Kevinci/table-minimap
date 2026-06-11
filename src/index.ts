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

// Import styles for side-effect (bundlers will extract CSS)
import './styles.css';

