import { expect, test, type Page } from '@playwright/test';

async function waitForLandingReady(page: Page) {
  await page.waitForFunction(() => document.body.dataset.landingReady === 'true');
}

test('uses a minimal editorial hero and a heading-free record row', async ({ page }) => {
  await page.goto('/');
  await waitForLandingReady(page);

  const hero = page.locator('[data-landing-hero]');
  const logo = page.getByRole('link', { name: 'FUTUR home' });

  await expect(logo).toHaveText('FUTUR');
  await expect(hero.getByText('SI · 웹/앱/업무 시스템 개발')).toHaveCount(0);
  await expect(page.getByAltText(/FUTUR 서비스 화면 예시/)).toHaveCount(0);
  await expect(hero.getByText('흐름 정리')).toHaveCount(0);
  await expect(hero.getByText('연동 설계')).toHaveCount(0);
  await expect(hero.getByText('현장 앱')).toHaveCount(0);
  await expect(hero.getByText('운영 지원')).toHaveCount(0);
  await expect(hero.getByText('기획 전 상담 가능')).toHaveCount(0);
  await expect(hero.getByText('범위·일정 투명화')).toHaveCount(0);
  await expect(hero.getByText('운영까지 고려')).toHaveCount(0);

  const records = page.getByRole('region', { name: '함께한 기록' });
  await expect(records).toBeVisible();
  await expect(records.getByRole('heading')).toHaveCount(0);
  await expect(records.getByText('Why FUTUR')).toHaveCount(0);
  await expect(records.getByText('숫자로 보는 함께한 시간.')).toHaveCount(0);
  await expect(records.getByText('운영까지 함께')).toHaveCount(0);
  await expect(records.getByText('배포 이후도 함께')).toHaveCount(0);
  await expect(records.getByText('계속 함께하는 이유')).toHaveCount(0);
  await expect(records.getByText('빠른 첫 답변')).toHaveCount(0);

  for (const [value, label] of [
    ['30+', '누적 프로젝트'],
    ['4년+', '평균 운영 동행'],
    ['95%+', '재의뢰율'],
    ['24h', '평균 회신'],
  ]) {
    await expect(records.getByText(value, { exact: true })).toBeVisible();
    await expect(records.getByText(label, { exact: true })).toBeVisible();
  }

  const heroAnimations = await hero.evaluate((element) =>
    element.getAnimations({ subtree: true }).map((animation) => {
      const timing = animation.effect?.getComputedTiming();

      return {
        duration: Number(timing?.duration ?? 0),
        iterations: Number(timing?.iterations ?? 0),
      };
    }),
  );

  expect(heroAnimations.every(({ duration }) => duration <= 650)).toBe(true);
  expect(heroAnimations.every(({ iterations }) => iterations <= 1)).toBe(true);
});

test('retains the original sections and Resend consent disclosures', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('[data-delivery-map]')).toHaveCount(0);
  await expect(page.getByText('Review', { exact: true })).toBeVisible();
  await expect(page.getByText('Stack', { exact: true })).toBeVisible();
  await expect(page.getByText('Process', { exact: true })).toBeVisible();
  await expect(page.getByText('Operations', { exact: true })).toBeVisible();

  const form = page.getByRole('form', { name: '프로젝트 상담 양식' });
  await expect(
    form.getByRole('checkbox', { name: '개인정보 수집·이용에 동의합니다.' }),
  ).toBeVisible();
  await expect(form.getByRole('list', { name: '개인정보 수집·이용 고지' })).toBeVisible();
  await expect(
    form.getByRole('checkbox', { name: '개인정보 국외 이전에 동의합니다.' }),
  ).toBeVisible();
  await expect(form.getByRole('list', { name: '개인정보 국외 이전 고지' })).toBeVisible();
});

test('uses a two-by-two record grid at tablet and mobile widths', async ({ page }) => {
  for (const viewport of [
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await waitForLandingReady(page);

    const positions = await page
      .getByRole('region', { name: '함께한 기록' })
      .locator('dl > div')
      .evaluateAll((elements) =>
        elements.map((element) => ({
          left: (element as HTMLElement).offsetLeft,
          top: (element as HTMLElement).offsetTop,
        })),
      );

    expect(new Set(positions.map(({ left }) => left)).size).toBe(2);
    expect(new Set(positions.map(({ top }) => top)).size).toBe(2);
  }
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('removes spatial motion from the hero and record row', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForLandingReady(page);

    await expect
      .poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
      .toBe(true);

    const heroMotion = await page
      .locator('[data-landing-hero]')
      .locator('h1 > span > span, p, [class*="heroActions"]')
      .evaluateAll((elements) =>
        elements.map((element) => {
          const style = getComputedStyle(element);

          return {
            animationName: style.animationName,
            transform: style.transform,
          };
        }),
      );

    expect(
      heroMotion.every(({ animationName }) => !/hero(?:Line|Fade)In/.test(animationName)),
    ).toBe(true);
    expect(heroMotion.every(({ transform }) => transform === 'none')).toBe(true);

    const recordTransform = await page
      .getByRole('region', { name: '함께한 기록' })
      .locator('dl')
      .evaluate((element) => getComputedStyle(element).transform);

    expect(recordTransform).toBe('none');
  });
});
