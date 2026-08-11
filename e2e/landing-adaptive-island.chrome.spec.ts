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

async function readGlassStyle(glass: Locator) {
  return glass.evaluate((element) => {
    const styles = getComputedStyle(element);
    const beforeStyles = getComputedStyle(element, '::before');
    const afterStyles = getComputedStyle(element, '::after');

    return {
      afterBackdropFilter: afterStyles.backdropFilter,
      backdropFilter: styles.backdropFilter,
      backgroundColor: styles.backgroundColor,
      beforeOpacity: beforeStyles.opacity,
      webkitBackdropFilter: styles.getPropertyValue('-webkit-backdrop-filter'),
    };
  });
}

async function readBackdropStyle(backdrop: Locator) {
  return backdrop.evaluate((element) => {
    const styles = getComputedStyle(element);

    return {
      backdropFilter: styles.backdropFilter,
      opacity: Number(styles.opacity),
      transitionDuration: styles.transitionDuration,
      transitionProperty: styles.transitionProperty,
      webkitBackdropFilter: styles.getPropertyValue('-webkit-backdrop-filter'),
    };
  });
}

async function enterCompactLayout(page: Page, sectionId = 'services', label = '서비스') {
  await page.setViewportSize(mobileViewport);
  await scrollSectionIntoView(page, sectionId);
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-compact');
  const button = compactButton(page);
  await expect(button).toBeVisible();
  await expectCompactLabel(button, label);
}

async function openCompactMenu(page: Page, label: string) {
  const button = compactButton(page);
  await button.click();
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-expanded');
  await expectExpandedController(page, label);
  return button;
}

async function expectCompactMenuClosed(page: Page, button: Locator, label: string) {
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-compact');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expectCompactLabel(button, label);
  await expect(button).toBeFocused();
}

async function expectFocusRestoredOnCompactCommit(page: Page, button: Locator) {
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-compact');
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

type DesktopIndicatorFrame = {
  activeHref: string | null;
  opacity: number;
  targetWidth: number;
  targetX: number;
  time: number;
  width: number;
  x: number;
};

async function sampleDesktopIndicatorMotion(
  page: Page,
  targetSectionId: 'stack' | 'team',
  retargetSectionId?: 'team',
) {
  return page.evaluate(
    async ({ retargetId, targetId }) => {
      const root = document.querySelector<HTMLElement>('[data-landing-nav]');
      const targetSection = document.querySelector<HTMLElement>(`#${targetId}`);
      const targetLink = root?.querySelector<HTMLElement>(`a[href="#${targetId}"]`);
      const retargetSection = retargetId
        ? document.querySelector<HTMLElement>(`#${retargetId}`)
        : null;
      if (!root || !targetSection || !targetLink) {
        throw new Error('desktop indicator fixture is incomplete');
      }

      const frames: DesktopIndicatorFrame[] = [];
      const startedAt = performance.now();
      let retargetSampleIndex: number | null = null;
      let retargeted = false;
      targetSection.scrollIntoView({ block: 'center', behavior: 'instant' });

      do {
        const indicator = root.querySelector<HTMLElement>('[data-header-active-indicator]');
        if (indicator) {
          const rect = indicator.getBoundingClientRect();
          const targetRect = targetLink.getBoundingClientRect();
          frames.push({
            activeHref:
              root.querySelector<HTMLElement>('a[aria-current="location"]')?.getAttribute('href') ??
              null,
            opacity: Number.parseFloat(getComputedStyle(indicator).opacity),
            targetWidth: targetRect.width,
            targetX: targetRect.left,
            time: performance.now() - startedAt,
            width: rect.width,
            x: rect.left,
          });
        }

        const elapsed = performance.now() - startedAt;
        if (!retargeted && retargetSection && elapsed >= 80) {
          retargetSampleIndex = frames.length - 1;
          retargeted = true;
          retargetSection.scrollIntoView({ block: 'center', behavior: 'instant' });
        }
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      } while (performance.now() - startedAt < 360);

      return { frames, retargetSampleIndex };
    },
    { retargetId: retargetSectionId, targetId: targetSectionId },
  );
}

async function readReducedIndicatorOnNextFrame(page: Page, targetSectionId: 'stack') {
  return page.evaluate(async (targetId) => {
    const root = document.querySelector<HTMLElement>('[data-landing-nav]');
    const indicator = root?.querySelector<HTMLElement>('[data-header-active-indicator]');
    const targetSection = document.querySelector<HTMLElement>(`#${targetId}`);
    const targetLink = root?.querySelector<HTMLElement>(`a[href="#${targetId}"]`);
    if (!root || !indicator || !targetSection || !targetLink) {
      throw new Error('reduced indicator fixture is incomplete');
    }

    return new Promise<{
      activeHref: string | null;
      opacity: string;
      targetWidth: number;
      targetX: number;
      width: number;
      x: number;
    }>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        observer.disconnect();
        reject(new Error('reduced indicator target did not become active'));
      }, 2_000);
      const observer = new MutationObserver(() => {
        if (targetLink.getAttribute('aria-current') !== 'location') return;

        observer.disconnect();
        window.clearTimeout(timeout);
        requestAnimationFrame(() => {
          const rect = indicator.getBoundingClientRect();
          const targetRect = targetLink.getBoundingClientRect();
          resolve({
            activeHref:
              root.querySelector<HTMLElement>('a[aria-current="location"]')?.getAttribute('href') ??
              null,
            opacity: indicator.style.opacity,
            targetWidth: targetRect.width,
            targetX: targetRect.left,
            width: rect.width,
            x: rect.left,
          });
        });
      });

      observer.observe(root, {
        attributeFilter: ['aria-current'],
        attributes: true,
        subtree: true,
      });
      targetSection.scrollIntoView({ block: 'center', behavior: 'instant' });
    });
  }, targetSectionId);
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

type MobileMotionSample = {
  height: number;
  inlineTransform: string;
  itemOpacity: number[];
  itemTranslateY: number[];
  time: number;
  width: number;
};

async function sampleMobileMotion(page: Page, targetLayout: 'mobile-compact' | 'mobile-expanded') {
  return header(page).evaluate(async (element, target) => {
    const round = (value: number) => Math.round(value * 100) / 100;
    const startedWaitingAt = performance.now();

    while (element.dataset.headerLayout !== target || element.dataset.headerMotion !== 'true') {
      if (performance.now() - startedWaitingAt >= 2_000) {
        throw new Error(`${target} motion did not start within 2 seconds`);
      }
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }

    const startedAt = performance.now();
    const samples: MobileMotionSample[] = [];
    do {
      const rect = element.getBoundingClientRect();
      const items = Array.from(
        element.querySelectorAll<HTMLElement>('nav[aria-label="주요 메뉴"] a'),
      );
      samples.push({
        height: round(rect.height),
        inlineTransform: element.style.transform,
        itemOpacity: items.map((item) => Number.parseFloat(getComputedStyle(item).opacity)),
        itemTranslateY: items.map((item) => {
          const transform = getComputedStyle(item).transform;
          return round(transform === 'none' ? 0 : new DOMMatrix(transform).m42);
        }),
        time: round(performance.now() - startedAt),
        width: round(rect.width),
      });
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    } while (element.dataset.headerMotion === 'true' && performance.now() - startedAt < 2_000);

    const rect = element.getBoundingClientRect();
    samples.push({
      height: round(rect.height),
      inlineTransform: element.style.transform,
      itemOpacity: Array.from(
        element.querySelectorAll<HTMLElement>('nav[aria-label="주요 메뉴"] a'),
        (item) => Number.parseFloat(getComputedStyle(item).opacity),
      ),
      itemTranslateY: Array.from(
        element.querySelectorAll<HTMLElement>('nav[aria-label="주요 메뉴"] a'),
        (item) => {
          const transform = getComputedStyle(item).transform;
          return round(transform === 'none' ? 0 : new DOMMatrix(transform).m42);
        },
      ),
      time: round(performance.now() - startedAt),
      width: round(rect.width),
    });
    return samples;
  }, targetLayout);
}

function longestEqualGeometryRun(samples: MobileMotionSample[]) {
  let longest = 0;
  let runStartedAt = samples[0]?.time ?? 0;

  for (let index = 1; index < samples.length; index += 1) {
    const current = samples[index]!;
    const previous = samples[index - 1]!;
    if (current.width !== previous.width || current.height !== previous.height) {
      runStartedAt = current.time;
      continue;
    }
    longest = Math.max(longest, current.time - runStartedAt);
  }

  return longest;
}

function expectContinuousMobileGeometry(samples: MobileMotionSample[]) {
  expect(new Set(samples.map(({ width }) => width)).size).toBeGreaterThanOrEqual(5);
  expect(new Set(samples.map(({ height }) => height)).size).toBeGreaterThanOrEqual(5);
  expect(longestEqualGeometryRun(samples)).toBeLessThan(80);
  const previous = samples[samples.length - 2]!;
  const last = samples[samples.length - 1]!;
  expect(Math.abs(last.width - previous.width)).toBeLessThan(16);
  expect(Math.abs(last.height - previous.height)).toBeLessThan(10);
}

async function sampleInterruptedMobileMotion(page: Page) {
  return header(page).evaluate(async (element) => {
    const round = (value: number) => Math.round(value * 100) / 100;
    const samples: MobileMotionSample[] = [];
    const toggle = element.querySelector<HTMLButtonElement>('[data-header-toggle]');
    if (!toggle) throw new Error('mobile header toggle is missing');

    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    toggle.click();
    const startedAt = performance.now();
    let reversed = false;
    let reversalSampleIndex: number | null = null;
    do {
      const elapsed = performance.now() - startedAt;
      const rect = element.getBoundingClientRect();
      const items = Array.from(
        element.querySelectorAll<HTMLElement>('nav[aria-label="주요 메뉴"] a'),
      );
      samples.push({
        height: round(rect.height),
        inlineTransform: element.style.transform,
        itemOpacity: items.map((item) => Number.parseFloat(getComputedStyle(item).opacity)),
        itemTranslateY: items.map((item) => {
          const transform = getComputedStyle(item).transform;
          return round(transform === 'none' ? 0 : new DOMMatrix(transform).m42);
        }),
        time: round(elapsed),
        width: round(rect.width),
      });
      if (!reversed && elapsed >= 120) {
        reversed = true;
        reversalSampleIndex = samples.length;
        document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
      }
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    } while (
      (!reversed || element.dataset.headerMotion === 'true') &&
      performance.now() - startedAt < 2_000
    );

    if (reversalSampleIndex === null) throw new Error('mobile motion never reversed');
    const indicator = element.querySelector<HTMLElement>('[data-header-mobile-active-indicator]');
    return {
      indicatorInlineStyle: indicator
        ? { opacity: indicator.style.opacity, transform: indicator.style.transform }
        : null,
      itemInlineStyles: Array.from(
        element.querySelectorAll<HTMLElement>('nav[aria-label="주요 메뉴"] a'),
        (item) => ({ opacity: item.style.opacity, transform: item.style.transform }),
      ),
      reversalSampleIndex,
      samples,
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
  const finalShrinkingSample = shrinkingSamples[shrinkingSamples.length - 1]!;
  expect(finalShrinkingSample.width).toBeCloseTo(1133.44, 0);
  expect(finalShrinkingSample.height).toBeCloseTo(68, 0);
  expect(finalShrinkingSample.radius).toBeCloseTo(24, 0);
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
  const finalRestoringSample = restoringSamples[restoringSamples.length - 1]!;
  expect(finalRestoringSample.width).toBeCloseTo(1232, 0);
  expect(finalRestoringSample.height).toBeCloseTo(76, 0);
  expect(finalRestoringSample.radius).toBeCloseTo(28, 0);
  expect(fontSizeSamples.every((sample) => sample.join() === initialFontSizes.join())).toBe(true);
});

test('avoids settled desktop geometry writes through the Hero to Services boundary', async ({
  page,
}) => {
  await page.goto('/');
  await expect(header(page)).toHaveAttribute('data-header-hydrated', 'true');
  await page.evaluate(() => window.scrollTo({ top: 620, behavior: 'instant' }));
  await expect.poll(async () => (await header(page).boundingBox())?.width).toBeCloseTo(1_133.44, 0);
  await page.waitForTimeout(240);

  try {
    await header(page).evaluate(async (element) => {
      const fluidProperties = new Set([
        '--header-fluid-width',
        '--header-fluid-height',
        '--header-fluid-radius',
        '--header-fluid-shell-start',
        '--header-fluid-shell-end',
        '--header-fluid-menu-gap',
        '--header-fluid-shadow-y',
        '--header-fluid-shadow-blur',
        '--header-fluid-shadow-alpha',
      ]);
      const recorded: string[] = [];
      const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;

      Object.assign(window, {
        __headerGeometryRecorded: recorded,
        __headerGeometryRestore: () => {
          CSSStyleDeclaration.prototype.setProperty = originalSetProperty;
        },
      });

      CSSStyleDeclaration.prototype.setProperty = function setProperty(name, value, priority) {
        if (this === element.style && fluidProperties.has(name)) recorded.push(`${name}:${value}`);
        return originalSetProperty.call(this, name, value, priority);
      };

      for (let index = 0; index < 30; index += 1) {
        const top = 620 + ((1_240 - 620) * index) / 29;
        window.scrollTo({ top, behavior: 'instant' });
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
      await new Promise<void>((resolve) => window.setTimeout(resolve, 280));
    });

    expect(
      await page.evaluate(() =>
        (
          window as typeof window & { __headerGeometryRecorded: string[] }
        ).__headerGeometryRecorded.slice(),
      ),
    ).toEqual([]);

    const widthBeforeResize = (await header(page).boundingBox())?.width;
    await page.setViewportSize({ width: 1180, height: desktopViewport.height });
    await expect
      .poll(async () => (await header(page).boundingBox())?.width)
      .toBeCloseTo(1_132 * 0.92, 0);
    expect((await header(page).boundingBox())?.width).not.toBe(widthBeforeResize);

    const resizeWrites = await page.evaluate(() =>
      (
        window as typeof window & { __headerGeometryRecorded: string[] }
      ).__headerGeometryRecorded.slice(),
    );
    expect(resizeWrites).toHaveLength(9);
    expect(new Set(resizeWrites.map((write) => write.split(':', 1)[0])).size).toBe(9);
  } finally {
    await page.evaluate(() => {
      const instrumentedWindow = window as typeof window & {
        __headerGeometryRecorded?: string[];
        __headerGeometryRestore?: () => void;
      };
      instrumentedWindow.__headerGeometryRestore?.();
      delete instrumentedWindow.__headerGeometryRecorded;
      delete instrumentedWindow.__headerGeometryRestore;
    });
  }
});

test('commits exact desktop geometry when reduced motion interrupts a quick tween', async ({
  page,
}) => {
  await page.goto('/');
  const nav = header(page);
  await expect(nav).toHaveAttribute('data-header-hydrated', 'true');
  await expect.poll(async () => (await nav.boundingBox())?.width).toBeCloseTo(1_232, 0);

  const midTweenWidth = await page.evaluate(async () => {
    window.scrollTo({ top: 620, behavior: 'instant' });
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    return document.querySelector<HTMLElement>('[data-landing-nav]')!.getBoundingClientRect().width;
  });
  expect(midTweenWidth).toBeGreaterThan(1_134);
  expect(midTweenWidth).toBeLessThan(1_232);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  const readGeometry = () =>
    nav.evaluate((element) => ({
      height: element.style.getPropertyValue('--header-fluid-height'),
      radius: element.style.getPropertyValue('--header-fluid-radius'),
      width: element.style.getPropertyValue('--header-fluid-width'),
    }));
  await expect.poll(readGeometry).toEqual({
    height: '68px',
    radius: '24px',
    width: '1133.44px',
  });

  const committedGeometry = await readGeometry();
  await page.waitForTimeout(240);
  expect(await readGeometry()).toEqual(committedGeometry);
});

test('writes settled desktop geometry after a retained-scroll reload', async ({ page }) => {
  await page.goto('/');
  await expect(header(page)).toHaveAttribute('data-header-hydrated', 'true');
  await page.evaluate(() => window.scrollTo({ top: 620, behavior: 'instant' }));
  await expect.poll(async () => (await header(page).boundingBox())?.width).toBeCloseTo(1_133.44, 0);

  await page.reload();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(160);
  await expect.poll(async () => (await header(page).boundingBox())?.width).toBeCloseTo(1_133.44, 0);
});

test('suspends only the Header blur while scrolling without degrading Hero rendering', async ({
  browser,
}) => {
  const page = await browser.newPage({
    deviceScaleFactor: 2,
    viewport: { height: 1080, width: 1920 },
  });
  await page.addInitScript(() => {
    const drawArrays = WebGL2RenderingContext.prototype.drawArrays;
    const drawCalls: Array<{ count: number; mode: number }> = [];

    WebGL2RenderingContext.prototype.drawArrays = function (...args) {
      drawCalls.push({ count: args[2], mode: args[0] });
      if (drawCalls.length > 80) drawCalls.shift();
      return drawArrays.apply(this, args);
    };
    (window as typeof window & { __heroDrawCalls: typeof drawCalls }).__heroDrawCalls = drawCalls;
  });
  await page.goto('/');

  const nav = header(page);
  const glass = nav.locator('[data-header-glass]');
  const backdrop = nav.locator('[data-header-backdrop-layer]');
  const scrollEdge = nav.locator('[data-header-scroll-edge]');
  const canvas = page.locator('#hero canvas[data-hero-particles]');
  await expect(nav).toHaveAttribute('data-header-hydrated', 'true');
  await expect(canvas).toHaveAttribute('data-particle-state', 'ready');
  await expect(canvas).toHaveAttribute('data-particle-count', '70000');
  await expect(canvas).toHaveAttribute('data-particle-emitter-count', '4000');
  await expect(nav).not.toHaveAttribute('data-header-scrolling');
  await expect(backdrop).toHaveAttribute('aria-hidden', 'true');
  await expect(backdrop).toHaveCSS('backdrop-filter', 'blur(20px) saturate(1.35) contrast(1.03)');
  await expect(backdrop).toHaveCSS('opacity', '1');
  await expect(scrollEdge).toHaveAttribute('aria-hidden', 'true');
  await expect(scrollEdge).toHaveCSS('backdrop-filter', 'none');
  await expect(scrollEdge).toHaveCSS('opacity', '0');
  const scrollEdgeHeight = await scrollEdge.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).height),
  );
  expect(scrollEdgeHeight).toBeGreaterThanOrEqual(18);
  expect(scrollEdgeHeight).toBeLessThanOrEqual(28);
  await expect(glass).toHaveCSS('background-color', 'rgba(248, 250, 255, 0.18)');
  await expect(glass).toHaveCSS('border-color', 'rgba(151, 184, 235, 0.28)');

  const heroQuality = await canvas.evaluate((element) => {
    const canvasElement = element as HTMLCanvasElement;
    const rect = canvasElement.getBoundingClientRect();
    const drawCalls = (
      window as typeof window & { __heroDrawCalls: Array<{ count: number; mode: number }> }
    ).__heroDrawCalls;
    const hasFourPassFrame = drawCalls.some(
      (call, index) =>
        call.mode === WebGL2RenderingContext.TRIANGLES &&
        call.count === 3 &&
        drawCalls[index + 1]?.mode === WebGL2RenderingContext.POINTS &&
        drawCalls[index + 1]?.count === 70_000 &&
        drawCalls[index + 2]?.mode === WebGL2RenderingContext.POINTS &&
        drawCalls[index + 2]?.count === 70_000 &&
        drawCalls[index + 3]?.mode === WebGL2RenderingContext.POINTS &&
        drawCalls[index + 3]?.count === 4_000,
    );

    return {
      context: canvasElement.getContext('webgl2') ? 'webgl2' : 'none',
      devicePixelRatio: window.devicePixelRatio,
      hasFourPassFrame,
      height: canvasElement.height,
      renderedHeight: Math.round(rect.height * 2),
      renderedWidth: Math.round(rect.width * 2),
      width: canvasElement.width,
    };
  });
  expect(heroQuality).toMatchObject({
    context: 'webgl2',
    devicePixelRatio: 2,
    hasFourPassFrame: true,
  });
  expect(heroQuality.width).toBe(heroQuality.renderedWidth);
  expect(heroQuality.height).toBe(heroQuality.renderedHeight);

  const fadeOutSamplesPromise = backdrop.evaluate(async (element) => {
    const nav = element.closest<HTMLElement>('[data-landing-nav]')!;
    const startedAt = performance.now();
    const samples: Array<{
      backdropFilter: string;
      elapsedMs: number;
      opacity: number;
      scrolling: boolean;
      suspended: boolean;
    }> = [];

    while (performance.now() - startedAt < 150) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const styles = getComputedStyle(element);
      samples.push({
        backdropFilter: styles.backdropFilter,
        elapsedMs: performance.now() - startedAt,
        opacity: Number(styles.opacity),
        scrolling: nav.dataset.headerScrolling === 'true',
        suspended: nav.dataset.headerBackdropSuspended === 'true',
      });
    }

    return samples;
  });
  await page.evaluate(() => {
    (
      window as typeof window & { __heroDrawCalls: Array<{ count: number; mode: number }> }
    ).__heroDrawCalls.length = 0;
    window.scrollTo({ behavior: 'instant', top: 120 });
  });
  const fadeOutSamples = await fadeOutSamplesPromise;
  await page.evaluate(async () => {
    for (const top of [124, 128, 132, 136]) {
      window.scrollTo({ behavior: 'instant', top });
      await new Promise<void>((resolve) => window.setTimeout(resolve, 40));
    }
  });
  await expect(nav).toHaveAttribute('data-header-scrolling', 'true');
  await expect(nav).toHaveAttribute('data-header-backdrop-suspended', 'true');
  await expect(scrollEdge).toHaveCSS('backdrop-filter', 'none');
  await expect(scrollEdge).toHaveCSS('opacity', '1');
  expect(fadeOutSamples).toContainEqual(
    expect.objectContaining({
      backdropFilter: 'blur(20px) saturate(1.35) contrast(1.03)',
      scrolling: true,
      suspended: false,
    }),
  );
  expect(
    fadeOutSamples.some(
      ({ backdropFilter, opacity }) =>
        backdropFilter === 'blur(20px) saturate(1.35) contrast(1.03)' &&
        opacity > 0.05 &&
        opacity < 0.95,
    ),
  ).toBe(true);
  expect(await readBackdropStyle(backdrop)).toMatchObject({
    backdropFilter: 'none',
    opacity: 0,
    webkitBackdropFilter: '',
  });
  await expect(glass).toHaveCSS('background-color', 'rgba(248, 250, 255, 0.18)');
  await expect(glass).toHaveCSS('border-color', 'rgba(151, 184, 235, 0.28)');

  const scrollingHeroQuality = await canvas.evaluate(async (element) => {
    const canvasElement = element as HTMLCanvasElement;
    const nav = document.querySelector<HTMLElement>('[data-landing-nav]')!;
    const drawCalls = (
      window as typeof window & { __heroDrawCalls: Array<{ count: number; mode: number }> }
    ).__heroDrawCalls;
    const hasFourPassFrame = () =>
      drawCalls.some(
        (call, index) =>
          call.mode === WebGL2RenderingContext.TRIANGLES &&
          call.count === 3 &&
          drawCalls[index + 1]?.mode === WebGL2RenderingContext.POINTS &&
          drawCalls[index + 1]?.count === 70_000 &&
          drawCalls[index + 2]?.mode === WebGL2RenderingContext.POINTS &&
          drawCalls[index + 2]?.count === 70_000 &&
          drawCalls[index + 3]?.mode === WebGL2RenderingContext.POINTS &&
          drawCalls[index + 3]?.count === 4_000,
      );

    let observedFourPassFrameWhileScrolling = hasFourPassFrame();
    while (nav.dataset.headerScrolling === 'true' && !observedFourPassFrameWhileScrolling) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (nav.dataset.headerScrolling === 'true') {
        observedFourPassFrameWhileScrolling = hasFourPassFrame();
      }
    }

    const rect = canvasElement.getBoundingClientRect();
    return {
      devicePixelRatio: window.devicePixelRatio,
      emitterCount: canvasElement.dataset.particleEmitterCount,
      hasFourPassFrame: observedFourPassFrameWhileScrolling,
      height: canvasElement.height,
      marker: nav.dataset.headerScrolling,
      particleCount: canvasElement.dataset.particleCount,
      renderedHeight: Math.round(rect.height * 2),
      renderedWidth: Math.round(rect.width * 2),
      width: canvasElement.width,
    };
  });
  expect(scrollingHeroQuality).toMatchObject({
    devicePixelRatio: 2,
    emitterCount: '4000',
    hasFourPassFrame: true,
    marker: 'true',
    particleCount: '70000',
  });
  expect(scrollingHeroQuality.width).toBe(scrollingHeroQuality.renderedWidth);
  expect(scrollingHeroQuality.height).toBe(scrollingHeroQuality.renderedHeight);

  const restoreSamples = await backdrop.evaluate(async (element) => {
    const nav = element.closest<HTMLElement>('[data-landing-nav]')!;
    const samples: Array<{
      backdropFilter: string;
      opacity: number;
      scrolling: boolean;
      suspended: boolean;
    }> = [];

    while (
      nav.dataset.headerScrolling === 'true' ||
      nav.dataset.headerBackdropSuspended === 'true' ||
      Number(getComputedStyle(element).opacity) < 0.999
    ) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const styles = getComputedStyle(element);
      samples.push({
        backdropFilter: styles.backdropFilter,
        opacity: Number(styles.opacity),
        scrolling: nav.dataset.headerScrolling === 'true',
        suspended: nav.dataset.headerBackdropSuspended === 'true',
      });
      if (samples.length > 40) throw new Error('Header backdrop did not restore');
    }

    return samples;
  });
  await expect(nav).not.toHaveAttribute('data-header-scrolling');
  await expect(nav).not.toHaveAttribute('data-header-backdrop-suspended');
  await expect(scrollEdge).toHaveCSS('opacity', '0');
  expect(
    restoreSamples.some(
      ({ backdropFilter, opacity, scrolling, suspended }) =>
        backdropFilter === 'blur(20px) saturate(1.35) contrast(1.03)' &&
        opacity > 0.05 &&
        opacity < 0.95 &&
        !scrolling &&
        !suspended,
    ),
  ).toBe(true);
  expect(await readBackdropStyle(backdrop)).toMatchObject({
    backdropFilter: 'blur(20px) saturate(1.35) contrast(1.03)',
    opacity: 1,
  });

  const scrollLifecycle = await nav.evaluate(async (element) => {
    const markerValues: Array<string | null> = [];
    let lastScrollAt = 0;
    let suspendedBackdropFilter = '';
    const trackScroll = () => {
      lastScrollAt = performance.now();
    };
    window.addEventListener('scroll', trackScroll, { passive: true });

    return new Promise<{
      idleDelayMs: number;
      markerValues: Array<string | null>;
      suspendedBackdropFilter: string;
    }>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        observer.disconnect();
        window.removeEventListener('scroll', trackScroll);
        reject(new Error('Header scrolling marker did not settle'));
      }, 1_000);
      const observer = new MutationObserver((records) => {
        const marker = element.getAttribute('data-header-scrolling');
        if (records.some((record) => record.attributeName === 'data-header-scrolling')) {
          markerValues.push(marker);
        }
        if (element.dataset.headerBackdropSuspended === 'true') {
          suspendedBackdropFilter = getComputedStyle(
            element.querySelector<HTMLElement>('[data-header-backdrop-layer]')!,
          ).backdropFilter;
        }
        if (marker === 'true') return;
        if (!lastScrollAt) return;

        window.clearTimeout(timeout);
        observer.disconnect();
        window.removeEventListener('scroll', trackScroll);
        resolve({
          idleDelayMs: performance.now() - lastScrollAt,
          markerValues,
          suspendedBackdropFilter,
        });
      });
      observer.observe(element, {
        attributeFilter: ['data-header-backdrop-suspended', 'data-header-scrolling'],
      });

      void (async () => {
        for (const top of [180, 240, 300]) {
          window.scrollTo({ behavior: 'instant', top });
          await new Promise<void>((resolveFrame) => requestAnimationFrame(() => resolveFrame()));
        }
      })();
    });
  });
  expect(scrollLifecycle.markerValues).toEqual(['true', null]);
  expect(scrollLifecycle.suspendedBackdropFilter).toBe('none');
  expect(scrollLifecycle.idleDelayMs).toBeGreaterThanOrEqual(140);
  expect(scrollLifecycle.idleDelayMs).toBeLessThanOrEqual(200);
  await expect(backdrop).toHaveCSS('backdrop-filter', 'blur(20px) saturate(1.35) contrast(1.03)');
  await expect(backdrop).toHaveCSS('opacity', '1');

  await scrollSectionIntoView(page, 'services');
  await expect(nav).not.toHaveAttribute('data-header-scrolling');
  await expect(nav).toHaveAttribute('data-header-glass-tone', 'light');
  await expect(glass).toHaveCSS('background-color', 'rgba(248, 250, 255, 0.26)');
  await expect(glass).toHaveCSS('border-color', 'rgba(255, 255, 255, 0.58)');
  await expect(backdrop).toHaveCSS('backdrop-filter', 'blur(20px) saturate(1.35) contrast(1.03)');

  await page.evaluate(async () => {
    for (const delta of [2, 2, 2, 2, 2, 2]) {
      window.scrollTo({ behavior: 'instant', top: window.scrollY + delta });
      await new Promise<void>((resolve) => window.setTimeout(resolve, 40));
    }
  });
  await expect(nav).toHaveAttribute('data-header-scrolling', 'true');
  await expect(nav).toHaveAttribute('data-header-backdrop-suspended', 'true');
  expect(await readBackdropStyle(backdrop)).toMatchObject({
    backdropFilter: 'none',
    opacity: 0,
    webkitBackdropFilter: '',
  });
  await expect(glass).toHaveCSS('background-color', 'rgba(248, 250, 255, 0.26)');
  await expect(glass).toHaveCSS('border-color', 'rgba(255, 255, 255, 0.58)');
  await expect(nav).not.toHaveAttribute('data-header-scrolling');
  await expect(backdrop).toHaveCSS('backdrop-filter', 'blur(20px) saturate(1.35) contrast(1.03)');
  await expect(backdrop).toHaveCSS('opacity', '1');

  await page.close();
});

test('retargets the Header backdrop crossfade from its current frame', async ({ page }) => {
  await page.goto('/');

  const nav = header(page);
  const backdrop = nav.locator('[data-header-backdrop-layer]');
  await expect(nav).toHaveAttribute('data-header-hydrated', 'true');

  const interruption = await backdrop.evaluate(async (element) => {
    const nav = element.closest<HTMLElement>('[data-landing-nav]')!;
    window.scrollTo({ behavior: 'instant', top: 120 });

    const deadline = performance.now() + 500;
    let before = 0;
    while (performance.now() < deadline) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const opacity = Number(getComputedStyle(element).opacity);
      if (nav.dataset.headerScrolling !== 'true' && opacity > 0.05 && opacity < 0.95) {
        before = opacity;
        break;
      }
    }
    if (!before) throw new Error('Header backdrop did not enter its restore crossfade');

    window.scrollTo({ behavior: 'instant', top: 128 });
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const after = Number(getComputedStyle(element).opacity);

    while (
      nav.dataset.headerScrolling === 'true' ||
      nav.dataset.headerBackdropSuspended === 'true' ||
      Number(getComputedStyle(element).opacity) < 0.999
    ) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (performance.now() > deadline + 600) throw new Error('Retargeted backdrop did not settle');
    }

    const styles = getComputedStyle(element);
    return {
      after,
      before,
      finalFilter: styles.backdropFilter,
      finalOpacity: Number(styles.opacity),
      scrolling: nav.dataset.headerScrolling,
      suspended: nav.dataset.headerBackdropSuspended,
    };
  });

  expect(interruption.before).toBeGreaterThan(0.05);
  expect(interruption.before).toBeLessThan(0.95);
  expect(interruption.after).toBeGreaterThan(0.02);
  expect(Math.abs(interruption.after - interruption.before)).toBeLessThan(0.3);
  expect(interruption.finalFilter).toBe('blur(20px) saturate(1.35) contrast(1.03)');
  expect(interruption.finalOpacity).toBeGreaterThan(0.999);
  expect(interruption.scrolling).toBeUndefined();
  expect(interruption.suspended).toBeUndefined();
});

test('switches dark surface ink from Hero white to light-section navy', async ({ page }) => {
  await page.goto('/');

  const nav = header(page);
  const logo = nav.getByRole('link', { name: 'FUTUR home' });
  const menu = nav.getByRole('navigation', { name: '주요 메뉴' });
  const servicesLink = menu.getByRole('link', { name: '서비스', exact: true });
  const stackLink = menu.getByRole('link', { name: '기술', exact: true });
  const teamLink = menu.getByRole('link', { name: '팀', exact: true });
  const glass = nav.locator('[data-header-glass]');
  const backdrop = nav.locator('[data-header-backdrop-layer]');

  await expect(nav).toHaveAttribute('data-header-glass-tone', 'dark');
  await expect(logo).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(servicesLink).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(logo).toHaveCSS('mix-blend-mode', 'normal');
  await expect(logo).toHaveCSS('text-shadow', 'none');
  await expect(servicesLink).toHaveCSS('text-shadow', 'none');
  await expect(servicesLink).toHaveCSS('opacity', '0.9');
  await expect(glass).toHaveCSS('background-color', 'rgba(248, 250, 255, 0.18)');
  await expect(backdrop).toHaveCSS('backdrop-filter', 'blur(20px) saturate(1.35) contrast(1.03)');
  expect(await glass.evaluate((element) => getComputedStyle(element).transitionProperty)).toBe(
    'border-color',
  );
  expect(await glass.evaluate((element) => getComputedStyle(element).borderColor)).not.toBe(
    'rgba(255, 255, 255, 0.58)',
  );

  await scrollSectionIntoView(page, 'services');
  await expect(nav).toHaveAttribute('data-header-glass-tone', 'light');
  await expect(servicesLink).toHaveAttribute('aria-current', 'location');
  await expect(logo).toHaveCSS('color', 'rgb(7, 24, 63)');
  await expect(servicesLink).toHaveCSS('color', 'rgb(30, 77, 196)');
  await expect(glass).toHaveCSS('background-color', 'rgba(248, 250, 255, 0.26)');
  await expect(backdrop).toHaveCSS('backdrop-filter', 'blur(20px) saturate(1.35) contrast(1.03)');

  await scrollSectionIntoView(page, 'stack');
  await expect(stackLink).toHaveAttribute('aria-current', 'location');
  await expect(logo).toHaveCSS('color', 'rgb(7, 24, 63)');
  await expect(stackLink).toHaveCSS('color', 'rgb(30, 77, 196)');

  await scrollSectionIntoView(page, 'team');
  await expect(teamLink).toHaveAttribute('aria-current', 'location');
  await expect(logo).toHaveCSS('color', 'rgb(7, 24, 63)');
  await expect(teamLink).toHaveCSS('color', 'rgb(30, 77, 196)');

  await scrollSectionIntoView(page, 'operations');
  await expect(nav).toHaveAttribute('data-header-glass-tone', 'dark');
  await expect(logo).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(servicesLink).toHaveCSS('color', 'rgb(255, 255, 255)');
});

test('keeps dark surface ink authority until Services crosses the Header probe', async ({
  page,
}) => {
  await page.goto('/');
  const nav = header(page);
  const services = page.locator('#services');
  const servicesLink = nav
    .getByRole('navigation', { name: '주요 메뉴' })
    .getByRole('link', { name: '서비스', exact: true });
  await expect(nav).toHaveAttribute('data-header-hydrated', 'true');

  await page.evaluate(() => {
    const headerElement = document.querySelector<HTMLElement>('[data-landing-nav]')!;
    const servicesElement = document.querySelector<HTMLElement>('#services')!;
    const servicesDocumentTop = servicesElement.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: servicesDocumentTop - (headerElement.getBoundingClientRect().bottom + 80),
      behavior: 'instant',
    });
  });
  await page.waitForTimeout(260);

  const beforeCrossing = await page.evaluate(() => {
    const headerElement = document.querySelector<HTMLElement>('[data-landing-nav]')!;
    const servicesElement = document.querySelector<HTMLElement>('#services')!;
    return {
      probeY: headerElement.getBoundingClientRect().bottom + 8,
      servicesTop: servicesElement.getBoundingClientRect().top,
    };
  });
  expect(beforeCrossing.servicesTop).toBeGreaterThan(beforeCrossing.probeY);
  expect(beforeCrossing.servicesTop).toBeLessThan(desktopViewport.height * 0.5);
  await expect(nav).toHaveAttribute('data-header-glass-tone', 'dark');
  await expect(servicesLink).not.toHaveAttribute('aria-current');

  await page.evaluate(() => {
    const headerElement = document.querySelector<HTMLElement>('[data-landing-nav]')!;
    const servicesElement = document.querySelector<HTMLElement>('#services')!;
    const probeY = headerElement.getBoundingClientRect().bottom + 8;
    window.scrollBy({
      top: servicesElement.getBoundingClientRect().top - probeY + 1,
      behavior: 'instant',
    });
  });
  await expect
    .poll(() =>
      Promise.all([
        services.evaluate((element) => element.getBoundingClientRect().top),
        nav.evaluate((element) => element.getBoundingClientRect().bottom + 8),
      ]).then(([servicesTop, probeY]) => servicesTop - probeY),
    )
    .toBeLessThanOrEqual(0);
  await expect(nav).toHaveAttribute('data-header-glass-tone', 'light');
  await expect(servicesLink).toHaveAttribute('aria-current', 'location');
});

test('keeps the desktop logo and five navigation links in tab order at full scroll progress', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo({ top: 160, behavior: 'instant' }));
  await expect(header(page)).toHaveAttribute('data-header-layout', 'desktop-fluid');

  const tabOrder = [
    header(page).getByRole('link', { name: 'FUTUR home' }),
    ...menuLabels.map((label) =>
      header(page)
        .getByRole('navigation', { name: '주요 메뉴' })
        .getByRole('link', { name: label, exact: true }),
    ),
  ];

  for (const control of tabOrder) {
    await page.keyboard.press('Tab');
    await expect(control).toBeFocused();
  }
});

test('uses one shared active indicator and glides between desktop sections', async ({ page }) => {
  await page.goto('/');
  await scrollSectionIntoView(page, 'services');

  const nav = header(page).getByRole('navigation', { name: '주요 메뉴' });
  const menuLinks = nav.locator(':scope > div');
  const sharedIndicator = menuLinks.locator('[data-header-active-indicator]');
  const mobileIndicator = menuLinks.locator('[data-header-mobile-active-indicator]');
  const activeLinks = nav.locator('a[aria-current="location"]');
  const servicesLink = nav.locator('a[href="#services"]');
  const stackLink = nav.locator('a[href="#stack"]');

  await expect(servicesLink).toHaveAttribute('aria-current', 'location');
  await expect(sharedIndicator).toHaveCount(1);
  await expect(menuLinks.locator('a [data-header-active-indicator]')).toHaveCount(0);
  await expect(mobileIndicator).toHaveCount(1);
  await page.waitForTimeout(240);
  const servicesBox = await servicesLink.boundingBox();
  expect(servicesBox).not.toBeNull();

  const { frames } = await sampleDesktopIndicatorMotion(page, 'stack');
  await expect(stackLink).toHaveAttribute('aria-current', 'location');
  await expect(activeLinks).toHaveCount(1);
  expect(new Set(frames.map(({ x }) => Math.round(x * 10) / 10)).size).toBeGreaterThanOrEqual(4);
  expect(frames[0]!.x).toBeCloseTo(servicesBox!.x, 0);
  expect(frames[0]!.width).toBeCloseTo(servicesBox!.width, 0);

  const activeFrame = frames.find(({ activeHref }) => activeHref === '#stack');
  const settledIndex = frames.findIndex(
    (frame, index) =>
      frame.activeHref === '#stack' &&
      Math.abs(frame.x - frame.targetX) <= 0.5 &&
      Math.abs(frame.width - frame.targetWidth) <= 0.5 &&
      frames
        .slice(index)
        .every(
          (laterFrame) =>
            laterFrame.activeHref === '#stack' &&
            Math.abs(laterFrame.x - laterFrame.targetX) <= 0.5 &&
            Math.abs(laterFrame.width - laterFrame.targetWidth) <= 0.5 &&
            Math.abs(laterFrame.x - frame.x) <= 0.02 &&
            Math.abs(laterFrame.width - frame.width) <= 0.02,
        ),
  );
  expect(activeFrame).toBeDefined();
  expect(settledIndex).toBeGreaterThanOrEqual(0);
  expect(frames[settledIndex]!.time - activeFrame!.time).toBeLessThanOrEqual(220);
  expect(frames.length - settledIndex).toBeGreaterThanOrEqual(2);

  const finalFrame = frames[frames.length - 1]!;
  const previousFrame = frames[frames.length - 2]!;
  const stackBox = await stackLink.boundingBox();
  expect(stackBox).not.toBeNull();
  expect(finalFrame.x).toBeCloseTo(stackBox!.x, 0);
  expect(finalFrame.width).toBeCloseTo(stackBox!.width, 0);
  expect(Math.abs(finalFrame.x - previousFrame.x)).toBeLessThan(16);
  expect(Math.abs(finalFrame.width - previousFrame.width)).toBeLessThan(16);

  for (const sectionId of ['hero', 'footer']) {
    await scrollSectionIntoView(page, sectionId);
    await expect(activeLinks).toHaveCount(0);
    await expect(sharedIndicator).toHaveCSS('opacity', '0');
  }
});

test('retargets the shared active indicator from its current desktop frame', async ({ page }) => {
  await page.goto('/');
  await scrollSectionIntoView(page, 'services');
  await expect(header(page).locator('a[href="#services"]')).toHaveAttribute(
    'aria-current',
    'location',
  );
  await page.waitForTimeout(240);

  const { frames, retargetSampleIndex } = await sampleDesktopIndicatorMotion(page, 'stack', 'team');
  expect(retargetSampleIndex).not.toBeNull();
  const beforeRetarget = frames[retargetSampleIndex!];
  const afterRetarget = frames[retargetSampleIndex! + 1];
  expect(beforeRetarget).toBeDefined();
  expect(afterRetarget).toBeDefined();
  expect(Math.abs(afterRetarget!.x - beforeRetarget!.x)).toBeLessThan(16);
  expect(Math.abs(afterRetarget!.width - beforeRetarget!.width)).toBeLessThan(16);

  const teamLink = header(page).locator('a[href="#team"]');
  await expect(teamLink).toHaveAttribute('aria-current', 'location');
  const stackLink = header(page).locator('a[href="#stack"]');
  const activeLinks = header(page).locator('a[aria-current="location"]');
  await expect(activeLinks).toHaveCount(1);
  await expect(stackLink).not.toHaveAttribute('aria-current');
  const [stackBox, teamBox] = await Promise.all([stackLink.boundingBox(), teamLink.boundingBox()]);
  const finalFrame = frames[frames.length - 1]!;
  expect(stackBox).not.toBeNull();
  expect(teamBox).not.toBeNull();
  expect(finalFrame.x).toBeCloseTo(teamBox!.x, 0);
  expect(finalFrame.width).toBeCloseTo(teamBox!.width, 0);
  expect(Math.abs(finalFrame.x - stackBox!.x)).toBeGreaterThan(1);
  expect(Math.abs(finalFrame.width - stackBox!.width)).toBeGreaterThan(1);
});

test('settles the shared active indicator immediately for reduced motion and excludes mobile', async ({
  browser,
}) => {
  const reducedPage = await browser.newPage({ reducedMotion: 'reduce', viewport: desktopViewport });
  await reducedPage.goto('/');
  await scrollSectionIntoView(reducedPage, 'services');

  const reducedNav = header(reducedPage).getByRole('navigation', { name: '주요 메뉴' });
  const reducedIndicator = reducedNav.locator('[data-header-active-indicator]');
  const reducedStackLink = reducedNav.locator('a[href="#stack"]');
  await expect(reducedNav.locator('a[href="#services"]')).toHaveAttribute(
    'aria-current',
    'location',
  );
  const nextFrame = await readReducedIndicatorOnNextFrame(reducedPage, 'stack');
  expect(nextFrame.activeHref).toBe('#stack');
  expect(nextFrame.x).toBeCloseTo(nextFrame.targetX, 0);
  expect(nextFrame.width).toBeCloseTo(nextFrame.targetWidth, 0);
  expect(nextFrame.opacity).toBe('0.82');
  await expect(reducedStackLink).toHaveAttribute('aria-current', 'location');
  await expect(reducedIndicator).toHaveCSS('opacity', '0.82');
  await reducedPage.close();

  const mobilePage = await browser.newPage({ viewport: mobileViewport });
  await mobilePage.goto('/');
  await enterCompactLayout(mobilePage);
  await openCompactMenu(mobilePage, '서비스');
  const mobileNav = header(mobilePage).getByRole('navigation', { name: '주요 메뉴' });
  await expect(mobileNav.locator('[data-header-active-indicator]')).toBeHidden();
  await expect(mobileNav.locator('[data-header-mobile-active-indicator]')).toHaveCount(1);
  await expect(mobileNav.locator('[data-header-mobile-active-indicator]')).toBeVisible();
  await mobilePage.close();
});

test('keeps mobile motion lifecycle intact through scroll and resize events', async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await page.goto('/');
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-compact');

  const openingResultPromise = header(page).evaluate(async (element) => {
    const layoutStartedAt = performance.now();
    while (
      element.dataset.headerLayout !== 'mobile-expanded' ||
      element.dataset.headerMotion !== 'true'
    ) {
      if (performance.now() - layoutStartedAt >= 2_000) {
        throw new Error('mobile-expanded motion did not start within 2 seconds');
      }
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }

    const motionStartedAt = performance.now();
    while (performance.now() - motionStartedAt < 100) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }

    element.style.setProperty('--header-fluid-shadow-alpha', '0.123');
    let cleanupDuringMotion = false;
    const startedAt = performance.now();
    do {
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('resize'));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (
        element.dataset.headerMotion === 'true' &&
        element.style.getPropertyValue('--header-fluid-shadow-alpha') === ''
      ) {
        cleanupDuringMotion = true;
      }
    } while (performance.now() - startedAt < 700);

    const rect = element.getBoundingClientRect();
    return {
      dataMotion: element.dataset.headerMotion ?? null,
      cleanupDuringMotion,
      height: Math.round(rect.height * 100) / 100,
      inlineTransform: element.style.transform,
      layout: element.dataset.headerLayout,
      width: Math.round(rect.width * 100) / 100,
    };
  });

  await compactButton(page).click();
  const result = await openingResultPromise;

  expect(result).toMatchObject({
    cleanupDuringMotion: false,
    dataMotion: null,
    height: 158,
    inlineTransform: '',
    layout: 'mobile-expanded',
    width: 370,
  });
});

test('clears an opening mobile timeline across a real desktop breakpoint round trip', async ({
  page,
}) => {
  await page.setViewportSize(mobileViewport);
  await page.goto('/');
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-compact');

  await compactButton(page).click();
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-expanded');
  await expect(header(page)).toHaveAttribute('data-header-motion', 'true');
  await page.waitForTimeout(100);

  await page.setViewportSize(desktopViewport);
  await page.waitForFunction(
    () =>
      document.querySelector<HTMLElement>('[data-landing-nav]')?.dataset.headerLayout ===
      'desktop-fluid',
    undefined,
    { polling: 'raf' },
  );
  await page.setViewportSize(mobileViewport);
  const compactHandle = await page.waitForFunction(
    () => {
      const element = document.querySelector<HTMLElement>('[data-landing-nav]');
      if (!element || element.dataset.headerLayout !== 'mobile-compact') return false;

      const navigation = element.querySelector<HTMLElement>('nav[aria-label="주요 메뉴"]');
      const toggle = element.querySelector<HTMLButtonElement>('[data-header-toggle]');
      const rect = element.getBoundingClientRect();
      return {
        dataMotion: element.dataset.headerMotion ?? null,
        focusedToggle: document.activeElement === toggle,
        headerTransform: element.style.transform,
        height: Math.round(rect.height * 100) / 100,
        itemStyles: Array.from(navigation?.querySelectorAll<HTMLElement>('a') ?? [], (item) => ({
          opacity: item.style.opacity,
          transform: item.style.transform,
        })),
        layout: element.dataset.headerLayout,
        mobileHeight: element.style.getPropertyValue('--header-mobile-height'),
        mobileWidth: element.style.getPropertyValue('--header-mobile-width'),
        navigationHidden: navigation?.getAttribute('aria-hidden'),
        toggleExpanded: toggle?.getAttribute('aria-expanded'),
        toggleHidden: toggle?.getAttribute('aria-hidden'),
        toggleTabIndex: toggle?.getAttribute('tabindex'),
        width: Math.round(rect.width * 100) / 100,
      };
    },
    undefined,
    { polling: 'raf' },
  );
  const result = await compactHandle.jsonValue();

  expect(result).toEqual({
    dataMotion: null,
    focusedToggle: true,
    headerTransform: '',
    height: 56,
    itemStyles: Array.from({ length: 5 }, () => ({ opacity: '', transform: '' })),
    layout: 'mobile-compact',
    mobileHeight: '',
    mobileWidth: '',
    navigationHidden: 'true',
    toggleExpanded: 'false',
    toggleHidden: 'false',
    toggleTabIndex: '0',
    width: 220,
  });
});

test('runs continuous mobile geometry and item motion while opening and closing', async ({
  page,
}) => {
  await page.setViewportSize(mobileViewport);
  await page.goto('/');
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-compact');

  const openingSamplesPromise = sampleMobileMotion(page, 'mobile-expanded');
  await compactButton(page).click();
  const openingSamples = await openingSamplesPromise;
  expectContinuousMobileGeometry(openingSamples);
  expect(Math.min(...openingSamples.flatMap(({ itemOpacity }) => itemOpacity))).toBeLessThan(0.1);
  expect(
    Math.max(...openingSamples.flatMap(({ itemTranslateY }) => itemTranslateY)),
  ).toBeGreaterThan(2);
  const links = header(page).locator('nav[aria-label="주요 메뉴"] a');
  await expect(links).toHaveCount(5);
  const rowSizes = Object.values(
    (
      await links.evaluateAll((elements) =>
        elements.map((element) => Math.round(element.getBoundingClientRect().top)),
      )
    ).reduce<Record<number, number>>((rows, top) => {
      rows[top] = (rows[top] ?? 0) + 1;
      return rows;
    }, {}),
  );
  expect(rowSizes).toEqual([3, 2]);

  const closingSamplesPromise = sampleMobileMotion(page, 'mobile-compact');
  await page.keyboard.press('Escape');
  const closingSamples = await closingSamplesPromise;
  expectContinuousMobileGeometry(closingSamples);
  expect(Math.min(...closingSamples.flatMap(({ itemOpacity }) => itemOpacity))).toBeLessThan(0.1);
  expect(Math.min(...closingSamples.flatMap(({ itemTranslateY }) => itemTranslateY))).toBeLessThan(
    -1,
  );

  await expect(header(page)).not.toHaveAttribute('data-header-motion');
  expect(await header(page).getAttribute('style')).not.toMatch(/transform|width|height|opacity/);
});

test('settles mobile expanded fallback at the capped geometry on wider phones', async ({
  page,
}) => {
  for (const width of [390, 414, 480]) {
    await page.setViewportSize({ width, height: mobileViewport.height });
    await page.goto('/');
    await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-compact');
    await compactButton(page).click();
    await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-expanded');
    await expect(header(page)).not.toHaveAttribute('data-header-motion');

    const box = await header(page).boundingBox();
    expect(box?.width).toBe(370);
    expect(box?.height).toBe(158);
  }
});

test('settles interrupted mobile geometry from the current frame', async ({ page }) => {
  await page.goto('/');
  await enterCompactLayout(page);

  const { indicatorInlineStyle, itemInlineStyles, reversalSampleIndex, samples } =
    await sampleInterruptedMobileMotion(page);

  expect(new Set(samples.map(({ width }) => width)).size).toBeGreaterThanOrEqual(5);
  expect(new Set(samples.map(({ height }) => height)).size).toBeGreaterThanOrEqual(5);
  const beforeReversal = samples[reversalSampleIndex - 1]!;
  const afterReversal = samples[reversalSampleIndex]!;
  expect(Math.abs(afterReversal.width - beforeReversal.width)).toBeLessThan(16);
  expect(Math.abs(afterReversal.height - beforeReversal.height)).toBeLessThan(10);
  expect(longestEqualGeometryRun(samples)).toBeLessThan(80);
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-compact');
  await expect(header(page)).not.toHaveAttribute('data-header-motion');
  expect(await header(page).getAttribute('style')).not.toMatch(/transform|width|height|opacity/);
  expect(itemInlineStyles).toEqual(
    Array.from({ length: 5 }, () => ({ opacity: '', transform: '' })),
  );
  expect(indicatorInlineStyle).toEqual({ opacity: '', transform: '' });
});

test('applies semantic clear crystal glass, spotlight, cursor contrast, and resilient fallbacks', async ({
  browser,
  page,
}) => {
  await page.goto('/');

  const glass = header(page).locator('[data-header-glass]');
  const backdrop = header(page).locator('[data-header-backdrop-layer]');
  const scrollEdge = header(page).locator('[data-header-scroll-edge]');
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

  const glassStyles: Partial<Record<'dark' | 'light', Awaited<ReturnType<typeof readGlassStyle>>>> =
    {};
  const backdropStyles: Partial<
    Record<'dark' | 'light', Awaited<ReturnType<typeof readBackdropStyle>>>
  > = {};
  for (const sectionId of ['services', 'operations', 'footer'] as const) {
    const tone = sectionId === 'operations' ? 'dark' : 'light';
    await scrollSectionIntoView(page, sectionId);
    await expect(header(page)).toHaveAttribute('data-header-glass-tone', tone);
    await expect(glass).toHaveCSS(
      'background-color',
      tone === 'dark' ? 'rgba(248, 250, 255, 0.18)' : 'rgba(248, 250, 255, 0.26)',
    );
    await expect(header(page)).not.toHaveAttribute('data-header-scrolling');
    await expect(backdrop).toHaveCSS('opacity', '1');
    glassStyles[tone] = await readGlassStyle(glass);
    backdropStyles[tone] = await readBackdropStyle(backdrop);
  }

  expect(glassStyles.dark?.backgroundColor).toBe('rgba(248, 250, 255, 0.18)');
  expect(glassStyles.light?.backgroundColor).toBe('rgba(248, 250, 255, 0.26)');
  expect(glassStyles.dark?.backdropFilter).toBe('none');
  expect(glassStyles.light?.backdropFilter).toBe('none');
  expect(backdropStyles.dark?.backdropFilter).toBe('blur(20px) saturate(1.35) contrast(1.03)');
  expect(backdropStyles.light?.backdropFilter).toBe('blur(20px) saturate(1.35) contrast(1.03)');
  expect(backdropStyles.dark?.opacity).toBe(1);
  expect(backdropStyles.light?.opacity).toBe(1);
  expect(glassStyles.dark?.webkitBackdropFilter).toBe('');
  expect(Number(glassStyles.dark?.beforeOpacity)).toBeLessThanOrEqual(0.28);
  expect(glassStyles.dark?.afterBackdropFilter).toBe('none');

  expect(
    await page.evaluate(async () => {
      const nav = document.querySelector<HTMLElement>('[data-landing-nav]');
      const glass = nav?.querySelector<HTMLElement>('[data-header-glass]');
      const backdrop = nav?.querySelector<HTMLElement>('[data-header-backdrop-layer]');
      const scrollEdge = nav?.querySelector<HTMLElement>('[data-header-scroll-edge]');
      if (!nav || !glass || !backdrop || !scrollEdge) return null;

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
      const logo = nav.querySelector<HTMLElement>('a[aria-label="FUTUR home"]');
      const servicesLink = nav.querySelector<HTMLElement>('a[href="#services"]');
      if (!logo || !servicesLink) return null;

      const computedByTone: Record<string, Record<string, string>> = {};
      for (const tone of ['dark', 'light']) {
        nav.dataset.headerGlassTone = tone;
        const originalCurrent = servicesLink.getAttribute('aria-current');
        servicesLink.setAttribute('aria-current', 'location');
        await new Promise<void>((resolve) => window.setTimeout(resolve, 180));
        const activeNavigationColor = getComputedStyle(servicesLink).color;
        if (originalCurrent) servicesLink.setAttribute('aria-current', originalCurrent);
        else servicesLink.removeAttribute('aria-current');
        await new Promise<void>((resolve) => window.setTimeout(resolve, 180));

        const styles = getComputedStyle(glass);
        const backdropStyles = getComputedStyle(backdrop);
        const scrollEdgeStyles = getComputedStyle(scrollEdge);
        computedByTone[tone] = {
          activeNavigationColor,
          backdropFilter: styles.backdropFilter,
          backdropLayerFilter: backdropStyles.backdropFilter,
          backdropLayerOpacity: backdropStyles.opacity,
          backgroundColor: styles.backgroundColor,
          logoColor: getComputedStyle(logo).color,
          navigationColor: getComputedStyle(servicesLink).color,
          scrollEdgeFilter: scrollEdgeStyles.backdropFilter,
          scrollEdgeOpacity: scrollEdgeStyles.opacity,
          webkitBackdropFilter: styles.getPropertyValue('-webkit-backdrop-filter'),
        };
      }

      if (originalTone) nav.dataset.headerGlassTone = originalTone;
      else delete nav.dataset.headerGlassTone;
      forcedFallback.remove();
      return computedByTone;
    }),
  ).toEqual({
    dark: {
      activeNavigationColor: 'rgb(30, 77, 196)',
      backdropFilter: 'none',
      backdropLayerFilter: 'none',
      backdropLayerOpacity: '0',
      backgroundColor: 'rgba(248, 250, 255, 0.92)',
      logoColor: 'rgb(7, 24, 63)',
      navigationColor: 'rgb(7, 24, 63)',
      scrollEdgeFilter: 'none',
      scrollEdgeOpacity: '0',
      webkitBackdropFilter: '',
    },
    light: {
      activeNavigationColor: 'rgb(30, 77, 196)',
      backdropFilter: 'none',
      backdropLayerFilter: 'none',
      backdropLayerOpacity: '0',
      backgroundColor: 'rgba(248, 250, 255, 0.92)',
      logoColor: 'rgb(7, 24, 63)',
      navigationColor: 'rgb(7, 24, 63)',
      scrollEdgeFilter: 'none',
      scrollEdgeOpacity: '0',
      webkitBackdropFilter: '',
    },
  });

  await page.emulateMedia({ contrast: 'more' });
  for (const tone of ['dark', 'light'] as const) {
    await header(page).evaluate((element, nextTone) => {
      element.dataset.headerGlassTone = nextTone;
    }, tone);
    expect(await readGlassStyle(glass)).toMatchObject({
      backdropFilter: 'none',
      backgroundColor: 'rgba(248, 250, 255, 0.92)',
      webkitBackdropFilter: '',
    });
    expect(await readBackdropStyle(backdrop)).toMatchObject({
      backdropFilter: 'none',
      opacity: 0,
      webkitBackdropFilter: '',
    });
    await expect(scrollEdge).toHaveCSS('backdrop-filter', 'none');
    await expect(scrollEdge).toHaveCSS('opacity', '0');
    const fallbackInk = await header(page).evaluate(async (element) => {
      const logo = element.querySelector<HTMLElement>('a[aria-label="FUTUR home"]')!;
      const servicesLink = element.querySelector<HTMLElement>('a[href="#services"]')!;
      await new Promise<void>((resolve) => window.setTimeout(resolve, 180));
      const navigation = getComputedStyle(servicesLink).color;
      const originalCurrent = servicesLink.getAttribute('aria-current');
      servicesLink.setAttribute('aria-current', 'location');
      await new Promise<void>((resolve) => window.setTimeout(resolve, 180));
      const activeNavigation = getComputedStyle(servicesLink).color;
      if (originalCurrent) servicesLink.setAttribute('aria-current', originalCurrent);
      else servicesLink.removeAttribute('aria-current');

      return {
        activeNavigation,
        logo: getComputedStyle(logo).color,
        navigation,
      };
    });
    expect(fallbackInk).toEqual({
      activeNavigation: 'rgb(30, 77, 196)',
      logo: 'rgb(7, 24, 63)',
      navigation: 'rgb(7, 24, 63)',
    });
  }

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
  const reducedNav = header(reducedPage);
  const reducedBackdrop = reducedNav.locator('[data-header-backdrop-layer]');
  const reducedScrollEdge = reducedNav.locator('[data-header-scroll-edge]');
  await expect(reducedNav).toHaveAttribute('data-header-hydrated', 'true');
  await reducedPage.mouse.move(140, 32);
  await reducedPage.waitForTimeout(100);
  await expect(reducedGlass).toHaveCSS('--mx', '50%');
  expect(await reducedGlass.evaluate((element) => element.style.getPropertyValue('--mx'))).toBe('');
  expect(
    await reducedNav.evaluate(async (element) => {
      window.scrollTo({ behavior: 'instant', top: 120 });
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const backdrop = element.querySelector<HTMLElement>('[data-header-backdrop-layer]')!;
      const scrollEdge = element.querySelector<HTMLElement>('[data-header-scroll-edge]')!;
      return {
        backdropFilter: getComputedStyle(backdrop).backdropFilter,
        backdropOpacity: getComputedStyle(backdrop).opacity,
        scrollEdgeFilter: getComputedStyle(scrollEdge).backdropFilter,
        scrollEdgeOpacity: getComputedStyle(scrollEdge).opacity,
        scrolling: element.dataset.headerScrolling,
        suspended: element.dataset.headerBackdropSuspended,
      };
    }),
  ).toEqual({
    backdropFilter: 'none',
    backdropOpacity: '0',
    scrollEdgeFilter: 'none',
    scrollEdgeOpacity: '1',
    scrolling: 'true',
    suspended: 'true',
  });
  await expect(reducedNav).not.toHaveAttribute('data-header-scrolling');
  await expect(reducedNav).not.toHaveAttribute('data-header-backdrop-suspended');
  await expect(reducedBackdrop).toHaveCSS(
    'backdrop-filter',
    'blur(20px) saturate(1.35) contrast(1.03)',
  );
  await expect(reducedBackdrop).toHaveCSS('opacity', '1');
  await expect(reducedScrollEdge).toHaveCSS('opacity', '0');
  await reducedPage.close();
});

test('uses the compact CSS offset for hash targets and avoids scroll-frame layout writes', async ({
  browser,
}) => {
  for (const viewport of [desktopViewport, mobileViewport]) {
    const page = await browser.newPage({ reducedMotion: 'reduce', viewport });
    await page.goto('/');
    await scrollSectionIntoView(page, 'services');
    if (viewport.width <= 900) await openCompactMenu(page, '서비스');

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

test('updates the mobile active section at the compact hash landing line', async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await page.goto('/');
  await scrollSectionIntoView(page, 'services');
  await openCompactMenu(page, '서비스');

  const nav = header(page).locator('nav[aria-label="주요 메뉴"]');
  await nav.getByRole('link', { name: '기술', exact: true }).click();

  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-compact');
  await expect(page).toHaveURL(/#stack$/);
  await expect
    .poll(() => page.locator('#stack').evaluate((element) => element.getBoundingClientRect().top))
    .toBeCloseTo(82, 0);
  await expect(nav.locator('a[href="#stack"]')).toHaveAttribute('aria-current', 'location');
  await expectCompactLabel(compactButton(page), '기술');
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

test('keeps desktop fluid navigation and exposes Compact controls only on mobile', async ({
  page,
}) => {
  await page.goto('/');

  await expect(header(page)).toHaveAttribute('data-header-layout', 'desktop-fluid');

  await enterCompactLayout(page);
  const button = compactButton(page);
  const controlledMenuId = await button.getAttribute('aria-controls');
  expect(controlledMenuId).toBeTruthy();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator(`#${controlledMenuId}`)).toHaveCount(1);

  await button.click();
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-expanded');
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
  await expect(header(page)).toHaveAttribute('data-header-layout', 'desktop-fluid');
  const servicesLink = header(page)
    .getByRole('navigation', { name: '주요 메뉴' })
    .getByRole('link', { name: '서비스', exact: true });
  await servicesLink.focus();
  await expect(servicesLink).toBeFocused();
  await page.setViewportSize(mobileViewport);
  await expectFocusRestoredOnCompactCommit(page, button);
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
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-compact');
  await page.setViewportSize(desktopViewport);
  await expect(header(page)).toHaveAttribute('data-header-layout', 'desktop-fluid');

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
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-compact');
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
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-compact');
  await page.setViewportSize(desktopViewport);
  await expect(header(page)).toHaveAttribute('data-header-layout', 'desktop-fluid');
  await page.evaluate(() => {
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  });
  await restoreAnimationFrames(page);

  await page.setViewportSize(mobileViewport);
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-compact');
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
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-compact');
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

test('reports the unsupported WebKit filter alias independently in high contrast', async ({
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
          webkitBackdropFilter: styles.getPropertyValue('-webkit-backdrop-filter'),
        };
      }),
  ).toEqual({ backdropFilter: 'none', webkitBackdropFilter: '' });
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

    await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-expanded');
    await expectExpandedController(page, '서비스');
    await page.keyboard.press('Escape');
    await expectCompactMenuClosed(page, button, '서비스');
  }
});

test('settles exact mobile geometry and clears transforms after interrupted reverse input', async ({
  page,
}) => {
  await page.goto('/');
  await enterCompactLayout(page);

  const button = compactButton(page);
  await button.click();
  await page.waitForTimeout(800);
  expect(await readHeaderGeometry(page)).toEqual({
    height: 158,
    inlineTransform: '',
    scaleX: 1,
    scaleY: 1,
    width: 370,
  });

  await page.keyboard.press('Escape');
  await expectCompactMenuClosed(page, button, '서비스');
  await button.press('Enter');
  await page.waitForTimeout(90);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  await expectCompactMenuClosed(page, button, '서비스');
  expect(await readHeaderGeometry(page)).toEqual({
    height: 56,
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
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-compact');

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
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-expanded');
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

    while (root.dataset.headerLayout !== 'mobile-expanded') {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }

    const samples: Array<{ inlineTransform: string; scaleX: number }> = [];
    const startedAt = performance.now();
    while (performance.now() - startedAt < 700) {
      const indicator = root.querySelector<HTMLElement>('[data-header-mobile-active-indicator]');
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
  expect(samples[samples.length - 1]).toEqual({ inlineTransform: '', scaleX: 1 });
});

test('tracks section navigation and maps operations to process', async ({ page }) => {
  await page.setViewportSize(mobileViewport);
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
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-expanded');
  await expectExpandedController(page, '서비스');
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), openedAt + 24);
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-compact');
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
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-expanded');
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

  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-compact');
  const button = compactButton(page);
  await expect(button).toBeVisible();
  await expectCompactLabel(button, 'FUTUR.');
  await openCompactMenu(page, 'FUTUR.');

  const nav = page.getByRole('navigation', { name: '주요 메뉴' });
  const links = nav.getByRole('link');
  await expect(links).toHaveCount(5);
  await expect(links).toHaveText(menuLabels);
  await expect(header(page)).not.toHaveAttribute('data-header-motion', 'true');

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
  await expect(header(page)).toHaveAttribute('data-header-layout', 'mobile-expanded');
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

test('keeps five navigation destinations and core content available in no-JavaScript mode', async ({
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
