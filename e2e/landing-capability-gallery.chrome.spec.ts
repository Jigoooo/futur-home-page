import { expect, test, type Page } from '@playwright/test';

async function waitForLandingHydration(page: Page) {
  await page.waitForFunction(() => {
    const landing = document.querySelector('[data-landing-page]');
    return landing && Object.keys(landing).some((key) => key.startsWith('__reactProps$'));
  });
}

test('replaces the presentation-like service flow with four image-free editorial capability cards', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#services');
  await waitForLandingHydration(page);

  const services = page.locator('#services');
  const cards = services.locator('[data-service-card]');

  await expect(
    services.getByRole('heading', { name: '새로운 서비스부터, 운영 중인 시스템까지.' }),
  ).toBeVisible();
  await expect(cards).toHaveCount(4);
  await expect(services.locator('[data-service-sticky-index]')).toHaveCount(0);
  await expect(services.locator('[data-service-surface-gate]')).toHaveCount(0);

  await expect(cards.locator('img, picture, svg')).toHaveCount(0);

  const introGeometry = await services.locator('[data-service-intro]').evaluate((intro) => ({
    height: intro.getBoundingClientRect().height,
    viewportHeight: window.innerHeight,
  }));
  expect(introGeometry.height).toBeLessThan(introGeometry.viewportHeight * 0.58);
});

test('keeps service scope labels equally prominent across asymmetric desktop cards', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#services');

  const scopeFontSizes = await page
    .locator('[data-service-card] ul')
    .evaluateAll((lists) =>
      lists.map((list) => Number.parseFloat(getComputedStyle(list).fontSize)),
    );

  expect(new Set(scopeFontSizes).size).toBe(1);
  expect(scopeFontSizes.every((size) => size > 15 && size <= 19)).toBe(true);
});

test('uses an unboxed kinetic technology index while retaining the full technology disclosure', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#technology');
  await waitForLandingHydration(page);

  const technology = page.locator('#technology');
  const rows = technology.locator('[data-technology-row]');

  await expect(rows).toHaveCount(4);
  await expect(technology.locator('[data-technology-sheet]')).toHaveCount(0);
  await expect(technology.locator('[data-technology-stack-enhanced]')).toHaveCount(0);
  await expect(rows.locator('[data-technology-marquee]')).toHaveCount(4);
  const technologyNameSize = await rows
    .first()
    .locator('[data-technology-marquee] p')
    .first()
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(technologyNameSize).toBeLessThanOrEqual(64);

  const disclosure = technology.locator('details[data-technology-details]');
  await expect(disclosure).not.toHaveAttribute('open', '');
  await disclosure.locator('summary').click();
  await expect(disclosure.locator('[data-technology-group]')).toHaveCount(16);
  await expect(disclosure.locator('[data-technology]')).toHaveCount(70);
});

test('uses compact twenty-second technology marquees at every supported width', async ({
  browser,
}) => {
  const page = await browser.newPage();

  for (const width of [1280, 900, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#technology');
    await waitForLandingHydration(page);

    const presentation = await page
      .locator('[data-technology-marquee]')
      .first()
      .evaluate((marquee) => {
        const label = marquee.querySelector<HTMLElement>('p')!;
        const marqueeStyle = getComputedStyle(marquee);

        return {
          duration: marqueeStyle.animationDuration,
          fontSize: Number.parseFloat(getComputedStyle(label).fontSize),
        };
      });

    expect(presentation.duration).toBe('20s');
    expect(presentation.fontSize).toBeLessThanOrEqual(width <= 560 ? 32 : 44);
  }

  await page.close();
});

test('enhances the native technology disclosure without pinning the summary', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#technology');
  await waitForLandingHydration(page);

  const disclosure = page.locator('details[data-technology-details]');
  const summary = disclosure.locator('summary');
  const closeControl = disclosure.locator('[data-technology-disclosure-close]');
  const panel = disclosure.locator('[data-technology-disclosure-panel]');
  const content = disclosure.locator('[data-technology-disclosure-content]');

  await expect(disclosure).toHaveAttribute('data-technology-disclosure-enhanced', 'true');
  await expect(disclosure).toHaveAttribute('data-technology-disclosure-controls', 'true');
  await expect(summary.getByText('기술 범위 전체 보기', { exact: true })).toBeVisible();
  await expect(panel).toHaveCount(1);
  await expect(content).toHaveCount(1);
  await expect(disclosure.locator('[data-technology-group][data-landing-reveal="up"]')).toHaveCount(
    16,
  );

  await summary.focus();
  await summary.press('Enter');

  await expect(disclosure).toHaveAttribute('open', '');
  await expect(summary.getByText('기술 범위 접기', { exact: true })).toBeVisible();
  await page.waitForTimeout(80);

  const firstGroup = disclosure.locator('[data-technology-group]').first();
  const firstGroupOpeningState = await firstGroup.evaluate((element) => ({
    opacity: Number.parseFloat(getComputedStyle(element).opacity),
    visible: element.getAttribute('data-landing-visible'),
  }));
  expect(firstGroupOpeningState.visible).toBe('true');
  expect(firstGroupOpeningState.opacity).toBeGreaterThan(0);

  const openingFrame = await panel.evaluate((element) => ({
    height: element.getBoundingClientRect().height,
    scrollHeight: element.scrollHeight,
  }));
  expect(openingFrame.height).toBeLessThan(openingFrame.scrollHeight);
  await expect(content).not.toHaveCSS('clip-path', 'none');
  await expect(firstGroup).toHaveCSS('opacity', '1');
  await expect(closeControl).toBeVisible();

  await disclosure.locator('[data-technology-group]').nth(8).scrollIntoViewIfNeeded();
  const summaryPresentation = await summary.evaluate((element) => ({
    position: getComputedStyle(element).position,
    top: element.getBoundingClientRect().top,
  }));
  expect(summaryPresentation.position).not.toBe('sticky');
  expect(summaryPresentation.top).toBeLessThan(0);
});

test('closes from the bottom and returns focus to the summary at the header-safe offset', async ({
  browser,
}) => {
  for (const { width, offset, maxGap } of [
    { width: 1280, offset: 96, maxGap: 120 },
    { width: 390, offset: 82, maxGap: 96 },
  ]) {
    const page = await browser.newPage({ viewport: { width, height: width === 1280 ? 900 : 844 } });
    await page.goto('/#technology');
    await waitForLandingHydration(page);

    const technology = page.locator('#technology');
    const disclosure = technology.locator('details[data-technology-details]');
    const summary = disclosure.locator('summary');
    const closeControl = disclosure.locator('[data-technology-disclosure-close]');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await closeControl.scrollIntoViewIfNeeded();

    const trailingSpace = await technology.evaluate((section) => {
      const close = section.querySelector<HTMLElement>('[data-technology-disclosure-close]')!;
      return {
        gap: section.getBoundingClientRect().bottom - close.getBoundingClientRect().bottom,
        padding: Number.parseFloat(getComputedStyle(section).paddingBottom),
      };
    });
    expect(trailingSpace.padding).toBeLessThanOrEqual(maxGap);
    expect(trailingSpace.gap).toBeLessThanOrEqual(maxGap + 2);

    await closeControl.click();
    await expect(disclosure).not.toHaveAttribute('open', '', { timeout: 1_000 });
    await expect(summary).toBeFocused();
    await expect
      .poll(() => summary.evaluate((element) => element.getBoundingClientRect().top))
      .toBeCloseTo(offset, 0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    ).toBe(false);
    await page.close();
  }
});

test('anchors and reverses the long technology disclosure without locking input', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#technology');
  await waitForLandingHydration(page);

  const disclosure = page.locator('details[data-technology-details]');
  const summary = disclosure.locator('summary');
  const panel = disclosure.locator('[data-technology-disclosure-panel]');

  await summary.click();
  await expect(disclosure).toHaveAttribute('open', '');

  await summary.click();
  await expect(disclosure).toHaveAttribute('data-technology-disclosure-closing', 'true');
  await page.waitForTimeout(70);
  await summary.click();

  await expect(disclosure).toHaveAttribute('open', '');
  await expect(disclosure).not.toHaveAttribute('data-technology-disclosure-closing');
  await expect(summary.getByText('기술 범위 접기', { exact: true })).toBeVisible();

  await expect
    .poll(() => panel.evaluate((element) => element.style.height), { timeout: 1_000 })
    .toBe('');

  const closeControl = disclosure.locator('[data-technology-disclosure-close]');
  await closeControl.scrollIntoViewIfNeeded();
  await closeControl.click();
  await expect(disclosure).not.toHaveAttribute('open', '', { timeout: 1_000 });
  await expect(summary).toBeFocused();
  await expect
    .poll(() => summary.evaluate((element) => element.getBoundingClientRect().top))
    .toBeCloseTo(96, 0);
});

test('keeps technology marquees moving without page scroll across desktop, tablet, and mobile', async ({
  browser,
}) => {
  const page = await browser.newPage();

  for (const width of [1280, 900, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#technology');
    await waitForLandingHydration(page);
    await page.waitForTimeout(900);

    const marquee = page.locator('[data-technology-marquee]').first();
    const before = await marquee.evaluate((element) => {
      const animation = element.getAnimations()[0];
      return {
        animationCount: element.getAnimations().length,
        currentTime: Number(animation?.currentTime ?? 0),
        scrollY: window.scrollY,
      };
    });

    await page.waitForTimeout(160);

    const after = await marquee.evaluate((element) => {
      const animation = element.getAnimations()[0];
      return {
        currentTime: Number(animation?.currentTime ?? 0),
        scrollY: window.scrollY,
      };
    });

    expect(before.animationCount).toBeGreaterThan(0);
    expect(after.currentTime).toBeGreaterThan(before.currentTime);
    expect(after.scrollY).toBe(before.scrollY);
  }

  const firstViewport = page.locator('[data-technology-row]').first().locator('[aria-label]');
  const firstMarquee = firstViewport.locator('[data-technology-marquee]');
  await firstViewport.hover();
  await expect(firstMarquee).toHaveCSS('animation-play-state', 'paused');

  await page.close();
});

test('exposes static technology text when reduced motion is requested', async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 900, height: 844 });
  await page.goto('/#technology');
  await waitForLandingHydration(page);

  const marquee = page.locator('[data-technology-marquee]').first();
  expect(await marquee.evaluate((element) => element.getAnimations().length)).toBe(0);
  await expect(marquee).toHaveCSS('transform', 'none');

  const disclosure = page.locator('details[data-technology-details]');
  const summary = disclosure.locator('summary');
  await expect(disclosure).not.toHaveAttribute('data-technology-disclosure-enhanced');
  await expect(disclosure).toHaveAttribute('data-technology-disclosure-controls', 'true');
  await summary.press('Enter');
  await expect(disclosure).toHaveAttribute('open', '');
  const reducedDisclosureMotion = await disclosure.evaluate((element) => {
    const panel = element.querySelector<HTMLElement>('[data-technology-disclosure-panel]')!;
    const content = element.querySelector<HTMLElement>('[data-technology-disclosure-content]')!;

    return {
      animationCount: panel.getAnimations().length + content.getAnimations().length,
      clipPath: content.style.clipPath,
      height: panel.style.height,
    };
  });
  expect(reducedDisclosureMotion).toEqual({ animationCount: 0, clipPath: '', height: '' });
  const closeControl = disclosure.locator('[data-technology-disclosure-close]');
  await closeControl.scrollIntoViewIfNeeded();
  await closeControl.click();
  await expect(disclosure).not.toHaveAttribute('open', '');
  await expect(summary).toBeFocused();

  await page.close();
});

test('restores the native pointer and presents an optically centered visible footer CTA', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#footer');
  await waitForLandingHydration(page);

  await expect(page.locator('[data-landing-cursor-ring], [data-landing-cursor-dot]')).toHaveCount(
    0,
  );
  await expect(page.locator('html')).not.toHaveAttribute('data-landing-cursor-enabled', 'true');

  const inquiry = page.locator('#footer').getByRole('link', { name: '문의하기', exact: true });
  const presentation = await inquiry.evaluate((link) => {
    const label = link.querySelector<HTMLElement>('[data-landing-label]')!;
    const linkRect = link.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    const style = getComputedStyle(link);

    return {
      background: style.backgroundColor,
      centerDelta: Math.abs(
        labelRect.left + labelRect.width / 2 - (linkRect.left + linkRect.width / 2),
      ),
    };
  });

  expect(presentation.background).not.toBe('rgba(0, 0, 0, 0)');
  expect(presentation.centerDelta).toBeLessThanOrEqual(1);
});

test('keeps the gallery and technology index static with reduced motion and responsive without overflow', async ({
  browser,
}) => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });

  for (const width of [1180, 900, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#services');
    await waitForLandingHydration(page);

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    ).toBe(false);
    await expect(page.locator('[data-service-card]')).toHaveCount(4);
    await expect(page.locator('[data-technology-row]')).toHaveCount(4);
    await expect(page.locator('[data-service-card]').first()).toHaveCSS('transform', 'none');
  }

  await page.close();
});
