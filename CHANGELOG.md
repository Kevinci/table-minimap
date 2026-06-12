# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/Kevinci/table-minimap/compare/v1.1.3...HEAD
[1.1.3]: https://github.com/Kevinci/table-minimap/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/Kevinci/table-minimap/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/Kevinci/table-minimap/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/Kevinci/table-minimap/compare/v1.0.7...v1.1.0
[1.0.7]: https://github.com/Kevinci/table-minimap/releases/tag/v1.0.7

