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
  await expect(button).toHaveAccessibleName(
    `주요 메뉴 ${expanded ? '닫기' : '열기'} · 현재 위치 ${label}`,
  );
}

async function scrollSectionIntoView(page: Page, sectionId: string) {
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

async function captureHeaderGeometry(page: Page) {
  return header(page).evaluate((element) => {
    const candidates = [element, ...element.querySelectorAll('[data-header-toggle], nav, nav a')];
    const round = (value: number) => Math.round(value * 1_000) / 1_000;

    return candidates.map((candidate) => {
      const rect = candidate.getBoundingClientRect();
      return {
        height: round(rect.height),
        left: round(rect.left),
        top: round(rect.top),
        transform: getComputedStyle(candidate).transform,
        width: round(rect.width),
      };
    });
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

  button = await openCompactMenu(page, '기술');
  await page.mouse.click(20, desktopViewport.height - 20);
  await expectCompactMenuClosed(page, button, '기술');

  button = await openCompactMenu(page, '기술');
  await page.keyboard.press('Escape');
  await expectCompactMenuClosed(page, button, '기술');

  button = await openCompactMenu(page, '기술');
  const openedAt = await page.evaluate(() => window.scrollY);
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), openedAt + 23);
  await expect(header(page)).toHaveAttribute('data-header-layout', 'menu-expanded');
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expectCompactLabel(button, '기술', true);
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), openedAt + 24);
  await expectCompactMenuClosed(page, button, '기술');
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
  await expect(header(page)).toHaveAttribute('data-header-layout', 'menu-expanded');
  await expectCompactLabel(button, '서비스', true);

  const immediateGeometry = await captureHeaderGeometry(page);
  await page.evaluate(
    () =>
      new Promise<void>((resolveFrame) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolveFrame()));
      }),
  );
  expect(await captureHeaderGeometry(page)).toEqual(immediateGeometry);
  await page.waitForTimeout(120);
  expect(await captureHeaderGeometry(page)).toEqual(immediateGeometry);

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
