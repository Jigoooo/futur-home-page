import { expect, test } from '@playwright/test';

async function waitForLandingHydration(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => {
    const landing = document.querySelector('[data-landing-page]');
    return landing && Object.keys(landing).some((key) => key.startsWith('__reactProps$'));
  });
}

const serviceTitles = [
  '서비스·솔루션 개발',
  '업무 시스템·SI',
  'AI 통합·AX',
  '운영·유지보수',
] as const;

test('renders the H1 landing narrative and navigation without the removed sections', async ({
  page,
}) => {
  await page.goto('/');

  expect(
    await page
      .locator('[data-landing-section]')
      .evaluateAll((sections) => sections.map((section) => section.id)),
  ).toEqual(['hero', 'services', 'technology', 'faq', 'footer']);

  const navigation = page.getByRole('navigation', { name: '주요 메뉴' });
  expect(
    await navigation
      .locator('[data-header-section-link]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
  ).toEqual(['#services', '#technology', '#faq']);
  await expect(navigation.getByRole('link', { name: '문의', exact: true })).toHaveAttribute(
    'href',
    '#footer',
  );

  await expect(page.locator('#team, #stack, #process')).toHaveCount(0);
  await expect(page.locator('[data-service-capability]')).toHaveCount(4);
  const serviceProgressItems = page.locator('[data-service-progress-item]');
  await expect(serviceProgressItems).toHaveCount(4);
  await expect(page.locator('[data-service-index-link]')).toHaveCount(0);
  for (const [index, title] of serviceTitles.entries()) {
    await expect(serviceProgressItems.nth(index)).toContainText(title);
  }
  await expect(
    page.locator('[data-service-sticky-index] a, [data-service-sticky-index] button'),
  ).toHaveCount(0);
  await expect(page.locator('[data-service-sticky-index] [aria-current]')).toHaveCount(0);
  await expect(page.locator('[data-service-card], [data-landing-service-icon]')).toHaveCount(0);
});

test('updates only the passive service progress while the chapters cross the viewport probe', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-landing-ready', 'true');
  await expect(page.locator('[data-landing-nav]')).toHaveAttribute('data-header-hydrated', 'true');

  const progressItems = page.locator('[data-service-progress-item]');
  await expect(progressItems.first()).toHaveAttribute('data-current', 'true');
  const initialUrl = page.url();

  await page.locator('#service-ai').evaluate((chapter) => {
    const rect = chapter.getBoundingClientRect();
    const top = rect.top + window.scrollY + rect.height / 2 - window.innerHeight / 2;
    window.scrollTo({ top, behavior: 'instant' });
  });
  await expect(progressItems.nth(2)).toHaveAttribute('data-current', 'true');
  await expect(progressItems.nth(0)).not.toHaveAttribute('data-current', 'true');
  expect(page.url()).toBe(initialUrl);
});

test('shows representative technologies first and exposes all 70 through a native disclosure', async ({
  page,
}) => {
  await page.goto('/#technology');
  await waitForLandingHydration(page);

  const technology = page.locator('#technology');
  const disclosure = technology.locator('details[data-technology-details]');
  await expect(technology.locator('[data-technology-summary]')).toHaveCount(4);
  await expect(disclosure).not.toHaveAttribute('open', '');
  await expect(disclosure.locator('[data-technology-group]').first()).toBeHidden();

  const summary = disclosure.getByText('기술 범위 전체 보기', { exact: true });
  await summary.focus();
  await summary.press('Enter');

  await expect(disclosure).toHaveAttribute('open', '');
  await expect(disclosure.locator('[data-technology-group]')).toHaveCount(16);
  await expect(disclosure.locator('[data-technology]')).toHaveCount(70);
  await expect(disclosure.locator('[data-technology-group]').first()).toBeVisible();
});

test('uses the split sticky layout only when the viewport can support it', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#services');

  const sticky = page.locator('[data-service-sticky-index]');
  const firstChapter = page.locator('[data-service-capability]').first();
  await expect(sticky).toHaveCSS('position', 'sticky');

  const desktopGeometry = await page.locator('[data-service-layout]').evaluate((layout) => {
    const layoutRect = layout.getBoundingClientRect();
    const stickyRect = layout
      .querySelector<HTMLElement>('[data-service-sticky-index]')!
      .getBoundingClientRect();
    const chapterRect = layout
      .querySelector<HTMLElement>('[data-service-capability]')!
      .getBoundingClientRect();

    return {
      chapterHeight: chapterRect.height,
      layoutWidth: layoutRect.width,
      stickyWidth: stickyRect.width,
      viewportHeight: window.innerHeight,
    };
  });
  expect(desktopGeometry.stickyWidth / desktopGeometry.layoutWidth).toBeGreaterThanOrEqual(0.35);
  expect(desktopGeometry.stickyWidth / desktopGeometry.layoutWidth).toBeLessThanOrEqual(0.45);
  expect(desktopGeometry.chapterHeight).toBeGreaterThanOrEqual(
    desktopGeometry.viewportHeight * 0.75,
  );
  await expect(firstChapter).toBeVisible();

  for (const width of [1180, 900, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.reload();
    await expect(sticky).toBeHidden();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    ).toBe(false);
  }
});

test('uses a full-width dark transition intro before revealing the split service surface', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#services');

  const geometry = await page.locator('[data-service-intro]').evaluate((intro) => {
    const rect = intro.getBoundingClientRect();
    const style = getComputedStyle(intro);

    return {
      backgroundImage: style.backgroundImage,
      height: rect.height,
      width: rect.width,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
    };
  });

  expect(geometry.backgroundImage).toContain('rgb(32, 37, 35)');
  expect(geometry.backgroundImage).toContain('rgb(9, 11, 16)');
  expect(geometry.width).toBe(geometry.viewportWidth);
  expect(geometry.height).toBeGreaterThanOrEqual(geometry.viewportHeight * 0.64);
});

test('removes the duplicated service progress below desktop and keeps one-column chapters', async ({
  page,
}) => {
  for (const width of [1180, 900, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#services');
    await expect(page.locator('[data-service-sticky-index]')).toBeHidden();

    const layout = await page.locator('[data-service-layout]').evaluate((element) => ({
      columns: getComputedStyle(element).gridTemplateColumns,
      pageOverflows: document.documentElement.scrollWidth > window.innerWidth,
    }));
    expect(layout.columns.split(' ')).toHaveLength(1);
    expect(layout.pageOverflows).toBe(false);
  }
});

test('reveals the first service curtain once and never hides the chapter again', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-landing-ready', 'true');

  const firstChapter = page.locator('[data-service-capability]').first();
  await expect(firstChapter).not.toHaveAttribute('data-landing-visible', 'true');
  expect(
    await firstChapter.evaluate((chapter) => getComputedStyle(chapter, '::before').transform),
  ).toBe('matrix(1, 0, 0, 1, 0, 0)');

  await firstChapter.scrollIntoViewIfNeeded();
  await expect(firstChapter).toHaveAttribute('data-landing-visible', 'true');
  await expect
    .poll(() => firstChapter.evaluate((chapter) => getComputedStyle(chapter, '::before').transform))
    .not.toBe('matrix(1, 0, 0, 1, 0, 0)');

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(firstChapter).toHaveAttribute('data-landing-visible', 'true');
});

test('uses SUIT for Korean content and Space Grotesk for English display and service numbers', async ({
  page,
}) => {
  const fontRequests: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'font') fontRequests.push(request.url());
  });
  await page.goto('/');

  const typography = await page.evaluate(() => {
    const read = (selector: string) => {
      const style = getComputedStyle(document.querySelector<HTMLElement>(selector)!);
      return { family: style.fontFamily, weight: style.fontWeight };
    };

    return {
      body: read('body'),
      hero: read('[data-landing-hero] h1'),
      logo: read('[data-landing-nav] a[aria-label="FUTUR home"]'),
      serviceHeading: read('[data-service-intro] h2'),
      serviceNumber: read('[data-service-capability] [data-service-chapter-index]'),
    };
  });

  expect(typography.body.family).toContain('SUIT Variable');
  expect(typography.hero).toEqual(
    expect.objectContaining({
      family: expect.stringContaining('Space Grotesk Variable'),
      weight: '700',
    }),
  );
  expect(typography.logo.family).toContain('Space Grotesk Variable');
  expect(typography.serviceHeading).toEqual(
    expect.objectContaining({ family: expect.stringContaining('SUIT Variable'), weight: '800' }),
  );
  expect(typography.serviceNumber.family).toContain('Space Grotesk Variable');

  expect(fontRequests.length).toBeGreaterThan(0);
  expect(
    fontRequests.every((requestUrl) => new URL(requestUrl).origin === new URL(page.url()).origin),
  ).toBe(true);
});

test('keeps service and technology content available with reduced motion and without JavaScript', async ({
  browser,
}) => {
  const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });
  await reducedPage.goto('/#services');

  const motion = await reducedPage
    .locator('[data-service-capability]')
    .first()
    .evaluate((chapter) => {
      const heading = chapter.querySelector<HTMLElement>('h3')!;
      const style = getComputedStyle(heading);
      return {
        opacity: style.opacity,
        transform: style.transform,
        transition: style.transitionDuration,
      };
    });
  expect(motion).toEqual({ opacity: '1', transform: 'none', transition: '0s' });
  await reducedPage.close();

  const noScriptPage = await browser.newPage({ javaScriptEnabled: false });
  await noScriptPage.goto('/');
  await expect(noScriptPage.locator('[data-service-capability]')).toHaveCount(4);
  await expect(noScriptPage.locator('[data-technology-summary]')).toHaveCount(4);
  const noScriptDisclosure = noScriptPage.locator('details[data-technology-details]');
  await noScriptDisclosure.locator('summary').click();
  await expect(noScriptDisclosure.locator('[data-technology]')).toHaveCount(70);
  await expect(noScriptPage.locator('#footer')).toBeVisible();
  await noScriptPage.close();
});
