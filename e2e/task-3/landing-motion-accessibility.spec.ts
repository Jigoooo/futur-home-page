import { expect, test, type Page } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';

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
  const dialogElement = page.locator('dialog');
  await expect(dialogElement).toHaveAttribute('data-state', 'closed');
  await page.waitForTimeout(100);
  await expect(dialogElement).toHaveCount(1);
  await expect(dialogElement).toHaveCount(0);
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
  const listbox = page.locator('[role="listbox"][aria-labelledby]').filter({ hasText: '500만원' });
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
  const aura = page.locator('[data-custom-cursor-aura]');
  const baseRing = await aura.evaluate((element) => {
    const tracker = getComputedStyle(element);
    const ring = getComputedStyle(element, '::before');
    return {
      width: tracker.width,
      height: tracker.height,
      transitionProperty: ring.transitionProperty,
      transitionDuration: ring.transitionDuration,
    };
  });
  await page.getByRole('link', { name: /프로젝트 문의하기/ }).hover();
  const hotRing = await aura.evaluate((element) => ({
    width: getComputedStyle(element).width,
    height: getComputedStyle(element).height,
  }));
  expect(hotRing).toEqual({ width: baseRing.width, height: baseRing.height });
  expect(baseRing.transitionProperty).toContain('transform');
  expect(baseRing.transitionProperty).toContain('opacity');
  expect(baseRing.transitionProperty).not.toMatch(/width|height/);
  expect(baseRing.transitionDuration.split(',').every((value) => value.trim() === '0.15s')).toBe(
    true,
  );
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

test('custom cursor restores the native cursor when RAF initialization fails', async ({ page }) => {
  await waitForLanding(page);
  await page.evaluate(() => {
    window.requestAnimationFrame = () => {
      throw new Error('task-3 forced cursor RAF failure');
    };
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 220, clientY: 180 }));
  });
  await expect(page.locator('body')).not.toHaveAttribute('data-landing-cursor-ready', 'true');
  await expect(page.locator('html')).not.toHaveAttribute('data-landing-cursor-enabled', 'true');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).cursor)).not.toBe(
    'none',
  );
});

test('FAQ pointer transitions retain presence for 180ms enter and 120ms exit while keyboard is immediate', async ({
  page,
}) => {
  await waitForLanding(page);
  const toggle = page.getByRole('button', { name: '의사소통은 어떻게 진행되나요?' });
  const panel = page.locator(`#${await toggle.getAttribute('aria-controls')}`);

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).not.toHaveAttribute('hidden', '');
  await expect(panel.locator('p')).toHaveCSS('transition-duration', '0.18s, 0.18s');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).not.toHaveAttribute('hidden', '');
  await expect(panel.locator('p')).toHaveCSS('transition-duration', '0.12s, 0.12s');
  await page.waitForTimeout(140);
  await expect(panel).toHaveAttribute('hidden', '');
  await expect(panel).toHaveAttribute('inert', '');

  await toggle.focus();
  await toggle.press('Enter');
  await expect(panel).toBeVisible();
  await expect(panel.locator('p')).toHaveCSS('transition-duration', '0s');
  await toggle.press('Enter');
  await expect(panel).toHaveAttribute('hidden', '');
});

test('mobile disclosure retains pointer exit presence and keyboard toggles immediately', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await waitForLanding(page);
  const toggle = page.locator('button[aria-controls="mobile-menu"]');
  await toggle.click();
  const shell = page.locator('[data-mobile-menu-shell]');
  await expect(shell).toHaveAttribute('data-state', 'open');
  await expect(shell).toHaveCSS('transition-duration', '0.18s, 0.18s');
  await toggle.click();
  await expect(shell).toHaveAttribute('data-state', 'closed');
  await expect(shell).toHaveCSS('transition-duration', '0.12s, 0.12s');
  await page.waitForTimeout(140);
  await expect(shell).toHaveCount(0);

  await toggle.focus();
  await toggle.press('Enter');
  await expect(shell).toHaveCSS('transition-duration', '0s, 0s');
  await page.keyboard.press('Escape');
  await expect(shell).toHaveCount(0);
  await expect(toggle).toBeFocused();
});

test('custom select refreshes keyboard modality for close and selection after pointer open', async ({
  page,
}) => {
  await waitForLanding(page);
  const select = page.getByRole('combobox', { name: '예산 범위' });
  await select.scrollIntoViewIfNeeded();
  const listbox = page.locator('[role="listbox"][aria-labelledby]').filter({ hasText: '500만원' });
  await select.click();
  await expect(listbox).toHaveCSS('transition-duration', '0.18s, 0s, 0.18s');
  await select.click();
  await expect(listbox).toHaveCSS('transition-duration', '0.12s, 0s, 0.12s');
  await select.click();
  await select.press('Escape');
  await expect(listbox).toHaveCSS('transition-duration', '0s');
  await select.click();
  await select.press('End');
  await select.press('Enter');
  await expect(listbox).toHaveCSS('transition-duration', '0s');
  await expect(select).toContainText('1,000만원 이상');
});

test('reduced-motion modal closes immediately and releases inert state', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await waitForLanding(page);
  const trigger = page.getByRole('button', { name: '개인정보 처리방침 자세히 보기' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: '개인정보 처리방침' });
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('#landing-page-content')).not.toHaveAttribute('inert', '');
  await expect(trigger).toBeFocused();
});

test('hover transforms are gated for reduced motion and coarse pointers', async ({
  browser,
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await waitForLanding(page);
  const reducedTargets = [
    page.locator('#services article').first(),
    page.locator('#team article').first(),
    page.locator('label[data-landing-interactive="stage-choice"]').first(),
    page.locator('label[data-landing-interactive="check-tile"]').first(),
    page.getByRole('button', { name: '상단으로 이동' }),
    page.locator('footer a[href^="mailto:"]').first(),
    page.getByRole('button', { name: '개인정보 처리방침 자세히 보기' }),
  ];
  for (const target of reducedTargets) {
    await target.scrollIntoViewIfNeeded();
    await target.hover({ force: true });
    await expect(target).toHaveCSS('transform', 'none');
    const surface = target.locator('[data-landing-surface]');
    if ((await surface.count()) > 0) await expect(surface).toHaveCSS('transform', 'none');
  }

  const service = page.locator('#services article').first();
  await service.hover({ force: true });
  for (const child of [
    service.locator('[data-landing-service-icon]'),
    service.locator('a'),
    service.locator('a i'),
  ]) {
    await expect(child).toHaveCSS('transform', 'none');
  }
  const team = page.locator('#team article').first();
  await team.hover({ force: true });
  await expect(team.locator('div').nth(1)).toHaveCSS('transform', 'none');
  await expect(team.locator('span').last()).toHaveCSS('transform', 'none');
  const navLink = page.getByRole('navigation', { name: '주요 메뉴' }).getByRole('link').first();
  await navLink.hover({ force: true });
  expect(await navLink.evaluate((element) => getComputedStyle(element, '::after').transform)).toBe(
    'matrix(0, 0, 0, 1, 0, 0)',
  );

  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const coarsePage = await context.newPage();
  await waitForLanding(coarsePage);
  const coarseStage = coarsePage.locator('label[data-landing-interactive="stage-choice"]').first();
  await coarseStage.hover({ force: true });
  await expect(coarseStage.locator('[data-landing-surface]')).toHaveCSS('transform', 'none');
  const coarseService = coarsePage.locator('#services article').first();
  await coarseService.hover({ force: true });
  await expect(coarseService).toHaveCSS('transform', 'none');
  await context.close();
});

test('approved motion tokens, hero budget, and GPU-only transition contracts are exact', async ({
  page,
}) => {
  await waitForLanding(page);
  const contracts = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const hero = Array.from(document.querySelectorAll<HTMLElement>('[data-landing-hero] *'));
    const heroEnd = Math.max(
      ...hero.map((element) => {
        const style = getComputedStyle(element);
        const duration = Number.parseFloat(style.animationDuration) * 1000;
        const delay = Number.parseFloat(style.animationDelay) * 1000;
        return duration + delay;
      }),
    );
    return {
      tokens: {
        press: root.getPropertyValue('--motion-press').trim(),
        hover: root.getPropertyValue('--motion-hover').trim(),
        enter: root.getPropertyValue('--motion-disclosure-enter').trim(),
        exit: root.getPropertyValue('--motion-disclosure-exit').trim(),
        tabs: root.getPropertyValue('--motion-tabs').trim(),
        modalEnter: root.getPropertyValue('--motion-modal-enter').trim(),
        modalExit: root.getPropertyValue('--motion-modal-exit').trim(),
      },
      heroEnd,
    };
  });
  expect(contracts.tokens).toEqual({
    press: '100ms',
    hover: '150ms',
    enter: '180ms',
    exit: '120ms',
    tabs: '220ms',
    modalEnter: '250ms',
    modalExit: '180ms',
  });
  expect(contracts.heroEnd).toBeLessThanOrEqual(900);

  const styleDirectory = 'src/pages/landing/ui/styles';
  const css = (
    await Promise.all(
      (await readdir(styleDirectory))
        .filter((file) => file.endsWith('.css'))
        .map((file) => readFile(`${styleDirectory}/${file}`, 'utf8')),
    )
  ).join('\n');
  expect(css).not.toMatch(
    /(?:transition|animation)[^;}]*(?:width|height|margin|padding|top|left)/i,
  );
  expect(css).not.toMatch(/\b(?:160|200)ms\b/);
  const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
    dependencies?: Record<string, string>;
  };
  expect(packageJson.dependencies).not.toHaveProperty('gsap');
  expect(packageJson.dependencies).not.toHaveProperty('@gsap/react');
  expect(await readFile('pnpm-lock.yaml', 'utf8')).not.toMatch(/(?:@gsap\/react|\bgsap@)/);
  expect(await readFile('src/pages/landing/ui/landing-page.tsx', 'utf8')).not.toContain(
    'useLandingGsapInteractions',
  );
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
