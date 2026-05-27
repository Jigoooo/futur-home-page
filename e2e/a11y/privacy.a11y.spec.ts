import { test } from './fixtures/a11y-fixture';
import { runA11yScan } from './helpers/run-a11y-scan';

test('/privacy — 개인정보 처리방침', async ({ page }) => {
  await page.goto('/privacy');
  await runA11yScan(page);
});
