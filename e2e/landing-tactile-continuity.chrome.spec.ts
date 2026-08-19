import { expect, test, type Page } from '@playwright/test';

async function waitForLandingHydration(page: Page) {
  await page.waitForFunction(() => {
    const landing = document.querySelector('[data-landing-page]');
    return landing && Object.keys(landing).some((key) => key.startsWith('__reactProps$'));
  });
}

test('uses one light service gallery without the reversed-L split or transition curtain', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#services');
  await waitForLandingHydration(page);

  const services = page.locator('#services');
  await expect(services).toHaveCSS('background-color', 'rgb(251, 254, 255)');
  await expect(services.locator('[data-service-card]')).toHaveCount(4);
  await expect(
    services.locator('[data-service-sticky-index], [data-service-surface-gate]'),
  ).toHaveCount(0);
  await expect(services.locator('img, picture, svg')).toHaveCount(0);
});

test('keeps the blue scrollbar visible and adapts it to each landing surface', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await waitForLandingHydration(page);

  const track = page.locator('[data-page-scrollbar-track]');
  const thumb = page.locator('[data-page-scrollbar-thumb]');
  await expect(track).toHaveCount(1);
  await expect(track).toHaveAttribute('data-page-scrollbar-surface', 'dark');

  await page.waitForTimeout(1_050);
  await expect(track).not.toHaveAttribute('data-visible', 'true');
  await expect(track).toHaveCSS('opacity', '0.5');
  await expect(thumb).toHaveCSS('background-color', 'rgba(127, 168, 255, 0.82)');

  for (const [sectionId, surface, color] of [
    ['services', 'light', 'rgba(30, 77, 196, 0.62)'],
    ['technology', 'dark', 'rgba(127, 168, 255, 0.82)'],
    ['faq', 'light', 'rgba(30, 77, 196, 0.62)'],
    ['footer', 'dark', 'rgba(127, 168, 255, 0.82)'],
  ] as const) {
    await page.locator(`#${sectionId}`).evaluate((element) => {
      element.scrollIntoView({ block: 'center', behavior: 'instant' });
    });
    await expect(track).toHaveAttribute('data-page-scrollbar-surface', surface);
    await expect(thumb).toHaveCSS('background-color', color);
  }
});

test('keeps the scrollbar thumb on one inset axis while hover expands it', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#technology');
  await waitForLandingHydration(page);

  const track = page.locator('[data-page-scrollbar-track]');
  const readGeometry = () =>
    track.evaluate((element) => {
      const thumb = element.querySelector<HTMLElement>('[data-page-scrollbar-thumb]')!;
      const trackRect = element.getBoundingClientRect();
      const thumbRect = thumb.getBoundingClientRect();
      return {
        centerDelta: thumbRect.left + thumbRect.width / 2 - (trackRect.left + trackRect.width / 2),
        thumbWidth: thumbRect.width,
        thumbRightGap: window.innerWidth - thumbRect.right,
        trackCenter: trackRect.left + trackRect.width / 2,
        trackRightGap: window.innerWidth - trackRect.right,
        trackWidth: trackRect.width,
      };
    });

  const idle = await readGeometry();
  expect(idle).toEqual({
    centerDelta: 0,
    thumbRightGap: 12,
    thumbWidth: 6,
    trackCenter: 1265,
    trackRightGap: 8,
    trackWidth: 14,
  });

  await track.hover();
  await expect(track).toHaveAttribute('data-hovered', 'true');
  await expect.poll(readGeometry).toEqual({
    centerDelta: 0,
    thumbRightGap: 11,
    thumbWidth: 8,
    trackCenter: idle.trackCenter,
    trackRightGap: 8,
    trackWidth: 14,
  });
});

test('shows a passive scroll progress rail while mobile keeps native scrolling', async ({
  browser,
}) => {
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('/#top');
  await waitForLandingHydration(mobilePage);
  await mobilePage.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));

  const progress = mobilePage.locator('[data-page-scroll-progress]');
  const fill = mobilePage.locator('[data-page-scroll-progress-fill]');
  const readScale = () =>
    fill.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m22);

  await expect(mobilePage.locator('html')).not.toHaveAttribute(
    'data-page-scrollbar-enabled',
    'true',
  );
  await expect(progress).toBeVisible();
  await expect(progress).toHaveAttribute('aria-hidden', 'true');
  await expect(progress).toHaveCSS('pointer-events', 'none');
  await expect(progress).toHaveCSS('right', '3px');
  await expect(progress).toHaveCSS('width', '3px');
  await expect.poll(readScale).toBeCloseTo(0, 3);

  await mobilePage.locator('#services').evaluate((element) => {
    element.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await expect(progress).toHaveAttribute('data-page-scrollbar-surface', 'light');
  await expect(fill).toHaveCSS('background-color', 'rgba(30, 77, 196, 0.88)');
  await expect.poll(readScale).toBeGreaterThan(0);

  await mobilePage.locator('#technology').evaluate((element) => {
    element.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await expect(progress).toHaveAttribute('data-page-scrollbar-surface', 'dark');
  await expect(fill).toHaveCSS('background-color', 'rgb(127, 168, 255)');

  await mobilePage.evaluate(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
  });
  await expect.poll(readScale).toBeCloseTo(1, 3);
  await mobilePage.close();

  const reducedPage = await browser.newPage({
    reducedMotion: 'reduce',
    viewport: { width: 390, height: 844 },
  });
  await reducedPage.goto('/');
  await waitForLandingHydration(reducedPage);
  await expect(reducedPage.locator('[data-page-scroll-progress]')).toBeVisible();
  await expect(reducedPage.locator('[data-page-scroll-progress-fill]')).toHaveCSS(
    'transition-duration',
    '0s',
  );
  await reducedPage.close();

  const noScriptPage = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  await noScriptPage.goto('/');
  await expect(noScriptPage.locator('[data-page-scroll-progress]')).toHaveCount(0);
  await noScriptPage.close();
});

test('presents four factual technology rows with continuous type at intermediate widths', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#technology');
  await waitForLandingHydration(page);

  const technology = page.locator('#technology');
  const rows = technology.locator('[data-technology-row]');
  const marquees = technology.locator('[data-technology-marquee]');

  await expect(rows).toHaveCount(4);
  await expect(marquees).toHaveCount(4);
  await expect(rows).toContainText([
    '웹·모바일·데스크톱 환경에서 일관된 제품 경험을 구현합니다.',
    '서비스의 API와 데이터, 권한, 검색과 비동기 처리 구조를 설계합니다.',
    '검증된 AI 모델을 조직의 데이터와 업무 흐름에 연결해 검색·자동화·에이전트를 구현합니다.',
    '배포와 트래픽, 관측, 변경 이력을 관리할 수 있는 운영 환경을 구성합니다.',
  ]);

  await rows.first().scrollIntoViewIfNeeded();
  await expect(marquees.first()).toHaveAttribute('data-technology-marquee-state', 'running');
  const initialTime = await marquees
    .first()
    .evaluate((element) => Number(element.getAnimations()[0]?.currentTime ?? 0));
  await page.waitForTimeout(160);
  expect(
    await marquees
      .first()
      .evaluate((element) => Number(element.getAnimations()[0]?.currentTime ?? 0)),
  ).toBeGreaterThan(initialTime);

  await page.setViewportSize({ width: 900, height: 844 });
  await page.reload();
  await waitForLandingHydration(page);
  expect(
    await marquees.first().evaluate((element) => element.getAnimations().length),
  ).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(
    false,
  );
});

test('shows a single-open editorial FAQ and a centered tactile footer inquiry button', async ({
  page,
}) => {
  await page.goto('/#faq');
  await waitForLandingHydration(page);

  const faq = page.locator('#faq');
  await expect(faq.locator('[data-faq-item]')).toHaveCount(6);
  await expect(faq.locator('[data-faq-trigger]')).toHaveCount(6);
  await expect(faq.locator('[data-faq-trigger]').first()).toHaveAttribute('aria-expanded', 'true');
  await expect(faq.locator('[data-faq-item][data-open="true"]')).toHaveCount(1);
  await expect(
    faq.getByText('만들고 싶은 서비스나 해결하려는 문제를 가능한 한 자세히'),
  ).toBeVisible();

  const footer = page.locator('#footer');
  const inquiry = footer.getByRole('link', { name: '문의하기', exact: true });
  await expect(inquiry).toHaveAttribute('href', 'mailto:kjwoo@futur.co.kr');
  await expect(inquiry).toHaveAttribute('data-landing-magnetic', 'true');
  await expect(inquiry.locator('[data-button-liquid-fill]')).toHaveCount(1);
  await expect(inquiry).toHaveCSS('background-color', 'rgb(49, 92, 255)');
  await expect(footer.getByRole('navigation', { name: '서비스 탐색' })).toHaveCount(0);
  await expect(footer.getByRole('link', { name: 'kjwoo@futur.co.kr' }).first()).toBeVisible();
  await expect(page.locator('[data-landing-cursor-ring], [data-landing-cursor-dot]')).toHaveCount(
    0,
  );

  const centerDelta = await inquiry.evaluate((element) => {
    const label = element.querySelector<HTMLElement>('[data-landing-label]')!;
    const buttonRect = element.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    return Math.abs(
      labelRect.left + labelRect.width / 2 - (buttonRect.left + buttonRect.width / 2),
    );
  });
  expect(centerDelta).toBeLessThanOrEqual(1);

  await page.mouse.move(1, 1);
  await expect(page.locator('[data-landing-page]')).toHaveAttribute(
    'data-landing-interactions-ready',
    'true',
  );
  await inquiry.scrollIntoViewIfNeeded();
  const box = await inquiry.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width * 0.75, box!.y + box!.height * 0.65);
  await expect
    .poll(() =>
      inquiry.evaluate((element) => {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
        return matrix.m41 > 0.5 && matrix.m41 <= 6.1 && matrix.m42 > 0 && matrix.m42 <= 6.1;
      }),
    )
    .toBe(true);

  await page.mouse.move(0, 0);
  await expect
    .poll(() => inquiry.evaluate((element) => getComputedStyle(element).transform))
    .toMatch(/^none$|matrix\(1, 0, 0, 1, 0, 0\)$/);
});

test('keeps legal documents as Korean-named standalone pages with the shared scrollbar', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/privacy');

  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('퓨터(영문명 Futur, 이하 “회사”)', { exact: false })).toBeVisible();
  await expect(page).toHaveTitle('개인정보 처리방침 · 퓨터');
  await expect(page.locator('[data-page-scrollbar-track]')).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('data-page-scrollbar-enabled', 'true');

  const scrollBeforeTrackClick = await page.evaluate(() => window.scrollY);
  await page.locator('[data-page-scrollbar-track]').click({ position: { x: 5, y: 600 } });
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(scrollBeforeTrackClick);

  await page.goto('/terms');
  await expect(page).toHaveURL(/\/terms$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('퓨터(영문명 Futur, 이하 “회사”)', { exact: false })).toBeVisible();
  await expect(page).toHaveTitle('이용약관 · 퓨터');
  await expect(page.locator('[data-page-scrollbar-track]')).toHaveCount(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator('html')).not.toHaveAttribute('data-page-scrollbar-enabled', 'true');
  await expect(page.locator('[data-page-scroll-progress]')).toBeVisible();
  await expect(page.locator('[data-page-scroll-progress]')).toHaveAttribute(
    'data-page-scrollbar-surface',
    'light',
  );
  await expect(page.locator('[data-page-scrollbar-track]')).toHaveCount(1);
  await expect(page.locator('[data-page-scrollbar-track]')).toBeHidden();
});

test('opens legal routes at the top without reverse smooth scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const destination of ['/privacy', '/terms'] as const) {
    await page.goto('/#footer');
    await expect(page.locator(`a[href="${destination}"]`)).toBeVisible();
    await page.waitForFunction((targetPath) => {
      const link = document.querySelector<HTMLAnchorElement>(`a[href="${targetPath}"]`);
      return Boolean(link && Object.keys(link).some((key) => key.startsWith('__reactProps$')));
    }, destination);

    const trace = await page.evaluate(async (targetPath) => {
      const link = document.querySelector<HTMLAnchorElement>(`a[href="${targetPath}"]`);
      if (!link) throw new Error(`legal link is missing: ${targetPath}`);

      link.scrollIntoView({ block: 'center', behavior: 'instant' });
      link.click();

      const frames: Array<{ path: string; y: number }> = [];
      const startedAt = performance.now();
      while (performance.now() - startedAt < 700) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        frames.push({ path: location.pathname, y: Math.round(window.scrollY) });
      }
      return frames;
    }, destination);

    const destinationFrames = trace.filter((frame) => frame.path === destination);
    expect(destinationFrames.length).toBeGreaterThan(0);
    expect([...new Set(destinationFrames.map((frame) => frame.y))]).toEqual([0]);
  }
});
