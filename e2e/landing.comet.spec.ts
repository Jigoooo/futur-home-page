import { expect, test } from '@playwright/test';

test('loads the landing page through Comet', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'FUTUR home' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /아이디어를 현실의 서비스로/ })).toBeVisible();
  await expect(page.getByAltText(/FUTUR 서비스 화면 예시/)).toBeVisible();

  await page.getByRole('link', { name: /프로젝트 문의하기/ }).click();

  await expect(page.locator('#contact')).toBeInViewport();
  await expect(page.getByRole('form', { name: '프로젝트 상담 양식' })).toBeVisible();
});
