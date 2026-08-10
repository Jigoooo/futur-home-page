import type { Page } from '@playwright/test';

/** 스타일 게이트 없이 제공되는 SSR 랜딩 콘텐츠가 DOM에 준비될 때까지 대기한다. */
export async function waitForStyleGateReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');

  const landing = page.locator('[data-landing-page]');
  if ((await landing.count()) === 0) return;

  await landing.waitFor({ state: 'attached', timeout: 15_000 });
  await page.locator('[data-landing-hero] h1').waitFor({ state: 'visible', timeout: 15_000 });
}
