import { expect, test } from './fixtures/a11y-fixture';
import { runA11yScan } from './helpers/run-a11y-scan';

// dev/prod 서버 1개에 대해 인터랙션 spec 을 순차 실행 (병렬 시 race condition)
test.describe.configure({ mode: 'serial' });

test.describe('/ 랜딩 페이지 인터랙티브 상태 a11y', () => {
  test('CustomSelect 열림 (combobox + listbox)', async ({ page }) => {
    await page.goto('/');
    // cold-start 시 첫 spec 의 contact 섹션이 페이지 하단이라 dev 서버 warmup 시간 필요
    await page.waitForLoadState('networkidle');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    const combobox = page.getByRole('combobox', { name: /예상 일정/ });
    await combobox.scrollIntoViewIfNeeded();
    await combobox.click();
    await expect(combobox).toHaveAttribute('aria-expanded', 'true', { timeout: 10_000 });
    await runA11yScan(page, { include: '#contact' });
  });

  test('LegalModal 열림 (dialog + aria-modal)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    const trigger = page.getByRole('button', { name: '개인정보 처리방침 자세히 보기' });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await page
      .locator('[role="dialog"][aria-modal="true"]')
      .waitFor({ state: 'attached', timeout: 10_000 });
    await runA11yScan(page);
  });

  test('FAQ 전체 펼침 (disclosure 다수)', async ({ page }) => {
    await page.goto('/');
    await page.locator('#faq').scrollIntoViewIfNeeded();
    const toggles = page.locator('#faq [aria-controls^="faq-panel-"]');
    const n = await toggles.count();
    for (let i = 0; i < n; i++) {
      const btn = toggles.nth(i);
      if ((await btn.getAttribute('aria-expanded')) !== 'true') {
        await btn.click();
      }
    }
    await runA11yScan(page, { include: '#faq' });
  });

  test('Contact 폼 invalid 상태 (aria-invalid="true" + role=alert)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    const submit = page.getByRole('button', { name: '상담 신청하기' });
    await submit.scrollIntoViewIfNeeded();
    await submit.click();
    await page
      .locator('#contact [role="alert"]')
      .first()
      .waitFor({ state: 'attached', timeout: 10_000 });
    await runA11yScan(page, { include: '#contact' });
  });
});
