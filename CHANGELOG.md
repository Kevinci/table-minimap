# Changelog

If you find a bug or anything that could be improved, feel free to email me at `kevinci.coding@gmail.com`.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-07-01

### Added

- **Canvas Column Selection** - Finder-like multi-selection (single-click, Shift+click, Cmd/Ctrl+click) with `canvasColumnSelection` option
- **Canvas Column Visibility Control** - Collapse/expand columns via context menu with `canvasColumnHiding`, `canvasHideColumnLabel`, `canvasShowColumnLabel` options
- **Enhanced Canvas Zoom System** - Interactive scroll-wheel zoom with readable text scaling at high zoom levels, configurable min/max zoom and speed
- **Touch Support** - Long-press context menu (600ms), pinch-to-zoom, double-tap zoom, and smooth touch pan gestures
- **Canvas Touch Handlers Module** - New `handlers/touch.ts` with `getTouchDistance()` and `getTouchCenter()` utilities
- **Canvas Rendering Module** - New `canvas/renderer.ts` with separated rendering logic and metrics calculation
- **Modularized Column Utilities** - New `utils/columns.ts` with column header extraction, cell selection, and clipboard operations
- **API Methods** - `getSelectedColumns()`, `setSelectedColumns()`, `getHiddenColumns()`, `setHiddenColumns()`, `getZoomState()`
- **Callback Events** - `onHiddenColumnsChange`, `onSelectedColumnsChange` with detailed change payloads
- **State Options** - `hiddenColumns` and `selectedColumns` for initial state configuration
- **Collapsed Column Width Configuration** - `collapsedColumnWidth` option (default: 10px)

### Changed

- **BREAKING**: Canvas rendering pipeline refactored for better modularity
- **BREAKING**: Context menu event delegation simplified
- **BREAKING**: Column data extraction requires explicit cell type handling
- Canvas mode no longer shows viewport indicator in fixed overlays
- Improved type system with detailed callback payload interfaces
- Enhanced touch event handling with configurable gesture thresholds

### Fixed

- Fixed canvas navigation clicks after viewport drag operations
- Improved canvas zoom rendering at high magnification levels
- Fixed row height interpolation based on zoom level
- Enhanced touch gesture recognition to prevent accidental triggers
- Improved column index normalization when table structure changes

### Improved

- Modularized code architecture (~14% reduction through dead code removal)
- Better tree-shaking opportunities with separate modules
- Enhanced error messages for easier debugging
- Touch event handling optimized for mobile devices
- Canvas rendering performance improved with metrics caching
- Documentation expanded with detailed feature examples and migration guide

## [1.3.0] - 2026-06-17

### Added

- Added canvas column marking via context menu (`canvasColumnMarking`) with configurable labels for mark/unmark actions.
- Added support for initial marked canvas columns (`markedColumns`) and change notifications via `onMarkedColumnsChange`.
- Added new public API methods `getMarkedColumns()` and `setMarkedColumns()`.
- Added bookmark-style visual indicators for marked columns in canvas headers.
- Added demo persistence for marked canvas columns using `localStorage`.
- Added desktop side navigation in the demo for quick section jumps.

### Improved

- Minimap click navigation now centers the clicked column more consistently in both columns and canvas mode.
- Viewport dragging now uses the actual viewport travel range for smoother, more predictable horizontal movement.
- Canvas interaction handling now better separates click, drag, and pan behavior.
- Canvas context menu now supports combined mark/copy actions with improved keyboard accessibility.

### Fixed

- Prevented unintended minimap navigation clicks immediately after viewport drag operations.
- Marked column indices are now normalized and clamped when table structure or column counts change.

### Documentation

- Updated README with the new canvas column marking options, callback payload, and usage examples.

## [1.2.1] - 2026-06-14

### Improved

- Updated the canvas demo notice to mention that mobile support is planned for Q3 2026.

## [1.2.0] - 2026-06-13

### Added

- Added canvas clipboard support via right-click context menu (`canvasClipboard`, `canvasClipboardLabel`).
- Added demo toggle to enable/disable clipboard copy in canvas mode.
- Added demo header metric for weekly npm downloads.

### Improved

- Added canvas context-menu styling tokens and UI styles in `src/styles.css`.
- Improved context-menu interactions (keyboard trigger and Escape/outside-click close behavior).

### Fixed

- Limited canvas pan start to left-click so right-click can be used reliably for clipboard actions.

## [1.1.3] - 2026-06-12

### Fixed

- Fixed compact fixed minimap dot clicks so opening the collapsed dot no longer triggers an unintended table navigation.

## [1.1.2] - 2026-06-12

### Added

- Added double-click repositioning for fixed minimaps.
- Fixed minimaps can now cycle through `bottom-right`, `bottom-left`, `top-left`, and `top-right` by double-clicking the minimap.

### Improved

- Smoothed canvas-mode horizontal panning with requestAnimationFrame throttling.
- Reversed canvas pan direction so dragging left/right matches the perceived table movement.

## [1.1.1] - 2026-06-12

### Improved

- Made fixed and compact fixed minimaps translucent so table headers and content remain visible underneath.
- Added translucent fixed-minimap styling to both the default stylesheet and the shadcn stylesheet.

## [1.1.0] - 2026-06-12

### Added

- Added the `fixedPosition` option for fixed minimaps:
  - `top-left`
  - `top-right`
  - `bottom-left`
  - `bottom-right`
- Added demo controls for fixed minimap corner positions.
- Added compact fixed minimap position controls to the demo.
- Added a demo Easter egg dialog for column counts of 100 or more.

### Changed

- Columns-mode minimap columns now render with equal visual width instead of mirroring the real table column widths.
- Canvas mode no longer shows the viewport indicator.

### Fixed

- Fixed compact fixed minimap expansion sizing and timing issues.
- Fixed canvas-mode column click behavior so clicked columns are centered in the table.
- Added a root `LICENSE` file for GitHub and npm license detection.

## [1.0.7] - 2026-06-12

### Added

- Added auto-injected styles for easier package consumption.
- Added compact mode for fixed minimaps.
- Added demo code toggles and framework usage sections.

### Documentation

- Updated license author information.
- Added homepage/demo metadata.

[Unreleased]: https://github.com/Kevinci/table-minimap/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/Kevinci/table-minimap/compare/v1.3.0...v2.0.0
[1.3.0]: https://github.com/Kevinci/table-minimap/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/Kevinci/table-minimap/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/Kevinci/table-minimap/compare/v1.1.3...v1.2.0
[1.1.3]: https://github.com/Kevinci/table-minimap/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/Kevinci/table-minimap/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/Kevinci/table-minimap/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/Kevinci/table-minimap/compare/v1.0.7...v1.1.0
[1.0.7]: https://github.com/Kevinci/table-minimap/releases/tag/v1.0.7
