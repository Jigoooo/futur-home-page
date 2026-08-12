import { expect, test, type Page } from '@playwright/test';

async function waitForLandingHydration(page: Page) {
  await page.waitForFunction(() => {
    const landing = document.querySelector('[data-landing-page]');
    return landing && Object.keys(landing).some((key) => key.startsWith('__reactProps$'));
  });
}

test('renders the approved full-screen particle hero with restrained typography', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');

  const hero = page.locator('[data-landing-hero]');
  const particle = page.locator('[data-hero-particle-layer]');
  const title = page.getByRole('heading', { level: 1, name: 'BUILT FOR WHAT’S NEXT.' });

  expect((await hero.boundingBox())?.height).toBeGreaterThanOrEqual(720);
  expect((await particle.boundingBox())?.width).toBeGreaterThanOrEqual(1279);
  await expect(title).toBeVisible();
  await expect(page.locator('[data-hero-headline-row]')).toHaveText(['BUILT FOR', 'WHAT’S NEXT.']);
  expect(
    Number.parseFloat(await title.evaluate((node) => getComputedStyle(node).fontSize)),
  ).toBeLessThanOrEqual(80);
  expect(await title.evaluate((node) => getComputedStyle(node).fontFamily)).not.toContain(
    'League Gothic',
  );
  expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toContain(
    'Wanted Sans Variable',
  );
  await expect(hero.getByRole('link')).toHaveCount(0);
});

test('renders the factual classic order without cinematic-only scenes', async ({ page }) => {
  await page.goto('/');

  expect(
    await page
      .locator('main > section[data-landing-section]')
      .evaluateAll((sections) => sections.map((section) => section.id)),
  ).toEqual(['hero', 'services', 'stack', 'team', 'process', 'operations', 'faq']);

  await expect(page.locator('#services').getByText('웹·앱 개발', { exact: true })).toBeVisible();
  await expect(page.locator('#services').getByText('AI 통합·AX', { exact: true })).toBeVisible();
  await expect(page.locator('#services article')).toHaveCount(5);
  const servicePhases = page.locator('#services [data-service-phase]');
  await expect(servicePhases).toHaveCount(3);
  expect(
    await servicePhases.evaluateAll((phases) =>
      phases.map((phase) => phase.getAttribute('data-service-phase')),
    ),
  ).toEqual(['build', 'connect', 'operate']);
  await expect(servicePhases.locator('[data-service-phase-label]')).toHaveText([
    'BUILD',
    'CONNECT',
    'OPERATE',
  ]);
  expect(await servicePhases.locator('article').allTextContents()).toHaveLength(5);
  expect(
    await servicePhases.evaluateAll((phases) =>
      phases.map((phase) => phase.querySelectorAll('article').length),
    ),
  ).toEqual([2, 2, 1]);
  await expect(page.locator("#services [data-landing-spotlight='card']")).toHaveCount(0);
  await expect(
    page.locator('#team').getByText('프로젝트 매니지먼트', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('#process').getByText('배포 및 운영', { exact: true })).toBeVisible();
  await expect(
    page.locator('#operations').getByText('변경 이력 공유', { exact: true }),
  ).toBeVisible();
});

test('highlights one capability phase without turning service content into controls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');

  const services = page.locator('#services');
  const buildPhase = services.locator('[data-service-phase="build"]');
  const backgroundBeforeHover = await buildPhase.evaluate(
    (phase) => getComputedStyle(phase).backgroundColor,
  );

  await buildPhase.hover();

  await expect
    .poll(() => buildPhase.evaluate((phase) => getComputedStyle(phase).backgroundColor))
    .not.toBe(backgroundBeforeHover);
  await expect(services.locator('a, button, [tabindex]')).toHaveCount(0);
});

test('renders A as a flat capability ledger with restrained motion', async ({ page }) => {
  await page.goto('/');
  const map = page.locator('[data-capability-map]');
  expect(await map.count()).toBe(1);
  const styles = await map.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      backgroundImage: computed.backgroundImage,
      borderRadius: Number.parseFloat(computed.borderRadius),
      boxShadow: computed.boxShadow,
    };
  });

  expect(styles.backgroundImage).toBe('none');
  expect(styles.borderRadius).toBeLessThanOrEqual(16);
  expect(styles.boxShadow).toBe('none');
  await expect(map.locator('[data-capability-phase]')).toHaveCount(3);
  expect(
    await map
      .locator('[data-capability-phase]')
      .evaluateAll((phases) =>
        phases.slice(0, -1).map((phase) => getComputedStyle(phase).borderBottomWidth),
      ),
  ).toEqual(['0px', '0px']);
});

test('keeps A service copy readable when the capability map narrows', async ({ page }) => {
  await page.setViewportSize({ width: 1181, height: 900 });
  await page.goto('/');

  const firstPhase = page.locator('[data-capability-phase]').first();
  const paragraphWidths = await firstPhase
    .locator('article p')
    .evaluateAll((paragraphs) =>
      paragraphs.map((paragraph) => Math.round(paragraph.getBoundingClientRect().width)),
    );

  expect(Math.min(...paragraphWidths)).toBeGreaterThanOrEqual(180);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(
    false,
  );
});

test('fixes Services to the approved A ledger and copy for every preview query', async ({
  page,
}) => {
  for (const path of ['/', '/?services=b', '/?services=c']) {
    await page.goto(path);

    const services = page.locator('#services');
    await expect(
      services.getByRole('heading', {
        level: 2,
        name: '기술보다 먼저, 쓰임을 생각합니다.',
      }),
    ).toBeVisible();
    await expect(
      services.getByText(
        '사용자와 운영자가 실제로 마주하는 흐름을 살피고, 필요한 기능과 시스템을 그에 맞게 설계합니다.',
        { exact: true },
      ),
    ).toBeVisible();
    await expect(services.locator('[data-capability-map]')).toHaveCount(1);
    await expect(services.locator('[data-services-bento], [data-services-variant]')).toHaveCount(0);
  }
});

test('renders Team as equal white editorial role cards without decorative chrome', async ({
  page,
}) => {
  await page.goto('/');

  const team = page.locator('#team');
  const cards = team.locator('[data-team-role-card]');
  await expect(cards).toHaveCount(5);
  await expect(cards.locator('[data-team-role-scope]')).toHaveCount(15);
  await expect(team.locator('a, button, [tabindex]')).toHaveCount(0);

  const surfaces = await cards.evaluateAll((items) =>
    items.map((item) => {
      const styles = getComputedStyle(item);
      return {
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage,
        borderWidth: styles.borderTopWidth,
        boxShadow: styles.boxShadow,
        borderRadius: Number.parseFloat(styles.borderRadius),
        accentContent: getComputedStyle(item, '::before').content,
      };
    }),
  );

  expect(surfaces).toEqual(
    Array.from({ length: 5 }, () => ({
      backgroundColor: 'rgb(255, 255, 255)',
      backgroundImage: 'none',
      borderWidth: '0px',
      boxShadow: 'none',
      borderRadius: 14,
      accentContent: 'none',
    })),
  );

  const firstCard = cards.first();
  await firstCard.scrollIntoViewIfNeeded();
  await expect(team.locator('[data-team-role-grid]')).toHaveAttribute(
    'data-landing-visible',
    'true',
  );
  await page.waitForTimeout(550);
  const beforeHover = await firstCard.evaluate((item) => getComputedStyle(item).transform);
  await firstCard.hover();
  expect(await firstCard.evaluate((item) => getComputedStyle(item).transform)).toBe(beforeHover);
});

test('reveals Team role cards in reading order', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-landing-ready', 'true');

  const grid = page.locator('#team [data-team-role-grid]');
  const cards = grid.locator('[data-team-role-card]');
  await expect(cards).toHaveCount(5);
  await expect(grid).not.toHaveAttribute('data-landing-visible', 'true');
  expect(await cards.first().evaluate((item) => getComputedStyle(item).opacity)).toBe('0');
  expect(await cards.last().evaluate((item) => getComputedStyle(item).transitionDelay)).toContain(
    '0.24s',
  );

  await grid.scrollIntoViewIfNeeded();
  await expect(grid).toHaveAttribute('data-landing-visible', 'true');
  await expect
    .poll(() => cards.last().evaluate((item) => getComputedStyle(item).opacity))
    .toBe('1');
});

test('shows Team role cards immediately when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const cards = page.locator('#team [data-team-role-card]');
  await expect(cards).toHaveCount(5);
  expect(
    await cards.evaluateAll((items) =>
      items.every((item) => {
        const styles = getComputedStyle(item);
        return (
          styles.opacity === '1' &&
          styles.transform === 'none' &&
          Number.parseFloat(styles.transitionDuration) === 0
        );
      }),
    ),
  ).toBe(true);
});

test('preserves classic reveal targets and tablet navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 720 });
  await page.goto('/');

  await expect(page.locator('[data-landing-reveal]')).not.toHaveCount(0);
  await page.locator('#team').scrollIntoViewIfNeeded();
  await expect(page.locator('#team [data-landing-visible="true"]')).not.toHaveCount(0);
  await expect(page.getByRole('navigation', { name: '주요 메뉴' })).toBeVisible();
});

test('keeps Hero copy inside deliberate responsive gutters without narrowing particles', async ({
  page,
}) => {
  const title = page.getByRole('heading', { level: 1, name: 'BUILT FOR WHAT’S NEXT.' });
  const particleLayer = page.locator('[data-hero-particle-layer]');

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  expect((await title.boundingBox())?.x).toBeGreaterThanOrEqual(32);

  await page.setViewportSize({ width: 390, height: 844 });
  expect((await title.boundingBox())?.x).toBeGreaterThanOrEqual(20);

  const particleBox = await particleLayer.boundingBox();
  expect(particleBox).not.toBeNull();
  expect(particleBox?.x).toBe(0);
  expect(particleBox?.width).toBeGreaterThanOrEqual(390);
});

test('reveals the scroll-to-top control only after meaningful page progress', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await waitForLandingHydration(page);

  const scrollTop = page.getByRole('button', { name: '상단으로 이동', includeHidden: true });
  await expect(scrollTop).toHaveAttribute('aria-hidden', 'true');
  await expect(scrollTop).toHaveAttribute('tabindex', '-1');
  await expect(scrollTop).toBeDisabled();
  expect(
    await scrollTop.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        opacity: style.opacity,
        pointerEvents: style.pointerEvents,
        visibility: style.visibility,
      };
    }),
  ).toEqual({ opacity: '0', pointerEvents: 'none', visibility: 'hidden' });

  await page.locator('#services').scrollIntoViewIfNeeded();
  await expect(scrollTop).toHaveAttribute('data-scroll-top-visible', 'true');
  await expect(scrollTop).not.toBeDisabled();
  await expect(scrollTop).toHaveAttribute('tabindex', '0');
  await expect(scrollTop).toBeVisible();

  const scrollYBeforeClick = await page.evaluate(() => window.scrollY);
  await scrollTop.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(scrollYBeforeClick);
});

test('changes the scroll-to-top threshold state without motion when reduced motion is active', async ({
  browser,
}) => {
  const reducedPage = await browser.newPage({
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 720 },
  });
  await reducedPage.goto('/');
  await waitForLandingHydration(reducedPage);

  const scrollTop = reducedPage.getByRole('button', {
    name: '상단으로 이동',
    includeHidden: true,
  });
  await reducedPage.locator('#services').scrollIntoViewIfNeeded();
  await expect(scrollTop).toHaveAttribute('data-scroll-top-visible', 'true');
  expect(await scrollTop.evaluate((node) => getComputedStyle(node).transitionProperty)).toBe(
    'none',
  );

  await scrollTop.click();
  expect(await reducedPage.evaluate(() => window.scrollY)).toBe(0);
  await reducedPage.close();
});

test('keeps classic section titles within the approved scale', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');

  for (const heading of await page.locator('#services h2, #team h2, #process h2, #faq h2').all()) {
    expect(
      Number.parseFloat(await heading.evaluate((node) => getComputedStyle(node).fontSize)),
    ).toBeLessThanOrEqual(55);
  }
});

test('uses one-shot classic reveal without a scene-motion ready state', async ({
  browser,
  page,
}) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.goto('/');
  await expect(page.locator('[data-landing-page]')).not.toHaveAttribute(
    'data-landing-scene-motion',
    'ready',
  );
  await page.locator('#team').scrollIntoViewIfNeeded();
  const target = page.locator('#team [data-landing-reveal]').first();
  await expect(target).toHaveAttribute('data-landing-visible', 'true');
  await page.locator('#hero').scrollIntoViewIfNeeded();
  await expect(target).toHaveAttribute('data-landing-visible', 'true');
  expect(runtimeErrors).toEqual([]);

  const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });
  await reducedPage.goto('/');
  await expect(
    reducedPage.locator('[data-landing-reveal]:not([data-landing-visible="true"])'),
  ).toHaveCount(0);
  await reducedPage.close();
});

test('keeps the classic services and process sections within the mobile viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  expect(
    await page.locator('#services, #process').evaluateAll((sections) =>
      sections.map((section) => ({
        id: section.id,
        fits: section.scrollWidth <= section.clientWidth,
      })),
    ),
  ).toEqual([
    { id: 'services', fits: true },
    { id: 'process', fits: true },
  ]);
});

test('adapts the ring and dot cursor to semantic surfaces and recovers after blur', async ({
  browser,
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await page.mouse.move(12, 12);
  await page.mouse.move(24, 24);
  await expect(page.locator('html')).toHaveAttribute('data-landing-cursor-enabled', 'true');
  await page.mouse.move(36, 36);
  await page.mouse.move(48, 48);
  await expect(page.locator('body')).toHaveAttribute('data-landing-cursor-ready', 'true');

  const ring = page.locator('[data-landing-cursor-ring]');
  const dot = page.locator('[data-landing-cursor-dot]');
  const assertTone = async (target: ReturnType<typeof page.locator>, tone: 'light' | 'dark') => {
    await target.hover();
    await expect(page.locator('body')).toHaveAttribute('data-landing-cursor-contrast', tone);
    await expect(ring).toHaveCSS('opacity', '1');
    await expect(dot).toHaveCSS('opacity', '1');
    await expect(ring).toHaveCSS(
      'border-color',
      tone === 'light' ? 'rgba(248, 247, 243, 0.96)' : 'rgba(32, 37, 35, 0.94)',
    );
    await expect(dot).toHaveCSS(
      'background-color',
      tone === 'light' ? 'rgba(248, 247, 243, 0.96)' : 'rgba(32, 37, 35, 0.94)',
    );
  };

  await assertTone(page.locator('#hero'), 'light');
  await assertTone(page.locator('#services'), 'dark');
  await assertTone(page.locator('#operations'), 'light');
  await assertTone(page.locator('#footer a[href^="mailto:"]').first(), 'dark');

  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.locator('body')).toHaveAttribute('data-landing-cursor-muted', 'true');
  await page.evaluate(() => window.dispatchEvent(new Event('pageshow')));
  await expect(page.locator('body')).not.toHaveAttribute('data-landing-cursor-muted', 'true');
  await expect(page.locator('body')).toHaveAttribute('data-landing-cursor-ready', 'true');

  await page.setViewportSize({ width: 900, height: 720 });
  await expect(page.locator('html')).toHaveCSS('cursor', 'auto');
  await expect(ring).toHaveCSS('display', 'none');
  await expect(dot).toHaveCSS('display', 'none');

  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.locator('html')).toHaveCSS('cursor', 'none');
  await expect(ring).not.toHaveCSS('display', 'none');
  await expect(dot).not.toHaveCSS('display', 'none');

  const coarsePage = await browser.newPage({ hasTouch: true });
  await coarsePage.setViewportSize({ width: 390, height: 844 });
  await coarsePage.goto('/');
  await coarsePage.mouse.move(12, 12);
  await expect(coarsePage.locator('html')).not.toHaveAttribute(
    'data-landing-cursor-enabled',
    'true',
  );
  await coarsePage.close();

  const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });
  await reducedPage.goto('/');
  await reducedPage.mouse.move(12, 12);
  await expect(reducedPage.locator('html')).not.toHaveAttribute(
    'data-landing-cursor-enabled',
    'true',
  );
  await reducedPage.close();
});
