import { expect, test, type Page } from '@playwright/test';

async function waitForLandingHydration(page: Page) {
  await page.waitForFunction(() => {
    const landing = document.querySelector('[data-landing-page]');
    return landing && Object.keys(landing).some((key) => key.startsWith('__reactProps$'));
  });
}

test('keeps four informational service cards with one surface and lens each', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#services');
  await waitForLandingHydration(page);

  const cards = page.locator('#services [data-service-card]');
  await expect(cards).toHaveCount(4);
  await expect(cards.locator('[data-service-card-surface]')).toHaveCount(4);
  await expect(cards.locator('[data-service-card-lens][aria-hidden="true"]')).toHaveCount(4);
  await expect(cards.locator('a, button, [role], [tabindex], img, picture, svg')).toHaveCount(0);

  const cursorValues = await cards.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).cursor),
  );
  expect(cursorValues.every((cursor) => cursor === 'auto' || cursor === 'default')).toBe(true);
});

test('lifts one fine-pointer service surface and tracks the local ink lens', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#services');
  await waitForLandingHydration(page);

  const card = page.locator('[data-service-card]').first();
  const surface = card.locator('[data-service-card-surface]');
  const lens = card.locator('[data-service-card-lens]');
  const box = await card.boundingBox();
  expect(box).not.toBeNull();

  await page.mouse.move((box?.x ?? 0) + 80, (box?.y ?? 0) + 90);
  await expect
    .poll(() =>
      surface.evaluate((element) => {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
        return matrix.m42;
      }),
    )
    .toBeLessThan(-5.5);
  const activeTransform = await surface.evaluate((element) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return { rotateB: matrix.b, rotateC: matrix.c, scale: matrix.a, y: matrix.m42 };
  });
  expect(activeTransform.y).toBeGreaterThan(-8.5);
  expect(activeTransform.scale).toBeGreaterThan(1.003);
  expect(activeTransform.scale).toBeLessThan(1.009);
  expect(activeTransform.rotateB).toBeCloseTo(0, 5);
  expect(activeTransform.rotateC).toBeCloseTo(0, 5);

  const firstX = await lens.evaluate((element) =>
    element.style.getPropertyValue('--service-lens-x'),
  );
  await page.mouse.move((box?.x ?? 0) + (box?.width ?? 0) - 80, (box?.y ?? 0) + 140);
  await expect
    .poll(() => lens.evaluate((element) => element.style.getPropertyValue('--service-lens-x')))
    .not.toBe(firstX);

  await page.mouse.move(0, 0);
  await expect
    .poll(() => surface.evaluate((element) => element.style.transform), { timeout: 1_000 })
    .toBe('');
});

test('redirects a service return tween on rapid re-entry', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#services');
  await waitForLandingHydration(page);
  const card = page.locator('[data-service-card]').nth(1);
  const surface = card.locator('[data-service-card-surface]');
  await card.scrollIntoViewIfNeeded();
  const box = await card.boundingBox();
  expect(box).not.toBeNull();
  const inside = { x: (box?.x ?? 0) + 70, y: (box?.y ?? 0) + 70 };

  await page.mouse.move(inside.x, inside.y);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(80);
  await page.mouse.move(inside.x + 40, inside.y + 20);
  await expect
    .poll(() =>
      surface.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42),
    )
    .toBeLessThan(-5.5);
});

test('keeps service cards static for reduced motion and touch', async ({ browser }) => {
  const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });
  await reducedPage.goto('/#services');
  await reducedPage.locator('[data-service-card]').first().hover();
  await expect(reducedPage.locator('[data-service-card-surface]').first()).toHaveCSS(
    'transform',
    'none',
  );
  await reducedPage.close();

  const touchContext = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const touchPage = await touchContext.newPage();
  await touchPage.goto('/#services');
  await expect(touchPage.locator('[data-service-card-surface]').first()).toHaveCSS(
    'transform',
    'none',
  );
  await expect(touchPage.locator('[data-service-card-lens]').first()).toHaveCSS('opacity', '0');
  await touchContext.close();
});
