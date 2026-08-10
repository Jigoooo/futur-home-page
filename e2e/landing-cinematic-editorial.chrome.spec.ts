import { expect, test } from '@playwright/test';

test('renders the approved full-screen particle hero with restrained typography', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');

  const hero = page.locator('[data-landing-hero]');
  const particle = page.locator('[data-hero-particle-layer]');
  const title = page.getByRole('heading', { level: 1, name: 'BUILT FOR WHAT’S NEXT.' });

  expect((await hero.boundingBox())?.height).toBeGreaterThanOrEqual(720);
  expect((await particle.boundingBox())?.width).toBeGreaterThanOrEqual(1279);
  await expect(title).toBeVisible();
  await expect(page.locator('[data-hero-headline-row]')).toHaveText(['BUILT FOR', 'WHAT’S NEXT.']);
  expect(
    Number.parseFloat(await title.evaluate((node) => getComputedStyle(node).fontSize)),
  ).toBeLessThanOrEqual(80);
  expect(await title.evaluate((node) => getComputedStyle(node).fontFamily)).not.toContain(
    'League Gothic',
  );
  expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toContain(
    'Wanted Sans Variable',
  );
  await expect(hero.getByRole('link', { name: '프로젝트 문의하기' })).toHaveCount(1);
});

test('preserves in-view reveal targets and tablet navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 720 });
  await page.goto('/');

  expect(
    await page
      .locator('[data-editorial-trigger="in-view"]')
      .evaluateAll((elements) =>
        elements.every((element) => element.dataset.landingReveal === 'editorial'),
      ),
  ).toBe(true);
  await expect(page.getByRole('navigation', { name: '주요 메뉴' })).toBeVisible();
});

test('keeps Hero copy inside deliberate responsive gutters', async ({ page }) => {
  const title = page.getByRole('heading', { level: 1, name: 'BUILT FOR WHAT’S NEXT.' });

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  expect((await title.boundingBox())?.x).toBeGreaterThanOrEqual(32);

  await page.setViewportSize({ width: 390, height: 844 });
  expect((await title.boundingBox())?.x).toBeGreaterThanOrEqual(20);
});

test('uses the approved cinematic editorial information architecture', async ({ page }) => {
  await page.goto('/');

  const sectionIds = await page
    .locator('[data-landing-section]')
    .evaluateAll((sections) => sections.map((section) => section.id));
  expect(sectionIds).toEqual([
    'hero',
    'quality',
    'services',
    'review',
    'process',
    'faq',
    'contact',
    'footer',
  ]);

  const navHrefs = await page
    .getByRole('navigation', { name: '주요 메뉴' })
    .locator('a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(navHrefs).toEqual(['#quality', '#services', '#review', '#process', '#faq', '#contact']);

  await expect(page.locator('#responsibility')).toHaveCount(0);
  await expect(page.getByText('책임은 역할과 이름으로 확인할 수 있어야 합니다.')).toHaveCount(0);
});
