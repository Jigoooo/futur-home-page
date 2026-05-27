import { test } from './fixtures/a11y-fixture';
import { runA11yScan } from './helpers/run-a11y-scan';

test('/terms — 이용약관', async ({ page }) => {
  await page.goto('/terms');
  await runA11yScan(page);
});
