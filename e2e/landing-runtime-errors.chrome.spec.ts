import { expect, test } from '@playwright/test';

async function waitForLandingHydration(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => {
    const landing = document.querySelector('[data-landing-page]');

    return landing && Object.keys(landing).some((key) => key.startsWith('__reactProps$'));
  });
}

test('initial load and primary interactions emit no runtime errors', async ({ page }) => {
  const errors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console.error: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));

  await page.goto('/');
  await waitForLandingHydration(page);
  const technologyDisclosure = page.locator('#technology details[data-technology-details]');
  await technologyDisclosure.locator('summary').click();
  await expect(technologyDisclosure).toHaveAttribute('open', '');
  await technologyDisclosure.locator('summary').click();
  await expect(technologyDisclosure).not.toHaveAttribute('open', '');

  await page
    .getByRole('navigation', { name: '주요 메뉴' })
    .getByRole('link', { name: '서비스' })
    .click();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await waitForLandingHydration(page);
  const headerToggle = page.locator('[data-header-toggle]');
  await expect(headerToggle).toBeVisible();
  await headerToggle.click();
  await expect(headerToggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await page.locator('#footer a[data-landing-magnetic]').hover();
  await page.mouse.move(0, 0);

  expect(errors).toEqual([]);
});

test('initial hydration emits no React attribute mismatch warning', async ({ page }) => {
  const hydrationWarnings: string[] = [];

  await page.route('**/', async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(/<html([^>]*)>/, '<html$1 style="">');
    await route.fulfill({ response, body });
  });

  page.on('console', (message) => {
    const text = message.text();
    if (/hydrated.*attributes.*didn't match/is.test(text)) hydrationWarnings.push(text);
  });

  await page.goto('/');
  await waitForLandingHydration(page);
  await page.waitForTimeout(100);

  expect(hydrationWarnings).toEqual([]);
});

test('root hydration suppression does not hide descendant mismatches', async ({ page }) => {
  const hydrationWarnings: string[] = [];

  await page.route('**/', async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(/<body([^>]*)>/, '<body$1 style="">');
    await route.fulfill({ response, body });
  });
  page.on('console', (message) => {
    const text = message.text();
    if (/hydrated.*attributes.*didn't match/is.test(text)) hydrationWarnings.push(text);
  });

  await page.goto('/');
  await waitForLandingHydration(page);
  await page.waitForTimeout(100);

  expect(hydrationWarnings).toHaveLength(1);
  expect(hydrationWarnings[0]).toContain('<body');
});
