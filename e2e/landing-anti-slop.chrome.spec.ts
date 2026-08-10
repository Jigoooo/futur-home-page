import { expect, test } from '@playwright/test';

const SECTION_ORDER = [
  'hero',
  'quality',
  'services',
  'review',
  'process',
  'faq',
  'contact',
  'footer',
] as const;

test('keeps only the evidence-backed landing narrative in the approved order', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('[data-landing-section]')).toHaveCount(SECTION_ORDER.length);
  await expect
    .poll(() =>
      page
        .locator('[data-landing-section]')
        .evaluateAll((elements) => elements.map((element) => element.id)),
    )
    .toEqual([...SECTION_ORDER]);

  for (const removedId of ['trust', 'stack', 'cases', 'reviews', 'operations', 'team']) {
    await expect(page.locator(`#${removedId}`)).toHaveCount(0);
  }

  await expect(page.locator('#responsibility')).toHaveCount(0);
  await expect(page.getByText('책임은 역할과 이름으로 확인할 수 있어야 합니다.')).toHaveCount(0);

  for (const removedCopy of [
    '30+',
    '누적 프로젝트',
    '95%+',
    '재의뢰율',
    '온라인 교육 플랫폼 대표',
    '헬스케어 앱 기획 리드',
    'ANONYMIZED WEB PROJECT',
    '예약·결제·관리 흐름을',
    'React Native',
    'Spring Boot',
    '사례 둘러보기',
  ]) {
    await expect(page.getByText(removedCopy, { exact: false })).toHaveCount(0);
  }
});

test('uses the approved navigation anchors and one inquiry-focused hero action', async ({
  page,
}) => {
  await page.goto('/');

  const nav = page.getByRole('navigation', { name: '주요 메뉴' });
  const hrefs = await nav
    .locator('a')
    .evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).getAttribute('href')));

  expect(hrefs).toEqual(['#quality', '#services', '#review', '#process', '#faq', '#contact']);

  const hero = page.locator('#hero');
  await expect(
    hero.getByRole('heading', {
      level: 1,
      name: 'VISIBLE EXPERIENCE. SOUND STRUCTURE.',
    }),
  ).toBeVisible();
  await expect(hero.getByRole('link', { name: '프로젝트 문의하기' })).toBeVisible();
  await expect(hero.getByRole('link')).toHaveCount(1);
});

test('preserves the existing pill button language inside the new composition', async ({ page }) => {
  await page.goto('/');

  const heroButton = page.locator('#hero [data-landing-interactive="button"]');
  await expect(heroButton).toHaveCSS('border-radius', '999px');
  await expect(heroButton).toHaveCSS('min-height', '50px');
  await expect(heroButton.locator('[data-landing-arrow]')).toHaveCSS('border-radius', '999px');
});

test('uses a minimal cursor that adapts to light and dark section surfaces', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await page.mouse.move(96, 180);

  const ring = page.locator('[data-landing-cursor-ring]');
  const dot = page.locator('[data-landing-cursor-dot]');
  await expect(ring).toHaveCount(1);
  await expect(dot).toHaveCount(1);
  await expect(ring.locator('span')).toHaveCount(0);
  await expect(ring).toHaveCSS('width', '24px');
  await expect(ring).toHaveCSS('height', '24px');
  await expect(dot).toHaveCSS('width', '4px');
  await expect(dot).toHaveCSS('height', '4px');
  await expect(ring).toHaveCSS('box-shadow', 'none');
  await expect(dot).toHaveCSS('box-shadow', 'none');

  await page.locator('[data-hero-dark-cursor-surface]').hover();
  await expect(page.locator('body')).toHaveAttribute('data-landing-cursor-contrast', 'light');

  await page.locator('#hero [data-landing-interactive="button"]').hover();
  await expect(page.locator('body')).toHaveAttribute('data-landing-cursor-contrast', 'dark');

  const quality = page.locator('#quality');
  await quality.getByRole('heading', { level: 2 }).hover();
  await expect(page.locator('body')).toHaveAttribute('data-landing-cursor-contrast', 'dark');

  const contact = page.locator('#contact');
  await contact.getByRole('heading', { level: 2 }).hover();
  await expect(page.locator('body')).toHaveAttribute('data-landing-cursor-contrast', 'light');

  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.locator('body')).toHaveAttribute('data-landing-cursor-muted', 'true');
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow')));
  await expect(page.locator('body')).toHaveAttribute('data-landing-cursor-ready', 'true');
  await expect(page.locator('body')).not.toHaveAttribute('data-landing-cursor-muted', 'true');
});

test('keeps the custom cursor disabled for reduced motion and mobile pointers', async ({
  browser,
}) => {
  const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });
  await reducedPage.goto('/');
  await reducedPage.waitForTimeout(800);
  await expect(reducedPage.locator('html')).not.toHaveAttribute(
    'data-landing-cursor-enabled',
    'true',
  );
  await expect(reducedPage.locator('[data-landing-cursor-ring]')).toHaveCount(0);
  await reducedPage.close();

  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('/');
  await mobilePage.waitForTimeout(800);
  await expect(mobilePage.locator('html')).not.toHaveAttribute(
    'data-landing-cursor-enabled',
    'true',
  );
  const mobileRing = mobilePage.locator('[data-landing-cursor-ring]');
  if ((await mobileRing.count()) > 0) await expect(mobileRing).toHaveCSS('display', 'none');
  await mobilePage.close();
});

test('keeps the dark inquiry form readable without reviving rounded white tiles', async ({
  page,
}) => {
  await page.goto('/');

  const form = page.getByRole('form', { name: '프로젝트 상담 양식' });
  const groupLabel = form.locator('[data-contact-group-label]').first();
  const groupHint = groupLabel.locator('small');
  const selectedStage = form.locator('input[name="stage"]:checked + [data-landing-surface]');
  const help = form.locator('[data-contact-help]');
  const message = form.locator('textarea[name="message"]');

  await expect(groupLabel).toHaveCSS('color', 'rgb(223, 231, 225)');
  await expect(groupHint).toHaveCSS('color', 'rgb(158, 172, 165)');
  await expect(help).toHaveCSS('color', 'rgb(184, 197, 190)');
  await expect(selectedStage).toHaveCSS('border-radius', '0px');
  await expect(selectedStage).toHaveCSS('background-image', 'none');
  await expect(selectedStage).not.toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(message).toHaveCSS('color', 'rgb(237, 241, 237)');

  const placeholderColor = await message.evaluate(
    (element) => getComputedStyle(element, '::placeholder').color,
  );
  expect(placeholderColor).toBe('rgb(174, 187, 180)');
});
