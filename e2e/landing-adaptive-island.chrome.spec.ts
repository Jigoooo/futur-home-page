/// <reference types="node" />

import { expect, test, type Locator, type Page } from '@playwright/test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const desktopViewport = { width: 1280, height: 720 };
const mobileViewport = { width: 390, height: 844 };
const menuLabels = ['서비스', '기술', '팀', '프로세스', 'FAQ'];

function header(page: Page) {
  return page.locator('[data-landing-nav]');
}

function compactButton(page: Page) {
  return header(page).locator('[data-header-toggle]');
}

async function expectCompactLabel(button: Locator, label: string) {
  await expect(button.getByText(label, { exact: true })).toBeVisible();
  await expect(button).toHaveAccessibleName(`주요 메뉴 열기 · 현재 위치 ${label}`);
}

async function expectExpandedController(page: Page, label: string) {
  const controller = header(page).getByRole('button', {
    name: `주요 메뉴 닫기 · 현재 위치 ${label}`,
    exact: true,
  });
  await expect(controller).toBeVisible();
  await expect(controller).toHaveAttribute('aria-expanded', 'true');
  await expect(controller).toHaveAttribute('aria-controls', 'header-menu');
  return controller;
}

async function scrollSectionIntoView(page: Page, sectionId: string) {
  await expect(header(page)).toHaveAttribute('data-header-hydrated', 'true');
  await page.locator(`#${sectionId}`).evaluate((element) => {
    element.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
}

async function enterCompactLayout(page: Page, sectionId = 'services', label = '서비스') {
  await scrollSectionIntoView(page, sectionId);
  await expect(header(page)).toHaveAttribute('data-header-layout', 'compact');
  const button = compactButton(page);
  await expect(button).toBeVisible();
  await expectCompactLabel(button, label);
}

async function openCompactMenu(page: Page, label: string) {
  const button = compactButton(page);
  await button.click();
  await expect(header(page)).toHaveAttribute('data-header-layout', 'menu-expanded');
  await expectExpandedController(page, label);
  return button;
}

async function expectCompactMenuClosed(page: Page, button: Locator, label: string) {
  await expect(header(page)).toHaveAttribute('data-header-layout', 'compact');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expectCompactLabel(button, label);
  await expect(button).toBeFocused();
}

async function expectFocusRestoredOnCompactCommit(page: Page, button: Locator) {
  await expect(header(page)).toHaveAttribute('data-header-layout', 'compact');
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));

  expect(
    await header(page).evaluate((element) => {
      const active = document.activeElement;
      return {
        focusInsideHiddenNav: active
          ? Boolean(element.querySelector('nav[aria-hidden="true"]')?.contains(active))
          : false,
        toggleFocused: active === element.querySelector('[data-header-toggle]'),
      };
    }),
  ).toEqual({ focusInsideHiddenNav: false, toggleFocused: true });
  await expect(button).toHaveAttribute('aria-expanded', 'false');
}

async function returnToHeroLayout(page: Page) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(header(page)).toHaveAttribute('data-header-layout', 'hero-expanded');
}

async function expectFocusTransferredToVisibleHeroControl(page: Page) {
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  expect(
    await header(page).evaluate((element) => {
      const active = document.activeElement;
      const logo = element.querySelector('a[aria-label="FUTUR home"]');
      const firstNavigationLink = element.querySelector('nav[aria-label="주요 메뉴"] a');
      return {
        focusedVisibleHeroControl: active === logo || active === firstNavigationLink,
        focusedHiddenToggle: active === element.querySelector('[data-header-toggle]'),
      };
    }),
  ).toEqual({ focusedVisibleHeroControl: true, focusedHiddenToggle: false });
}

async function holdAnimationFrames(page: Page) {
  await page.evaluate(() => {
    const originalRequestAnimationFrame = window.requestAnimationFrame.bind(window);
    const originalCancelAnimationFrame = window.cancelAnimationFrame.bind(window);
    const heldFrames = new Map<number, FrameRequestCallback>();
    let frameId = 1_000_000;
    const testWindow = window as typeof window & { __restoreHeaderFrames?: () => void };

    window.requestAnimationFrame = (callback) => {
      frameId += 1;
      heldFrames.set(frameId, callback);
      return frameId;
    };
    window.cancelAnimationFrame = (id) => heldFrames.delete(id);
    testWindow.__restoreHeaderFrames = () => {
      heldFrames.clear();
      window.requestAnimationFrame = originalRequestAnimationFrame;
      window.cancelAnimationFrame = originalCancelAnimationFrame;
      delete testWindow.__restoreHeaderFrames;
    };
  });
}

async function restoreAnimationFrames(page: Page) {
  await page.evaluate(() => {
    const testWindow = window as typeof window & { __restoreHeaderFrames?: () => void };
    testWindow.__restoreHeaderFrames?.();
  });
}

async function sampleReducedMotionFrames(page: Page) {
  return header(page).evaluate(async (element) => {
    const menu = element.querySelector('nav[aria-label="주요 메뉴"]');
    const round = (value: number) => Math.round(value * 1_000) / 1_000;
    const snapshot = () =>
      [
        { name: 'shell', node: element },
        { name: 'menu', node: menu },
      ].map(({ name, node }) => {
        if (!node) return { name, missing: true };

        const rect = node.getBoundingClientRect();
        const styles = getComputedStyle(node);
        return {
          height: round(rect.height),
          left: round(rect.left),
          name,
          opacity: styles.opacity,
          top: round(rect.top),
          transform: styles.transform,
          width: round(rect.width),
        };
      });

    const startedAt = performance.now();
    const samples = [snapshot()];

    return new Promise<{ elapsedMs: number; samples: ReturnType<typeof snapshot>[] }>((resolve) => {
      const collectFrame = (timestamp: number) => {
        samples.push(snapshot());

        if (timestamp - startedAt >= 700) {
          resolve({ elapsedMs: timestamp - startedAt, samples });
          return;
        }

        requestAnimationFrame(collectFrame);
      };

      requestAnimationFrame(collectFrame);
    });
  });
}

async function sampleHeaderFrames(page: Page, durationMs: number) {
  return header(page).evaluate(async (element, duration) => {
    const samples: Array<{ height: number; radius: number; width: number }> = [];
    const startedAt = performance.now();

    do {
      const rect = element.getBoundingClientRect();
      const glass = element.querySelector<HTMLElement>('[data-header-glass]');
      samples.push({
        height: Math.round(rect.height * 100) / 100,
        radius: Number.parseFloat(getComputedStyle(glass!).borderRadius),
        width: Math.round(rect.width * 100) / 100,
      });
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    } while (performance.now() - startedAt < duration);

    return samples;
  }, durationMs);
}

async function sampleNavigationFontSizes(page: Page, durationMs: number) {
  return header(page)
    .locator('nav[aria-label="주요 메뉴"] a')
    .evaluateAll(async (elements, duration) => {
      const samples: string[][] = [];
      const startedAt = performance.now();

      do {
        samples.push(elements.map((element) => getComputedStyle(element).fontSize));
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      } while (performance.now() - startedAt < duration);

      return samples;
    }, durationMs);
}

async function readHeaderGeometry(page: Page) {
  return header(page).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const transform = getComputedStyle(element).transform;
    const matrix = transform === 'none' ? new DOMMatrix() : new DOMMatrix(transform);
    const round = (value: number) => Math.round(value * 1_000) / 1_000;

    return {
      height: round(rect.height),
      inlineTransform: element.style.transform,
      scaleX: round(Math.hypot(matrix.a, matrix.b)),
      scaleY: round(Math.hypot(matrix.c, matrix.d)),
      width: round(rect.width),
    };
  });
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
});

test('keeps desktop fluid navigation visible through continuous scroll-linked geometry', async ({
  page,
}) => {
  await page.goto('/');
  const nav = header(page).locator('nav[aria-label="주요 메뉴"]');
  const links = nav.getByRole('link');
  const logo = header(page).getByRole('link', { name: 'FUTUR home' });
  const toggle = compactButton(page);
  const initialFontSizes = await links.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).fontSize),
  );

  for (const scrollY of [0, 40, 80, 120, 160]) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), scrollY);
    await expect(header(page)).toHaveAttribute('data-header-layout', 'desktop-fluid');
    await expect(links).toHaveCount(5);
    for (const link of await links.all()) await expect(link).toBeVisible();
    await expect(logo).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-hidden', 'true');
    await expect(toggle).toHaveAttribute('tabindex', '-1');
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(240);
  const shrinkingSamplesPromise = sampleHeaderFrames(page, 360);
  const fontSizeSamplesPromise = sampleNavigationFontSizes(page, 360);
  await page.evaluate(() => window.scrollTo({ top: 160, behavior: 'instant' }));
  const shrinkingSamples = await shrinkingSamplesPromise;
  const fontSizeSamples = await fontSizeSamplesPromise;

  expect(new Set(shrinkingSamples.map(({ width }) => width)).size).toBeGreaterThanOrEqual(5);
  expect(shrinkingSamples.at(-1)!.width).toBeCloseTo(1133.44, 0);
  expect(shrinkingSamples.at(-1)!.height).toBeCloseTo(68, 0);
  expect(shrinkingSamples.at(-1)!.radius).toBeCloseTo(24, 0);
  for (let index = 1; index < shrinkingSamples.length; index += 1) {
    expect(shrinkingSamples[index]!.width).toBeLessThanOrEqual(shrinkingSamples[index - 1]!.width);
    expect(shrinkingSamples[index]!.height).toBeLessThanOrEqual(
      shrinkingSamples[index - 1]!.height,
    );
    expect(shrinkingSamples[index]!.radius).toBeLessThanOrEqual(
      shrinkingSamples[index - 1]!.radius,
    );
  }

  const restoringSamplesPromise = sampleHeaderFrames(page, 360);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  const restoringSamples = await restoringSamplesPromise;
  for (let index = 1; index < restoringSamples.length; index += 1) {
    expect(restoringSamples[index]!.width).toBeGreaterThanOrEqual(
      restoringSamples[index - 1]!.width,
    );
    expect(restoringSamples[index]!.height).toBeGreaterThanOrEqual(
      restoringSamples[index - 1]!.height,
    );
    expect(restoringSamples[index]!.radius).toBeGreaterThanOrEqual(
      restoringSamples[index - 1]!.radius,
    );
  }
  expect(restoringSamples.at(-1)!.width).toBeCloseTo(1232, 0);
  expect(restoringSamples.at(-1)!.height).toBeCloseTo(76, 0);
  expect(restoringSamples.at(-1)!.radius).toBeCloseTo(28, 0);
  expect(fontSizeSamples.every((sample) => sample.join() === initialFontSizes.join())).toBe(true);
});

test('applies semantic glass tint, spotlight, cursor contrast, and resilient fallbacks', async ({
  browser,
  page,
}) => {
  await page.goto('/');

  const glass = header(page).locator('[data-header-glass]');
  const toggle = compactButton(page);
  const close = header(page).locator('[data-header-close]');
  await expect(glass).toHaveAttribute('data-landing-spotlight', 'header');
  await expect(glass).toHaveAttribute('data-cursor-contrast', 'dark');
  await expect(toggle).toHaveAttribute('data-cursor-contrast', 'light');
  await expect(close).toHaveAttribute('data-cursor-contrast', 'light');

  const firstPoint = await glass.boundingBox();
  expect(firstPoint).not.toBeNull();
  await page.mouse.move((firstPoint?.x ?? 0) + 28, (firstPoint?.y ?? 0) + 24);
  await expect(page.locator('html')).toHaveAttribute('data-landing-cursor-enabled', 'true');
  await page.mouse.move((firstPoint?.x ?? 0) + 28, (firstPoint?.y ?? 0) + 24);
  await expect
    .poll(() => glass.evaluate((element) => getComputedStyle(element).getPropertyValue('--mx')))
    .toContain('28px');
  const firstMx = await glass.evaluate((element) => element.style.getPropertyValue('--mx'));
  await page.mouse.move((firstPoint?.x ?? 0) + 180, (firstPoint?.y ?? 0) + 38);
  await expect
    .poll(() => glass.evaluate((element) => element.style.getPropertyValue('--mx')))
    .not.toBe(firstMx);

  for (const sectionId of ['services', 'operations', 'footer'] as const) {
    await scrollSectionIntoView(page, sectionId);
    await expect(header(page)).toHaveAttribute(
      'data-header-glass-tone',
      sectionId === 'operations' ? 'dark' : 'light',
    );
    await expect(glass).toHaveCSS(
      'background-color',
      sectionId === 'operations' ? 'rgba(248, 250, 255, 0.46)' : 'rgba(248, 250, 255, 0.66)',
    );
  }

  expect(
    await page.evaluate(() => {
      const nav = document.querySelector<HTMLElement>('[data-landing-nav]');
      const glass = nav?.querySelector<HTMLElement>('[data-header-glass]');
      if (!nav || !glass) return null;

      const fallback = Array.from(document.styleSheets)
        .flatMap((sheet) => Array.from(sheet.cssRules))
        .find(
          (rule): rule is CSSSupportsRule =>
            rule instanceof CSSSupportsRule &&
            rule.conditionText.includes('backdrop-filter') &&
            rule.conditionText.includes('not'),
        );
      if (!fallback) return null;

      const forcedFallback = document.createElement('style');
      forcedFallback.dataset.headerFallbackEmulation = 'true';
      forcedFallback.textContent = Array.from(fallback.cssRules, (rule) => rule.cssText).join('\n');
      document.head.append(forcedFallback);

      const originalTone = nav.dataset.headerGlassTone;
      const computedByTone = Object.fromEntries(
        ['dark', 'light'].map((tone) => {
          nav.dataset.headerGlassTone = tone;
          const styles = getComputedStyle(glass);
          return [
            tone,
            {
              backdropFilter: styles.backdropFilter,
              backgroundColor: styles.backgroundColor,
              webkitBackdropFilter:
                styles.getPropertyValue('-webkit-backdrop-filter') || styles.backdropFilter,
            },
          ];
        }),
      );

      if (originalTone) nav.dataset.headerGlassTone = originalTone;
      else delete nav.dataset.headerGlassTone;
      forcedFallback.remove();
      return computedByTone;
    }),
  ).toEqual({
    dark: {
      backdropFilter: 'none',
      backgroundColor: 'rgba(248, 250, 255, 0.94)',
      webkitBackdropFilter: 'none',
    },
    light: {
      backdropFilter: 'none',
      backgroundColor: 'rgba(248, 250, 255, 0.94)',
      webkitBackdropFilter: 'none',
    },
  });

  await page.emulateMedia({ contrast: 'more' });
  await expect(glass).toHaveCSS('background-color', 'rgba(248, 250, 255, 0.94)');

  const coarsePage = await browser.newPage({ hasTouch: true, viewport: mobileViewport });
  await coarsePage.goto('/');
  const coarseGlass = coarsePage.locator('[data-header-glass]');
  const coarseMx = await coarseGlass.evaluate((element) => element.style.getPropertyValue('--mx'));
  await coarsePage.mouse.move(120, 32);
  await coarsePage.waitForTimeout(100);
  await expect(coarseGlass).toHaveCSS('--mx', '50%');
  expect(await coarseGlass.evaluate((element) => element.style.getPropertyValue('--mx'))).toBe(
    coarseMx,
  );
  await coarsePage.close();

  const reducedPage = await browser.newPage({ reducedMotion: 'reduce', viewport: desktopViewport });
  await reducedPage.goto('/');
  const reducedGlass = reducedPage.locator('[data-header-glass]');
  await reducedPage.mouse.move(140, 32);
  await reducedPage.waitForTimeout(100);
  await expect(reducedGlass).toHaveCSS('--mx', '50%');
  expect(await reducedGlass.evaluate((element) => element.style.getPropertyValue('--mx'))).toBe('');
  await reducedPage.close();
});

test('uses the compact CSS offset for hash targets and avoids scroll-frame layout writes', async ({
  browser,
}) => {
  for (const viewport of [desktopViewport, mobileViewport]) {
    const page = await browser.newPage({ reducedMotion: 'reduce', viewport });
    await page.goto('/');
    await scrollSectionIntoView(page, 'services');
    await openCompactMenu(page, '서비스');

    const expectedOffset = viewport.width <= 900 ? 82 : 92;
    await expect(header(page)).toHaveCSS('--landing-compact-header-offset', `${expectedOffset}px`);

    const writes = await page.evaluate(() => {
      const recorded: string[] = [];
      const original = CSSStyleDeclaration.prototype.setProperty;
      CSSStyleDeclaration.prototype.setProperty = function setProperty(name, value, priority) {
        if (name === 'width' || name === 'height') recorded.push(`${name}:${value}`);
        return original.call(this, name, value, priority);
      };
      (window as typeof window & { __headerLayoutWrites?: string[] }).__headerLayoutWrites =
        recorded;
      return recorded;
    });
    expect(writes).toEqual([]);

    await page
      .getByRole('navigation', { name: '주요 메뉴' })
      .getByRole('link', { name: '기술', exact: true })
      .click();
    await expect
      .poll(() => page.locator('#stack').evaluate((element) => element.getBoundingClientRect().top))
      .toBeCloseTo(expectedOffset, 0);

    await page.evaluate(() => {
      for (let index = 0; index < 12; index += 1) {
        window.scrollBy({ top: index % 2 === 0 ? 3 : -3, behavior: 'instant' });
      }
    });
    expect(
      await page.evaluate(
        () => (window as typeof window & { __headerLayoutWrites?: string[] }).__headerLayoutWrites,
      ),
    ).toEqual([]);
    await page.close();
  }
});

test('keeps will-change scoped to active header transitions', async ({ page }) => {
  await page.goto('/');
  await enterCompactLayout(page);
  await expect(header(page)).toHaveCSS('will-change', 'auto');

  await header(page).evaluate((element) => {
    const layoutWrites: string[] = [];
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (!(mutation.target instanceof HTMLElement)) continue;
        if (mutation.target.style.width) layoutWrites.push(`width:${mutation.target.style.width}`);
        if (mutation.target.style.height) {
          layoutWrites.push(`height:${mutation.target.style.height}`);
        }
      }
    });
    observer.observe(element, { attributes: true, attributeFilter: ['style'], subtree: true });
    (
      window as typeof window & {
        __headerMotionLayoutObserver?: MutationObserver;
        __headerMotionLayoutWrites?: string[];
      }
    ).__headerMotionLayoutObserver = observer;
    (
      window as typeof window & {
        __headerMotionLayoutObserver?: MutationObserver;
        __headerMotionLayoutWrites?: string[];
      }
    ).__headerMotionLayoutWrites = layoutWrites;
  });

  const button = compactButton(page);
  await button.click();
  await expect(header(page)).toHaveAttribute('data-header-motion', 'true');
  await expect(header(page)).toHaveCSS('will-change', 'transform');
  await page.waitForTimeout(800);
  await expect(header(page)).not.toHaveAttribute('data-header-motion');
  await expect(header(page)).toHaveCSS('will-change', 'auto');
  expect(
    await page.evaluate(() => {
      const state = window as typeof window & {
        __headerMotionLayoutObserver?: MutationObserver;
        __headerMotionLayoutWrites?: string[];
      };
      state.__headerMotionLayoutObserver?.disconnect();
      return state.__headerMotionLayoutWrites;
    }),
  ).toEqual([]);
});

test('moves from the desktop Hero header to Compact and Menu Expanded layouts', async ({
  page,
}) => {
  await page.goto('/');

  await expect(header(page)).toHaveAttribute('data-header-layout', 'hero-expanded');

  await enterCompactLayout(page);
  const button = compactButton(page);
  const controlledMenuId = await button.getAttribute('aria-controls');
  expect(controlledMenuId).toBeTruthy();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator(`#${controlledMenuId}`)).toHaveCount(1);

  await button.click();
  await expect(header(page)).toHaveAttribute('data-header-layout', 'menu-expanded');
  await expectExpandedController(page, '서비스');
});

test('restores toggle focus when a base transition hides focused Hero controls', async ({
  page,
}) => {
  await page.goto('/');
  await expect(header(page)).toHaveAttribute('data-header-hydrated', 'true');
  const button = compactButton(page);
  const logo = header(page).getByRole('link', { name: 'FUTUR home' });

  await logo.focus();
  await expect(logo).toBeFocused();
  await page.setViewportSize(mobileViewport);
  await expectFocusRestoredOnCompactCommit(page, button);

  await page.setViewportSize(desktopViewport);
  await expect(header(page)).toHaveAttribute('data-header-layout', 'hero-expanded');
  const servicesLink = header(page)
    .getByRole('navigation', { name: '주요 메뉴' })
    .getByRole('link', { name: '서비스', exact: true });
  await servicesLink.focus();
  await expect(servicesLink).toBeFocused();
  await scrollSectionIntoView(page, 'services');
  await expectFocusRestoredOnCompactCommit(page, button);
});

test('moves focused Compact toggle to a visible Hero control including after Escape close', async ({
  page,
}) => {
  await page.goto('/');
  await enterCompactLayout(page);
  const button = compactButton(page);

  await button.focus();
  await expect(button).toBeFocused();
  await returnToHeroLayout(page);
  await expectFocusTransferredToVisibleHeroControl(page);

  await enterCompactLayout(page);
  await openCompactMenu(page, '서비스');
  await page.keyboard.press('Escape');
  await expectCompactMenuClosed(page, button, '서비스');
  await returnToHeroLayout(page);
  await expectFocusTransferredToVisibleHeroControl(page);
});

test('cancels a Hero focus transfer on rapid reverse or outside ownership', async ({ page }) => {
  await page.goto('/');
  await enterCompactLayout(page);
  const button = compactButton(page);
  await button.focus();
  await expect(button).toBeFocused();
  await holdAnimationFrames(page);
  const outsideOwner = page.locator('#hero-focus-owner');
  await page.evaluate(() => {
    const owner = document.createElement('button');
    owner.id = 'hero-focus-owner';
    owner.textContent = 'Outside Hero focus owner';
    owner.style.position = 'fixed';
    owner.style.inset = '0 auto auto 0';
    document.body.append(owner);
  });

  await returnToHeroLayout(page);
  await scrollSectionIntoView(page, 'services');
  await expect(header(page)).toHaveAttribute('data-header-layout', 'compact');
  await outsideOwner.click();
  await expect(outsideOwner).toBeFocused();
  await restoreAnimationFrames(page);
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  await expect(outsideOwner).toBeFocused();

  await button.focus();
  await holdAnimationFrames(page);
  await returnToHeroLayout(page);
  await outsideOwner.click();
  await expect(outsideOwner).toBeFocused();
  await restoreAnimationFrames(page);
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  await expect(outsideOwner).toBeFocused();
});

test('does not reuse an interrupted compact focus return after ownership moves outside', async ({
  page,
}) => {
  await page.goto('/');
  await expect(header(page)).toHaveAttribute('data-header-hydrated', 'true');
  const logo = header(page).getByRole('link', { name: 'FUTUR home' });
  await logo.focus();
  await expect(logo).toBeFocused();
  await holdAnimationFrames(page);

  await page.setViewportSize(mobileViewport);
  await expect(header(page)).toHaveAttribute('data-header-layout', 'compact');
  await page.setViewportSize(desktopViewport);
  await expect(header(page)).toHaveAttribute('data-header-layout', 'hero-expanded');

  const outsideOwner = page.locator('#focus-owner');
  await page.evaluate(() => {
    const owner = document.createElement('button');
    owner.id = 'focus-owner';
    owner.textContent = 'Outside focus owner';
    owner.style.position = 'fixed';
    owner.style.inset = '0 auto auto 0';
    document.body.append(owner);
  });
  await outsideOwner.click();
  await expect(outsideOwner).toBeFocused();
  await restoreAnimationFrames(page);

  await page.setViewportSize(mobileViewport);
  await expect(header(page)).toHaveAttribute('data-header-layout', 'compact');
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  await expect(outsideOwner).toBeFocused();
});

test('does not reuse an interrupted compact focus return after an outside pointer intent', async ({
  page,
}) => {
  await page.goto('/');
  await expect(header(page)).toHaveAttribute('data-header-hydrated', 'true');
  const logo = header(page).getByRole('link', { name: 'FUTUR home' });
  const button = compactButton(page);
  await logo.focus();
  await expect(logo).toBeFocused();
  await holdAnimationFrames(page);

  await page.setViewportSize(mobileViewport);
  await expect(header(page)).toHaveAttribute('data-header-layout', 'compact');
  await page.setViewportSize(desktopViewport);
  await expect(header(page)).toHaveAttribute('data-header-layout', 'hero-expanded');
  await page.evaluate(() => {
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  });
  await restoreAnimationFrames(page);

  await page.setViewportSize(mobileViewport);
  await expect(header(page)).toHaveAttribute('data-header-layout', 'compact');
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  await expect(button).not.toBeFocused();
});

test('exposes the expanded close control as the current-location menu controller', async ({
  page,
}) => {
  await page.goto('/');
  await enterCompactLayout(page);
  await compactButton(page).click();

  const controller = header(page).getByRole('button', {
    name: '주요 메뉴 닫기 · 현재 위치 서비스',
    exact: true,
  });
  await expect(controller).toBeVisible();
  await expect(controller).toHaveAttribute('aria-expanded', 'true');
  await expect(controller).toHaveAttribute('aria-controls', 'header-menu');
  await expect(page.locator('#header-menu')).toHaveCount(1);
});

test('hydrates mobile directly into Compact without a 158px painted frame', async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await page.addInitScript(() => {
    const samples: Array<{ height: number; hydrated: string | null }> = [];
    Object.defineProperty(window, '__headerPaintSamples', { configurable: true, value: samples });

    const sample = () => {
      const element = document.querySelector<HTMLElement>('[data-landing-nav]');
      if (element) {
        samples.push({
          height: Math.round(element.getBoundingClientRect().height),
          hydrated: element.dataset.headerHydrated ?? null,
        });
      }
      if (samples.length < 4) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });

  await page.goto('/');
  await expect(header(page)).toHaveAttribute('data-header-layout', 'compact');
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as typeof window & {
              __headerPaintSamples?: Array<{ height: number; hydrated: string | null }>;
            }
          ).__headerPaintSamples?.length ?? 0,
      ),
    )
    .toBeGreaterThanOrEqual(4);

  const samples = await page.evaluate(
    () =>
      (
        window as typeof window & {
          __headerPaintSamples?: Array<{ height: number; hydrated: string | null }>;
        }
      ).__headerPaintSamples ?? [],
  );
  expect(samples.every(({ height }) => height <= 60)).toBe(true);
  expect(samples.some(({ height }) => height >= 150)).toBe(false);
});

test('disables both backdrop-filter implementations on the high-contrast glass overlay', async ({
  page,
}) => {
  await page.emulateMedia({ contrast: 'more' });
  await page.goto('/');

  expect(
    await header(page)
      .locator('[data-header-glass]')
      .evaluate((element) => {
        const styles = getComputedStyle(element, '::after');
        return {
          backdropFilter: styles.backdropFilter,
          webkitBackdropFilter:
            styles.getPropertyValue('-webkit-backdrop-filter') || styles.backdropFilter,
        };
      }),
  ).toEqual({ backdropFilter: 'none', webkitBackdropFilter: 'none' });
});

test('opens the Compact menu with click, Enter, and Space', async ({ page }) => {
  await page.goto('/');
  await enterCompactLayout(page);

  const button = compactButton(page);
  for (const activation of ['click', 'Enter', 'Space'] as const) {
    if (activation === 'click') {
      await button.click();
    } else {
      await button.focus();
      await button.press(activation);
    }

    await expect(header(page)).toHaveAttribute('data-header-layout', 'menu-expanded');
    await expectExpandedController(page, '서비스');
    await page.keyboard.press('Escape');
    await expectCompactMenuClosed(page, button, '서비스');
  }
});

test('settles exact desktop geometry and clears transforms after interrupted reverse input', async ({
  page,
}) => {
  await page.goto('/');
  await enterCompactLayout(page);

  const button = compactButton(page);
  await button.click();
  await page.waitForTimeout(800);
  expect(await readHeaderGeometry(page)).toEqual({
    height: 68,
    inlineTransform: '',
    scaleX: 1,
    scaleY: 1,
    width: 820,
  });

  await page.keyboard.press('Escape');
  await expectCompactMenuClosed(page, button, '서비스');
  await button.press('Enter');
  await page.waitForTimeout(90);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  await expectCompactMenuClosed(page, button, '서비스');
  expect(await readHeaderGeometry(page)).toEqual({
    height: 58,
    inlineTransform: '',
    scaleX: 1,
    scaleY: 1,
    width: 220,
  });
});

test('removes hidden Header controls from keyboard order and moves focus into the opened menu', async ({
  page,
}) => {
  await page.setViewportSize(mobileViewport);
  await page.goto('/');
  await expect(header(page)).toHaveAttribute('data-header-layout', 'compact');

  const logo = header(page).getByRole('link', { name: 'FUTUR home', includeHidden: true });
  const button = compactButton(page);
  const nav = header(page).locator('nav[aria-label="주요 메뉴"]');
  const faqLink = nav.locator('a[href="#faq"]');
  const closeButton = nav.locator('[data-header-close]');

  await expect(logo).toHaveAttribute('aria-hidden', 'true');
  await expect(logo).toHaveAttribute('tabindex', '-1');
  await button.focus();
  await button.press('Enter');
  await expect(closeButton).toBeFocused();
  await expect(button).toHaveAttribute('tabindex', '-1');
  await expect(closeButton).toHaveAttribute('aria-hidden', 'false');
  await page.keyboard.press('Shift+Tab');
  await expect(header(page)).toHaveAttribute('data-header-layout', 'menu-expanded');
  await expect(faqLink).toBeFocused();

  await page.keyboard.press('Escape');
  await expectCompactMenuClosed(page, button, 'FUTUR.');
  await page.keyboard.press('Tab');
  expect(
    await header(page).evaluate((element) => {
      const active = document.activeElement;
      return active ? element.contains(active) : false;
    }),
  ).toBe(false);
});

test('runs and settles the active indicator follow-through inside the open timeline', async ({
  page,
}) => {
  await page.goto('/');
  await enterCompactLayout(page);

  const button = compactButton(page);
  const samplePromise = page.evaluate(async () => {
    const root = document.querySelector<HTMLElement>('[data-landing-nav]');
    if (!root) return [];

    while (root.dataset.headerLayout !== 'menu-expanded') {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }

    const samples: Array<{ inlineTransform: string; scaleX: number }> = [];
    const startedAt = performance.now();
    while (performance.now() - startedAt < 700) {
      const indicator = root.querySelector<HTMLElement>('[data-header-active-indicator]');
      if (indicator) {
        const transform = getComputedStyle(indicator).transform;
        const matrix = transform === 'none' ? new DOMMatrix() : new DOMMatrix(transform);
        samples.push({
          inlineTransform: indicator.style.transform,
          scaleX: Math.round(Math.hypot(matrix.a, matrix.b) * 1_000) / 1_000,
        });
      }
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
    return samples;
  });

  await button.click();
  const samples = await samplePromise;
  expect(samples.some(({ scaleX }) => scaleX >= 0.7 && scaleX < 0.99)).toBe(true);
  expect(samples.at(-1)).toEqual({ inlineTransform: '', scaleX: 1 });
});

test('tracks section navigation and maps operations to process', async ({ page }) => {
  await page.goto('/');

  const nav = header(page).locator('nav[aria-label="주요 메뉴"]');
  const activeLinks = nav.locator('a[aria-current="location"]');
  const expectedSections: Record<string, { activeHref: string | null; label: string | null }> = {
    hero: { activeHref: null, label: null },
    services: { activeHref: '#services', label: '서비스' },
    stack: { activeHref: '#stack', label: '기술' },
    team: { activeHref: '#team', label: '팀' },
    process: { activeHref: '#process', label: '프로세스' },
    operations: { activeHref: '#process', label: '프로세스' },
    faq: { activeHref: '#faq', label: 'FAQ' },
    footer: { activeHref: null, label: 'FUTUR.' },
  };

  for (const [sectionId, { activeHref, label }] of Object.entries(expectedSections)) {
    await scrollSectionIntoView(page, sectionId);

    if (activeHref === null) {
      await expect(activeLinks).toHaveCount(0);
    } else {
      await expect(nav.locator(`a[href="${activeHref}"]`)).toHaveAttribute(
        'aria-current',
        'location',
      );
      await expect(activeLinks).toHaveCount(1);
    }

    if (label !== null) {
      const button = compactButton(page);
      await expect(button).toBeVisible();
      await expectCompactLabel(button, label);

      if (activeHref !== null) {
        await openCompactMenu(page, label);
        await page.keyboard.press('Escape');
        await expectCompactMenuClosed(page, button, label);
      }
    }
  }
});

test('closes the expanded menu and returns focus for every dismissal path', async ({ page }) => {
  await page.goto('/');
  await enterCompactLayout(page);

  let button = await openCompactMenu(page, '서비스');
  await page
    .getByRole('navigation', { name: '주요 메뉴' })
    .getByRole('link', {
      name: '기술',
      exact: true,
    })
    .click();
  await expectCompactMenuClosed(page, button, '기술');
  await scrollSectionIntoView(page, 'stack');

  button = await openCompactMenu(page, '기술');
  await page.mouse.click(20, desktopViewport.height - 20);
  await expectCompactMenuClosed(page, button, '기술');

  button = await openCompactMenu(page, '기술');
  await page.keyboard.press('Escape');
  await expectCompactMenuClosed(page, button, '기술');

  await page.goto('/');
  await enterCompactLayout(page);
  button = await openCompactMenu(page, '서비스');
  const openedAt = await page.evaluate(() => window.scrollY);
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), openedAt + 23);
  await expect(header(page)).toHaveAttribute('data-header-layout', 'menu-expanded');
  await expectExpandedController(page, '서비스');
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), openedAt + 24);
  await expect(header(page)).toHaveAttribute('data-header-layout', 'compact');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(button).toHaveAccessibleName(/주요 메뉴 열기/);
  await expect(button).toBeFocused();
});

test('restores toggle focus by the next frame for every compact dismissal commit', async ({
  page,
}) => {
  await page.goto('/');
  await enterCompactLayout(page);

  let button = await openCompactMenu(page, '서비스');
  await page
    .getByRole('navigation', { name: '주요 메뉴' })
    .getByRole('link', { name: '기술', exact: true })
    .click();
  await expectFocusRestoredOnCompactCommit(page, button);

  await scrollSectionIntoView(page, 'stack');
  button = await openCompactMenu(page, '기술');
  await page.mouse.click(20, desktopViewport.height - 20);
  await expectFocusRestoredOnCompactCommit(page, button);

  button = await openCompactMenu(page, '기술');
  await page.keyboard.press('Escape');
  await expectFocusRestoredOnCompactCommit(page, button);

  await page.goto('/');
  await enterCompactLayout(page);
  button = await openCompactMenu(page, '서비스');
  const openedAt = await page.evaluate(() => window.scrollY);
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), openedAt + 24);
  await expectFocusRestoredOnCompactCommit(page, button);

  await page.goto('/');
  await enterCompactLayout(page);
  await openCompactMenu(page, '서비스');
  await page.evaluate(() => {
    const toggle = document.querySelector<HTMLButtonElement>('[data-header-toggle]');
    document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
    toggle?.click();
  });
  await expect(header(page)).toHaveAttribute('data-header-layout', 'menu-expanded');
  await page.waitForTimeout(500);
  expect(
    await header(page).evaluate((element) => {
      const active = document.activeElement;
      return {
        focusInsideMenu: active
          ? Boolean(element.querySelector('nav[aria-hidden="false"]')?.contains(active))
          : false,
        toggleFocused: active === element.querySelector('[data-header-toggle]'),
      };
    }),
  ).toEqual({ focusInsideMenu: true, toggleFocused: false });
});

test('uses a contained 3+2 menu grid from the mobile Hero', async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await page.goto('/');

  await expect(header(page)).toHaveAttribute('data-header-layout', 'compact');
  const button = compactButton(page);
  await expect(button).toBeVisible();
  await expectCompactLabel(button, 'FUTUR.');
  await openCompactMenu(page, 'FUTUR.');

  const nav = page.getByRole('navigation', { name: '주요 메뉴' });
  const links = nav.getByRole('link');
  await expect(links).toHaveCount(5);
  await expect(links).toHaveText(menuLabels);

  const linkBoxes = await links.evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: Math.round(rect.top) };
    }),
  );
  const rowSizes = Object.values(
    linkBoxes.reduce<Record<number, number>>((rows, box) => {
      rows[box.top] = (rows[box.top] ?? 0) + 1;
      return rows;
    }, {}),
  );
  expect(rowSizes).toEqual([3, 2]);

  const headerBox = await header(page).boundingBox();
  expect(headerBox).not.toBeNull();
  expect(headerBox?.x).toBeGreaterThanOrEqual(10);
  expect((headerBox?.x ?? 0) + (headerBox?.width ?? 0)).toBeLessThanOrEqual(
    mobileViewport.width - 10,
  );
  expect(Math.min(...linkBoxes.map((box) => box.left))).toBeGreaterThanOrEqual(10);
  expect(Math.max(...linkBoxes.map((box) => box.right))).toBeLessThanOrEqual(
    mobileViewport.width - 10,
  );

  const documentWidth = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(documentWidth.scrollWidth).toBeLessThanOrEqual(documentWidth.clientWidth);
});

test('completes Compact transitions immediately when reduced motion is requested', async ({
  browser,
}) => {
  const page = await browser.newPage({ reducedMotion: 'reduce', viewport: desktopViewport });
  await page.goto('/');
  await enterCompactLayout(page);

  const button = compactButton(page);
  await button.click();
  const frameSamples = await sampleReducedMotionFrames(page);
  await expect(header(page)).toHaveAttribute('data-header-layout', 'menu-expanded');
  await expectExpandedController(page, '서비스');

  expect(frameSamples.elapsedMs).toBeGreaterThanOrEqual(700);
  expect(frameSamples.samples.length).toBeGreaterThan(2);
  const firstFrame = frameSamples.samples[0];
  expect(firstFrame).toBeDefined();
  for (const sample of frameSamples.samples) expect(sample).toEqual(firstFrame);

  const movingElements = await header(page).evaluate((element) => {
    const elements = [element, ...element.querySelectorAll('*')];
    const hasNonZeroTime = (value: string) =>
      value.split(',').some((time) => Number.parseFloat(time) > 0);

    return elements.flatMap((candidate) => {
      const styles = getComputedStyle(candidate);
      const hasMotion = [
        styles.animationDelay,
        styles.animationDuration,
        styles.transitionDelay,
        styles.transitionDuration,
      ].some(hasNonZeroTime);

      return hasMotion ? [candidate.tagName.toLowerCase()] : [];
    });
  });
  expect(movingElements).toEqual([]);

  await page.keyboard.press('Escape');
  await expectCompactMenuClosed(page, button, '서비스');
  await page.close();
});

test('keeps five navigation destinations and core content available without JavaScript', async ({
  browser,
}) => {
  const page = await browser.newPage({ javaScriptEnabled: false, viewport: mobileViewport });
  await page.goto('/');

  const nav = page.getByRole('navigation', { name: '주요 메뉴' });
  const links = nav.getByRole('link');
  await expect(links).toHaveCount(5);
  await expect(links).toHaveText(menuLabels);
  for (const link of await links.all()) await expect(link).toBeVisible();

  const headerBox = await header(page).boundingBox();
  expect(headerBox).not.toBeNull();
  expect(headerBox?.height).toBeGreaterThanOrEqual(150);
  expect(headerBox?.height).toBeLessThanOrEqual(166);
  const linkBoxes = await links.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().toJSON()),
  );
  for (const box of linkBoxes) {
    expect(box.left).toBeGreaterThanOrEqual(headerBox?.x ?? 0);
    expect(box.right).toBeLessThanOrEqual((headerBox?.x ?? 0) + (headerBox?.width ?? 0));
    expect(box.top).toBeGreaterThanOrEqual(headerBox?.y ?? 0);
    expect(box.bottom).toBeLessThanOrEqual((headerBox?.y ?? 0) + (headerBox?.height ?? 0));
  }
  await expect(compactButton(page)).toBeHidden();
  await expect(header(page).getByRole('button', { name: '주요 메뉴 닫기' })).toBeHidden();

  await expect(
    page.getByRole('heading', { level: 1, name: 'BUILT FOR WHAT’S NEXT.' }),
  ).toBeVisible();
  for (const sectionId of ['services', 'stack', 'team', 'process', 'operations', 'faq', 'footer']) {
    await expect(page.locator(`#${sectionId}`)).toBeVisible();
  }

  await page.close();
});

test('removes contact UI and keeps the approved landing order', async ({ page }) => {
  await page.goto('/');

  await expect(header(page).getByRole('link', { name: /문의/ })).toHaveCount(0);
  await expect(header(page).getByRole('button', { name: /문의/ })).toHaveCount(0);
  await expect(page.locator('#contact')).toHaveCount(0);
  await expect(page.locator('[data-landing-nav] [href="#contact"]')).toHaveCount(0);
  await expect(page.locator('[data-landing-hero] a')).toHaveCount(0);
  await expect(page.locator('#services a[href="#contact"]')).toHaveCount(0);

  expect(
    await page
      .locator('[data-landing-section]')
      .evaluateAll((elements) => elements.map((element) => element.id)),
  ).toEqual(['hero', 'services', 'stack', 'team', 'process', 'operations', 'faq', 'footer']);
});

test('preserves the Hero particle, Footer email, contact server layers, and behavior specs', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.locator('#hero canvas[data-hero-particles]')).toHaveCount(1);
  await expect(page.locator('#footer a[href^="mailto:"]').first()).toBeVisible();

  for (const path of [
    'src/pages/landing/model/contact-inquiry.ts',
    'src/pages/landing/server/contact-inquiry.functions.ts',
    'src/pages/landing/server/contact-inquiry.server.ts',
    'src/pages/landing/server/contact-mail.server.ts',
    'e2e/contact-server-boundaries.chrome.spec.ts',
    'e2e/contact-mail-safety.chrome.spec.ts',
  ]) {
    expect(existsSync(resolve(process.cwd(), path)), `${path} must remain available`).toBe(true);
  }
});
