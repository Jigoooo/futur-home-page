import { expect, test } from '@playwright/test';

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
