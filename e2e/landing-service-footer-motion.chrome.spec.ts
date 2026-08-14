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

  const pageWidth = await page.evaluate(() => ({
    height: window.innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    width: window.innerWidth,
  }));
  expect(pageWidth).toMatchObject({ height: 900, width: 1280 });
  expect(pageWidth.scrollWidth).toBeLessThanOrEqual(pageWidth.width);
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

test('replaces the duplicate Footer logo with one decorative signature and preserves real information', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#footer');
  await waitForLandingHydration(page);

  const footer = page.locator('#footer');
  const inquiry = footer.getByRole('link', { name: '문의하기', exact: true });
  await expect(inquiry).toHaveAttribute('href', /^mailto:/);
  await expect(inquiry.locator('[data-landing-label]')).toHaveText('문의하기');

  await expect(footer.getByRole('heading', { name: 'FUTUR.' })).toHaveCount(0);
  const signature = footer.locator('[data-footer-signature][aria-hidden="true"]');
  await expect(signature).toHaveCount(1);
  await expect(signature.locator('[data-footer-signature-base]')).toHaveText('FUTUR.');
  await expect(signature.locator('[data-footer-signature-lens]')).toHaveText('FUTUR.');
  await expect(footer.locator('address')).toBeVisible();
  expect(await footer.locator('a[href^="mailto:"]').count()).toBeGreaterThanOrEqual(2);

  const lowerHairlineCount = await footer.locator(':scope > div > *').evaluateAll(
    (elements) =>
      elements.filter((element) => {
        const style = getComputedStyle(element);
        return style.borderTopStyle === 'solid' && style.borderTopWidth === '1px';
      }).length,
  );
  expect(lowerHairlineCount).toBe(2);

  for (const text of [
    '서비스와 시스템을 만들고, 필요한 기술을 연결해 운영까지 이어갑니다.',
    '개인정보처리방침',
    '이용약관',
    '사업자등록번호',
    '통신판매업',
    '개인정보 보호책임자',
  ]) {
    await expect(footer.getByText(text, { exact: false }).first()).toBeVisible();
  }
});

test('reveals the Footer signature once and tracks the lens without moving the wordmark', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await waitForLandingHydration(page);

  const signature = page.locator('[data-footer-signature]');
  await signature.scrollIntoViewIfNeeded();
  await expect(signature).toHaveAttribute('data-landing-visible', 'true');
  await expect
    .poll(() => signature.evaluate((element) => getComputedStyle(element).transform))
    .toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);

  const box = await signature.boundingBox();
  expect(box).not.toBeNull();
  const beforeRect = await signature.evaluate((element) =>
    element.getBoundingClientRect().toJSON(),
  );
  await page.mouse.move((box?.x ?? 0) + 100, (box?.y ?? 0) + 40);
  await expect(signature.locator('[data-footer-signature-lens]')).toHaveCSS('opacity', '1');
  const firstX = await signature.evaluate((element) =>
    element.style.getPropertyValue('--footer-signature-x'),
  );
  await page.mouse.move((box?.x ?? 0) + (box?.width ?? 0) - 120, (box?.y ?? 0) + 55);
  await expect
    .poll(() =>
      signature.evaluate((element) => element.style.getPropertyValue('--footer-signature-x')),
    )
    .not.toBe(firstX);
  const afterRect = await signature.evaluate((element) => element.getBoundingClientRect().toJSON());
  expect(afterRect.x).toBeCloseTo(beforeRect.x, 1);
  expect(afterRect.y).toBeCloseTo(beforeRect.y, 1);

  await page.mouse.move(0, 0);
  await expect(signature.locator('[data-footer-signature-lens]')).toHaveCSS('opacity', '0');

  await page.locator('#services').scrollIntoViewIfNeeded();
  await signature.scrollIntoViewIfNeeded();
  await expect(signature).toHaveAttribute('data-landing-visible', 'true');
});

test('uses a static Footer signature for reduced motion and touch', async ({ browser }) => {
  const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });
  await reducedPage.goto('/#footer');
  await waitForLandingHydration(reducedPage);
  const reducedSignature = reducedPage.locator('[data-footer-signature]');
  await expect(reducedSignature).toHaveCSS('transform', 'none');
  await expect(reducedSignature.locator('[data-footer-signature-lens]')).toHaveCSS('opacity', '0');
  await reducedPage.close();

  const touchContext = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const touchPage = await touchContext.newPage();
  await touchPage.goto('/#footer');
  await waitForLandingHydration(touchPage);
  await expect(touchPage.locator('[data-footer-signature-lens]')).toHaveCSS('opacity', '0');
  await touchContext.close();
});
