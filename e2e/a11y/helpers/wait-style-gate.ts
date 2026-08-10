import type { Page } from '@playwright/test';

/** SSR 콘텐츠가 표시된 뒤 landing hydration이 끝날 때까지 대기한다. */
export async function waitForStyleGateReady(page: Page) {
  await page.waitForFunction(
    () =>
      !document.querySelector('[data-landing-page]') ||
      document.body.dataset.landingReady === 'true',
    null,
    { timeout: 15_000 },
  );
}
