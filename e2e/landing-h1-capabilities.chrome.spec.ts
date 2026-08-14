import { expect, test } from '@playwright/test';

async function waitForLandingHydration(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => {
    const landing = document.querySelector('[data-landing-page]');
    return landing && Object.keys(landing).some((key) => key.startsWith('__reactProps$'));
  });
}

test('renders the capability landing narrative and navigation without removed sections', async ({
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
  await expect(page.locator('[data-service-card]')).toHaveCount(4);
  await expect(
    page.locator('[data-service-sticky-index], [data-service-surface-gate]'),
  ).toHaveCount(0);
  await expect(page.locator('[data-technology-row]')).toHaveCount(4);
});

test('uses an asymmetric service bento on desktop and a safe single column on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#services');

  const cards = page.locator('[data-service-card]');
  const desktop = await cards.evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, width: rect.width };
    }),
  );
  expect(desktop[0]?.width).toBeGreaterThan((desktop[1]?.width ?? 0) * 1.8);
  expect(desktop[3]?.width).toBeGreaterThan((desktop[2]?.width ?? 0) * 1.8);
  expect(desktop[1]?.left).toBeLessThan(desktop[2]?.left ?? 0);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(
    false,
  );
  const mobileLefts = await cards.evaluateAll((elements) =>
    elements.map((element) => Math.round(element.getBoundingClientRect().left)),
  );
  expect(new Set(mobileLefts).size).toBe(1);
});

test('shows representative technologies and exposes all 70 through a native disclosure', async ({
  page,
}) => {
  await page.goto('/#technology');
  await waitForLandingHydration(page);

  const technology = page.locator('#technology');
  const disclosure = technology.locator('details[data-technology-details]');
  await expect(technology.locator('[data-technology-summary]')).toHaveCount(4);
  await expect(technology.locator('[data-technology-marquee]')).toHaveCount(4);
  await expect(disclosure).not.toHaveAttribute('open', '');

  const summary = disclosure.locator('summary');
  await expect(summary.getByText('기술 범위 전체 보기', { exact: true })).toBeVisible();
  await summary.focus();
  await summary.press('Enter');

  await expect(disclosure).toHaveAttribute('open', '');
  await expect(summary.getByText('기술 범위 접기', { exact: true })).toBeVisible();
  await expect(disclosure.locator('[data-technology-group]')).toHaveCount(16);
  await expect(disclosure.locator('[data-technology]')).toHaveCount(70);
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
      serviceNumber: read('[data-service-card-index]'),
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

test('keeps capability content available with reduced motion and without JavaScript', async ({
  browser,
}) => {
  const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });
  await reducedPage.goto('/#services');
  await expect(reducedPage.locator('[data-service-card]').first()).toHaveCSS('transform', 'none');
  await expect(reducedPage.locator('[data-technology-marquee]').first()).toHaveCSS(
    'transform',
    'none',
  );
  await reducedPage.close();

  const noScriptPage = await browser.newPage({ javaScriptEnabled: false });
  await noScriptPage.goto('/');
  await expect(noScriptPage.locator('[data-service-card]')).toHaveCount(4);
  await expect(noScriptPage.locator('[data-technology-summary]')).toHaveCount(4);
  const noScriptDisclosure = noScriptPage.locator('details[data-technology-details]');
  await noScriptDisclosure.locator('summary').click();
  await expect(noScriptDisclosure.locator('[data-technology]')).toHaveCount(70);
  await expect(noScriptPage.locator('#footer')).toBeVisible();
  await noScriptPage.close();
});
