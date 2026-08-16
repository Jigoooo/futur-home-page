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
  await card.scrollIntoViewIfNeeded();
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
    .toBeLessThan(-3.7);
  const activeTransform = await surface.evaluate((element) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return { rotateB: matrix.b, rotateC: matrix.c, scale: matrix.a, y: matrix.m42 };
  });
  expect(activeTransform.y).toBeGreaterThan(-4.5);
  expect(activeTransform.scale).toBeGreaterThan(1.001);
  expect(activeTransform.scale).toBeLessThan(1.003);
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
    .toBeLessThan(-3.7);
  await expect
    .poll(() =>
      surface.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42),
    )
    .toBeGreaterThan(-4.5);
});

test('keeps service cards static for reduced motion and touch', async ({ browser }) => {
  const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });
  await reducedPage.goto('/#services');
  await waitForLandingHydration(reducedPage);
  await reducedPage.locator('[data-service-card]').first().hover();
  await expect(reducedPage.locator('[data-service-card-surface]').first()).toHaveCSS(
    'transform',
    'none',
  );
  await expect(reducedPage.locator('[data-service-card-lens]').first()).toHaveCSS('opacity', '0');
  await reducedPage.close();

  const touchContext = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const touchPage = await touchContext.newPage();
  await touchPage.goto('/#services');
  await waitForLandingHydration(touchPage);
  const touchCard = touchPage.locator('[data-service-card]').first();
  await touchCard.scrollIntoViewIfNeeded();
  const touchCardBox = await touchCard.boundingBox();
  expect(touchCardBox).not.toBeNull();
  await touchPage.touchscreen.tap((touchCardBox?.x ?? 0) + 40, (touchCardBox?.y ?? 0) + 40);
  await expect(touchPage.locator('[data-service-card-surface]').first()).toHaveCSS(
    'transform',
    'none',
  );
  await expect(touchPage.locator('[data-service-card-lens]').first()).toHaveCSS('opacity', '0');
  await touchContext.close();
});

test('uses a compact Footer utility grid and preserves real information', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#footer');
  await waitForLandingHydration(page);

  const footer = page.locator('#footer');
  const inquiry = footer.getByRole('link', { name: '문의하기', exact: true });
  await expect(inquiry).toHaveAttribute('href', /^mailto:/);
  await expect(inquiry.locator('[data-landing-label]')).toHaveText('문의하기');

  const utility = footer.locator('[data-footer-utility]');
  await expect(utility).toHaveCount(1);
  await expect(utility.locator('[data-footer-utility-column]')).toHaveCount(3);
  await expect(utility.locator('[data-footer-wordmark]')).toHaveText('FUTUR.');
  await expect(footer.locator('[data-footer-signature]')).toHaveCount(0);
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

test('draws one utility hairline and reveals the three Footer columns once', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await waitForLandingHydration(page);

  const utility = page.locator('[data-footer-utility]');
  const line = utility.locator('[data-footer-utility-line]');
  const columns = utility.locator('[data-footer-utility-column]');
  await utility.scrollIntoViewIfNeeded();
  await expect(utility).toHaveAttribute('data-landing-visible', 'true');
  await expect(line).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  await expect(columns).toHaveCount(3);
  const delays = await columns.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).transitionDelay),
  );
  expect(delays).toEqual(['0s', '0.06s', '0.12s']);

  await page.locator('#services').scrollIntoViewIfNeeded();
  await utility.scrollIntoViewIfNeeded();
  await expect(utility).toHaveAttribute('data-landing-visible', 'true');
});

test('uses a static Footer utility grid for reduced motion and touch', async ({ browser }) => {
  const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });
  await reducedPage.goto('/#footer');
  await waitForLandingHydration(reducedPage);
  const reducedUtility = reducedPage.locator('[data-footer-utility]');
  await expect(reducedUtility.locator('[data-footer-utility-line]')).toHaveCSS(
    'transform',
    'matrix(1, 0, 0, 1, 0, 0)',
  );
  for (const column of await reducedUtility.locator('[data-footer-utility-column]').all()) {
    await expect(column).toHaveCSS('transform', 'none');
    await expect(column).toHaveCSS('transition-duration', '0s');
  }
  await reducedPage.close();

  const touchContext = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const touchPage = await touchContext.newPage();
  await touchPage.goto('/#footer');
  await waitForLandingHydration(touchPage);
  const touchUtility = touchPage.locator('[data-footer-utility]');
  for (const column of await touchUtility.locator('[data-footer-utility-column]').all()) {
    await expect(column).toHaveCSS('transform', 'none');
    await expect(column).toHaveCSS('transition-duration', '0s');
  }
  await touchContext.close();
});

test('keeps Services and Footer readable without horizontal overflow at supported widths', async ({
  browser,
}) => {
  const page = await browser.newPage();
  for (const width of [1280, 900, 390]) {
    await page.setViewportSize({ width, height: width === 1280 ? 900 : 844 });
    await page.goto('/');
    await waitForLandingHydration(page);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    ).toBe(false);
    await expect(page.locator('[data-service-card]')).toHaveCount(4);
    await expect(page.locator('[data-footer-utility]')).toHaveCount(1);
    await expect(page.locator('[data-footer-signature]')).toHaveCount(0);

    const layout = await page.locator('[data-footer-utility-grid]').evaluate((element) => ({
      columns: getComputedStyle(element).gridTemplateColumns.split(' ').length,
      wordmarkColumn: getComputedStyle(
        element.querySelector<HTMLElement>('[data-footer-wordmark]')!,
      ).gridColumnStart,
    }));
    expect(layout.columns).toBe(width > 900 ? 3 : width > 560 ? 2 : 1);
    if (width === 900) expect(layout.wordmarkColumn).toBe('span 2');
  }
  await page.close();

  const noScriptContext = await browser.newContext({ javaScriptEnabled: false });
  const noScriptPage = await noScriptContext.newPage();
  await noScriptPage.goto('/');
  await expect(noScriptPage.locator('[data-service-card]')).toHaveCount(4);
  await expect(noScriptPage.locator('[data-footer-utility]')).toBeVisible();
  await expect(noScriptPage.locator('[data-footer-signature]')).toHaveCount(0);
  await expect(noScriptPage.getByRole('link', { name: '문의하기', exact: true })).toHaveAttribute(
    'href',
    /^mailto:/,
  );
  await noScriptContext.close();
});

test('surfaces a Services child overflow instead of concealing it at section or page level', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#services');
  await waitForLandingHydration(page);

  const overflowIsObservable = await page.evaluate(() => {
    const services = document.querySelector<HTMLElement>('#services')!;
    const sentinel = document.createElement('span');
    sentinel.setAttribute('aria-hidden', 'true');
    Object.assign(sentinel.style, {
      height: '1px',
      left: '100%',
      pointerEvents: 'none',
      position: 'absolute',
      top: '0',
      width: '32px',
    });
    services.append(sentinel);

    const overflowDetected = document.documentElement.scrollWidth > window.innerWidth;
    sentinel.remove();
    return overflowDetected;
  });

  expect(overflowIsObservable).toBe(true);
});
