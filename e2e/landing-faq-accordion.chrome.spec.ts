import { expect, test, type Page } from '@playwright/test';

async function waitForLandingHydration(page: Page) {
  await page.waitForFunction(() => {
    const landing = document.querySelector('[data-landing-page]');
    return landing && Object.keys(landing).some((key) => key.startsWith('__reactProps$'));
  });
}

test('keeps one of six FAQ answers open and switches it from the full question row', async ({
  page,
}) => {
  await page.goto('/#faq');
  await waitForLandingHydration(page);

  const faq = page.locator('#faq');
  const items = faq.locator('[data-faq-item]');
  const triggers = faq.locator('[data-faq-trigger]');
  const panels = faq.locator('[data-faq-panel]');

  await expect(items).toHaveCount(6);
  await expect(triggers).toHaveCount(6);
  await expect(triggers.first()).toHaveAttribute('aria-expanded', 'true');
  await expect(triggers.nth(1)).toHaveAttribute('aria-expanded', 'false');
  await expect(panels.first()).toHaveAttribute('aria-hidden', 'false');
  await expect(panels.nth(1)).toHaveAttribute('aria-hidden', 'true');

  await triggers.nth(1).click();

  await expect(triggers.first()).toHaveAttribute('aria-expanded', 'false');
  await expect(triggers.nth(1)).toHaveAttribute('aria-expanded', 'true');
  await expect(faq.locator('[data-faq-item][data-open="true"]')).toHaveCount(1);

  await triggers.nth(2).focus();
  await page.keyboard.press('Enter');
  await expect(triggers.nth(1)).toHaveAttribute('aria-expanded', 'false');
  await expect(triggers.nth(2)).toHaveAttribute('aria-expanded', 'true');

  await expect(faq.getByText('기존 시스템이나 외부 서비스와 연동할 수 있나요?')).toBeVisible();
  await expect(faq.getByText('AI 기능은 어떤 방식으로 도입하나요?')).toBeVisible();
  await expect(faq.getByText('프로젝트는 어떤 방식으로 진행되나요?')).toBeVisible();
});

test('uses the quiet line, panel and plus motion rhythm without card styling', async ({ page }) => {
  await page.goto('/#faq');
  await waitForLandingHydration(page);

  const faq = page.locator('#faq');
  const firstItem = faq.locator('[data-faq-item]').first();
  const panel = firstItem.locator('[data-faq-panel]');
  const icon = firstItem.locator('[data-faq-icon]');

  await expect(firstItem).toHaveCSS('border-bottom-style', 'solid');
  await expect(firstItem).toHaveCSS('border-radius', '0px');
  await expect(panel).toHaveCSS('grid-template-rows', /.+/);
  await expect(icon).toHaveCSS('transform', /matrix\(.+/);

  const durations = await firstItem.evaluate((element) => {
    const panelElement = element.querySelector<HTMLElement>('[data-faq-panel]')!;
    const iconElement = element.querySelector<HTMLElement>('[data-faq-icon]')!;
    return {
      panel: getComputedStyle(panelElement).transitionDuration,
      icon: getComputedStyle(iconElement).transitionDuration,
    };
  });

  expect(durations.panel).toContain('0.4s');
  expect(durations.icon).toContain('0.35s');
});
