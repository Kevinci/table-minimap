import { TableMinimap } from '../src';
import '../src/styles.css';

// State
let cols1 = 20, rows1 = 50, position1: 'top' | 'bottom' = 'bottom';
let cols2 = 20, rows2 = 50, width2 = 250;
let colsCompact = 22, rowsCompact = 48;
let cols3 = 20, rows3 = 50;
let minimap1: TableMinimap | null = null;
let minimap2: TableMinimap | null = null;
let minimapCompact: TableMinimap | null = null;
let minimap3: TableMinimap | null = null;

/**
 * Formats code with syntax highlighting classes
 */
function formatCode(code: string): string {
  return code
    .replace(/\b(import|from|const|new)\b/g, '<span class="keyword">$1</span>')
    .replace(/'([^']+)'/g, "'<span class=\"string\">$1</span>'")
    .replace(/\/\/.*/g, '<span class="comment">$&</span>')
    .replace(/\b(TableMinimap)\b/g, '<span class="function">$1</span>')
    .replace(/\b(true|false)\b/g, '<span class="keyword">$1</span>');
}

/**
 * Generates code string for Demo 1
 */
function generateCode1(): string {
  return formatCode(`import { TableMinimap } from 'table-minimap';
import 'table-minimap/style.css';

const minimap = new TableMinimap('#my-table', {
  mode: 'columns',
  height: 40,
  position: '${position1}'
});`);
}

/**
 * Generates code string for Demo 2
 */
function generateCode2(): string {
  return formatCode(`import { TableMinimap } from 'table-minimap';
import 'table-minimap/style.css';

const minimap = new TableMinimap('#my-table', {
  mode: 'columns',
  height: 50,
  position: 'fixed',
  fixedWidth: ${width2}
});`);
}

/**
 * Generates code string for Compact Demo
 */
function generateCodeCompact(): string {
  return formatCode(`import { TableMinimap } from 'table-minimap';
import 'table-minimap/style.css';

const minimap = new TableMinimap('#my-table', {
  mode: 'columns',
  height: 44,
  position: 'fixed',
  fixedWidth: 260,
  compact: true
});`);
}

/**
 * Generates code string for Demo 3
 */
function generateCode3(): string {
  return formatCode(`import { TableMinimap } from 'table-minimap';
import 'table-minimap/style.css';

const minimap = new TableMinimap('#my-table', {
  mode: 'canvas',
  height: 100,
  position: 'bottom',
  zoomable: true,
  maxZoom: 12
});`);
}

/**
 * Updates code content for all demos
 */
function updateCodeBlocks(): void {
  const code1 = document.getElementById('code-content-1');
  const code2 = document.getElementById('code-content-2');
  const codeCompact = document.getElementById('code-content-compact');
  const code3 = document.getElementById('code-content-3');

  if (code1) code1.innerHTML = generateCode1();
  if (code2) code2.innerHTML = generateCode2();
  if (codeCompact) codeCompact.innerHTML = generateCodeCompact();
  if (code3) code3.innerHTML = generateCode3();
}

/**
 * Toggles code block visibility
 */
function toggleCodeBlock(buttonId: string, blockId: string): void {
  const button = document.getElementById(buttonId);
  const block = document.getElementById(blockId);
  if (!button || !block) return;

  button.addEventListener('click', () => {
    const isHidden = block.classList.contains('hidden');
    block.classList.toggle('hidden');
    const textSpan = button.childNodes[button.childNodes.length - 1];
    if (textSpan) {
      textSpan.textContent = isHidden ? ' Code verbergen' : ' Code anzeigen';
    }
  });
}

/**
 * Generates random cell content
 */
function generateCellContent(row: number, col: number): string {
  const random = Math.random();
  if (random < 0.3) return '';
  if (random < 0.5) return `${row}-${col}`;
  if (random < 0.7) return `Cell ${row},${col}`;
  if (random < 0.85) return `Data ${row}x${col}`;
  return `Lorem ipsum ${row}`;
}

/**
 * Creates/recreates a table with specified dimensions
 */
function createTable(
  headerRowId: string,
  bodyId: string,
  cols: number,
  rows: number,
  randomContent = false
): void {
  const headerRow = document.getElementById(headerRowId);
  const tbody = document.getElementById(bodyId);
  if (!headerRow || !tbody) return;

  // Clear existing content
  headerRow.innerHTML = '';
  tbody.innerHTML = '';

  // Create headers
  for (let c = 0; c < cols; c++) {
    const th = document.createElement('th');
    th.textContent = `Column ${c + 1}`;
    headerRow.appendChild(th);
  }

  // Create rows
  for (let r = 0; r < rows; r++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < cols; c++) {
      const td = document.createElement('td');
      td.textContent = randomContent
        ? generateCellContent(r + 1, c + 1)
        : `Row ${r + 1}, Col ${c + 1}`;
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

/**
 * Updates scroll position display
 */
function updateScrollInfo(wrapper: HTMLElement, displayId: string): void {
  const display = document.getElementById(displayId);
  if (!display) return;
  const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
  const percentage = maxScroll > 0 ? Math.round((wrapper.scrollLeft / maxScroll) * 100) : 0;
  display.textContent = `${percentage}%`;
}

/**
 * Recreates Demo 1 - Columns Mode with Position Toggle
 */
function recreateDemo1(): void {
  minimap1?.destroy();
  createTable('header-row-1', 'table-body-1', cols1, rows1);
  minimap1 = new TableMinimap('#demo-table-1', {
    mode: 'columns',
    height: 40,
    position: position1,
  });
}

/**
 * Recreates Demo 2 - Fixed Position
 */
function recreateDemo2(): void {
  minimap2?.destroy();
  createTable('header-row-2', 'table-body-2', cols2, rows2);
  minimap2 = new TableMinimap('#demo-table-2', {
    mode: 'columns',
    height: 50,
    position: 'fixed',
    fixedWidth: width2,
  });
}

/**
 * Recreates Demo 2b - Compact Fixed Position
 */
function recreateDemoCompact(): void {
  minimapCompact?.destroy();
  createTable('header-row-compact', 'table-body-compact', colsCompact, rowsCompact, true);
  minimapCompact = new TableMinimap('#demo-table-compact', {
    mode: 'columns',
    height: 44,
    position: 'fixed',
    fixedWidth: 260,
    compact: true,
  });
}

/**
 * Recreates Demo 3 - Canvas Mode
 */
function recreateDemo3(): void {
  minimap3?.destroy();
  createTable('header-row-3', 'table-body-3', cols3, rows3, true);
  minimap3 = new TableMinimap('#demo-table-3', {
    mode: 'canvas',
    height: 100,
    position: 'bottom',
    zoomable: true,
    maxZoom: 12,
  });
}

/**
 * Main initialization
 */
function init(): void {
  const wrapper1 = document.getElementById('table-wrapper-1')!;
  const wrapper2 = document.getElementById('table-wrapper-2')!;
  const wrapper3 = document.getElementById('table-wrapper-3')!;
  const zoomDisplay3 = document.getElementById('zoom-level-3')!;

  // Initial table creation
  recreateDemo1();
  recreateDemo2();
  recreateDemoCompact();
  recreateDemo3();

  // Initialize code blocks
  updateCodeBlocks();
  toggleCodeBlock('show-code-1', 'code-block-1');
  toggleCodeBlock('show-code-2', 'code-block-2');
  toggleCodeBlock('show-code-compact', 'code-block-compact');
  toggleCodeBlock('show-code-3', 'code-block-3');

  // === Demo 1: Columns Mode with Position Toggle ===
  wrapper1.addEventListener('scroll', () => updateScrollInfo(wrapper1, 'scroll-pos-1'));

  document.getElementById('scroll-start-1')?.addEventListener('click', () => {
    wrapper1.scrollTo({ left: 0, behavior: 'smooth' });
  });
  document.getElementById('scroll-middle-1')?.addEventListener('click', () => {
    wrapper1.scrollTo({ left: (wrapper1.scrollWidth - wrapper1.clientWidth) / 2, behavior: 'smooth' });
  });
  document.getElementById('scroll-end-1')?.addEventListener('click', () => {
    wrapper1.scrollTo({ left: wrapper1.scrollWidth, behavior: 'smooth' });
  });

  // Reactive inputs for Demo 1
  document.getElementById('cols-1')?.addEventListener('change', (e) => {
    cols1 = parseInt((e.target as HTMLInputElement).value) || 20;
    recreateDemo1();
  });
  document.getElementById('rows-1')?.addEventListener('change', (e) => {
    rows1 = parseInt((e.target as HTMLInputElement).value) || 50;
    recreateDemo1();
  });
  document.getElementById('position-1')?.addEventListener('change', (e) => {
    position1 = (e.target as HTMLSelectElement).value as 'top' | 'bottom';
    recreateDemo1();
    updateCodeBlocks();
  });

  // === Demo 2: Fixed Position ===
  wrapper2.addEventListener('scroll', () => updateScrollInfo(wrapper2, 'scroll-pos-2'));

  document.getElementById('scroll-start-2')?.addEventListener('click', () => {
    wrapper2.scrollTo({ left: 0, behavior: 'smooth' });
  });
  document.getElementById('scroll-middle-2')?.addEventListener('click', () => {
    wrapper2.scrollTo({ left: (wrapper2.scrollWidth - wrapper2.clientWidth) / 2, behavior: 'smooth' });
  });
  document.getElementById('scroll-end-2')?.addEventListener('click', () => {
    wrapper2.scrollTo({ left: wrapper2.scrollWidth, behavior: 'smooth' });
  });

  // Reactive inputs for Demo 2
  document.getElementById('cols-2')?.addEventListener('change', (e) => {
    cols2 = parseInt((e.target as HTMLInputElement).value) || 20;
    recreateDemo2();
  });
  document.getElementById('rows-2')?.addEventListener('change', (e) => {
    rows2 = parseInt((e.target as HTMLInputElement).value) || 50;
    recreateDemo2();
  });
  document.getElementById('width-2')?.addEventListener('change', (e) => {
    width2 = parseInt((e.target as HTMLInputElement).value) || 250;
    recreateDemo2();
    updateCodeBlocks();
  });

  // === Demo 2b: Compact Fixed Position ===
  const wrapperCompact = document.getElementById('table-wrapper-compact')!;
  wrapperCompact.addEventListener('scroll', () => updateScrollInfo(wrapperCompact, 'scroll-pos-compact'));

  document.getElementById('scroll-start-compact')?.addEventListener('click', () => {
    wrapperCompact.scrollTo({ left: 0, behavior: 'smooth' });
  });
  document.getElementById('scroll-middle-compact')?.addEventListener('click', () => {
    wrapperCompact.scrollTo({ left: (wrapperCompact.scrollWidth - wrapperCompact.clientWidth) / 2, behavior: 'smooth' });
  });
  document.getElementById('scroll-end-compact')?.addEventListener('click', () => {
    wrapperCompact.scrollTo({ left: wrapperCompact.scrollWidth, behavior: 'smooth' });
  });

  document.getElementById('cols-compact')?.addEventListener('change', (e) => {
    colsCompact = parseInt((e.target as HTMLInputElement).value) || 22;
    recreateDemoCompact();
  });
  document.getElementById('rows-compact')?.addEventListener('change', (e) => {
    rowsCompact = parseInt((e.target as HTMLInputElement).value) || 48;
    recreateDemoCompact();
  });

  // === Demo 3: Canvas Mode ===
  const updateInfo3 = () => {
    updateScrollInfo(wrapper3, 'scroll-pos-3');
    if (minimap3) {
      const zoomState = minimap3.getZoomState();
      zoomDisplay3.textContent = `${zoomState.level.toFixed(1)}x`;
    }
  };

  wrapper3.addEventListener('scroll', updateInfo3);
  wrapper3.parentElement?.addEventListener('wheel', () => setTimeout(updateInfo3, 50), { passive: true });

  document.getElementById('scroll-start-3')?.addEventListener('click', () => {
    wrapper3.scrollTo({ left: 0, behavior: 'smooth' });
  });
  document.getElementById('scroll-middle-3')?.addEventListener('click', () => {
    wrapper3.scrollTo({ left: (wrapper3.scrollWidth - wrapper3.clientWidth) / 2, behavior: 'smooth' });
  });
  document.getElementById('scroll-end-3')?.addEventListener('click', () => {
    wrapper3.scrollTo({ left: wrapper3.scrollWidth, behavior: 'smooth' });
  });
  document.getElementById('reset-zoom-3')?.addEventListener('click', () => {
    minimap3?.resetZoom();
    setTimeout(updateInfo3, 50);
  });

  // Reactive inputs for Demo 3
  document.getElementById('cols-3')?.addEventListener('change', (e) => {
    cols3 = parseInt((e.target as HTMLInputElement).value) || 20;
    recreateDemo3();
  });
  document.getElementById('rows-3')?.addEventListener('change', (e) => {
    rows3 = parseInt((e.target as HTMLInputElement).value) || 50;
    recreateDemo3();
  });

  console.log('TableMinimap Demo Initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
