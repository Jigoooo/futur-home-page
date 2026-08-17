import { expect, test, type Locator, type Page } from '@playwright/test';

const desktopViewport = { width: 1280, height: 900 };
const mobileViewports = [
  { width: 390, height: 844 },
  { width: 320, height: 720 },
];

function header(page: Page) {
  return page.locator('[data-landing-nav]');
}

function navigation(page: Page) {
  return page.getByRole('navigation', { name: '주요 메뉴' });
}

async function visibleSectionLabels(page: Page) {
  return navigation(page).locator('[data-header-section-link]:visible').allTextContents();
}

async function waitForHeader(page: Page, layout: 'desktop-fluid' | 'mobile-persistent') {
  await expect(header(page)).toHaveAttribute('data-header-hydrated', 'true');
  await expect(header(page)).toHaveAttribute('data-header-layout', layout);
}

async function waitForMobileRoll(page: Page, state: 'idle' | 'running' | 'reduced' = 'idle') {
  await expect(header(page)).toHaveAttribute('data-header-mobile-roll', 'enhanced');
  await expect(header(page)).toHaveAttribute('data-header-mobile-roll-state', state);
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
}

async function scrollSectionIntoView(page: Page, sectionId: string) {
  await expect(header(page)).toHaveAttribute('data-header-hydrated', 'true');
  await page.locator(`#${sectionId}`).evaluate((element) => {
    element.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
}

type DesktopHeaderFrame = { height: number; radius: number; width: number };

async function readDesktopHeaderFrame(page: Page): Promise<DesktopHeaderFrame> {
  return header(page).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const glass = element.querySelector<HTMLElement>('[data-header-glass]')!;
    const round = (value: number) => Math.round(value * 100) / 100;

    return {
      height: round(rect.height),
      radius: round(Number.parseFloat(getComputedStyle(glass).borderRadius)),
      width: round(rect.width),
    };
  });
}

async function settleDesktopHeaderAt(page: Page, scrollY: number, expected: DesktopHeaderFrame) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), scrollY);
  await expect.poll(() => readDesktopHeaderFrame(page)).toEqual(expected);
  return readDesktopHeaderFrame(page);
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
  targetSectionId: 'technology' | 'faq',
  retargetSectionId?: 'faq',
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
        throw new Error('shared indicator fixture is incomplete');
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

async function readReducedIndicatorOnNextFrame(page: Page, targetSectionId: 'technology') {
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

async function readGlassStyle(glass: Locator) {
  return glass.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      backdropFilter: styles.backdropFilter,
      backgroundColor: styles.backgroundColor,
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
      webkitBackdropFilter: styles.getPropertyValue('-webkit-backdrop-filter'),
    };
  });
}

test('keeps desktop navigation visible through exact continuous scroll-linked geometry', async ({
  page,
}) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/');
  await waitForHeader(page, 'desktop-fluid');

  const nav = header(page);
  const logo = nav.getByRole('link', { name: 'FUTUR home' });
  const links = navigation(page).getByRole('link');
  const initialFontSizes = await links.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).fontSize),
  );
  const checkpoints = [
    { expected: { height: 76, radius: 28, width: 1232 }, scrollY: 0 },
    { expected: { height: 74, radius: 27, width: 1207.36 }, scrollY: 40 },
    { expected: { height: 72, radius: 26, width: 1182.72 }, scrollY: 80 },
    { expected: { height: 70, radius: 25, width: 1158.08 }, scrollY: 120 },
    { expected: { height: 68, radius: 24, width: 1133.44 }, scrollY: 160 },
  ] satisfies Array<{ expected: DesktopHeaderFrame; scrollY: number }>;
  const shrinkingSamples: DesktopHeaderFrame[] = [];

  for (const checkpoint of checkpoints) {
    shrinkingSamples.push(
      await settleDesktopHeaderAt(page, checkpoint.scrollY, checkpoint.expected),
    );
    await expect(nav).toHaveAttribute('data-header-layout', 'desktop-fluid');
    await expect(links).toHaveCount(4);
    for (const link of await links.all()) await expect(link).toBeVisible();
    await expect(logo).toBeVisible();
    await expect
      .poll(() =>
        links.evaluateAll((elements) =>
          elements.map((element) => getComputedStyle(element).fontSize),
        ),
      )
      .toEqual(initialFontSizes);
  }

  expect(new Set(shrinkingSamples.map(({ width }) => width)).size).toBe(checkpoints.length);
  for (let index = 1; index < shrinkingSamples.length; index += 1) {
    expect(shrinkingSamples[index]!.width).toBeLessThan(shrinkingSamples[index - 1]!.width);
    expect(shrinkingSamples[index]!.height).toBeLessThan(shrinkingSamples[index - 1]!.height);
    expect(shrinkingSamples[index]!.radius).toBeLessThan(shrinkingSamples[index - 1]!.radius);
  }

  const restoringSamples: DesktopHeaderFrame[] = [];
  for (const checkpoint of checkpoints.slice(0, -1).reverse()) {
    restoringSamples.push(
      await settleDesktopHeaderAt(page, checkpoint.scrollY, checkpoint.expected),
    );
  }
  for (let index = 1; index < restoringSamples.length; index += 1) {
    expect(restoringSamples[index]!.width).toBeGreaterThan(restoringSamples[index - 1]!.width);
    expect(restoringSamples[index]!.height).toBeGreaterThan(restoringSamples[index - 1]!.height);
    expect(restoringSamples[index]!.radius).toBeGreaterThan(restoringSamples[index - 1]!.radius);
  }
});

test('avoids settled desktop geometry writes while preserving resize recalculation', async ({
  page,
}) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/');
  await waitForHeader(page, 'desktop-fluid');
  await settleDesktopHeaderAt(page, 620, { height: 68, radius: 24, width: 1133.44 });

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
    });

    expect(
      await page.evaluate(
        () =>
          (window as typeof window & { __headerGeometryRecorded: string[] })
            .__headerGeometryRecorded,
      ),
    ).toEqual([]);

    await page.setViewportSize({ width: 1180, height: desktopViewport.height });
    await expect
      .poll(async () => (await header(page).boundingBox())?.width)
      .toBeCloseTo(1_132 * 0.92, 0);
    const resizeWrites = await page.evaluate(
      () =>
        (window as typeof window & { __headerGeometryRecorded: string[] }).__headerGeometryRecorded,
    );
    expect(resizeWrites).toHaveLength(9);
    expect(new Set(resizeWrites.map((write) => write.split(':', 1)[0])).size).toBe(9);
  } finally {
    await page.evaluate(() => {
      const state = window as typeof window & {
        __headerGeometryRecorded?: string[];
        __headerGeometryRestore?: () => void;
      };
      state.__headerGeometryRestore?.();
      delete state.__headerGeometryRecorded;
      delete state.__headerGeometryRestore;
    });
  }
});

test('commits exact desktop geometry when reduced motion interrupts a quick tween', async ({
  page,
}) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/');
  const nav = header(page);
  await waitForHeader(page, 'desktop-fluid');
  await expect.poll(async () => (await nav.boundingBox())?.width).toBeCloseTo(1_232, 0);

  const midTweenWidth = await page.evaluate(async () => {
    window.scrollTo({ top: 620, behavior: 'instant' });
    const navElement = document.querySelector<HTMLElement>('[data-landing-nav]')!;
    const startedAt = performance.now();
    let width = navElement.getBoundingClientRect().width;
    while (width >= 1_232 && performance.now() - startedAt < 1_000) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      width = navElement.getBoundingClientRect().width;
    }
    return width;
  });
  expect(midTweenWidth).toBeGreaterThan(1_134);
  expect(midTweenWidth).toBeLessThan(1_232);

  await page.emulateMedia({ reducedMotion: 'reduce' });
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
  await expect.poll(readGeometry).toEqual(committedGeometry);
});

test('writes settled desktop geometry after a retained-scroll reload', async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/');
  await waitForHeader(page, 'desktop-fluid');
  await page.evaluate(() => window.scrollTo({ top: 620, behavior: 'instant' }));
  await expect.poll(async () => (await header(page).boundingBox())?.width).toBeCloseTo(1_133.44, 0);

  await page.reload();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(160);
  await expect.poll(async () => (await header(page).boundingBox())?.width).toBeCloseTo(1_133.44, 0);
});

test('keeps the mobile header geometry stable with active-only navigation', async ({ page }) => {
  for (const viewport of mobileViewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 0));
    await waitForHeader(page, 'mobile-persistent');

    const nav = header(page);
    const initial = await nav.boundingBox();
    await expect(nav.getByRole('link', { name: 'FUTUR home' })).toBeVisible();
    await expect(navigation(page).getByRole('link', { name: '문의', exact: true })).toBeVisible();
    await expect.poll(() => visibleSectionLabels(page)).toEqual([]);
    await expect(nav.locator('[data-header-toggle], [data-header-close]')).toHaveCount(0);

    await page.locator('#services').evaluate((element) => element.scrollIntoView());
    await page.waitForTimeout(80);
    await expect.poll(() => visibleSectionLabels(page)).toEqual(['서비스']);
    const scrolled = await nav.boundingBox();

    expect(initial).not.toBeNull();
    expect(scrolled).not.toBeNull();
    expect(scrolled!.width).toBeCloseTo(initial!.width, 0);
    expect(scrolled!.height).toBeCloseTo(initial!.height, 0);
    expect(scrolled!.x).toBeGreaterThanOrEqual(0);
    expect(scrolled!.x + scrolled!.width).toBeLessThanOrEqual(viewport.width);
    await expectNoHorizontalOverflow(page);
  }
});

test('keeps the full menu comfortably spaced at tablet widths', async ({ page }) => {
  for (const viewport of [
    { width: 900, height: 844 },
    { width: 768, height: 844 },
    { width: 561, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await waitForHeader(page, 'mobile-persistent');

    const links = navigation(page).getByRole('link');
    await expect(links).toHaveCount(4);
    for (const link of await links.all()) await expect(link).toBeVisible();

    await expect(navigation(page)).toHaveCSS('font-size', '14px');
    await expect(header(page).locator('[data-header-section-link]').first()).toHaveCSS(
      'padding-left',
      '8px',
    );
    await expectNoHorizontalOverflow(page);
  }
});

test('keeps mobile navigation active through direct scroll state', async ({ page }) => {
  await page.setViewportSize(mobileViewports[0]);
  await page.goto('/');
  await waitForHeader(page, 'mobile-persistent');

  await page.locator('#technology').evaluate((element) => element.scrollIntoView());

  const technologyLink = navigation(page).getByRole('link', { name: '기술', exact: true });
  await expect.poll(() => visibleSectionLabels(page)).toEqual(['기술']);
  await expect(technologyLink).toHaveAttribute('aria-current', 'location');
  await expect(header(page).locator('[data-header-active-indicator]')).toBeHidden();
});

test('rolls the narrow mobile section label upward through a clipped center lane', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await waitForHeader(page, 'mobile-persistent');
  await waitForMobileRoll(page);

  await page.locator('#services').evaluate((element) => element.scrollIntoView());
  await expect.poll(() => visibleSectionLabels(page)).toEqual(['서비스']);
  await waitForMobileRoll(page);

  const motionFrames = await page.evaluate(async () => {
    const root = document.querySelector<HTMLElement>('[data-landing-nav]')!;
    const target = document.querySelector<HTMLElement>('#technology')!;
    const frames: Array<{
      incomingHref: string | null;
      incomingY: number | null;
      outgoingHref: string | null;
      outgoingY: number | null;
      state: string | undefined;
    }> = [];
    target.scrollIntoView();
    let sawRunning = false;
    const startedAt = performance.now();
    do {
      const outgoing = root.querySelector<HTMLElement>('[data-header-roll-role="outgoing"]');
      const incoming = root.querySelector<HTMLElement>('[data-header-roll-role="incoming"]');
      const outgoingText = outgoing?.querySelector<HTMLElement>('span') ?? null;
      const incomingText = incoming?.querySelector<HTMLElement>('span') ?? null;
      const state = root.dataset.headerMobileRollState;
      sawRunning ||= state === 'running';
      frames.push({
        incomingHref: incoming?.getAttribute('href') ?? null,
        incomingY: incomingText
          ? new DOMMatrixReadOnly(getComputedStyle(incomingText).transform).m42
          : null,
        outgoingHref: outgoing?.getAttribute('href') ?? null,
        outgoingY: outgoingText
          ? new DOMMatrixReadOnly(getComputedStyle(outgoingText).transform).m42
          : null,
        state,
      });
      if (sawRunning && state === 'idle') break;
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    } while (performance.now() - startedAt < 1_000);
    return frames;
  });
  const motionFrame = motionFrames.find(
    ({ incomingHref, incomingY, outgoingHref, outgoingY, state }) =>
      state === 'running' &&
      outgoingHref === '#services' &&
      incomingHref === '#technology' &&
      outgoingY !== null &&
      outgoingY < 0 &&
      incomingY !== null &&
      incomingY > 0,
  );
  expect(motionFrame).toBeDefined();
  expect(motionFrame!.outgoingY).toBeLessThan(0);
  expect(motionFrame!.incomingY).toBeGreaterThan(0);

  await waitForMobileRoll(page);
  await expect.poll(() => visibleSectionLabels(page)).toEqual(['기술']);
  await expect(navigation(page).locator('[data-header-roll-role]')).toHaveCount(0);
  await expect(navigation(page).getByRole('link', { name: '기술', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  );
});

test('scopes mobile label will-change to the active roll lifecycle', async ({ page }) => {
  await page.setViewportSize(mobileViewports[0]);
  await page.goto('/');
  await waitForHeader(page, 'mobile-persistent');
  await scrollSectionIntoView(page, 'services');
  await waitForMobileRoll(page);

  const spans = navigation(page).locator('[data-header-section-link] > span');
  await expect
    .poll(() =>
      spans.evaluateAll((items) => items.map((item) => getComputedStyle(item).willChange)),
    )
    .toEqual(['auto', 'auto', 'auto']);

  const lifecycle = await page.evaluate(async () => {
    const root = document.querySelector<HTMLElement>('[data-landing-nav]')!;
    const target = document.querySelector<HTMLElement>('#technology')!;
    const samples: Array<{
      incoming: string | null;
      outgoing: string | null;
      state: string | undefined;
    }> = [];
    target.scrollIntoView();
    let sawRunning = false;
    const startedAt = performance.now();
    do {
      const outgoing = root.querySelector<HTMLElement>('[data-header-roll-role="outgoing"] span');
      const incoming = root.querySelector<HTMLElement>('[data-header-roll-role="incoming"] span');
      const state = root.dataset.headerMobileRollState;
      sawRunning ||= state === 'running';
      samples.push({
        incoming: incoming ? getComputedStyle(incoming).willChange : null,
        outgoing: outgoing ? getComputedStyle(outgoing).willChange : null,
        state,
      });
      if (sawRunning && state === 'idle') break;
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    } while (performance.now() - startedAt < 1_000);
    return samples;
  });
  expect(
    lifecycle.some(
      ({ incoming, outgoing, state }) =>
        state === 'running' &&
        incoming === 'transform, opacity' &&
        outgoing === 'transform, opacity',
    ),
  ).toBe(true);

  await waitForMobileRoll(page);
  await expect
    .poll(() =>
      spans.evaluateAll((items) => items.map((item) => getComputedStyle(item).willChange)),
    )
    .toEqual(['auto', 'auto', 'auto']);
  await expect(navigation(page).locator('[data-header-roll-role]')).toHaveCount(0);
});

test('settles a rapid mobile section roll without leaving an interrupted label behind', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await waitForHeader(page, 'mobile-persistent');

  await page.locator('#services').evaluate((element) => element.scrollIntoView());
  await expect.poll(() => visibleSectionLabels(page)).toEqual(['서비스']);
  await waitForMobileRoll(page);

  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const menu = document.querySelector('[aria-label="주요 메뉴"]')!;
        const technology = '#technology';
        const faq = document.querySelector<HTMLElement>('#faq')!;
        const observer = new MutationObserver(() => {
          const incoming = menu.querySelector('[data-header-roll-role="incoming"]');
          if (incoming?.getAttribute('href') !== technology) return;
          observer.disconnect();
          requestAnimationFrame(() => {
            faq.scrollIntoView();
            resolve();
          });
        });
        observer.observe(menu, {
          attributes: true,
          attributeFilter: ['data-header-roll-role'],
          subtree: true,
        });
        document.querySelector<HTMLElement>(technology)!.scrollIntoView();
      }),
  );
  await expect(header(page)).toHaveAttribute('data-header-mobile-roll-state', 'running');
  await page.waitForFunction(
    () =>
      document
        .querySelector('[data-header-section-link][data-header-roll-role="incoming"]')
        ?.getAttribute('href') === '#faq',
    null,
    { polling: 'raf' },
  );

  await expect(
    navigation(page).locator('[data-header-section-link][data-header-roll-role="outgoing"]'),
  ).toHaveAttribute('href', '#technology');
  await expect(
    navigation(page).locator('[data-header-section-link][data-header-roll-role="incoming"]'),
  ).toHaveAttribute('href', '#faq');
  await expect(
    navigation(page).locator('[data-header-section-link][href="#services"][data-header-roll-role]'),
  ).toHaveCount(0);

  const interruptionFrame = await page.waitForFunction(
    () => {
      const outgoing = document.querySelector<HTMLElement>(
        '[data-header-section-link][href="#technology"][data-header-roll-role="outgoing"] span',
      );
      const incoming = document.querySelector<HTMLElement>(
        '[data-header-section-link][href="#faq"][data-header-roll-role="incoming"] span',
      );
      if (!outgoing || !incoming) return false;
      const outgoingY = new DOMMatrixReadOnly(getComputedStyle(outgoing).transform).m42;
      const incomingY = new DOMMatrixReadOnly(getComputedStyle(incoming).transform).m42;
      return outgoingY < 0 && incomingY > 0 ? { incomingY, outgoingY } : false;
    },
    null,
    { polling: 'raf' },
  );
  const crossing = (await interruptionFrame.jsonValue()) as {
    incomingY: number;
    outgoingY: number;
  };
  expect(crossing.outgoingY).toBeLessThan(0);
  expect(crossing.incomingY).toBeGreaterThan(0);

  await waitForMobileRoll(page);
  await expect.poll(() => visibleSectionLabels(page)).toEqual(['FAQ']);
  await expect(navigation(page).locator('[data-header-roll-role]')).toHaveCount(0);
  await expect(navigation(page).getByRole('link', { name: 'FAQ', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  );
  await expect
    .poll(() =>
      navigation(page)
        .locator('[data-header-section-link]')
        .evaluateAll((links) =>
          links.map((link) => {
            const text = link.querySelector('span')!;
            return {
              linkOpacity: (link as HTMLElement).style.opacity,
              linkVisibility: (link as HTMLElement).style.visibility,
              textOpacity: (text as HTMLElement).style.opacity,
              textTransform: (text as HTMLElement).style.transform,
            };
          }),
        ),
    )
    .toEqual([
      { linkOpacity: '', linkVisibility: '', textOpacity: '', textTransform: '' },
      { linkOpacity: '', linkVisibility: '', textOpacity: '', textTransform: '' },
      { linkOpacity: '', linkVisibility: '', textOpacity: '', textTransform: '' },
    ]);
});

test('settles rapid mobile section changes on the final accessible anchor', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#services');
  await waitForHeader(page, 'mobile-persistent');
  await waitForMobileRoll(page);

  for (const selector of ['#technology', '#faq', '#services']) {
    await page.locator(selector).evaluate((element) => element.scrollIntoView());
    await page.waitForTimeout(60);
  }

  await waitForMobileRoll(page);
  await expect.poll(() => visibleSectionLabels(page)).toEqual(['서비스']);
  await expect(navigation(page).locator('[data-header-roll-role]')).toHaveCount(0);

  const servicesLink = navigation(page).locator('[data-header-section-link][href="#services"]');
  const technologyLink = navigation(page).locator('[data-header-section-link][href="#technology"]');
  const faqLink = navigation(page).locator('[data-header-section-link][href="#faq"]');
  await expect(servicesLink).toHaveAttribute('aria-current', 'location');
  await expect(servicesLink).toHaveJSProperty('inert', false);
  await expect(servicesLink).not.toHaveAttribute('aria-hidden', 'true');
  for (const inactiveLink of [technologyLink, faqLink]) {
    await expect(inactiveLink).toHaveJSProperty('inert', true);
    await expect(inactiveLink).toHaveAttribute('aria-hidden', 'true');
  }

  await page.locator('#footer').evaluate((element) => element.scrollIntoView());
  await waitForMobileRoll(page);
  await expect.poll(() => visibleSectionLabels(page)).toEqual([]);
});

test('shows only the current section between the mobile logo and inquiry action', async ({
  page,
}) => {
  for (const viewport of [
    { width: 560, height: 844 },
    { width: 390, height: 844 },
    { width: 320, height: 720 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 0));
    await waitForHeader(page, 'mobile-persistent');

    const nav = header(page);
    await expect(nav.getByRole('link', { name: 'FUTUR home' })).toBeVisible();
    await expect(navigation(page).getByRole('link', { name: '문의', exact: true })).toBeVisible();
    await expect.poll(() => visibleSectionLabels(page)).toEqual([]);
    await expect(nav.locator('[data-header-active-indicator]')).toBeHidden();

    for (const [selector, label] of [
      ['#services', '서비스'],
      ['#technology', '기술'],
      ['#faq', 'FAQ'],
    ] as const) {
      await page.locator(selector).evaluate((element) => element.scrollIntoView());
      await expect.poll(() => visibleSectionLabels(page)).toEqual([label]);

      const frame = await page.evaluate(() => {
        const root = document.querySelector<HTMLElement>('[data-landing-nav]')!;
        const active = root.querySelector<HTMLElement>('[data-header-section-link][aria-current]')!;
        const rootRect = root.getBoundingClientRect();
        const activeRect = active.getBoundingClientRect();
        return {
          activeCenter: activeRect.left + activeRect.width / 2,
          headerCenter: rootRect.left + rootRect.width / 2,
          headerHeight: rootRect.height,
          headerWidth: rootRect.width,
        };
      });

      expect(frame.activeCenter).toBeCloseTo(frame.headerCenter, 0);
      expect(frame.headerHeight).toBeCloseTo(60, 0);
      expect(frame.headerWidth).toBeCloseTo(viewport.width - 24, 0);
    }

    await page.locator('#footer').evaluate((element) => element.scrollIntoView());
    await expect.poll(() => visibleSectionLabels(page)).toEqual([]);
    await expectNoHorizontalOverflow(page);
  }
});

test('keeps a direct mobile hash destination accessible before hydration and enhanced after it', async ({
  browser,
}) => {
  const preHydrationPage = await browser.newPage({
    javaScriptEnabled: false,
    viewport: mobileViewports[0],
  });
  await preHydrationPage.goto('/#technology');
  await expect(header(preHydrationPage)).toHaveAttribute('data-header-hydrated', 'false');
  await expect(header(preHydrationPage)).not.toHaveAttribute('data-header-mobile-roll');
  for (const [name, href] of [
    ['서비스', '#services'],
    ['기술', '#technology'],
    ['FAQ', '#faq'],
    ['문의', '#footer'],
  ] as const) {
    const link = navigation(preHydrationPage).getByRole('link', { name, exact: true });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', href);
  }
  await preHydrationPage.close();

  const hydratedPage = await browser.newPage({ viewport: mobileViewports[0] });
  await hydratedPage.goto('/#technology');
  await waitForHeader(hydratedPage, 'mobile-persistent');
  await expect(hydratedPage).toHaveURL(/#technology$/);
  await waitForMobileRoll(hydratedPage);
  await expect.poll(() => visibleSectionLabels(hydratedPage)).toEqual(['기술']);
  await expect(
    navigation(hydratedPage).getByRole('link', { name: '기술', exact: true }),
  ).toHaveAttribute('aria-current', 'location');
  await expect(header(hydratedPage)).toHaveAttribute('data-header-mobile-roll', 'enhanced');
  await hydratedPage.close();
});

test('keeps mobile section destinations reachable through direct scroll state', async ({
  page,
}) => {
  await page.setViewportSize(mobileViewports[0]);
  await page.goto('/');
  await waitForHeader(page, 'mobile-persistent');

  const expectedSections = [
    ['#services', '서비스'],
    ['#technology', '기술'],
    ['#faq', 'FAQ'],
  ] as const;

  for (const [selector, label] of expectedSections) {
    await page.locator(selector).evaluate((element) => element.scrollIntoView());
    const link = navigation(page).getByRole('link', { name: label, exact: true });
    await expect.poll(() => visibleSectionLabels(page)).toEqual([label]);
    await expect(link).toHaveAttribute('aria-current', 'location');
  }
});

test('keeps the mobile header geometry stable across breakpoint round trips', async ({ page }) => {
  await page.setViewportSize(mobileViewports[0]);
  await page.goto('/');
  await waitForHeader(page, 'mobile-persistent');
  const before = await header(page).boundingBox();
  await page.locator('#services').evaluate((element) => element.scrollIntoView());
  await expect.poll(() => visibleSectionLabels(page)).toEqual(['서비스']);
  await waitForMobileRoll(page);

  await page.setViewportSize({ width: 561, height: 844 });
  await expect(header(page)).not.toHaveAttribute('data-header-mobile-roll', 'enhanced');
  for (const link of await navigation(page).locator('[data-header-section-link]').all()) {
    await expect(link).not.toHaveAttribute('inert', '');
    await expect(link).not.toHaveAttribute('aria-hidden', 'true');
    await expect(link).toBeVisible();
  }
  await page.locator('#faq').evaluate((element) => element.scrollIntoView());
  await expect(navigation(page).getByRole('link', { name: 'FAQ', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  );
  const sharedIndicator = header(page).locator('[data-header-active-indicator]');
  await expect(sharedIndicator).toBeVisible();
  await expect
    .poll(() => sharedIndicator.evaluate((element) => element.getBoundingClientRect().width))
    .toBeGreaterThan(0);
  await expect
    .poll(() => sharedIndicator.evaluate((element) => Number(getComputedStyle(element).opacity)))
    .toBeGreaterThan(0.75);

  await page.setViewportSize({ width: 901, height: 844 });
  await waitForHeader(page, 'desktop-fluid');
  await page.setViewportSize(mobileViewports[0]);
  await waitForHeader(page, 'mobile-persistent');
  const after = await header(page).boundingBox();

  expect(before).not.toBeNull();
  expect(after).not.toBeNull();
  expect(after!.width).toBeCloseTo(before!.width, 0);
  expect(after!.height).toBeCloseTo(before!.height, 0);
  await expect(header(page).locator('[data-header-motion-phase]')).toHaveCount(0);
});

test('glides one shared active indicator across desktop and tablet section geometry', async ({
  browser,
}) => {
  for (const viewport of [desktopViewport, { width: 720, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    await page.goto('/');
    await waitForHeader(page, viewport.width > 900 ? 'desktop-fluid' : 'mobile-persistent');
    await scrollSectionIntoView(page, 'services');

    const nav = navigation(page);
    const sharedIndicator = nav.locator('[data-header-active-indicator]');
    const activeLinks = nav.locator('a[aria-current="location"]');
    const servicesLink = nav.locator('a[href="#services"]');
    const technologyLink = nav.locator('a[href="#technology"]');
    await expect(servicesLink).toHaveAttribute('aria-current', 'location');
    await expect(sharedIndicator).toHaveCount(1);
    await expect(nav.locator('a [data-header-active-indicator]')).toHaveCount(0);
    await expect
      .poll(() =>
        sharedIndicator.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity)),
      )
      .toBeCloseTo(0.82, 2);
    await expect
      .poll(async () => {
        const [indicatorBox, linkBox] = await Promise.all([
          sharedIndicator.boundingBox(),
          servicesLink.boundingBox(),
        ]);
        if (!indicatorBox || !linkBox) return Number.POSITIVE_INFINITY;
        return Math.max(
          Math.abs(indicatorBox.x - linkBox.x),
          Math.abs(indicatorBox.width - linkBox.width),
        );
      })
      .toBeLessThanOrEqual(1);
    const servicesBox = await servicesLink.boundingBox();
    expect(servicesBox).not.toBeNull();

    const { frames } = await sampleDesktopIndicatorMotion(page, 'technology');
    await expect(technologyLink).toHaveAttribute('aria-current', 'location');
    await expect(activeLinks).toHaveCount(1);
    expect(new Set(frames.map(({ x }) => Math.round(x * 10) / 10)).size).toBeGreaterThanOrEqual(4);
    expect(Math.abs(frames[0]!.x - servicesBox!.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(frames[0]!.width - servicesBox!.width)).toBeLessThanOrEqual(1);

    const activeFrame = frames.find(({ activeHref }) => activeHref === '#technology');
    const settledIndex = frames.findIndex(
      (frame, index) =>
        frame.activeHref === '#technology' &&
        Math.abs(frame.x - frame.targetX) <= 0.5 &&
        Math.abs(frame.width - frame.targetWidth) <= 0.5 &&
        frames
          .slice(index)
          .every(
            (laterFrame) =>
              laterFrame.activeHref === '#technology' &&
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
    const technologyBox = await technologyLink.boundingBox();
    expect(technologyBox).not.toBeNull();
    expect(Math.abs(finalFrame.x - technologyBox!.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(finalFrame.width - technologyBox!.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(finalFrame.x - previousFrame.x)).toBeLessThan(16);
    expect(Math.abs(finalFrame.width - previousFrame.width)).toBeLessThan(16);

    for (const sectionId of ['hero', 'footer']) {
      await scrollSectionIntoView(page, sectionId);
      await expect(activeLinks).toHaveCount(0);
      await expect(sharedIndicator).toHaveCSS('opacity', '0');
    }
    await page.close();
  }
});

test('retargets the shared active indicator from its current desktop frame', async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/');
  await waitForHeader(page, 'desktop-fluid');
  await scrollSectionIntoView(page, 'services');
  await expect(header(page).locator('a[href="#services"]')).toHaveAttribute(
    'aria-current',
    'location',
  );
  await expect
    .poll(() =>
      header(page)
        .locator('[data-header-active-indicator]')
        .evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity)),
    )
    .toBeCloseTo(0.82, 2);

  const { frames, retargetSampleIndex } = await sampleDesktopIndicatorMotion(
    page,
    'technology',
    'faq',
  );
  expect(retargetSampleIndex).not.toBeNull();
  const beforeRetarget = frames[retargetSampleIndex!];
  const afterRetarget = frames[retargetSampleIndex! + 1];
  expect(beforeRetarget).toBeDefined();
  expect(afterRetarget).toBeDefined();
  expect(Math.abs(afterRetarget!.x - beforeRetarget!.x)).toBeLessThan(16);
  expect(Math.abs(afterRetarget!.width - beforeRetarget!.width)).toBeLessThan(16);

  const faqLink = header(page).locator('a[href="#faq"]');
  const technologyLink = header(page).locator('a[href="#technology"]');
  await expect(faqLink).toHaveAttribute('aria-current', 'location');
  await expect(header(page).locator('a[aria-current="location"]')).toHaveCount(1);
  await expect(technologyLink).not.toHaveAttribute('aria-current');
  const [technologyBox, faqBox] = await Promise.all([
    technologyLink.boundingBox(),
    faqLink.boundingBox(),
  ]);
  const finalFrame = frames[frames.length - 1]!;
  expect(technologyBox).not.toBeNull();
  expect(faqBox).not.toBeNull();
  expect(finalFrame.x).toBeCloseTo(faqBox!.x, 0);
  expect(finalFrame.width).toBeCloseTo(faqBox!.width, 0);
  expect(Math.abs(finalFrame.x - technologyBox!.x)).toBeGreaterThan(1);
});

test('settles the shared indicator immediately for reduced motion and hides it at 560px', async ({
  browser,
}) => {
  const reducedPage = await browser.newPage({
    reducedMotion: 'reduce',
    viewport: { width: 720, height: 844 },
  });
  await reducedPage.goto('/');
  await waitForHeader(reducedPage, 'mobile-persistent');
  await scrollSectionIntoView(reducedPage, 'services');
  const nextFrame = await readReducedIndicatorOnNextFrame(reducedPage, 'technology');
  expect(nextFrame.activeHref).toBe('#technology');
  expect(nextFrame.x).toBeCloseTo(nextFrame.targetX, 0);
  expect(nextFrame.width).toBeCloseTo(nextFrame.targetWidth, 0);
  expect(nextFrame.opacity).toBe('0.82');
  await reducedPage.close();

  const narrowPage = await browser.newPage({ viewport: { width: 560, height: 844 } });
  await narrowPage.goto('/');
  await waitForHeader(narrowPage, 'mobile-persistent');
  await scrollSectionIntoView(narrowPage, 'technology');
  await waitForMobileRoll(narrowPage);
  await expect(navigation(narrowPage).locator('[data-header-active-indicator]')).toBeHidden();
  await expect.poll(() => visibleSectionLabels(narrowPage)).toEqual(['기술']);
  await narrowPage.close();
});

test('keeps Header blur visually continuous while scrolling', async ({ browser }) => {
  for (const viewport of [desktopViewport, mobileViewports[0]]) {
    const page = await browser.newPage({ viewport });
    await page.goto('/');
    await waitForHeader(page, viewport.width > 900 ? 'desktop-fluid' : 'mobile-persistent');
    const nav = header(page);
    const backdrop = nav.locator('[data-header-backdrop-layer]');

    const samples = await backdrop.evaluate(async (element) => {
      const root = element.closest<HTMLElement>('[data-landing-nav]')!;
      const values: Array<{
        filter: string;
        opacity: string;
        scrolling: string | undefined;
        suspended: string | undefined;
      }> = [];
      for (const top of [0, 80, 160, 320]) {
        window.scrollTo({ behavior: 'instant', top });
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        const styles = getComputedStyle(element);
        values.push({
          filter: styles.backdropFilter,
          opacity: styles.opacity,
          scrolling: root.dataset.headerScrolling,
          suspended: root.dataset.headerBackdropSuspended,
        });
      }
      return values;
    });

    expect(samples).toEqual(
      Array.from({ length: 4 }, () => ({
        filter: 'blur(12px) saturate(1.35) contrast(1.03)',
        opacity: '1',
        scrolling: undefined,
        suspended: undefined,
      })),
    );
    await page.close();
  }
});

test('switches computed Header ink and glass with the actual section surface', async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/');
  await waitForHeader(page, 'desktop-fluid');

  const nav = header(page);
  const logo = nav.getByRole('link', { name: 'FUTUR home' });
  const glass = nav.locator('[data-header-glass]');
  const backdrop = nav.locator('[data-header-backdrop-layer]');
  const sections = [
    ['hero', 'dark', 'rgb(255, 255, 255)', 'rgba(248, 250, 255, 0.18)'],
    ['services', 'light', 'rgb(7, 24, 63)', 'rgba(248, 250, 255, 0.26)'],
    ['technology', 'dark', 'rgb(255, 255, 255)', 'rgba(248, 250, 255, 0.18)'],
    ['faq', 'light', 'rgb(7, 24, 63)', 'rgba(248, 250, 255, 0.26)'],
    ['footer', 'dark', 'rgb(255, 255, 255)', 'rgba(248, 250, 255, 0.18)'],
  ] as const;

  for (const [sectionId, tone, ink, background] of sections) {
    await scrollSectionIntoView(page, sectionId);
    await expect(nav).toHaveAttribute('data-header-glass-tone', tone);
    await expect(logo).toHaveCSS('color', ink);
    await expect(glass).toHaveCSS('background-color', background);
    await expect(backdrop).toHaveCSS('backdrop-filter', 'blur(12px) saturate(1.35) contrast(1.03)');
    if (['services', 'technology', 'faq'].includes(sectionId)) {
      const activeLink = navigation(page).locator(`a[href="#${sectionId}"]`);
      await expect(activeLink).toHaveAttribute('aria-current', 'location');
      await expect(activeLink).toHaveCSS(
        'color',
        tone === 'light' ? 'rgb(30, 77, 196)' : 'rgb(255, 255, 255)',
      );
    }
  }
});

test('switches Header ink when the incoming surface crosses the island midpoint', async ({
  page,
}) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/');
  const nav = header(page);
  await waitForHeader(page, 'desktop-fluid');

  const placeServicesTopAt = async (offsetFromHeaderMidpoint: number) => {
    await page.evaluate((offset) => {
      const headerElement = document.querySelector<HTMLElement>('[data-landing-nav]')!;
      const servicesElement = document.querySelector<HTMLElement>('#services')!;
      const servicesDocumentTop = servicesElement.getBoundingClientRect().top + window.scrollY;
      const headerRect = headerElement.getBoundingClientRect();
      const headerMidpoint = headerRect.top + headerRect.height / 2;
      window.scrollTo({
        top: servicesDocumentTop - headerMidpoint - offset,
        behavior: 'instant',
      });
    }, offsetFromHeaderMidpoint);
  };

  await placeServicesTopAt(2);
  await expect(nav).toHaveAttribute('data-header-glass-tone', 'dark');
  await placeServicesTopAt(-2);
  await expect(nav).toHaveAttribute('data-header-glass-tone', 'light');
  await placeServicesTopAt(-2);
  await expect(nav).toHaveAttribute('data-header-glass-tone', 'light');
  await placeServicesTopAt(2);
  await expect(nav).toHaveAttribute('data-header-glass-tone', 'dark');

  expect(
    await nav.evaluate((element) => {
      const glass = element.querySelector<HTMLElement>('[data-header-glass]')!;
      const logo = element.querySelector<HTMLElement>('a[aria-label="FUTUR home"]')!;
      return {
        glass: getComputedStyle(glass).transitionDuration,
        logo: getComputedStyle(logo).transitionDuration,
      };
    }),
  ).toEqual({ glass: '0.24s, 0.24s', logo: '0.24s' });
});

test('applies computed glass fallback and high-contrast ink for both surface tones', async ({
  page,
}) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/');
  await waitForHeader(page, 'desktop-fluid');
  const nav = header(page);
  const glass = nav.locator('[data-header-glass]');
  const backdrop = nav.locator('[data-header-backdrop-layer]');

  const fallbackByTone = await nav.evaluate(async (element) => {
    const glassElement = element.querySelector<HTMLElement>('[data-header-glass]')!;
    const backdropElement = element.querySelector<HTMLElement>('[data-header-backdrop-layer]')!;
    const logo = element.querySelector<HTMLElement>('a[aria-label="FUTUR home"]')!;
    const servicesLink = element.querySelector<HTMLElement>('a[href="#services"]')!;
    const fallback = Array.from(document.styleSheets)
      .flatMap((sheet) => Array.from(sheet.cssRules))
      .find(
        (rule): rule is CSSSupportsRule =>
          rule instanceof CSSSupportsRule &&
          rule.conditionText.includes('backdrop-filter') &&
          rule.conditionText.includes('not'),
      );
    if (!fallback) throw new Error('Header backdrop fallback rule is missing');

    const forcedFallback = document.createElement('style');
    forcedFallback.textContent = Array.from(fallback.cssRules, (rule) => rule.cssText).join('\n');
    document.head.append(forcedFallback);
    const computedByTone: Record<string, Record<string, string>> = {};
    for (const tone of ['dark', 'light']) {
      element.dataset.headerGlassTone = tone;
      servicesLink.setAttribute('aria-current', 'location');
      const startedAt = performance.now();
      while (
        (getComputedStyle(logo).color !== 'rgb(7, 24, 63)' ||
          getComputedStyle(servicesLink).color !== 'rgb(30, 77, 196)') &&
        performance.now() - startedAt < 1_000
      ) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
      computedByTone[tone] = {
        activeNavigationColor: getComputedStyle(servicesLink).color,
        backdropFilter: getComputedStyle(backdropElement).backdropFilter,
        backdropOpacity: getComputedStyle(backdropElement).opacity,
        backgroundColor: getComputedStyle(glassElement).backgroundColor,
        logoColor: getComputedStyle(logo).color,
      };
    }
    forcedFallback.remove();
    servicesLink.removeAttribute('aria-current');
    return computedByTone;
  });

  expect(fallbackByTone).toEqual({
    dark: {
      activeNavigationColor: 'rgb(30, 77, 196)',
      backdropFilter: 'none',
      backdropOpacity: '0',
      backgroundColor: 'rgba(248, 250, 255, 0.92)',
      logoColor: 'rgb(7, 24, 63)',
    },
    light: {
      activeNavigationColor: 'rgb(30, 77, 196)',
      backdropFilter: 'none',
      backdropOpacity: '0',
      backgroundColor: 'rgba(248, 250, 255, 0.92)',
      logoColor: 'rgb(7, 24, 63)',
    },
  });

  await page.emulateMedia({ contrast: 'more' });
  for (const tone of ['dark', 'light'] as const) {
    await nav.evaluate((element, nextTone) => {
      element.dataset.headerGlassTone = nextTone;
    }, tone);
    expect(await readGlassStyle(glass)).toEqual({
      backdropFilter: 'none',
      backgroundColor: 'rgba(248, 250, 255, 0.92)',
      webkitBackdropFilter: '',
    });
    expect(await readBackdropStyle(backdrop)).toEqual({
      backdropFilter: 'none',
      opacity: 0,
      transitionDuration: '0s',
      webkitBackdropFilter: '',
    });
    await expect(nav.getByRole('link', { name: 'FUTUR home' })).toHaveCSS(
      'color',
      'rgb(7, 24, 63)',
    );
  }
});

test('keeps the desktop logo and navigation links in tab order at full scroll progress', async ({
  page,
}) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/');
  await waitForHeader(page, 'desktop-fluid');
  await page.evaluate(() => window.scrollTo({ top: 160, behavior: 'instant' }));
  await settleDesktopHeaderAt(page, 160, { height: 68, radius: 24, width: 1133.44 });

  const tabOrder = [
    header(page).getByRole('link', { name: 'FUTUR home' }),
    ...['서비스', '기술', 'FAQ', '문의'].map((label) =>
      navigation(page).getByRole('link', { name: label, exact: true }),
    ),
  ];
  for (const control of tabOrder) {
    await page.keyboard.press('Tab');
    await expect(control).toBeFocused();
  }
});

test('lands hash navigation below the fixed Header on desktop and mobile', async ({ page }) => {
  for (const [viewport, expectedOffset] of [
    [desktopViewport, 92],
    [mobileViewports[0], 82],
  ] as const) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await waitForHeader(page, viewport.width > 900 ? 'desktop-fluid' : 'mobile-persistent');

    if (viewport.width <= 560) {
      await page.goto('/#technology');
      await waitForHeader(page, 'mobile-persistent');
      await page.locator('#technology').evaluate((element) => element.scrollIntoView());
      await page.evaluate(() => window.scrollBy(0, -82));
    } else {
      await navigation(page).getByRole('link', { name: '기술' }).click();
    }
    await expect(page).toHaveURL(/#technology$/);
    await expect
      .poll(() =>
        page.locator('#technology').evaluate((element) => element.getBoundingClientRect().top),
      )
      .toBeCloseTo(expectedOffset, 0);
    await expect(header(page)).toHaveCSS('--landing-compact-header-offset', `${expectedOffset}px`);
  }
});

test('keeps the mobile Header static with reduced motion', async ({ browser }) => {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: mobileViewports[0],
  });
  const page = await context.newPage();
  await page.goto('/');
  await waitForHeader(page, 'mobile-persistent');

  const nav = header(page);
  const before = await nav.boundingBox();
  await page.evaluate(() => window.scrollTo(0, 700));
  const after = await nav.boundingBox();

  expect(after).toEqual(before);
  await expect(nav.locator('[data-header-toggle], [data-header-close]')).toHaveCount(0);
  await expect.poll(() => visibleSectionLabels(page)).toEqual([]);
  await page.locator('#technology').evaluate((element) => element.scrollIntoView());
  await waitForMobileRoll(page, 'reduced');
  await expect.poll(() => visibleSectionLabels(page)).toEqual(['기술']);
  const sectionMotion = await navigation(page)
    .locator('[data-header-section-link] > span')
    .evaluateAll((spans) =>
      spans.map((span) => {
        const style = getComputedStyle(span);
        return {
          animationDuration: style.animationDuration,
          transform: style.transform,
          transitionDuration: style.transitionDuration,
        };
      }),
    );
  expect(sectionMotion).toEqual([
    { animationDuration: '0s', transform: 'none', transitionDuration: '0s' },
    { animationDuration: '0s', transform: 'none', transitionDuration: '0s' },
    { animationDuration: '0s', transform: 'none', transitionDuration: '0s' },
  ]);
  await context.close();
});

test('keeps navigation and core content available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: mobileViewports[0],
  });
  const page = await context.newPage();
  await page.goto('/');

  await expect(header(page).getByRole('link', { name: 'FUTUR home' })).toBeVisible();
  await expect(header(page)).not.toHaveAttribute('data-header-mobile-roll');
  await expect(navigation(page).getByRole('link')).toHaveCount(4);
  for (const name of ['서비스', '기술', 'FAQ', '문의']) {
    await expect(navigation(page).getByRole('link', { name, exact: true })).toBeVisible();
  }
  await expect(header(page).locator('[data-header-toggle], [data-header-close]')).toHaveCount(0);
  await expect(page.locator('#services')).toContainText('새로운 서비스부터');
  await expect(page.locator('#technology')).toContainText('기술은 목적과 환경에 맞게 선택합니다.');
  await expect(page.locator('#faq')).toContainText('자주 묻는 질문');
  await expect(page.locator('#footer')).toContainText('문의하기');
  await expectNoHorizontalOverflow(page);
  await context.close();
});
