import { test } from './fixtures/a11y-fixture';
import { runA11yScan } from './helpers/run-a11y-scan';

test('404 — not-found 페이지', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');
  await runA11yScan(page);
});
