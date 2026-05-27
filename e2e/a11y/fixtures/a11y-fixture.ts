import { test as base, expect } from '@playwright/test';

/**
 * a11y 전용 fixture.
 * - `prefers-reduced-motion: reduce` 강제: shared.module.css 가 `.reveal { opacity:1; transform:none }`
 *   으로 즉시-가시 처리하므로 axe color-contrast / 비가시 요소 false-positive 가 사라진다.
 * - GSAP / scroll-trigger / custom-cursor / scrollbar 의 매크로 애니메이션도 동시에 비활성화된다.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await use(page);
  },
});

export { expect };
