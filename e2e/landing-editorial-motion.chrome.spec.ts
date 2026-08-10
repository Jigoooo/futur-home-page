import { expect, test } from '@playwright/test';

const HERO_LABEL = 'FROM COMPLEX WORK TO SERVICES THAT WORK.';

test('serves the editorial hero immediately with the critical font preloaded', async ({
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
  expect(html).toContain('/fonts/PretendardVariable.critical.woff2');
  expect(html).not.toContain('/fonts/PretendardVariable.woff2');

  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: HERO_LABEL })).toBeVisible();
  await expect(page.getByText(/사용자 흐름과 데이터 구조를 함께 설계하고/)).toBeVisible();
  await expect(page.locator('.style-gate-loader')).toHaveCount(0);

  const noScriptPage = await browser.newPage({ javaScriptEnabled: false });
  await noScriptPage.goto('/');
  await expect(noScriptPage.getByRole('heading', { level: 1, name: HERO_LABEL })).toBeVisible();
  await expect(noScriptPage.getByRole('link', { name: /프로젝트 문의하기/ })).toBeVisible();
  await expect(noScriptPage.locator('.style-gate-loader')).toHaveCount(0);
  await noScriptPage.close();
});

test('does not swap the hero geometry when the critical font arrives late', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.route('**/fonts/PretendardVariable.critical.woff2', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1_200));
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const heading = page.getByRole('heading', { level: 1, name: HERO_LABEL });
  const initialBox = await heading.boundingBox();
  await page.waitForTimeout(1_500);
  const settledBox = await heading.boundingBox();
  const fontRequests = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((name) => name.includes('/fonts/')),
  );

  expect(initialBox).not.toBeNull();
  expect(settledBox).not.toBeNull();
  expect(Math.abs((initialBox?.width ?? 0) - (settledBox?.width ?? 0))).toBeLessThan(1);
  expect(Math.abs((initialBox?.height ?? 0) - (settledBox?.height ?? 0))).toBeLessThan(1);
  expect(fontRequests.some((name) => name.endsWith('PretendardVariable.woff2'))).toBe(false);

  await context.close();
});

test('removes decorative English kickers and keeps the contact disclosures', async ({ page }) => {
  await page.goto('/');

  for (const kicker of [
    'Our Services',
    'Stack',
    'Project Records',
    'Our Team',
    'Process',
    'Operations',
    'Review',
    'FAQ',
    'Project Brief',
  ]) {
    await expect(page.locator('span').filter({ hasText: new RegExp(`^${kicker}$`) })).toHaveCount(
      0,
    );
  }

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

test('uses an editorial word reveal and a sticky navy service chapter on desktop', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const hero = page.locator('[data-landing-hero]');
  const words = hero.locator('[data-editorial-word]');
  const services = page.locator('#services');

  await expect(words).toHaveCount(7);
  await expect(services).toHaveAttribute('data-editorial-chapter', 'services');

  const heroMotion = await words.evaluateAll((elements) =>
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

  await services.scrollIntoViewIfNeeded();
  const chapterStyle = await services.evaluate((element) => {
    const style = getComputedStyle(element);
    return { backgroundColor: style.backgroundColor, backgroundImage: style.backgroundImage };
  });
  const stickyPosition = await services
    .locator('[data-services-sticky]')
    .evaluate((element) => getComputedStyle(element).position);

  expect(chapterStyle.backgroundColor).toBe('rgb(7, 24, 63)');
  expect(chapterStyle.backgroundImage).toBe('none');
  expect(stickyPosition).toBe('sticky');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('removes spatial text and chapter motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForTimeout(50);

    const motion = await page.locator('[data-editorial-word]').evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        return {
          animationName: style.animationName,
          transform: style.transform,
        };
      }),
    );
    const services = page.locator('#services');
    const stickyPosition = await services
      .locator('[data-services-sticky]')
      .evaluate((element) => getComputedStyle(element).position);
    const clipPath = await services.evaluate((element) => getComputedStyle(element).clipPath);

    expect(
      motion.every(({ transform }) => transform === 'none'),
      JSON.stringify(motion),
    ).toBe(true);
    expect(
      motion.every(({ animationName }) => /(?:editorial|hero)OpacityIn/.test(animationName)),
    ).toBe(true);
    expect(stickyPosition).toBe('static');
    expect(clipPath).toBe('none');
  });
});
