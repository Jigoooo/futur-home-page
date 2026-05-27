import type { Page } from '@playwright/test';

/**
 * RootDocument 의 `data-style-gate` 가 'ready' 가 될 때까지 대기.
 * 'pending' 상태에서 `.style-gate-app` 은 opacity:0 + pointer-events:none 으로 숨겨져 있어
 * axe-core 가 hidden tree 로 인식하고 스킵 → ready 도달 후에만 스캔해야 한다.
 */
export async function waitForStyleGateReady(page: Page) {
  await page.waitForFunction(
    () => document.documentElement.dataset.styleGate === 'ready',
    null,
    { timeout: 15_000 },
  );
}
