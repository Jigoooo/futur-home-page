import { expect, test } from '@playwright/test';

const HERO_LABEL = 'VISIBLE EXPERIENCE. SOUND STRUCTURE.';

test('serves the editorial landing content without a JavaScript visibility gate', async ({
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
  await expect(page.getByText(/보이는 화면과 보이지 않는 구조를/)).toBeVisible();
  await expect(page.locator('.style-gate-loader')).toHaveCount(0);

  const noScriptPage = await browser.newPage({ javaScriptEnabled: false });
  await noScriptPage.goto('/');
  await expect(noScriptPage.getByRole('heading', { level: 1, name: HERO_LABEL })).toBeVisible();
  await expect(noScriptPage.getByRole('link', { name: /프로젝트 문의하기/ })).toBeVisible();
  await expect(noScriptPage.locator('#quality')).toBeVisible();
  await expect(noScriptPage.locator('#contact')).toBeVisible();
  await noScriptPage.close();
});

test('keeps decorative English kickers out and retains contact disclosures', async ({ page }) => {
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

test('limits staggered entrance motion to the hero and keeps later sections visible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const heroWords = page.locator('[data-landing-hero] [data-editorial-word]');
  await expect(heroWords).toHaveCount(4);

  const heroMotion = await heroWords.evaluateAll((elements) =>
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

  test('uses opacity-only hero fallback and keeps all content available', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const motion = await page.locator('[data-editorial-word]').evaluateAll((elements) =>
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
