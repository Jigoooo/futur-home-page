import { expect, test, type Page } from '@playwright/test';

async function waitForLandingHydration(page: Page) {
  await expect(page.locator('body')).toHaveAttribute('data-landing-ready', 'true');
}

test('loads the landing page through Chrome', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'FUTUR home' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /아이디어를 현실의 서비스로/ })).toBeVisible();
  await expect(page.getByText('FUTUR 프로젝트 전달 지도')).toBeVisible();

  await page.getByRole('link', { name: /프로젝트 문의하기/ }).click();

  await expect(page.locator('#contact')).toBeInViewport();
  await expect(page.getByRole('form', { name: '프로젝트 상담 양식' })).toBeVisible();
});

test('animates header navigation scroll to sections', async ({ page }) => {
  await page.goto('/');
  await waitForLandingHydration(page);

  await page.evaluate(() => {
    const testWindow = window as Window & { __lastScrollBehavior?: ScrollBehavior };
    const scrollTo = window.scrollTo.bind(window);

    window.scrollTo = ((options?: ScrollToOptions | number, y?: number) => {
      if (typeof options === 'object' && options) {
        testWindow.__lastScrollBehavior = options.behavior;
        scrollTo({ ...options, behavior: 'auto' });
        return;
      }

      scrollTo(options ?? 0, y ?? 0);
    }) as typeof window.scrollTo;
  });

  await page
    .getByRole('navigation', { name: '주요 메뉴' })
    .getByRole('link', { name: '서비스' })
    .click();

  await expect(page.locator('#services')).toBeInViewport();

  const behavior = await page.evaluate(
    () => (window as Window & { __lastScrollBehavior?: ScrollBehavior }).__lastScrollBehavior,
  );

  expect(behavior).toBe('smooth');
});
