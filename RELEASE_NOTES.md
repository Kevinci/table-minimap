# Release Notes v2.0.0

> **Version 2.0.0** - Major Release | July 1, 2026

This is a significant milestone release with breaking API changes, enhanced canvas capabilities, and comprehensive mobile support.

## 🎯 Major Features

### Canvas Column Selection
- **Finder-like Multi-Selection**: Single-click selects a column, Shift+click selects ranges, Cmd/Ctrl+click toggles individual columns
- **API**: `canvasColumnSelection` option (boolean)
- **Events**: `onSelectedColumnsChange` callback with detailed change information
- **State Management**: `selectedColumns` option for initial selection, `getSelectedColumns()` / `setSelectedColumns()` methods

### Canvas Column Visibility
- **Context Menu Actions**: Right-click to collapse/expand individual columns
- **Bulk Operations**: Collapse/expand all columns via context menu
- **Persistent State**: Track via `hiddenColumns` option and `onHiddenColumnsChange` callback
- **Visual Feedback**: Collapsed columns show as thin indicators
- **Configuration**: `collapsedColumnWidth` option (default: 10px)
- **API Methods**: `getHiddenColumns()` / `setHiddenColumns()`

### Canvas Column Marking
- **Bookmark-Style Indicators**: Visual marks for important columns
- **Context Menu Integration**: Mark/unmark individual columns or clear all marks
- **Customizable Labels**: `canvasMarkColumnLabel`, `canvasUnmarkColumnLabel`, `canvasUnmarkAllColumnsLabel`
- **Change Events**: `onMarkedColumnsChange` with header information
- **State Methods**: `getMarkedColumns()` / `setMarkedColumns()`

### Enhanced Canvas Zoom System
- **Scroll Wheel Zoom**: Interactive zoom in/out with smooth scaling
- **Readable Text**: At zoom levels > 3x, text scales for better readability
- **Range Control**: `minZoom` (default 1) and `maxZoom` (default 10)
- **Speed Control**: `zoomSpeed` option (default 0.1)
- **Zoom State API**: `getZoomState()` returns current level and bounds
- **Adaptive Rendering**: Row heights interpolate based on zoom level

### Canvas Clipboard
- **Copy to Clipboard**: Right-click context menu to copy entire column data
- **Customizable Label**: `canvasClipboardLabel` option for i18n
- **Robust**: Works with column data extraction and system clipboard API

## 📱 Mobile & Touch Support

### Touch Interactions
- **Long-Press Menu**: Long-press (600ms) opens context menu for canvas operations
- **Double-Tap Zoom**: Double-tap to zoom in/out in canvas mode
- **Pinch-to-Zoom**: Two-finger pinch gesture for intuitive zoom control
- **Touch Pan**: Smooth horizontal panning with touch dragging
- **Touch Distance Calculation**: Accurate multi-touch distance measurement

### Mobile Optimizations
- **Larger Touch Targets**: Context menu items optimized for finger interaction
- **Gesture Thresholds**: Configurable thresholds for double-tap (300ms) and long-press (600ms)
- **Move Tolerance**: 10px threshold to distinguish drag from tap
- **Responsive Design**: Adapts to mobile viewport constraints

## 🏗️ Architecture Improvements

### Code Organization
- **Modularized Touch Handlers** (`handlers/touch.ts`)
  - `getTouchDistance()` - Calculate distance between touch points
  - `getTouchCenter()` - Find center point of multi-touch
  
- **Canvas Rendering Module** (`canvas/renderer.ts`)
  - Separated rendering logic for canvas mode
  - Metrics calculation for accurate visualization
  - Efficient pixel-level rendering
  
- **Utilities Library** (`utils/columns.ts`)
  - Column header extraction
  - Cell selection and clipboard operations
  - Column index normalization

### Type System Enhancements
- **Detailed Callback Payloads**:
  - `CanvasMarkedColumnsChangeDetails`
  - `CanvasHiddenColumnsChangeDetails`
  - `CanvasSelectedColumnsChangeDetails`
- **Zoom State Interface**: `ZoomState` with level, pan, and boundary information
- **Column Info Type**: `ColumnInfo` for width calculations
- **Scroll State Tracking**: `ScrollState` interface for viewport management

## Fixed Position & Layout

### Corner Positioning
- **Four Corners**: `top-left`, `top-right`, `bottom-left`, `bottom-right`
- **Double-Click Cycling**: Double-click fixed minimap to cycle through positions
- **Double-Click Delay**: Separate timing for distinguishing double-click from single-click

### Compact Floating Mode
- **Dot Handle**: Collapses into small dot handle (8px) in corner
- **Auto-Expand**: Expands on hover, focus, or click
- **Auto-Collapse**: Collapses after 3 seconds of pointer leave
- **Smooth Transitions**: CSS-based animations for expand/collapse

## Configuration Options

### New Options in v2.0.0
```typescript
canvasColumnSelection?: boolean;        // Finder-like multi-select
canvasColumnHiding?: boolean;           // Collapse/expand columns
canvasHideColumnLabel?: string;         // Customizable "Collapse column"
canvasShowColumnLabel?: string;         // Customizable "Expand column"
canvasShowAllColumnsLabel?: string;     // Customizable "Expand all columns"
collapsedColumnWidth?: number;          // Width of collapsed columns (default: 10)
hiddenColumns?: number[];               // Initial hidden columns
selectedColumns?: number[];             // Initial selected columns
onHiddenColumnsChange?: callback;       // Hidden columns changed
onSelectedColumnsChange?: callback;     // Selected columns changed
```

## API Methods

### New Public Methods
- `getSelectedColumns()` → `number[]` - Get currently selected columns
- `setSelectedColumns(indices)` → `void` - Set selected columns
- `getHiddenColumns()` → `number[]` - Get currently hidden columns
- `setHiddenColumns(indices)` → `void` - Set hidden columns
- `getMarkedColumns()` → `number[]` - Get marked columns (existing)
- `setMarkedColumns(indices)` → `void` - Set marked columns (existing)
- `getZoomState()` → `ZoomState` - Get current zoom information

## Breaking Changes

### API Changes
- Canvas rendering pipeline refactored for better modularity
- Column data extraction now requires explicit cell type handling
- Context menu event delegation simplified

### Deprecated
- `panX` property in `ZoomState` (now derived from scroll position)

### Configuration Deprecation
- Fixed minimaps no longer show viewport indicator in canvas mode

## Performance Improvements

### Bundle Size
- **Modularized Code**: Better tree-shaking opportunities
- **Dead Code Removal**: ~14% code reduction through modularization
- **Optimized Rendering**: Canvas renderer efficient pixel-level operations

### Runtime Performance
- Touch distance calculations use optimized math
- Canvas rendering caches metrics between frames
- Column data extraction cached per render cycle
- Viewport dragging uses actual travel range for smooth movement

## Migration Guide

### For v1.x Users

Most changes are additive. If you were using v1.3.0:

```typescript
// v1.3.0 (still works)
const minimap = new TableMinimap('#table', {
  mode: 'canvas',
  canvasColumnMarking: true,
  canvasClipboard: true
});

// v2.0.0 (with new features)
const minimap = new TableMinimap('#table', {
  mode: 'canvas',
  canvasColumnMarking: true,
  canvasClipboard: true,
  canvasColumnHiding: true,
  canvasColumnSelection: true,
  zoomable: true
});

// Listen to new events
minimap.on('selectedColumnsChange', (details) => {
  console.log('Selected:', details.selectedColumns);
});
```

### Mobile Support
Mobile features are automatic - no configuration needed:
- Long-press opens context menu
- Pinch-to-zoom works when `zoomable: true`
- Touch pan gestures work automatically

## Browser Compatibility

- **Chrome/Edge**: Full support (v90+)
- **Firefox**: Full support (v88+)
- **Safari**: Full support (v14+)
- **Mobile Safari (iOS)**: Full support with touch gestures
- **Chrome Mobile**: Full support with touch gestures
- **IE 11**: Not supported (ES6+ only)

## Known Limitations

1. **Copy to Clipboard**: Requires HTTPS or localhost (browser security)
2. **Touch Events**: Some older devices may not support all gesture types
3. **Canvas Zoom**: Very large tables (10,000+ columns) may experience slow zoom at high levels
4. **Touch Double-Tap**: iOS may interpret double-tap as zoom, resulting in device zoom instead of minimap action

## Resources

- **Documentation**: See [README.md](README.md) for detailed API documentation
- **Demo**: Available at [https://kevinci.github.io/table-minimap/](https://kevinci.github.io/table-minimap/)
- **GitHub**: [github.com/Kevinci/table-minimap](https://github.com/Kevinci/table-minimap)
- **Issues**: [GitHub Issues](https://github.com/Kevinci/table-minimap/issues)

## Support

For bug reports, feature requests, or questions, please visit:
- 📧 Email: kevinci.coding@gmail.com
- 🐛 GitHub Issues: [Report an Issue](https://github.com/Kevinci/table-minimap/issues)

---

**Thank you for using Table Minimap!** 🎉

