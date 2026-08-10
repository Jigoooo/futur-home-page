import { test } from './fixtures/a11y-fixture';
import { runA11yScan } from './helpers/run-a11y-scan';

// dev/prod 서버 1개에 대해 인터랙션 spec 을 순차 실행 (병렬 시 race condition)
test.describe.configure({ mode: 'serial' });

test.describe('/ 랜딩 페이지 인터랙티브 상태 a11y', () => {
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
});
