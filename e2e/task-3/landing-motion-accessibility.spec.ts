import { expect, test, type Page } from '@playwright/test';

async function waitForLanding(page: Page) {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-landing-ready', 'true');
}

test('custom scrollbar exposes ARIA state and supports keyboard scrolling', async ({ page }) => {
  await waitForLanding(page);

  const scrollbar = page.getByRole('scrollbar', { name: '페이지 스크롤' });
  await expect(scrollbar).toBeVisible();
  await expect(scrollbar).toHaveAttribute('aria-controls', 'landing-page-content');
  await expect(scrollbar).toHaveAttribute('aria-valuemin', '0');
  await expect(scrollbar).toHaveAttribute('aria-valuemax', /\d+/);
  await expect(scrollbar).toHaveAttribute('aria-valuenow', '0');

  await scrollbar.focus();
  await expect(scrollbar).toBeFocused();
  await scrollbar.press('ArrowDown');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  const afterArrow = await page.evaluate(() => window.scrollY);

  await scrollbar.press('PageDown');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(afterArrow);
  await scrollbar.press('End');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
  await expect(scrollbar).toHaveAttribute('aria-valuenow', /[1-9]\d*/);
  await scrollbar.press('Home');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test('legal modal traps initial focus, makes the page inert, closes, and restores focus', async ({
  page,
}) => {
  await waitForLanding(page);
  const trigger = page.getByRole('button', { name: '개인정보 처리방침 자세히 보기' });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: '개인정보 처리방침' });
  const close = dialog.getByRole('button', { name: '닫기', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-labelledby', /.+/);
  await expect(close).toBeFocused();
  await expect(page.locator('#landing-page-content')).toHaveAttribute('inert', '');

  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await close.focus();
  await page.keyboard.press('Tab');
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator('#landing-page-content')).not.toHaveAttribute('inert', '');

  await trigger.click();
  await dialog.locator('[data-legal-backdrop]').click({ position: { x: 4, y: 4 } });
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('closed FAQ panels are hidden and inert while keyboard state stays accurate', async ({
  page,
}) => {
  await waitForLanding(page);
  const toggle = page.getByRole('button', { name: '기획서가 없는데 문의해도 되나요?' });
  const panelId = await toggle.getAttribute('aria-controls');
  expect(panelId).toBeTruthy();
  const panel = page.locator(`#${panelId}`);

  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await toggle.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();
  await expect(panel).toHaveAttribute('inert', '');
  await toggle.press('Space');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();
  await expect(panel).not.toHaveAttribute('inert', '');
});

test('custom select measures after opening and keeps active descendant and selection aligned', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await waitForLanding(page);
  const select = page.getByRole('combobox', { name: '예산 범위' });
  await select.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 260));
  await select.press('Enter');

  await expect(select).toHaveAttribute('aria-expanded', 'true');
  const listbox = page.getByRole('listbox', { name: '예산 범위' });
  await expect(listbox).toBeVisible();
  const listboxId = await listbox.getAttribute('id');
  expect(listboxId).toBeTruthy();
  const geometry = await page.evaluate(() => {
    const root = document.querySelector<HTMLInputElement>('input[name="budget"]')?.parentElement;
    const trigger = root?.querySelector<HTMLElement>('[role="combobox"]');
    const menu = root?.querySelector<HTMLElement>('[role="listbox"]');
    if (!trigger || !menu) return null;
    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    return {
      triggerTop: triggerRect.top,
      triggerBottom: triggerRect.bottom,
      menuTop: menuRect.top,
      menuBottom: menuRect.bottom,
    };
  });
  expect(geometry).not.toBeNull();
  expect(geometry!.menuBottom <= 720 || geometry!.menuTop < geometry!.triggerTop).toBe(true);

  await select.press('End');
  const activeId = await select.getAttribute('aria-activedescendant');
  expect(activeId).toBeTruthy();
  await expect(page.locator(`#${activeId}`)).toContainText('1,000만원 이상');
  await select.press('Enter');
  await expect(select).toHaveAttribute('aria-expanded', 'false');
  await expect(select).toContainText('1,000만원 이상');
  await expect(
    page.locator(`#${listboxId} [role="option"]`, { hasText: '1,000만원 이상' }),
  ).toHaveAttribute('aria-selected', 'true');
});

test('custom cursor keeps native fallback until ready, idles its RAF, hides, and restarts', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const nativeRaf = window.requestAnimationFrame.bind(window);
    let count = 0;
    Object.defineProperty(window, '__task3RafCount', { get: () => count });
    window.requestAnimationFrame = (callback) => {
      count += 1;
      return nativeRaf(callback);
    };
  });
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-landing-ready', 'true');

  expect(await page.evaluate(() => getComputedStyle(document.documentElement).cursor)).not.toBe(
    'none',
  );
  await page.mouse.move(240, 180);
  await expect(page.locator('body')).toHaveAttribute('data-landing-cursor-ready', 'true');
  await page.waitForTimeout(1400);
  const idleCount = await page.evaluate(
    () => (window as typeof window & { __task3RafCount: number }).__task3RafCount,
  );
  await page.waitForTimeout(250);
  expect(
    await page.evaluate(
      () => (window as typeof window & { __task3RafCount: number }).__task3RafCount,
    ),
  ).toBe(idleCount);

  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('body')).toHaveAttribute('data-landing-cursor-muted', 'true');
  await page.mouse.move(300, 220);
  await page.waitForTimeout(80);
  expect(
    await page.evaluate(
      () => (window as typeof window & { __task3RafCount: number }).__task3RafCount,
    ),
  ).toBe(idleCount);

  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.mouse.move(360, 260);
  await expect
    .poll(() =>
      page.evaluate(() => (window as typeof window & { __task3RafCount: number }).__task3RafCount),
    )
    .toBeGreaterThan(idleCount);
});

test('reduced motion removes spatial movement while retaining short opacity and color feedback', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await waitForLanding(page);

  await expect(page.locator('[data-landing-cursor-enabled]')).toHaveCount(0);
  await expect(page.getByRole('scrollbar', { name: '페이지 스크롤' })).toBeVisible();
  const styles = await page.evaluate(() => {
    const reveal = document.querySelector<HTMLElement>('[data-landing-reveal]');
    const button = document.querySelector<HTMLElement>('[data-landing-interactive="button"]');
    if (!reveal || !button) return null;
    const revealStyle = getComputedStyle(reveal);
    const buttonStyle = getComputedStyle(button);
    return {
      revealTransform: revealStyle.transform,
      transitionProperties: buttonStyle.transitionProperty,
      transitionDurations: buttonStyle.transitionDuration,
    };
  });
  expect(styles).not.toBeNull();
  expect(styles!.revealTransform).toBe('none');
  expect(styles!.transitionProperties).not.toContain('transform');
  const durations = styles!.transitionDurations
    .split(',')
    .map((value) => Number.parseFloat(value) * (value.includes('ms') ? 1 : 1000));
  expect(durations.some((duration) => duration > 0 && duration <= 200)).toBe(true);
});

test('rapid tabs are last-selection-wins and repeated menu interaction emits no console errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await waitForLanding(page);

  const tabs = page.locator('#cases').getByRole('tab');
  await tabs.nth(1).click();
  await tabs.nth(2).click();
  await tabs.nth(3).click();
  await tabs.nth(0).click();
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#record-panel-web')).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.locator('button[aria-controls="mobile-menu"]');
  for (let index = 0; index < 4; index += 1) {
    await menu.click();
    await menu.click();
  }
  await page.waitForTimeout(300);
  expect(errors).toEqual([]);
});

test('runtime styles contain no forbidden infinite, ease-in, scale-zero, or transition-all motion', async ({
  page,
}) => {
  await waitForLanding(page);
  const css = await page.evaluate(() =>
    Array.from(document.styleSheets)
      .flatMap((sheet) => {
        try {
          return Array.from(sheet.cssRules, (rule) => rule.cssText);
        } catch {
          return [];
        }
      })
      .join('\n'),
  );
  expect(css).not.toMatch(/transition\s*:\s*all\b/i);
  expect(css).not.toMatch(/animation[^;}]*\binfinite\b/i);
  expect(css).not.toMatch(/\bease-in(?:\s|[,;])/i);
  expect(css).not.toMatch(/scale\(0(?:\.0+)?\)/i);
});
