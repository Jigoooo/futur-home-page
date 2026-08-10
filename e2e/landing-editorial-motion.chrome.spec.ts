import { expect, test } from '@playwright/test';

const HERO_LABEL = 'BUILT FOR WHAT’S NEXT.';

test('reveals classic sections once without hiding SSR content', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('[data-landing-reveal]').first()).toBeVisible();
  await page.locator('#team').scrollIntoViewIfNeeded();
  await expect(page.locator('#team [data-landing-reveal]').first()).toHaveAttribute(
    'data-landing-visible',
    'true',
  );
});

test('keeps classic content visible without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('/');

  for (const selector of ['#services', '#team', '#contact']) {
    const target = page.locator(`${selector} [data-landing-reveal]`).first();

    await expect(target).toBeVisible();
    expect(
      await target.evaluate((node) => {
        const style = getComputedStyle(node);
        return { opacity: style.opacity, transform: style.transform };
      }),
    ).toEqual({ opacity: '1', transform: 'none' });
  }

  await context.close();
});

test('serves the classic landing content without a JavaScript visibility gate', async ({
  browser,
  page,
  request,
}) => {
  const response = await request.get('/');
  const html = await response.text();

  expect(response.ok()).toBe(true);
  expect(html).toContain(HERO_LABEL);
  expect(html).not.toContain('style-gate-loader');
  expect(html).not.toContain("data-style-gate='pending'");
  expect(html).not.toContain('/fonts/PretendardVariable.woff2');

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: HERO_LABEL })).toBeVisible();
  await expect(page.getByText(/화면에 보이는 경험부터 코드와 데이터/)).toBeVisible();
  await expect(page.locator('.style-gate-loader')).toHaveCount(0);

  const noScriptPage = await browser.newPage({ javaScriptEnabled: false });
  await noScriptPage.goto('/');
  await expect(noScriptPage.getByRole('heading', { level: 1, name: HERO_LABEL })).toBeVisible();
  await expect(noScriptPage.getByRole('link', { name: /프로젝트 문의하기/ })).toBeVisible();
  await expect(noScriptPage.locator('#services')).toBeVisible();
  await expect(noScriptPage.locator('#team')).toBeVisible();
  await expect(noScriptPage.locator('#contact')).toBeVisible();
  await noScriptPage.close();
});

test('retains contact disclosures', async ({ page }) => {
  await page.goto('/');

  const form = page.getByRole('form', { name: '프로젝트 상담 양식' });
  await expect(
    form.getByRole('checkbox', { name: /개인정보 수집·이용에 동의합니다/ }),
  ).toBeVisible();
  await expect(form.getByRole('list', { name: '개인정보 수집·이용 고지' })).toBeVisible();
  await expect(
    form.getByRole('checkbox', { name: /개인정보 국외 이전에 동의합니다/ }),
  ).toBeVisible();
  await expect(form.getByRole('list', { name: '개인정보 국외 이전 고지' })).toBeVisible();
});

test('limits staggered entrance motion to the hero and keeps classic section containers visible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const heroUnits = page.locator('[data-landing-hero] [data-editorial-unit]');
  await expect(heroUnits).toHaveCount(2);

  const heroMotion = await heroUnits.evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element);
      return {
        duration: style.animationDuration,
        name: style.animationName,
        filter: style.filter,
      };
    }),
  );

  expect(heroMotion.every(({ duration }) => duration === '0.4s')).toBe(true);
  expect(heroMotion.every(({ name }) => name !== 'none')).toBe(true);
  expect(heroMotion.every(({ filter }) => filter === 'none')).toBe(true);

  const sections = page.locator('[data-landing-section]:not([data-landing-hero])');
  await expect(sections).toHaveCount(8);
  const visibility = await sections.evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element);
      return { opacity: style.opacity, visibility: style.visibility };
    }),
  );
  expect(
    visibility.every(({ opacity, visibility }) => opacity === '1' && visibility === 'visible'),
  ).toBe(true);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('shows restored sections in their final state', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    expect(
      await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches),
    ).toBe(true);

    await expect(
      page.locator('[data-landing-reveal]:not([data-landing-visible="true"])'),
    ).toHaveCount(0);
  });

  test('uses opacity-only hero fallback and keeps all content available', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const heroUnits = page.locator('[data-landing-hero] [data-editorial-unit]');
    await expect(heroUnits).toHaveCount(2);
    const motion = await heroUnits.evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        return {
          animationName: style.animationName,
          transform: style.transform,
        };
      }),
    );

    expect(
      motion.every(({ transform }) => transform === 'none'),
      JSON.stringify(motion),
    ).toBe(true);
    expect(
      motion.every(({ animationName }) => /(?:editorial|hero)OpacityIn/.test(animationName)),
    ).toBe(true);
    await expect(page.locator('#contact')).toBeVisible();
  });
});
