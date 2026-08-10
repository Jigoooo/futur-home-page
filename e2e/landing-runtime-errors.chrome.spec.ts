import { expect, test } from '@playwright/test';

async function waitForLandingHydration(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => {
    const button = document.querySelector('[data-landing-interactive="button"]');

    return button && Object.keys(button).some((key) => key.startsWith('__reactProps$'));
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
  const animatedButton = page
    .locator('[data-landing-interactive="button"]')
    .filter({ has: page.locator('[data-landing-label]') })
    .first();
  await animatedButton.dispatchEvent('pointerover', { pointerType: 'mouse' });
  await page.waitForTimeout(350);
  await animatedButton.dispatchEvent('pointerout', { pointerType: 'mouse' });
  await page.waitForTimeout(350);
  await page
    .getByRole('navigation', { name: '주요 메뉴' })
    .getByRole('link', { name: '제공 영역' })
    .click();
  await page.locator('#services').getByRole('link').first().hover();
  await page.mouse.move(0, 0);

  expect(errors).toEqual([]);
});
