import { afterEach, describe, expect, it, vi } from 'vitest';
import { TableMinimap } from '../../src/TableMinimap';

const COLUMN_COUNT = 20;
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 100;

interface Fixture {
  canvas: HTMLCanvasElement;
  minimap: TableMinimap;
  selectedChanges: number[][];
}

function createTableMarkup(columnCount = COLUMN_COUNT, rowCount = 4): string {
  const headers = Array.from(
    { length: columnCount },
    (_, index) => `<th>Column ${index + 1}</th>`,
  ).join('');
  const rows = Array.from({ length: rowCount }, (_, rowIndex) => {
    const cells = Array.from(
      { length: columnCount },
      (_, colIndex) => `<td>R${rowIndex + 1}C${colIndex + 1}</td>`,
    ).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `
    <div id="wrapper" style="overflow-x: auto;" data-test-client-width="500" data-test-scroll-width="1000">
      <table id="table">
        <thead><tr>${headers}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function installRect(element: Element): void {
  element.getBoundingClientRect = () =>
    ({
      bottom: CANVAS_HEIGHT,
      height: CANVAS_HEIGHT,
      left: 0,
      right: CANVAS_WIDTH,
      top: 0,
      width: CANVAS_WIDTH,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect;
}

function createFixture(): Fixture {
  document.body.innerHTML = createTableMarkup();

  const table = document.querySelector<HTMLTableElement>('#table');
  if (!table) throw new Error('Test table was not created');

  const selectedChanges: number[][] = [];
  const minimap = new TableMinimap(table, {
    mode: 'canvas',
    height: CANVAS_HEIGHT,
    zoomable: true,
    canvasColumnSelection: true,
    canvasColumnMarking: true,
    canvasColumnHiding: true,
    onSelectedColumnsChange: ({ selectedColumns }) => {
      selectedChanges.push(selectedColumns);
    },
  });

  const canvas = document.querySelector<HTMLCanvasElement>('.tm-canvas');
  const minimapElement = document.querySelector<HTMLElement>('.tm-minimap');
  if (!canvas || !minimapElement) throw new Error('Canvas minimap was not created');

  installRect(canvas);
  installRect(minimapElement);

  return { canvas, minimap, selectedChanges };
}

function xForColumn(columnIndex: number): number {
  return CANVAS_WIDTH * ((columnIndex + 0.5) / COLUMN_COUNT);
}

function dispatchCanvasPointerClick(
  canvas: HTMLCanvasElement,
  columnIndex: number,
  init: Pick<PointerEventInit, 'ctrlKey' | 'metaKey' | 'shiftKey'> = {},
): void {
  const clientX = xForColumn(columnIndex);
  const clientY = CANVAS_HEIGHT / 2;

  canvas.dispatchEvent(
    new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX,
      clientY,
      pointerId: 1,
      ...init,
    }),
  );

  document.dispatchEvent(
    new PointerEvent('pointerup', {
      bubbles: true,
      button: 0,
      clientX,
      clientY,
      pointerId: 1,
      ...init,
    }),
  );
}

function openContextMenu(canvas: HTMLCanvasElement, columnIndex: number): void {
  canvas.dispatchEvent(
    new MouseEvent('contextmenu', {
      bubbles: true,
      button: 2,
      cancelable: true,
      clientX: xForColumn(columnIndex),
      clientY: CANVAS_HEIGHT / 2,
    }),
  );
}

function clickContextAction(label: string): void {
  const action = Array.from(
    document.querySelectorAll<HTMLElement>('.tm-canvas-context-menu__action'),
  ).find((element) => element.textContent?.includes(label));

  if (!action) throw new Error(`Context action "${label}" was not found`);
  action.click();
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.clearAllMocks();
});

describe('TableMinimap canvas column selection', () => {
  it('supports Finder-like single, range and additive selection in zoomable canvas mode', () => {
    const { canvas, minimap, selectedChanges } = createFixture();

    dispatchCanvasPointerClick(canvas, 9);
    expect(minimap.getSelectedColumns()).toEqual([9]);

    dispatchCanvasPointerClick(canvas, 14, { shiftKey: true });
    expect(minimap.getSelectedColumns()).toEqual([9, 10, 11, 12, 13, 14]);

    dispatchCanvasPointerClick(canvas, 3, { metaKey: true });
    expect(minimap.getSelectedColumns()).toEqual([3, 9, 10, 11, 12, 13, 14]);

    dispatchCanvasPointerClick(canvas, 7, { ctrlKey: true });
    expect(minimap.getSelectedColumns()).toEqual([3, 7, 9, 10, 11, 12, 13, 14]);

    dispatchCanvasPointerClick(canvas, 1);
    expect(minimap.getSelectedColumns()).toEqual([1]);

    expect(selectedChanges).toEqual([
      [9],
      [9, 10, 11, 12, 13, 14],
      [3, 9, 10, 11, 12, 13, 14],
      [3, 7, 9, 10, 11, 12, 13, 14],
      [1],
    ]);

    minimap.destroy();
  });

  it('applies context-menu mark and collapse actions to the selected columns', () => {
    const { canvas, minimap } = createFixture();

    minimap.setSelectedColumns([3, 4, 7]);
    openContextMenu(canvas, 4);

    expect(document.querySelector('.tm-canvas-context-menu')?.textContent).toContain(
      'Mark column (3)',
    );
    expect(document.querySelector('.tm-canvas-context-menu')?.textContent).toContain(
      'Collapse column (3)',
    );

    clickContextAction('Mark column');
    expect(minimap.getMarkedColumns()).toEqual([3, 4, 7]);
    expect(document.querySelector('.tm-canvas-context-menu__status')?.textContent).toBe(
      '3 columns marked.',
    );

    clickContextAction('Collapse column');
    expect(minimap.getHiddenColumns()).toEqual([3, 4, 7]);
    expect(document.querySelector('.tm-canvas-context-menu__status')?.textContent).toBe(
      '3 columns collapsed.',
    );

    minimap.destroy();
  });
});

