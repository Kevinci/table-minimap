import { expect, test, type Locator, type Page } from '@playwright/test';

const COLUMN_COUNT = 20;

type Selection = number[];

async function clickCanvasColumn(
  page: Page,
  canvas: Locator,
  columnIndex: number,
  modifier?: 'Meta' | 'Shift',
): Promise<void> {
  const box = await canvas.boundingBox();
  expect(box, 'canvas should be visible before clicking').not.toBeNull();
  if (!box) return;

  const x = box.x + box.width * ((columnIndex + 0.5) / COLUMN_COUNT);
  const y = box.y + box.height / 2;

  if (modifier) await page.keyboard.down(modifier);
  await page.mouse.click(x, y);
  if (modifier) await page.keyboard.up(modifier);
}

async function rightClickCanvasColumn(
  page: Page,
  canvas: Locator,
  columnIndex: number,
): Promise<void> {
  const box = await canvas.boundingBox();
  expect(box, 'canvas should be visible before right-clicking').not.toBeNull();
  if (!box) return;

  await page.mouse.click(
    box.x + box.width * ((columnIndex + 0.5) / COLUMN_COUNT),
    box.y + box.height / 2,
    { button: 'right' },
  );
}

function lastSelection(selections: Selection[]): Selection | undefined {
  return selections[selections.length - 1];
}

test.describe('canvas column selection', () => {
  test('supports Finder-like selection and applies context-menu actions to selected columns', async ({
    page,
  }) => {
    const selections: Selection[] = [];

    page.on('console', async (message) => {
      if (message.type() !== 'log') return;
      const args = message.args();
      if ((await args[0]?.jsonValue()) !== 'Selected columns:') return;
      const selectedColumns = await args[1]?.jsonValue();
      if (Array.isArray(selectedColumns)) {
        selections.push(selectedColumns as Selection);
      }
    });

    await page.goto('./');

    const canvas = page.locator('#demo-container-3 canvas');
    await expect(canvas).toBeVisible();
    await canvas.scrollIntoViewIfNeeded();

    await clickCanvasColumn(page, canvas, 9);
    await expect.poll(() => lastSelection(selections)).toEqual([9]);

    await clickCanvasColumn(page, canvas, 14, 'Shift');
    await expect.poll(() => lastSelection(selections)).toEqual([9, 10, 11, 12, 13, 14]);

    await clickCanvasColumn(page, canvas, 3, 'Meta');
    await expect.poll(() => lastSelection(selections)).toEqual([3, 9, 10, 11, 12, 13, 14]);

    await rightClickCanvasColumn(page, canvas, 9);
    await expect(page.getByText('Mark column (7)')).toBeVisible();
    await expect(page.getByText('Collapse column (7)')).toBeVisible();

    await page.getByText('Mark column (7)').click();
    await expect(page.getByText('7 columns marked.')).toBeVisible();

    await page.getByText('Collapse column (7)').click();
    await expect(page.getByText('7 columns collapsed.')).toBeVisible();
  });
});

