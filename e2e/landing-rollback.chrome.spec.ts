import { expect, test } from '@playwright/test';

test('keeps the original landing composition while retaining Resend consent disclosures', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.getByAltText(/FUTUR 서비스 화면 예시/)).toBeVisible();
  await expect(page.locator('[data-delivery-map]')).toHaveCount(0);
  await expect(page.getByText('Review', { exact: true })).toBeVisible();
  await expect(page.getByText('Stack', { exact: true })).toBeVisible();
  await expect(page.getByText('Process', { exact: true })).toBeVisible();
  await expect(page.getByText('Operations', { exact: true })).toBeVisible();

  const form = page.getByRole('form', { name: '프로젝트 상담 양식' });
  await expect(
    form.getByRole('checkbox', { name: '개인정보 수집·이용에 동의합니다.' }),
  ).toBeVisible();
  await expect(form.getByRole('list', { name: '개인정보 수집·이용 고지' })).toBeVisible();
  await expect(
    form.getByRole('checkbox', { name: '개인정보 국외 이전에 동의합니다.' }),
  ).toBeVisible();
  await expect(form.getByRole('list', { name: '개인정보 국외 이전 고지' })).toBeVisible();
});
