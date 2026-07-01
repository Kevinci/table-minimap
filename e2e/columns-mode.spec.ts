import { expect, test, type Locator, type Page } from '@playwright/test';

async function getScrollMetrics(wrapper: Locator): Promise<{
  scrollLeft: number;
  maxScroll: number;
}> {
  return wrapper.evaluate((element) => ({
    scrollLeft: element.scrollLeft,
    maxScroll: Math.max(element.scrollWidth - element.clientWidth, 0),
  }));
}

async function clickMinimapAt(page: Page, minimap: Locator, ratio: number): Promise<void> {
  const box = await minimap.boundingBox();
  expect(box, 'columns minimap should be visible before clicking').not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * ratio, box.y + box.height / 2);
}

test.describe('columns mode navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.locator('#version-columns').scrollIntoViewIfNeeded();
    await expect(page.locator('#demo-container-1 .tm-minimap')).toBeVisible();
  });

  test('scroll buttons move the table to start, middle and end', async ({ page }) => {
    const wrapper = page.locator('#table-wrapper-1');
    const maxScroll = (await getScrollMetrics(wrapper)).maxScroll;
    expect(maxScroll).toBeGreaterThan(0);

    await page.locator('#scroll-end-1').click();
    await expect
      .poll(async () => (await getScrollMetrics(wrapper)).scrollLeft)
      .toBeGreaterThan(maxScroll * 0.85);
    await expect(page.locator('#scroll-pos-1')).toContainText('100%');

    await page.locator('#scroll-middle-1').click();
    await expect
      .poll(async () => {
        const { scrollLeft } = await getScrollMetrics(wrapper);
        return Math.abs(scrollLeft - maxScroll / 2);
      })
      .toBeLessThan(maxScroll * 0.2);
    await expect(page.locator('#scroll-pos-1')).toContainText(/4\d%|5\d%|6\d%/);

    await page.locator('#scroll-start-1').click();
    await expect
      .poll(async () => (await getScrollMetrics(wrapper)).scrollLeft)
      .toBeLessThan(maxScroll * 0.15);
    await expect(page.locator('#scroll-pos-1')).toContainText('0%');
  });

  test('clicking the columns minimap navigates right and left', async ({ page }) => {
    const wrapper = page.locator('#table-wrapper-1');
    const minimap = page.locator('#demo-container-1 .tm-minimap');
    const maxScroll = (await getScrollMetrics(wrapper)).maxScroll;
    expect(maxScroll).toBeGreaterThan(0);

    await page.locator('#scroll-start-1').click();
    await expect
      .poll(async () => (await getScrollMetrics(wrapper)).scrollLeft)
      .toBeLessThan(maxScroll * 0.15);

    await clickMinimapAt(page, minimap, 0.9);
    await expect
      .poll(async () => (await getScrollMetrics(wrapper)).scrollLeft)
      .toBeGreaterThan(maxScroll * 0.45);

    await clickMinimapAt(page, minimap, 0.05);
    await expect
      .poll(async () => (await getScrollMetrics(wrapper)).scrollLeft)
      .toBeLessThan(maxScroll * 0.2);
  });
});
