import { expect, test, type Page } from '@playwright/test';

async function waitForLandingHydration(page: Page) {
  await page.waitForFunction(() => {
    const navLink = document.querySelector('[data-landing-nav] a[href="#services"]');

    if (!navLink) return false;

    return Object.keys(navLink).some((key) => key.startsWith('__reactProps$'));
  });
}

test('loads the landing page through Chrome', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'FUTUR home' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'BUILT FOR WHAT’S NEXT.' })).toBeVisible();
  await expect(page.locator('canvas[data-hero-particles]')).toHaveCount(1);

  await expect(page.locator('#contact')).toHaveCount(0);
  await expect(page.locator('#footer a[href^="mailto:"]').first()).toBeVisible();
});

test('animates header navigation scroll to sections', async ({ page }) => {
  await page.goto('/');
  await waitForLandingHydration(page);

  const trace = await page.evaluate(
    () =>
      new Promise<{ duration: number; finalY: number; frames: number[] }>((resolve) => {
        const header = document.querySelector<HTMLElement>('[data-landing-nav]')!;
        const target = document.querySelector<HTMLElement>('#services')!;
        const link = header.querySelector<HTMLAnchorElement>('a[href="#services"]')!;
        const offset = Number.parseFloat(
          getComputedStyle(header).getPropertyValue('--landing-compact-header-offset'),
        );
        const finalY = target.getBoundingClientRect().top + window.scrollY - offset;
        const frames: number[] = [];
        const startedAt = performance.now();
        let settledFrames = 0;

        link.click();
        const sample = () => {
          frames.push(window.scrollY);
          settledFrames = Math.abs(window.scrollY - finalY) <= 1 ? settledFrames + 1 : 0;
          const duration = performance.now() - startedAt;
          if ((settledFrames >= 3 && duration >= 300) || duration >= 800) {
            resolve({ duration, finalY, frames });
            return;
          }
          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      }),
  );

  expect(new Set(trace.frames.map((value) => Math.round(value))).size).toBeGreaterThan(1);
  expect(trace.duration).toBeGreaterThanOrEqual(380);
  expect(trace.duration).toBeLessThanOrEqual(760);
  expect(Math.max(...trace.frames)).toBeLessThanOrEqual(trace.finalY + 1);
  expect(
    trace.frames.every((value, index) => index === 0 || value >= trace.frames[index - 1]! - 1),
  ).toBe(true);
  expect(trace.frames.at(-1)).toBeCloseTo(trace.finalY, 0);
  await expect(page).toHaveURL(/#services$/);
  await expect(page.locator('#services')).toBeInViewport();
});
