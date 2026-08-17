import { expect, test, type Page } from '@playwright/test';

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

test('keeps desktop navigation visible through scroll-linked geometry', async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/');
  await waitForHeader(page, 'desktop-fluid');

  const nav = header(page);
  const logo = nav.getByRole('link', { name: 'FUTUR home' });
  const links = navigation(page).getByRole('link');
  const initial = await nav.boundingBox();

  await expect(logo).toBeVisible();
  await expect(links).toHaveCount(4);
  await expect(nav.locator('[data-header-toggle], [data-header-close]')).toHaveCount(0);

  await page.evaluate(() => window.scrollTo(0, 420));
  await expect.poll(() => nav.boundingBox()).not.toBeNull();
  const scrolled = await nav.boundingBox();

  expect(initial).not.toBeNull();
  expect(scrolled).not.toBeNull();
  expect(scrolled!.width).toBeLessThanOrEqual(initial!.width);
  expect(scrolled!.height).toBeLessThanOrEqual(initial!.height);
  await expect(logo).toBeVisible();
  await expect(links).toHaveCount(4);
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

  await page.locator('#technology').evaluate((element) => element.scrollIntoView());
  await expect(header(page)).toHaveAttribute('data-header-mobile-roll-state', 'running');
  await expect(
    navigation(page).locator('[data-header-section-link][data-header-roll-role="outgoing"]'),
  ).toHaveAttribute('href', '#services');
  await expect(
    navigation(page).locator('[data-header-section-link][data-header-roll-role="incoming"]'),
  ).toHaveAttribute('href', '#technology');

  const motionFrame = await page.evaluate(() => {
    const outgoing = document.querySelector<HTMLElement>('[data-header-roll-role="outgoing"] span');
    const incoming = document.querySelector<HTMLElement>('[data-header-roll-role="incoming"] span');
    return {
      outgoingY: outgoing ? new DOMMatrixReadOnly(getComputedStyle(outgoing).transform).m42 : null,
      incomingY: incoming ? new DOMMatrixReadOnly(getComputedStyle(incoming).transform).m42 : null,
    };
  });
  expect(motionFrame.outgoingY).not.toBeNull();
  expect(motionFrame.incomingY).not.toBeNull();

  await waitForMobileRoll(page);
  await expect.poll(() => visibleSectionLabels(page)).toEqual(['기술']);
  await expect(navigation(page).locator('[data-header-roll-role]')).toHaveCount(0);
  await expect(navigation(page).getByRole('link', { name: '기술', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  );
});

test('settles a rapid mobile section roll without leaving an interrupted label behind', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const dateNow = Date.now.bind(Date);
    let firstTick: number | null = null;
    Date.now = () => {
      const currentTick = dateNow();
      firstTick ??= currentTick;
      return firstTick + (currentTick - firstTick) * 0.1;
    };
  });
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
          faq.scrollIntoView();
          resolve();
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

  const interruptionFrame = await page.evaluate(() => {
    const outgoing = document.querySelector<HTMLElement>('[data-header-roll-role="outgoing"] span');
    const incoming = document.querySelector<HTMLElement>('[data-header-roll-role="incoming"] span');
    return {
      outgoingY: outgoing ? new DOMMatrixReadOnly(getComputedStyle(outgoing).transform).m42 : null,
      incomingY: incoming ? new DOMMatrixReadOnly(getComputedStyle(incoming).transform).m42 : null,
    };
  });
  expect(interruptionFrame.incomingY).toBeGreaterThan(0);

  await page.waitForTimeout(1500);
  const exitFrame = await page.evaluate(() => {
    const outgoing = document.querySelector<HTMLElement>('[data-header-roll-role="outgoing"] span');
    return outgoing ? new DOMMatrixReadOnly(getComputedStyle(outgoing).transform).m42 : null;
  });
  expect(exitFrame).toBeLessThan(0);

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

test('keeps a direct mobile hash destination visible before and after hydration', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#technology');
  await waitForHeader(page, 'mobile-persistent');

  await page.evaluate(() => {
    document.documentElement.dataset.headerInitialLayout = 'mobile-persistent';
    const root = document.querySelector<HTMLElement>('[data-landing-nav]')!;
    root.dataset.headerHydrated = 'false';
    root.querySelectorAll('[data-header-section-link][aria-current]').forEach((link) => {
      link.removeAttribute('aria-current');
    });
  });
  const preHydrationDisplay = await page.evaluate(
    () =>
      getComputedStyle(document.querySelector('[data-header-section-link][href="#technology"]')!)
        .display,
  );
  expect(preHydrationDisplay).not.toBe('none');

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.reload();
  await waitForHeader(page, 'mobile-persistent');
  await expect(page).toHaveURL(/#technology$/);
  await page.locator('#technology').evaluate((element) => element.scrollIntoView());
  await expect.poll(() => visibleSectionLabels(page)).toEqual(['기술']);
  await expect(navigation(page).getByRole('link', { name: '기술', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  );
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

test('uses the shared active indicator on desktop and tablet, but not narrow mobile', async ({
  page,
}) => {
  for (const [viewport, indicatorVisible] of [
    [desktopViewport, true],
    [{ width: 720, height: 844 }, true],
    [mobileViewports[0], false],
  ] as const) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await waitForHeader(page, viewport.width > 900 ? 'desktop-fluid' : 'mobile-persistent');

    const nav = header(page);
    await expect(nav.locator('[data-header-active-indicator]')).toHaveCount(1);
    await expect(nav.locator('[data-header-mobile-active-indicator]')).toHaveCount(0);

    await page.locator('#faq').evaluate((element) => element.scrollIntoView());
    if (!indicatorVisible) {
      await expect.poll(() => visibleSectionLabels(page)).toEqual(['FAQ']);
    }
    await expect(navigation(page).getByRole('link', { name: 'FAQ' })).toHaveAttribute(
      'aria-current',
      'location',
    );
    if (!indicatorVisible) {
      await expect(nav.locator('[data-header-active-indicator]')).toBeHidden();
      continue;
    }
    await expect
      .poll(() =>
        nav
          .locator('[data-header-active-indicator]')
          .evaluate((element) => element.getBoundingClientRect().width),
      )
      .toBeGreaterThan(0);
    await expect
      .poll(() =>
        nav
          .locator('[data-header-active-indicator]')
          .evaluate((element) => Number(getComputedStyle(element).opacity)),
      )
      .toBeGreaterThan(0.75);
  }
});

test('switches Header ink with the actual light and dark section surfaces', async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/');
  await waitForHeader(page, 'desktop-fluid');

  const nav = header(page);
  const sections = [
    ['#top', 'dark'],
    ['#services', 'dark'],
    ['#service-product', 'light'],
    ['#technology', 'dark'],
    ['#faq', 'light'],
    ['#footer', 'dark'],
  ] as const;

  for (const [selector, tone] of sections) {
    await page.locator(selector).evaluate((element) => element.scrollIntoView());
    await expect(nav).toHaveAttribute('data-header-glass-tone', tone);
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
