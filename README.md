# Table Minimap

A framework-agnostic minimap component for navigating large HTML tables. Inspired by VS Code's minimap, this library provides a visual overview of wide tables and enables drag-to-scroll navigation.

[![npm version](https://img.shields.io/npm/v/table-minimap)](https://www.npmjs.com/package/table-minimap)
[![bundle size](https://img.shields.io/bundlephobia/minzip/table-minimap)](https://bundlephobia.com/package/table-minimap)
[![license](https://img.shields.io/npm/l/table-minimap)](https://github.com/Kevinci/table-minimap/blob/main/LICENSE)

**[Live Demo](https://kevinci.github.io/table-minimap/)**

## Features

- **Framework Agnostic** - Works with vanilla JS, React, Vue, Angular, or any framework
- **Zero Dependencies** - No external runtime dependencies
- **Tree Shakable** - ESM + CommonJS outputs
- **Two Render Modes** - Simple columns or VS Code-like canvas preview
- **Touch Support** - Mouse, touch, and pointer events
- **Auto Updates** - Responds to resize, scroll, and DOM mutations
- **Accessible** - ARIA attributes and keyboard navigation support
- **Themeable** - CSS custom properties for easy customization
- **shadcn/ui Ready** - Dedicated theme using shadcn CSS variables
- **TypeScript** - Fully typed with declaration files

## Installation

```bash
npm install table-minimap
```

```bash
yarn add table-minimap
```

```bash
pnpm add table-minimap
```

## Quick Start

```typescript
import { TableMinimap } from 'table-minimap';


// Using a CSS selector
const minimap = new TableMinimap('#my-table');

// Or using a DOM element
const table = document.querySelector('table');
const minimap = new TableMinimap(table);

// Don't forget to cleanup when done
minimap.destroy();
```

## Usage

### Basic Usage

```html
<div class="table-container" style="overflow-x: auto;">
  <table id="my-table">
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
        <!-- ... more columns ... -->
      </tr>
    </thead>
    <tbody>
      <!-- ... rows ... -->
    </tbody>
  </table>
</div>
<!-- Minimap will be inserted after the container -->
```

```typescript
import { TableMinimap } from 'table-minimap';


const minimap = new TableMinimap('#my-table');
```

### With Configuration

```typescript
const minimap = new TableMinimap('#my-table', {
  mode: 'canvas',      // 'columns' | 'canvas'
  height: 50,          // Height in pixels
  position: 'bottom',  // 'top' | 'bottom' | 'fixed'
  draggable: true,     // Enable drag navigation
  showViewport: true,  // Show viewport indicator
});
```

### Compact Fixed Mode

For a smaller, hideable floating minimap, enable `compact` together with `position: 'fixed'`:

```typescript
const minimap = new TableMinimap('#my-table', {
  position: 'fixed',
  fixedWidth: 260,
  fixedPosition: 'bottom-right',
  compact: true,
  height: 44,
});
```

- Collapses into a small translucent dot in the bottom-right corner
- Expands on click or keyboard focus
- Remains clickable when collapsed
- Uses a short ease-in-out transition for width/height/opacity
- Double-click fixed minimaps to move them to the next corner

### Canvas Mode (VS Code-like)

Canvas mode renders a compressed pixel preview of the entire table:

```typescript
const minimap = new TableMinimap('#data-table', {
  mode: 'canvas',
  height: 60,
});
```

- Darker pixels indicate cells with more content
- Empty cells appear lighter
- Provides a visual "density map" of your data

### Canvas Mode with Zoom

Enable zoom functionality in canvas mode for detailed inspection:

```typescript
const minimap = new TableMinimap('#data-table', {
  mode: 'canvas',
  height: 80,
  zoomable: true,
  minZoom: 1,
  maxZoom: 10,
  zoomSpeed: 0.1,
});

// Programmatic zoom control
minimap.setZoom(3, 0.5);     // Zoom to 3x at center
minimap.zoomToColumns(5, 15); // Zoom to columns 5-15
minimap.resetZoom();          // Reset to full view
```

**Zoom Controls:**
- **Scroll wheel** on minimap to zoom in/out
- **Drag** the canvas when zoomed to pan
- A position indicator appears at the bottom when zoomed

### Position Options

```typescript
// Minimap above the table
const minimap = new TableMinimap('#my-table', {
  position: 'top',
});

// Minimap below the table (default)
const minimap = new TableMinimap('#my-table', {
  position: 'bottom',
});
```

## Configuration

### Options Interface

```typescript
interface TableMinimapOptions {
  /**
   * Rendering mode
   * - "columns": Simple column segments (default)
   * - "canvas": VS Code-like pixel preview
   */
  mode?: 'columns' | 'canvas';

  /**
   * Height of the minimap in pixels
   * @default 40
   */
  height?: number;

  /**
   * Position relative to the table
   * @default "bottom"
   */
  position?: 'top' | 'bottom' | 'fixed';

  /**
   * Corner position when using position: 'fixed'
   * Double-click fixed minimaps to cycle to the next corner.
   * @default "bottom-right"
   */
  fixedPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /**
   * Enable compact floating mode for fixed minimaps
   * @default false
   */
  compact?: boolean;

  /**
   * Enable drag navigation
   * @default true
   */
  draggable?: boolean;

  /**
   * Show viewport indicator
   * @default true
   */
  showViewport?: boolean;

  /**
   * Enable zoom in canvas mode (scroll wheel)
   * @default false
   */
  zoomable?: boolean;

  /**
   * Minimum zoom level
   * @default 1
   */
  minZoom?: number;

  /**
   * Maximum zoom level
   * @default 10
   */
  maxZoom?: number;

  /**
   * Zoom speed multiplier
   * @default 0.1
   */
  zoomSpeed?: number;
}
```

### Default Values

| Option | Default |
|--------|---------|
| `mode` | `'columns'` |
| `height` | `40` |
| `position` | `'bottom'` |
| `fixedPosition` | `'bottom-right'` |
| `compact` | `false` |
| `draggable` | `true` |
| `showViewport` | `true` |
| `zoomable` | `false` |
| `minZoom` | `1` |
| `maxZoom` | `10` |
| `zoomSpeed` | `0.1` |

## API Reference

### Constructor

```typescript
new TableMinimap(selector: string | HTMLTableElement, options?: TableMinimapOptions)
```

**Parameters:**
- `selector` - CSS selector string or HTMLTableElement
- `options` - Optional configuration object

**Throws:**
- Error if element is not found
- Error if element is not a `<table>`

### Methods

#### `destroy(): void`

Removes the minimap and cleans up all event listeners, observers, and DOM elements. Always call this when the table is removed from the DOM.

```typescript
minimap.destroy();
```

#### `refresh(): void`

Forces a refresh of the minimap. Useful after programmatic table modifications.

```typescript
// After dynamically updating table content
minimap.refresh();
```

#### `getScrollState(): ScrollState`

Returns the current scroll state.

```typescript
const state = minimap.getScrollState();
console.log(state);
// {
//   scrollLeft: 200,
//   scrollWidth: 2000,
//   clientWidth: 500,
//   viewportRatio: 0.25,
//   positionRatio: 0.13
// }
```

#### `getColumns(): ColumnInfo[]`

Returns information about detected columns.

```typescript
const columns = minimap.getColumns();
console.log(columns);
// [
//   { index: 0, width: 120, widthPercent: 6 },
//   { index: 1, width: 80, widthPercent: 4 },
//   ...
// ]
```

#### `scrollToColumn(columnIndex: number, smooth?: boolean): void`

Scrolls the table to bring a specific column into view.

```typescript
// Scroll to column 10 with smooth animation
minimap.scrollToColumn(10, true);

// Instant scroll
minimap.scrollToColumn(10, false);
```

#### `getZoomState(): ZoomState`

Returns the current zoom state (canvas mode only).

```typescript
const zoom = minimap.getZoomState();
console.log(zoom);
// {
//   level: 2.5,
//   panX: 0.3,
//   isMinZoom: false,
//   isMaxZoom: false
// }
```

#### `setZoom(level: number, panX?: number): void`

Sets the zoom level programmatically (canvas mode only).

```typescript
// Zoom to 3x at current position
minimap.setZoom(3);

// Zoom to 5x centered at 50% of table width
minimap.setZoom(5, 0.5);
```

#### `resetZoom(): void`

Resets zoom to show the full table overview.

```typescript
minimap.resetZoom();
```

#### `zoomToColumns(startCol: number, endCol: number): void`

Zooms to show a specific column range (canvas mode only).

```typescript
// Zoom to show columns 10-20
minimap.zoomToColumns(10, 20);
```

## Styling

### CSS Custom Properties

Override these CSS variables to customize the minimap appearance:

```css
:root {
  --tm-background: #f5f5f5;
  --tm-border: #e0e0e0;
  --tm-viewport-color: rgba(0, 120, 212, 0.3);
  --tm-viewport-border: rgba(0, 120, 212, 0.8);
  --tm-height: 40px;
  --tm-column-color: #d0d0d0;
  --tm-column-gap: 1px;
  --tm-border-radius: 4px;
  --tm-canvas-empty: #f0f0f0;
  --tm-canvas-filled: #606060;
}
```

### Dark Mode

The library automatically supports `prefers-color-scheme: dark`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --tm-background: #2d2d2d;
    --tm-border: #404040;
    --tm-viewport-color: rgba(100, 180, 255, 0.25);
    --tm-viewport-border: rgba(100, 180, 255, 0.7);
    --tm-column-color: #505050;
    --tm-canvas-empty: #3a3a3a;
    --tm-canvas-filled: #a0a0a0;
  }
}
```

### CSS Classes

| Class | Description |
|-------|-------------|
| `.tm-minimap` | Main container |
| `.tm-minimap--top` | Applied when position is 'top' |
| `.tm-minimap--bottom` | Applied when position is 'bottom' |
| `.tm-columns` | Columns container (columns mode) |
| `.tm-column` | Individual column segment |
| `.tm-canvas` | Canvas element (canvas mode) |
| `.tm-viewport` | Viewport indicator |
| `.tm-viewport--dragging` | Applied during drag |
| `.tm-viewport--disabled` | Applied when draggable is false |

### Custom Theme Example

```css
/* Blue theme */
.tm-minimap {
  --tm-background: #e3f2fd;
  --tm-border: #bbdefb;
  --tm-viewport-color: rgba(25, 118, 210, 0.3);
  --tm-viewport-border: #1976d2;
  --tm-column-color: #90caf9;
}
```

### shadcn/ui Integration

For projects using [shadcn/ui](https://ui.shadcn.com/), import the dedicated stylesheet that uses shadcn's CSS variables:

```typescript
import { TableMinimap } from 'table-minimap';
import 'table-minimap/shadcn.css'; // Use shadcn theme instead of style.css

const minimap = new TableMinimap('#my-table');
```

The shadcn theme automatically uses your project's color scheme:

| Minimap Variable | shadcn Variable |
|------------------|-----------------|
| `--tm-background` | `--muted` |
| `--tm-border` | `--border` |
| `--tm-viewport-color` | `--primary` (with opacity) |
| `--tm-viewport-border` | `--primary` |
| `--tm-column-color` | `--muted-foreground` |
| `--tm-border-radius` | `--radius` |

This ensures the minimap matches your shadcn/ui theme including dark mode support.

#### shadcn/ui + React Example

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { TableMinimap } from 'table-minimap';
import 'table-minimap/shadcn.css';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function DataTableWithMinimap({ data }: { data: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<TableMinimap | null>(null);

  useEffect(() => {
    const table = containerRef.current?.querySelector('table');
    if (table) {
      minimapRef.current = new TableMinimap(table as HTMLTableElement, {
        mode: 'columns',
        height: 36,
      });
    }

    return () => {
      minimapRef.current?.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {/* Your headers */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Your rows */}
        </TableBody>
      </Table>
    </div>
  );
}
```

## Framework Integration

### React

```tsx
import { useEffect, useRef } from 'react';
import { TableMinimap } from 'table-minimap';


function DataTable() {
  const tableRef = useRef<HTMLTableElement>(null);
  const minimapRef = useRef<TableMinimap | null>(null);

  useEffect(() => {
    if (tableRef.current) {
      minimapRef.current = new TableMinimap(tableRef.current);
    }

    return () => {
      minimapRef.current?.destroy();
    };
  }, []);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table ref={tableRef}>
        {/* ... */}
      </table>
    </div>
  );
}
```

### Vue 3

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { TableMinimap } from 'table-minimap';


const tableRef = ref<HTMLTableElement | null>(null);
let minimap: TableMinimap | null = null;

onMounted(() => {
  if (tableRef.value) {
    minimap = new TableMinimap(tableRef.value);
  }
});

onUnmounted(() => {
  minimap?.destroy();
});
</script>

<template>
  <div style="overflow-x: auto;">
    <table ref="tableRef">
      <!-- ... -->
    </table>
  </div>
</template>
```

### Angular

```typescript
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { TableMinimap } from 'table-minimap';


@Component({
  selector: 'app-data-table',
  template: `
    <div style="overflow-x: auto;">
      <table #tableElement>
        <!-- ... -->
      </table>
    </div>
  `
})
export class DataTableComponent implements AfterViewInit, OnDestroy {
  @ViewChild('tableElement') tableRef!: ElementRef<HTMLTableElement>;
  private minimap: TableMinimap | null = null;

  ngAfterViewInit() {
    this.minimap = new TableMinimap(this.tableRef.nativeElement);
  }

  ngOnDestroy() {
    this.minimap?.destroy();
  }
}
```

## Development

### Setup

```bash
git clone https://github.com/your-username/table-minimap.git
cd table-minimap
npm install
```

### Development Server

```bash
npm run dev
```

Opens the demo at `http://localhost:5173`

### Build

```bash
npm run build
```

Outputs to `dist/`:
- `table-minimap.js` (ESM)
- `table-minimap.cjs` (CommonJS)
- `style.css`
- `index.d.ts` (TypeScript declarations)

### Project Structure

```
table-minimap/
├── src/
│   ├── TableMinimap.ts    # Main component class
│   ├── styles.css         # Default styles
│   ├── types.ts           # TypeScript interfaces
│   └── index.ts           # Public exports
├── demo/
│   ├── index.html         # Demo page
│   └── main.ts            # Demo script
├── dist/                  # Build output
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Publishing

```bash
# Ensure build is up to date
npm run build

# Publish to npm
npm publish
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Requires:
- `ResizeObserver`
- `MutationObserver`
- `PointerEvents`

## License

MIT © Kevin Imig

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

