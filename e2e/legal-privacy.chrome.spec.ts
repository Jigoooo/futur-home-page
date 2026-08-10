import { expect, test } from '@playwright/test';

test('preserves the disclosed required and optional privacy collection items', async ({ page }) => {
  await page.goto('/privacy');
  const collectedItems = page.locator('section').filter({
    has: page.getByRole('heading', { name: '2. 처리 항목' }),
  });

  await expect(collectedItems.getByText('필수', { exact: true }).locator('..')).toContainText(
    '프로젝트 단계, 일정, 예산 범위',
  );
  await expect(collectedItems.getByText('선택', { exact: true }).locator('..')).toContainText(
    '회사명',
  );
});
