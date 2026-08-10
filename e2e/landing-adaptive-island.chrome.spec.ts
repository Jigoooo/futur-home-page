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

async function expectCompactLabel(button: Locator, label: string, expanded: boolean) {
  await expect(button.getByText(label, { exact: true })).toBeVisible();
  const accessibleLabel = `주요 메뉴 ${expanded ? '닫기' : '열기'} · 현재 위치 ${label}`;

  if (expanded) {
    await expect(button).toHaveAttribute('aria-label', accessibleLabel);
    await expect(button).toHaveAttribute('aria-hidden', 'true');
    await expect(button).toHaveAttribute('tabindex', '-1');
    return;
  }

  await expect(button).toHaveAccessibleName(accessibleLabel);
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
  await expectCompactLabel(button, label, false);
}

async function openCompactMenu(page: Page, label: string) {
  const button = compactButton(page);
  await button.click();
  await expect(header(page)).toHaveAttribute('data-header-layout', 'menu-expanded');
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expectCompactLabel(button, label, true);
  return button;
}

async function expectCompactMenuClosed(page: Page, button: Locator, label: string) {
  await expect(header(page)).toHaveAttribute('data-header-layout', 'compact');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expectCompactLabel(button, label, false);
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
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expectCompactLabel(button, '서비스', true);
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
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expectCompactLabel(button, '서비스', true);
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
      await expectCompactLabel(button, label, false);

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
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expectCompactLabel(button, '서비스', true);
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
  await expectCompactLabel(button, 'FUTUR.', false);
  await openCompactMenu(page, 'FUTUR.');
  await expect(button).toHaveAttribute('aria-expanded', 'true');

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
  await expectCompactLabel(button, '서비스', true);

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
