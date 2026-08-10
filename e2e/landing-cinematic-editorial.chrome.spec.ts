import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

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

test('loads scene motion lazily and preserves the reduced-motion final state', async ({
  browser,
  page,
}) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.goto('/');

  await expect(page.locator('[data-landing-page]')).toHaveAttribute(
    'data-landing-scene-motion',
    'ready',
  );

  await page.reload();
  await expect(page.locator('[data-landing-page]')).toHaveAttribute(
    'data-landing-scene-motion',
    'ready',
  );
  expect(runtimeErrors).toEqual([]);

  const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });

  await reducedPage.goto('/');
  await expect(reducedPage.locator('[data-landing-page]')).not.toHaveAttribute(
    'data-landing-scene-motion',
    'ready',
  );
  await expect(
    reducedPage.getByRole('heading', { level: 1, name: 'BUILT FOR WHAT’S NEXT.' }),
  ).toBeVisible();

  await reducedPage.close();
});

test('uses one rounded solid quality stage instead of ledger rows', async ({ page }) => {
  await page.goto('/');

  const quality = page.locator('#quality');
  await expect(quality.locator('[data-quality-stage]')).toHaveCount(1);
  await expect(quality.locator('[data-quality-orb]')).toHaveCount(2);
  await expect(quality.locator('[data-quality-copy]')).toHaveCount(1);
  await expect(quality.locator('article')).toHaveCount(0);
  expect(
    Number.parseFloat(
      await quality
        .locator('[data-quality-stage]')
        .evaluate((node) => getComputedStyle(node).borderRadius),
    ),
  ).toBeGreaterThanOrEqual(32);
});

test('keeps the decorative quality stage visible without scene motion for reduced motion', async ({
  browser,
}) => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });

  await page.goto('/');

  await expect(page.locator('[data-landing-page]')).not.toHaveAttribute(
    'data-landing-scene-motion',
    'ready',
  );
  await expect(page.locator('[data-quality-copy]')).toBeVisible();
  await expect(page.locator('[data-quality-stage]')).toBeVisible();

  await page.close();
});

test('merges four service layers into one product core without an orbit', async ({ page }) => {
  await page.goto('/');

  const services = page.locator('#services');
  await expect(
    services.getByRole('heading', { name: '필요한 영역을 연결해 하나의 제품으로 만듭니다.' }),
  ).toBeVisible();
  await expect(services.locator('[data-service-merge]')).toHaveCount(1);
  await expect(services.locator('[data-service-layer]')).toHaveCount(4);
  await expect(services.locator('[data-service-core]')).toHaveCount(1);
  await expect(services.locator('[data-service-row]')).toHaveCount(4);
  await expect(services.locator('[data-service-orbit]')).toHaveCount(0);
});

test('keeps the completed service merge visible without scene motion for reduced motion', async ({
  browser,
}) => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });

  await page.goto('/');

  await expect(page.locator('[data-landing-page]')).not.toHaveAttribute(
    'data-landing-scene-motion',
    'ready',
  );
  await expect(page.locator('[data-service-merge]')).toBeVisible();
  await expect(page.locator('[data-service-core]')).toBeVisible();
  await expect(page.locator('[data-service-row]')).toHaveCount(4);

  await page.close();
});

test('keeps the service scene within the mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const services = page.locator('#services');
  expect(await services.evaluate((section) => section.scrollWidth <= section.clientWidth)).toBe(
    true,
  );
});

test('renders the completed service scene before JavaScript enhancement', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('/');

  await expect(page.locator('[data-service-merge]')).toBeVisible();
  await expect(page.locator('[data-service-core]')).toBeVisible();
  await expect(page.locator('[data-service-row]')).toHaveCount(4);
  await expect(page.locator('[data-service-row]').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-service-row]').first()).toHaveCSS('clip-path', 'none');

  await context.close();
});

test('uses a service-specific inline reveal instead of a generic row fade-up', async () => {
  const motionSource = await readFile(
    new URL('../src/pages/landing/ui/use-landing-scene-motion.ts', import.meta.url),
    'utf8',
  );

  expect(motionSource).toContain('clipPath');
  expect(motionSource).not.toMatch(/\.from\(rows, \{[^}]*\by:/s);
  expect(motionSource).not.toMatch(/\.from\(rows, \{[^}]*\bopacity:/s);
});

test('uses a curved review mask and a semantic process path', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('[data-review-stage]')).toHaveCount(1);
  await expect(page.locator('[data-review-mask]')).toHaveCount(1);
  await expect(page.locator('[data-review-group]')).toHaveCount(4);

  const path = page.locator('svg [data-process-path]');
  await expect(path).toHaveCount(1);
  await expect(page.locator('[data-process-marker]')).toHaveCount(1);
  await expect(page.locator('ol [data-process-step]')).toHaveCount(5);
  expect(
    await page
      .locator('#review, #process')
      .evaluateAll((sections) =>
        sections.every((section) => getComputedStyle(section).scrollSnapAlign !== 'start'),
      ),
  ).toBe(true);
});

test('keeps the Review and Process scenes restrained, semantic, and accessible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');

  const headings = page.locator('#review h2, #process h2');
  for (const heading of await headings.all()) {
    const { fontSize, letterSpacing } = await heading.evaluate((node) => {
      const style = getComputedStyle(node);
      return { fontSize: Number.parseFloat(style.fontSize), letterSpacing: style.letterSpacing };
    });
    expect(fontSize).toBeLessThanOrEqual(55);
    expect(Number.parseFloat(letterSpacing)).toBeGreaterThanOrEqual(fontSize * -0.04);
  }

  await expect(page.locator('[data-review-stage]')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('[data-review-mask]')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('svg:has([data-process-path])')).toHaveAttribute('aria-hidden', 'true');
});

test('keeps Review and Process final content visible without scene motion or JavaScript', async ({
  browser,
}) => {
  const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });
  await reducedPage.goto('/');

  await expect(reducedPage.locator('[data-landing-page]')).not.toHaveAttribute(
    'data-landing-scene-motion',
    'ready',
  );
  await expect(reducedPage.locator('[data-review-group]')).toHaveCount(4);
  await expect(reducedPage.locator('[data-review-group]').first()).toBeVisible();
  await expect(reducedPage.locator('[data-process-step]')).toHaveCount(5);
  await expect(reducedPage.locator('[data-process-step]').first()).toBeVisible();
  await expect(reducedPage.locator('[data-process-path]')).toBeVisible();
  await reducedPage.close();

  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  await staticPage.goto('/');

  await expect(staticPage.locator('[data-review-stage]')).toBeVisible();
  await expect(staticPage.locator('[data-review-mask]')).toBeVisible();
  await expect(staticPage.locator('[data-review-group]')).toHaveCount(4);
  await expect(staticPage.locator('[data-process-path]')).toBeVisible();
  await expect(staticPage.locator('[data-process-step]')).toHaveCount(5);
  await staticContext.close();
});

test('keeps Review and Process scenes within the mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  expect(
    await page.locator('#review, #process').evaluateAll((sections) =>
      sections.map((section) => ({
        id: section.id,
        fits: section.scrollWidth <= section.clientWidth,
      })),
    ),
  ).toEqual([
    { id: 'review', fits: true },
    { id: 'process', fits: true },
  ]);
});
