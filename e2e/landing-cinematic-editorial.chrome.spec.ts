import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

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

test('renders only the controller-verified Korean copy while preserving fixed contracts', async ({
  page,
}) => {
  await page.goto('/');

  const expectedCopy = [
    [
      '#hero',
      '화면에 보이는 경험부터 코드와 데이터, 배포 뒤 운영까지 함께 봅니다. 다음 변화에도 흔들리지 않을 디지털 제품을 만듭니다.',
    ],
    ['#services', '화면 경험, 코드와 데이터 구조, 배포 후 운영을 따로 떼어 보지 않습니다.'],
    ['#services', '반복 업무와 관리 기준을 정리하고, 필요한 화면과 데이터 구조를 만듭니다.'],
    ['#services', '배포 뒤 생기는 오류를 살피고 기능 개선과 운영 점검을 이어갑니다.'],
    [
      '#review',
      '목적과 범위를 먼저 맞춥니다. 실제 흐름과 운영 조건을 살피고, 선택한 방향과 근거를 기록합니다.',
    ],
    ['#review', '해결할 문제를 먼저 확인하고, 이번 작업에서 다룰 범위를 나눕니다.'],
    ['#review', '정상 동작과 함께 실패·복구, 운영 중 살펴야 할 조건까지 검토합니다.'],
    ['#review', '선택한 방향과 제외한 범위, 판단 근거를 기록해 다음 결정에 활용합니다.'],
    [
      '#process',
      '필요한 범위와 기준부터 맞춥니다. 설계·구현·검토에서 확인한 내용은 다음 단계에 반영합니다.',
    ],
    ['#process', '현재 상황, 만들고 싶은 결과, 주요 사용자를 확인합니다.'],
    ['#process', '주요 사용 흐름을 살피고 발견한 문제를 수정합니다.'],
    ['#process', '배포 조건을 확인한 뒤 서비스를 배포하고, 운영 단계의 변경을 관리합니다.'],
    ['#faq', '문의 전에 많이 확인하는 내용을 모았습니다.'],
    [
      '#faq',
      '문의 양식에서 현재 단계와 필요한 영역을 선택한 뒤, 알고 있는 내용을 적어 보내주세요. 세부 범위는 보내주신 내용을 보고 확인합니다.',
    ],
    [
      '#faq',
      '요청 범위와 일정, 외부 연동, 운영 조건을 확인한 뒤 협의합니다. 문의 양식에 예산 범위를 남겨주시면 검토할 때 참고합니다.',
    ],
    [
      '#faq',
      'NDA가 필요하면 문의 내용에 적어주세요. 자료를 전달하고 보관하는 방식은 프로젝트 조건과 적용 범위를 확인해 협의합니다.',
    ],
    [
      '#faq',
      '범위와 연동 조건, 검토 절차에 따라 달라집니다. 문의 내용을 확인하고 일정 산정에 필요한 항목을 정리합니다.',
    ],
  ] as const;

  for (const [section, copy] of expectedCopy) {
    await expect(page.locator(section).getByText(copy, { exact: true })).toHaveCount(1);
  }

  await expect(
    page.getByRole('heading', { level: 1, name: 'BUILT FOR WHAT’S NEXT.' }),
  ).toBeVisible();
  await expect(page.locator('#contact').getByText('프로젝트 문의', { exact: true })).toBeVisible();
  await expect(
    page.locator('#contact').getByRole('heading', {
      name: '만들거나 개선하려는 제품을 알려주세요.',
    }),
  ).toBeVisible();
  await expect(
    page
      .locator('#contact')
      .getByText('현재 상황과 필요한 범위를 적어주시면 확인 후 연락드리겠습니다.', {
        exact: true,
      }),
  ).toBeVisible();
  await expect(page.locator('[data-cursor-text], [data-editorial-chapter]')).toHaveCount(0);
});

test('preserves in-view reveal targets and tablet navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 720 });
  await page.goto('/');

  expect(
    await page
      .locator('[data-editorial-trigger="in-view"]')
      .evaluateAll((elements) =>
        elements.every((element) => element.dataset.landingReveal === 'editorial'),
      ),
  ).toBe(true);
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
  expect(
    await scrollTop.evaluate((node) => {
      const style = getComputedStyle(node);
      const properties = style.transitionProperty.split(',').map((value) => value.trim());
      const durations = style.transitionDuration.split(',').map((value) => value.trim());

      return properties.some(
        (property, index) => property === 'transform' && durations[index] === '0.28s',
      );
    }),
  ).toBe(true);

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

test('keeps major editorial and contact titles within the approved scale', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');

  for (const heading of await page.locator('#services h2, #faq h2').all()) {
    expect(
      Number.parseFloat(await heading.evaluate((node) => getComputedStyle(node).fontSize)),
    ).toBeLessThanOrEqual(55);
  }

  const contactTitle = page.locator('#contact h2');
  expect(
    Number.parseFloat(await contactTitle.evaluate((node) => getComputedStyle(node).fontSize)),
  ).toBeLessThanOrEqual(48);
});

test('uses the approved cinematic editorial information architecture', async ({ page }) => {
  await page.goto('/');

  const sectionIds = await page
    .locator('[data-landing-section]')
    .evaluateAll((sections) => sections.map((section) => section.id));
  expect(sectionIds).toEqual([
    'hero',
    'quality',
    'services',
    'review',
    'process',
    'faq',
    'contact',
    'footer',
  ]);

  const navHrefs = await page
    .getByRole('navigation', { name: '주요 메뉴' })
    .locator('a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(navHrefs).toEqual(['#quality', '#services', '#review', '#process', '#faq', '#contact']);

  await expect(page.locator('#responsibility')).toHaveCount(0);
  await expect(page.getByText('책임은 역할과 이름으로 확인할 수 있어야 합니다.')).toHaveCount(0);
});

test('loads scene motion lazily and preserves the reduced-motion final state', async ({
  browser,
  page,
}) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.goto('/');

  await expect(page.locator('[data-landing-page]')).toHaveAttribute(
    'data-landing-scene-motion',
    'ready',
  );

  await page.reload();
  await expect(page.locator('[data-landing-page]')).toHaveAttribute(
    'data-landing-scene-motion',
    'ready',
  );
  expect(runtimeErrors).toEqual([]);

  const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });

  await reducedPage.goto('/');
  await expect(reducedPage.locator('[data-landing-page]')).not.toHaveAttribute(
    'data-landing-scene-motion',
    'ready',
  );
  await expect(
    reducedPage.getByRole('heading', { level: 1, name: 'BUILT FOR WHAT’S NEXT.' }),
  ).toBeVisible();

  await reducedPage.close();
});

test('uses one rounded solid quality stage instead of ledger rows', async ({ page }) => {
  await page.goto('/');

  const quality = page.locator('#quality');
  await expect(quality.locator('[data-quality-stage]')).toHaveCount(1);
  await expect(quality.locator('[data-quality-orb]')).toHaveCount(2);
  await expect(quality.locator('[data-quality-copy]')).toHaveCount(1);
  await expect(quality.locator('article')).toHaveCount(0);
  expect(
    Number.parseFloat(
      await quality
        .locator('[data-quality-stage]')
        .evaluate((node) => getComputedStyle(node).borderRadius),
    ),
  ).toBeGreaterThanOrEqual(32);
});

test('keeps the decorative quality stage visible without scene motion for reduced motion', async ({
  browser,
}) => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });

  await page.goto('/');

  await expect(page.locator('[data-landing-page]')).not.toHaveAttribute(
    'data-landing-scene-motion',
    'ready',
  );
  await expect(page.locator('[data-quality-copy]')).toBeVisible();
  await expect(page.locator('[data-quality-stage]')).toBeVisible();

  await page.close();
});

test('merges four service layers into one product core without an orbit', async ({ page }) => {
  await page.goto('/');

  const services = page.locator('#services');
  await expect(
    services.getByRole('heading', { name: '필요한 영역을 연결해 하나의 제품으로 만듭니다.' }),
  ).toBeVisible();
  await expect(services.locator('[data-service-merge]')).toHaveCount(1);
  await expect(services.locator('[data-service-layer]')).toHaveCount(4);
  await expect(services.locator('[data-service-core]')).toHaveCount(1);
  await expect(services.locator('[data-service-row]')).toHaveCount(4);
  await expect(services.locator('[data-service-orbit]')).toHaveCount(0);
});

test('keeps the completed service merge visible without scene motion for reduced motion', async ({
  browser,
}) => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });

  await page.goto('/');

  await expect(page.locator('[data-landing-page]')).not.toHaveAttribute(
    'data-landing-scene-motion',
    'ready',
  );
  await expect(page.locator('[data-service-merge]')).toBeVisible();
  await expect(page.locator('[data-service-core]')).toBeVisible();
  await expect(page.locator('[data-service-row]')).toHaveCount(4);

  await page.close();
});

test('keeps the service scene within the mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const services = page.locator('#services');
  expect(await services.evaluate((section) => section.scrollWidth <= section.clientWidth)).toBe(
    true,
  );
});

test('renders the completed service scene before JavaScript enhancement', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('/');

  await expect(page.locator('[data-service-merge]')).toBeVisible();
  await expect(page.locator('[data-service-core]')).toBeVisible();
  await expect(page.locator('[data-service-row]')).toHaveCount(4);
  await expect(page.locator('[data-service-row]').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-service-row]').first()).toHaveCSS('clip-path', 'none');

  await context.close();
});

test('uses a service-specific inline reveal instead of a generic row fade-up', async () => {
  const motionSource = await readFile(
    new URL('../src/pages/landing/ui/use-landing-scene-motion.ts', import.meta.url),
    'utf8',
  );

  expect(motionSource).toContain('clipPath');
  expect(motionSource).not.toMatch(/\.from\(rows, \{[^}]*\by:/s);
  expect(motionSource).not.toMatch(/\.from\(rows, \{[^}]*\bopacity:/s);
});

test('uses a curved review mask and a semantic process path', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('[data-review-stage]')).toHaveCount(1);
  await expect(page.locator('[data-review-mask]')).toHaveCount(1);
  await expect(page.locator('[data-review-group]')).toHaveCount(4);

  const path = page.locator('svg [data-process-path]');
  await expect(path).toHaveCount(1);
  await expect(page.locator('[data-process-marker]')).toHaveCount(1);
  await expect(page.locator('ol [data-process-step]')).toHaveCount(5);
  expect(
    await page
      .locator('#review, #process')
      .evaluateAll((sections) =>
        sections.every((section) => getComputedStyle(section).scrollSnapAlign !== 'start'),
      ),
  ).toBe(true);
});

test('keeps the Review and Process scenes restrained, semantic, and accessible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');

  const headings = page.locator('#review h2, #process h2');
  for (const heading of await headings.all()) {
    const { fontSize, letterSpacing } = await heading.evaluate((node) => {
      const style = getComputedStyle(node);
      return { fontSize: Number.parseFloat(style.fontSize), letterSpacing: style.letterSpacing };
    });
    expect(fontSize).toBeLessThanOrEqual(55);
    expect(Number.parseFloat(letterSpacing)).toBeGreaterThanOrEqual(fontSize * -0.04);
  }

  await expect(page.locator('[data-review-stage]')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('[data-review-mask]')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('svg:has([data-process-path])')).toHaveAttribute('aria-hidden', 'true');
});

test('keeps Review and Process final content visible without scene motion or JavaScript', async ({
  browser,
}) => {
  const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });
  await reducedPage.goto('/');

  await expect(reducedPage.locator('[data-landing-page]')).not.toHaveAttribute(
    'data-landing-scene-motion',
    'ready',
  );
  await expect(reducedPage.locator('[data-review-group]')).toHaveCount(4);
  await expect(reducedPage.locator('[data-review-group]').first()).toBeVisible();
  await expect(reducedPage.locator('[data-process-step]')).toHaveCount(5);
  await expect(reducedPage.locator('[data-process-step]').first()).toBeVisible();
  await expect(reducedPage.locator('[data-process-path]')).toBeVisible();
  await reducedPage.close();

  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  await staticPage.goto('/');

  await expect(staticPage.locator('[data-review-stage]')).toBeVisible();
  await expect(staticPage.locator('[data-review-mask]')).toBeVisible();
  await expect(staticPage.locator('[data-review-group]')).toHaveCount(4);
  await expect(staticPage.locator('[data-process-path]')).toBeVisible();
  await expect(staticPage.locator('[data-process-step]')).toHaveCount(5);
  await staticContext.close();
});

test('keeps Review and Process scenes within the mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  expect(
    await page.locator('#review, #process').evaluateAll((sections) =>
      sections.map((section) => ({
        id: section.id,
        fits: section.scrollWidth <= section.clientWidth,
      })),
    ),
  ).toEqual([
    { id: 'review', fits: true },
    { id: 'process', fits: true },
  ]);
});

test('uses the approved inquiry copy in one rounded dark contact surface', async ({ page }) => {
  await page.goto('/');

  const contact = page.locator('#contact');
  await expect(contact.getByText('프로젝트 문의', { exact: true })).toBeVisible();
  await expect(
    contact.getByRole('heading', { name: '만들거나 개선하려는 제품을 알려주세요.' }),
  ).toBeVisible();
  await expect(
    contact.getByText('현재 상황과 필요한 범위를 적어주시면 확인 후 연락드리겠습니다.', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(contact.getByText('START A PROJECT', { exact: true })).toHaveCount(0);
  await expect(contact.getByText('프로젝트 이야기를 들려주세요.', { exact: true })).toHaveCount(0);

  const surface = contact.locator('[data-contact-surface]');
  await expect(surface).toHaveCount(1);
  expect(
    Number.parseFloat(await surface.evaluate((node) => getComputedStyle(node).borderRadius)),
  ).toBeGreaterThanOrEqual(40);
  await expect(surface.locator('[data-contact-group]')).toHaveCount(5);
  expect(
    Number.parseFloat(
      await contact
        .locator('[data-contact-stage-grid] [data-landing-surface]')
        .first()
        .evaluate((node) => getComputedStyle(node).borderRadius),
    ),
  ).toBeLessThanOrEqual(18);
});

test('uses semantic nested cursor tones for the contact surface and its CTA', async ({ page }) => {
  await page.goto('/');

  const contact = page.locator('#contact');
  await expect(contact).toHaveAttribute('data-cursor-contrast', 'light');
  await expect(contact.locator('[data-contact-surface]')).toHaveAttribute(
    'data-cursor-contrast',
    'light',
  );
  await expect(contact.getByRole('link', { name: '메일로 문의' })).toHaveAttribute(
    'data-cursor-contrast',
    'dark',
  );

  await expect(contact.locator('[data-landing-contact-form]')).toHaveAttribute(
    'data-cursor-contrast',
    'light',
  );
});

test('keeps the contact surface compact and solid on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const surface = page.locator('[data-contact-surface]');
  expect(
    Number.parseFloat(await surface.evaluate((node) => getComputedStyle(node).borderRadius)),
  ).toBeGreaterThanOrEqual(30);
  await expect(surface.locator('[style*="background: white" i]')).toHaveCount(0);
  expect(
    await surface
      .locator('[data-landing-contact-form] input, [data-landing-contact-form] textarea')
      .evaluateAll((controls) =>
        controls.every(
          (control) => getComputedStyle(control).backgroundColor === 'rgba(0, 0, 0, 0)',
        ),
      ),
  ).toBe(true);
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
  await assertTone(page.locator('#quality'), 'dark');
  await assertTone(page.locator('[data-contact-surface]'), 'light');
  await assertTone(page.getByRole('link', { name: '메일로 문의' }), 'dark');
  await assertTone(page.locator('[data-landing-contact-form]'), 'light');

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
