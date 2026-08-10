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
  await expect(hero.getByRole('link', { name: '프로젝트 문의하기' })).toHaveCount(1);
});

test('renders the factual classic order without cinematic-only scenes', async ({ page }) => {
  await page.goto('/');

  expect(
    await page
      .locator('main > section[data-landing-section]')
      .evaluateAll((sections) => sections.map((section) => section.id)),
  ).toEqual(['hero', 'services', 'stack', 'team', 'process', 'operations', 'faq', 'contact']);

  await expect(page.locator('#services').getByText('웹·앱 개발', { exact: true })).toBeVisible();
  await expect(
    page.locator('#team').getByText('프로젝트 매니지먼트', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('#process').getByText('배포 및 운영', { exact: true })).toBeVisible();
  await expect(
    page.locator('#operations').getByText('변경 이력 공유', { exact: true }),
  ).toBeVisible();
});

test('preserves classic reveal targets and tablet navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 720 });
  await page.goto('/');

  await expect(page.locator('[data-landing-reveal]')).not.toHaveCount(0);
  await page.locator('#team').scrollIntoViewIfNeeded();
  await expect(page.locator('#team [data-landing-visible="true"]')).not.toHaveCount(0);
  await expect(page.getByRole('navigation', { name: '주요 메뉴' })).toBeVisible();
});

test('keeps Hero copy inside deliberate responsive gutters', async ({ page }) => {
  const title = page.getByRole('heading', { level: 1, name: 'BUILT FOR WHAT’S NEXT.' });

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  expect((await title.boundingBox())?.x).toBeGreaterThanOrEqual(32);

  await page.setViewportSize({ width: 390, height: 844 });
  expect((await title.boundingBox())?.x).toBeGreaterThanOrEqual(20);
});

test('keeps the mobile header inquiry button inside its capsule', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const headerBox = await page.locator('[data-landing-nav]').boundingBox();
  const inquiryBox = await page
    .locator('[data-landing-nav] [data-landing-interactive="button"]')
    .boundingBox();

  expect(headerBox).not.toBeNull();
  expect(inquiryBox).not.toBeNull();
  expect(inquiryBox!.x).toBeGreaterThanOrEqual(headerBox!.x);
  expect(inquiryBox!.x + inquiryBox!.width).toBeLessThanOrEqual(headerBox!.x + headerBox!.width);
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

test('keeps classic section and contact titles within the approved scale', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');

  for (const heading of await page.locator('#services h2, #team h2, #process h2, #faq h2').all()) {
    expect(
      Number.parseFloat(await heading.evaluate((node) => getComputedStyle(node).fontSize)),
    ).toBeLessThanOrEqual(55);
  }

  expect(
    Number.parseFloat(
      await page.locator('#contact h2').evaluate((node) => getComputedStyle(node).fontSize),
    ),
  ).toBeLessThanOrEqual(48);
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

test('uses the restored classic contact layout and disclosures', async ({ page }) => {
  await page.goto('/');

  const contact = page.locator('#contact');
  await expect(
    contact.getByRole('heading', { name: '새로운 프로젝트를 가볍게 이야기해보세요.' }),
  ).toBeVisible();
  await expect(contact.getByRole('heading', { name: '상담 전 확인사항' })).toBeVisible();
  await expect(contact.getByRole('form', { name: '프로젝트 상담 양식' })).toBeVisible();
  await expect(contact.getByRole('list', { name: '개인정보 수집·이용 고지' })).toBeVisible();
  await expect(contact.getByRole('list', { name: '개인정보 국외 이전 고지' })).toBeVisible();
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
  await assertTone(page.locator('#contact'), 'dark');
  await assertTone(page.getByRole('link', { name: '메일로 문의' }), 'dark');

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
