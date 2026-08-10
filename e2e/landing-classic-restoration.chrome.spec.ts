import { expect, test } from '@playwright/test';

const orderedSections = [
  'hero',
  'services',
  'stack',
  'team',
  'process',
  'operations',
  'faq',
  'contact',
];

test('keeps the current hero and restores the factual classic order', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#hero canvas[data-hero-particles]')).toHaveCount(1);
  await expect(
    page.getByRole('heading', { level: 1, name: 'BUILT FOR WHAT’S NEXT.' }),
  ).toBeVisible();
  expect(
    await page
      .locator('main > section[data-landing-section]')
      .evaluateAll((nodes) => nodes.map((node) => node.id)),
  ).toEqual(orderedSections);
  await expect(page.getByRole('link', { name: '서비스' })).toHaveAttribute('href', '#services');
  await expect(page.getByRole('link', { name: '팀' })).toHaveAttribute('href', '#team');
});

test('does not restore unverified proof or cinematic-only scenes', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#trust, #reviews, #cases, #quality, #review')).toHaveCount(0);
  await expect(
    page.locator('[data-quality-stage], [data-review-stage], [data-service-merge]'),
  ).toHaveCount(0);
  await expect(page.getByText(/24\/7|4시간|30\+|95%\+|자동 NDA|경력 \d+년/)).toHaveCount(0);
});

test('uses classic surfaces without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const width = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.client);
  await expect(
    page.locator(
      '#services [data-classic-surface], #stack [data-classic-surface], #team [data-classic-surface], #process [data-classic-surface], #operations [data-classic-surface]',
    ),
  ).toHaveCount(5);
});

test('restores the classic contact composition and native controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#contact');

  await expect(
    page.locator('#faq [data-classic-surface], #contact [data-classic-surface]'),
  ).toHaveCount(2);
  await expect(page.locator('#contact input[name="stage"]')).toHaveCount(3);
  await expect(page.locator('#contact input[name="services"]')).toHaveCount(5);
  await expect(page.locator('#contact input[type="hidden"][name="timeline"]')).toHaveCount(1);
  await expect(page.locator('#contact input[type="hidden"][name="budget"]')).toHaveCount(1);
  await expect(page.locator('#contact input[name="name"]')).toHaveCount(1);
  await expect(page.locator('#contact input[name="company"]')).toHaveCount(1);
  await expect(page.locator('#contact input[name="email"]')).toHaveCount(1);
  await expect(page.locator('#contact textarea[name="message"]')).toHaveCount(1);

  for (const name of ['collectionConsent', 'overseasTransferConsent']) {
    const input = page.locator(`input[name="${name}"]`);
    await input.locator('..').click();
    await expect(input).toBeChecked();
  }
});
