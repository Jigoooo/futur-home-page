import { expect, test } from '@playwright/test';

import {
  DENSITY_VERTEX_SHADER,
  EMITTER_FRAGMENT_SHADER,
  EMITTER_VERTEX_SHADER,
  HERO_POINTER_RESPONSE,
  MAIN_FRAGMENT_SHADER,
  MAIN_VERTEX_SHADER,
} from '../src/pages/landing/ui/hero-particle-shaders';

const HERO_LABEL = 'BUILT FOR WHAT’S NEXT.';

test('serves the hero copy and particle canvas immediately from SSR', async ({
  browser,
  page,
  request,
}) => {
  const response = await request.get('/');
  const html = await response.text();

  expect(response.ok()).toBe(true);
  expect(html).toContain(HERO_LABEL);
  expect(html).not.toContain('futur-system-flow-poster.webp');
  expect(html).not.toContain('futur-system-flow.webm');
  expect(html).not.toContain('futur-system-flow.mp4');
  expect(html).not.toContain('<video');
  expect(html).toContain('data-hero-particles');

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: HERO_LABEL })).toBeVisible();
  await expect(page.locator('[data-hero-media]')).toHaveCount(0);
  await expect(page.locator('canvas[data-hero-particles]')).toHaveCount(1);
  await expect(page.locator('[data-hero-particle-layer]')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.getByRole('link', { name: /프로젝트 문의하기/ })).toBeVisible();
  await expect(page.locator('[data-landing-hero] a')).toHaveCount(1);

  const noScriptPage = await browser.newPage({ javaScriptEnabled: false });
  await noScriptPage.goto('/');
  await expect(noScriptPage.getByRole('heading', { level: 1, name: HERO_LABEL })).toBeVisible();
  await expect(noScriptPage.locator('[data-hero-media]')).toHaveCount(0);
  await expect(noScriptPage.locator('canvas[data-hero-particles]')).toHaveCount(1);
  await expect(noScriptPage.locator('[data-hero-video]')).toHaveCount(0);
  await noScriptPage.close();
});

test('does not mount or request hero video and poster assets', async ({ page }) => {
  const mediaRequests: string[] = [];
  page.on('request', (request) => {
    if (/\/media\/hero\/futur-system-flow/.test(request.url())) mediaRequests.push(request.url());
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('[data-hero-video], [data-hero-poster]')).toHaveCount(0);
  expect(mediaRequests).toEqual([]);
});

test('renders a changing WebGL2 particle field and reacts to pointer movement', async ({
  page,
}) => {
  await page.goto('/');

  const canvas = page.locator('canvas[data-hero-particles]');
  await expect(canvas).toHaveAttribute('data-particle-state', 'ready');

  const runtime = await canvas.evaluate((element) => {
    const context = (element as HTMLCanvasElement).getContext('webgl2');
    return {
      context: context ? 'webgl2' : 'none',
      width: (element as HTMLCanvasElement).width,
      height: (element as HTMLCanvasElement).height,
    };
  });
  expect(runtime.context).toBe('webgl2');
  expect(runtime.width).toBeGreaterThan(0);
  expect(runtime.height).toBeGreaterThan(0);

  const before = await canvas.screenshot();
  await page.waitForTimeout(900);
  const after = await canvas.screenshot();
  expect(after.equals(before)).toBe(false);

  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.move(box.x + box.width * 0.72, box.y + box.height * 0.42);
  await expect(canvas).toHaveAttribute('data-pointer-active', 'true');

  await page.evaluate(() => window.scrollTo({ top: window.innerHeight, behavior: 'instant' }));
  await page.mouse.move(8, 8);
  await expect(canvas).toHaveAttribute('data-pointer-active', 'false');
});

test('runs the dense parametric particle pipeline on the dark hero surface', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const hero = page.locator('[data-landing-hero]');
  const canvas = page.locator('canvas[data-hero-particles]');
  await expect(canvas).toHaveAttribute('data-particle-state', 'ready');
  await expect(hero).toHaveCSS('background-color', 'rgb(32, 37, 35)');
  await expect(canvas).toHaveCSS('opacity', '1');
  await expect(canvas).toHaveAttribute('data-particle-density', 'active');
  await expect(canvas).toHaveAttribute('data-particle-displacement', 'feedback-touch');
  await expect(canvas).toHaveAttribute('data-particle-contact', 'trail-24');
  await expect(canvas).toHaveAttribute('data-particle-emitter', 'active');
  await expect(canvas).toHaveAttribute('data-particle-emitter-count', '4000');
  await expect(canvas).toHaveAttribute('data-particle-emitter-style', 'dandelion-seeds');
  await expect(canvas).toHaveAttribute('data-particle-initial-shape', 'braided-flow');
  await expect(canvas).toHaveAttribute('data-particle-initial-density', 'clustered');
  await expect(canvas).toHaveAttribute('data-particle-surface-scale', 'expanded');
  await expect(canvas).toHaveAttribute(
    'data-pointer-lift',
    String(HERO_POINTER_RESPONSE.surfaceLift),
  );

  const particleCount = Number(await canvas.getAttribute('data-particle-count'));
  expect(particleCount).toBeGreaterThanOrEqual(68_000);
});

test('uses bounded particle tiers outside desktop', async ({ browser }) => {
  const compactDesktopPage = await browser.newPage({ viewport: { width: 1095, height: 996 } });
  await compactDesktopPage.goto('/');
  const compactDesktopCanvas = compactDesktopPage.locator('canvas[data-hero-particles]');
  await expect(compactDesktopCanvas).toHaveAttribute('data-particle-state', 'ready');
  await expect(compactDesktopCanvas).toHaveAttribute('data-particle-count', '70000');
  await expect(compactDesktopCanvas).toHaveAttribute('data-particle-emitter-count', '4000');
  await compactDesktopPage.close();

  const tabletPage = await browser.newPage({ viewport: { width: 900, height: 996 } });
  await tabletPage.goto('/');
  const tabletCanvas = tabletPage.locator('canvas[data-hero-particles]');
  await expect(tabletCanvas).toHaveAttribute('data-particle-state', 'ready');
  const tabletCount = Number(await tabletCanvas.getAttribute('data-particle-count'));
  expect(tabletCount).toBeGreaterThanOrEqual(42_000);
  expect(tabletCount).toBeLessThanOrEqual(46_000);
  await tabletPage.close();

  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('/');
  const mobileCanvas = mobilePage.locator('canvas[data-hero-particles]');
  await expect(mobileCanvas).toHaveAttribute('data-particle-state', 'ready');
  const mobileCount = Number(await mobileCanvas.getAttribute('data-particle-count'));
  expect(mobileCount).toBeLessThanOrEqual(18_000);
  await expect(mobileCanvas).toHaveAttribute('data-particle-emitter', 'disabled');
  await mobilePage.close();
});

test('morphs surfaces and accumulates a damped contact trail', async ({ page }) => {
  await page.goto('/');

  const canvas = page.locator('canvas[data-hero-particles]');
  await expect(canvas).toHaveAttribute('data-particle-state', 'ready');

  const initialSurface = await canvas.getAttribute('data-particle-surface');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  for (let step = 0; step < 8; step += 1) {
    await page.mouse.move(box.x + 480 + step * 18, box.y + 330 + Math.sin(step) * 32);
  }

  await expect
    .poll(async () => Number(await canvas.getAttribute('data-pointer-samples')))
    .toBeGreaterThan(2);
  await page.waitForTimeout(6_500);
  await expect(canvas).not.toHaveAttribute('data-particle-surface', initialSurface ?? '');
});

test('keeps the sculptural silhouette while contact particles move and lift locally', () => {
  expect(DENSITY_VERTEX_SHADER).not.toContain('projected +=');
  expect(MAIN_VERTEX_SHADER).toContain('vec2 contactOffset =');
  expect(MAIN_VERTEX_SHADER).toContain('projected += contactOffset;');
  expect(MAIN_VERTEX_SHADER).toContain('float contact =');
  expect(MAIN_VERTEX_SHADER).toContain('vContact = contact;');
  expect(MAIN_VERTEX_SHADER).toContain('vec3 braidedFlow');
  expect(MAIN_VERTEX_SHADER).toContain('fitSurfaceToFrame');
  expect(EMITTER_VERTEX_SHADER).toContain('aDirection');
  expect(EMITTER_VERTEX_SHADER).toContain('uDisplacementTexture');
  expect(EMITTER_VERTEX_SHADER).toContain('trailContact');
  expect(EMITTER_VERTEX_SHADER).toContain('seedFlight');
  expect(EMITTER_FRAGMENT_SHADER).toContain('seedStem');
  expect(HERO_POINTER_RESPONSE.surfaceLift).toBeGreaterThan(0);
  expect(HERO_POINTER_RESPONSE.surfaceLift).toBeLessThanOrEqual(0.04);
});

test('keeps far-depth and dispersing particles visible on the dark hero surface', () => {
  expect(MAIN_VERTEX_SHADER).toContain('gl_PointSize = mix(0.9, 2.45, depth)');
  expect(MAIN_FRAGMENT_SHADER).toContain('vec3 farColor = vec3(0.18, 0.42, 0.5);');
  expect(MAIN_FRAGMENT_SHADER).toContain('mix(0.3, 0.68, vDepth)');
  expect(EMITTER_FRAGMENT_SHADER).toContain('vEmitterAlpha * 0.9');
});

test('clusters the initial braided flow around each ribbon centerline', () => {
  expect(MAIN_VERTEX_SHADER).toContain(
    'float compactAcross = sign(across) * pow(abs(across), 1.45);',
  );
  expect(MAIN_VERTEX_SHADER).toContain('float crossing = laneOffset * cos(uv.x * PI) * 0.74;');
  expect(MAIN_VERTEX_SHADER).toContain('compactAcross * 0.28');
});

test('keeps fast pointer movement within the surface-contact profile', async ({ page }) => {
  await page.goto('/');

  const canvas = page.locator('canvas[data-hero-particles]');
  await expect(canvas).toHaveAttribute('data-particle-state', 'ready');

  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  for (let step = 0; step < 12; step += 1) {
    await page.mouse.move(
      box.x + box.width * (0.18 + step * 0.055),
      box.y + box.height * (step % 2 === 0 ? 0.34 : 0.58),
    );
  }

  await expect
    .poll(async () => Number(await canvas.getAttribute('data-pointer-samples')))
    .toBeGreaterThan(2);
  await expect(canvas).toHaveAttribute('data-pointer-response', 'dandelion-emitter');

  const impulse = Number(await canvas.getAttribute('data-pointer-impulse'));
  expect(impulse).toBeGreaterThan(0);
  expect(impulse).toBeLessThanOrEqual(0.004);
});

test('does not start the particle renderer for reduced motion or Save-Data', async ({
  browser,
}) => {
  const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });
  await reducedPage.goto('/');
  await expect(reducedPage.locator('canvas[data-hero-particles]')).toHaveAttribute(
    'data-particle-state',
    'static',
  );
  await reducedPage.close();

  const saveDataPage = await browser.newPage();
  await saveDataPage.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true },
    });
  });
  await saveDataPage.goto('/');
  await expect(saveDataPage.locator('canvas[data-hero-particles]')).toHaveAttribute(
    'data-particle-state',
    'static',
  );
  await saveDataPage.close();
});

test('keeps the hero reveal within 650ms and retains two explicit rows on mobile', async ({
  page,
}) => {
  await page.goto('/');

  const units = page.locator('[data-landing-hero] [data-editorial-unit]');
  const timings = await units.evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element);
      return {
        delay: Number.parseFloat(style.animationDelay) * 1_000,
        duration: Number.parseFloat(style.animationDuration) * 1_000,
        filter: style.filter,
      };
    }),
  );

  expect(Math.max(...timings.map(({ delay, duration }) => delay + duration))).toBeLessThanOrEqual(
    650,
  );
  expect(timings.every(({ filter }) => filter === 'none')).toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(700);
  const rows = await page.locator('[data-hero-headline-row]').evaluateAll((elements) =>
    elements.map((element) => ({
      text: element.textContent,
      top: Math.round(element.getBoundingClientRect().top),
      width: Math.round(element.getBoundingClientRect().width),
    })),
  );
  expect(new Set(rows.map(({ top }) => top)).size, JSON.stringify(rows)).toBe(2);
  await expect(page.getByRole('link', { name: /프로젝트 문의하기/ })).toBeInViewport();
  await expect(page.locator('[data-landing-hero]')).not.toHaveCSS('overflow-x', 'visible');
});

test('transitions the header from the hero surface after the 48px sentinel', async ({ page }) => {
  await page.goto('/');

  const header = page.locator('[data-landing-nav]');
  await page.waitForFunction(() => {
    const element = document.querySelector('[data-landing-nav]');

    return element && Object.keys(element).some((key) => key.startsWith('__reactProps$'));
  });
  await expect(header).toHaveAttribute('data-header-surface', 'hero');

  await page.evaluate(() => window.scrollTo({ top: 96, behavior: 'instant' }));
  await expect(header).toHaveAttribute('data-header-surface', 'solid');

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).toHaveAttribute('data-header-surface', 'hero');
});
