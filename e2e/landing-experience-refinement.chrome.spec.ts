import { expect, test, type Page } from '@playwright/test';

async function waitForLandingHydration(page: Page) {
  await page.waitForFunction(() => {
    const landing = document.querySelector('[data-landing-page]');
    return landing && Object.keys(landing).some((key) => key.startsWith('__reactProps$'));
  });
}

test('controls all four technology marquees and preserves the user pause choice', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#technology');
  await waitForLandingHydration(page);

  const technology = page.locator('#technology');
  const control = technology.locator('[data-technology-marquee-control]');
  const marquees = technology.locator('[data-technology-marquee]');
  const firstMarquee = marquees.first();

  await expect(control).toHaveCount(1);
  await expect(control).toHaveAttribute('aria-pressed', 'false');
  await expect(control).toHaveAccessibleName('기술 흐름 일시정지');
  await expect(control).toHaveCSS('width', '44px');
  await expect(control).toHaveCSS('height', '44px');
  await expect(technology).toHaveAttribute('data-technology-marquee-enhanced', 'true');

  await page.locator('[data-technology-row]').first().scrollIntoViewIfNeeded();
  await expect(firstMarquee).toHaveAttribute('data-technology-marquee-state', 'running');

  await control.click();
  await expect(control).toHaveAttribute('aria-pressed', 'true');
  await expect(control).toHaveAccessibleName('기술 흐름 재생');
  for (const marquee of await marquees.all()) {
    await expect(marquee).toHaveAttribute('data-technology-marquee-state', 'user-paused');
    await expect(marquee).toHaveCSS('animation-play-state', 'paused');
  }

  await page.locator('#top').scrollIntoViewIfNeeded();
  await expect(firstMarquee).toHaveAttribute('data-technology-marquee-state', 'user-paused');
  await control.scrollIntoViewIfNeeded();
  await expect(control).toHaveAttribute('aria-pressed', 'true');

  await control.click();
  await page.locator('[data-technology-row]').first().scrollIntoViewIfNeeded();
  await expect(firstMarquee).toHaveAttribute('data-technology-marquee-state', 'running');
  await expect(marquees.last()).toHaveAttribute(
    'data-technology-marquee-state',
    'offscreen-paused',
  );
});

test('pauses a technology marquee offscreen, on hover, and while the page is hidden', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#technology');
  await waitForLandingHydration(page);

  const firstRow = page.locator('[data-technology-row]').first();
  const firstMarquee = firstRow.locator('[data-technology-marquee]');
  await firstRow.scrollIntoViewIfNeeded();
  await expect(firstMarquee).toHaveAttribute('data-technology-marquee-state', 'running');

  await firstRow.locator('[data-technology-marquee-viewport]').hover();
  await expect(firstMarquee).toHaveCSS('animation-play-state', 'paused');
  await page.mouse.move(0, 0);
  await expect(firstMarquee).toHaveCSS('animation-play-state', 'running');

  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(firstMarquee).toHaveAttribute('data-technology-marquee-state', 'page-hidden');
  await expect(firstMarquee).toHaveCSS('animation-play-state', 'paused');
});

test('keeps technology motion static without JavaScript and with reduced motion', async ({
  browser,
}) => {
  const noScriptContext = await browser.newContext({ javaScriptEnabled: false });
  const noScriptPage = await noScriptContext.newPage();
  await noScriptPage.goto('/#technology');
  const noScriptTechnology = noScriptPage.locator('#technology');
  await expect(noScriptTechnology.locator('[data-technology-marquee-control]')).toBeHidden();
  await expect(noScriptTechnology.locator('[data-technology-marquee]').first()).toHaveCSS(
    'animation-play-state',
    'paused',
  );
  await noScriptContext.close();

  const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });
  await reducedPage.goto('/#technology');
  await waitForLandingHydration(reducedPage);
  const reducedTechnology = reducedPage.locator('#technology');
  await expect(reducedTechnology.locator('[data-technology-marquee-control]')).toBeHidden();
  for (const marquee of await reducedTechnology.locator('[data-technology-marquee]').all()) {
    await expect(marquee).toHaveAttribute('data-technology-marquee-state', 'reduced');
    await expect(marquee).toHaveCSS('animation-name', 'none');
  }
  await reducedPage.close();
});

test('groups the full technology list into four readable capability chapters', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#technology');
  await waitForLandingHydration(page);

  const disclosure = page.locator('[data-technology-details]');
  await disclosure.locator('summary').click();

  const chapters = disclosure.locator('[data-technology-chapter]');
  await expect(chapters).toHaveCount(4);
  await expect(disclosure.locator('[data-technology-group]')).toHaveCount(16);
  await expect(disclosure.locator('[data-technology]')).toHaveCount(70);

  for (const chapter of await chapters.all()) {
    await expect(chapter.locator('[data-technology-chapter-heading]')).toHaveCount(1);
    await expect(chapter.locator('[data-technology-group]')).toHaveCount(4);
  }
});

test('connects the Services intro to its gallery and uses the FUTUR Field reveal distance', async ({
  browser,
}) => {
  const page = await browser.newPage();

  for (const { width, expectedMargin } of [
    { width: 1280, expectedMargin: 64 },
    { width: 900, expectedMargin: 56 },
    { width: 390, expectedMargin: 48 },
  ]) {
    await page.setViewportSize({ width, height: width === 1280 ? 900 : 844 });
    await page.goto('/#services');
    await waitForLandingHydration(page);
    const margin = await page
      .locator('#services [data-service-gallery]')
      .evaluate((gallery) => Number.parseFloat(getComputedStyle(gallery).marginTop));
    expect(margin).toBeCloseTo(expectedMargin, 0);
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#top');
  await waitForLandingHydration(page);
  const firstCard = page.locator('[data-service-card]').first();
  await firstCard.evaluate((card) => delete (card as HTMLElement).dataset.landingVisible);
  await expect
    .poll(() =>
      firstCard.evaluate((card) => new DOMMatrixReadOnly(getComputedStyle(card).transform).m42),
    )
    .toBeCloseTo(20, 0);

  await page.close();
});

test('raises Footer legal information to the shared readable text size', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#footer');
  await waitForLandingHydration(page);

  const footer = page.locator('#footer');
  await expect(footer.getByRole('link', { name: '개인정보처리방침' })).toHaveCSS(
    'font-size',
    '14px',
  );
  await expect(footer.getByRole('link', { name: '이용약관' })).toHaveCSS('font-size', '14px');
  await expect(footer.locator('[data-footer-legal-facts]')).toHaveCSS('font-size', '14px');

  const contrastAlpha = await footer.evaluate((element) => {
    const readAlpha = (selector: string) => {
      const color = getComputedStyle(element.querySelector<HTMLElement>(selector)!).color;
      return Number(color.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/)?.[1] ?? 1);
    };

    return {
      facts: readAlpha('[data-footer-legal-facts]'),
      policy: readAlpha('a[href="/privacy"]'),
    };
  });
  expect(contrastAlpha.policy).toBeGreaterThanOrEqual(0.74);
  expect(contrastAlpha.facts).toBeGreaterThanOrEqual(0.7);
});
