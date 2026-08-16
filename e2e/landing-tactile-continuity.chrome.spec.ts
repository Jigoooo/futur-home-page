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
  await expect(services).toHaveCSS('background-color', 'rgb(244, 244, 240)');
  await expect(services.locator('[data-service-card]')).toHaveCount(4);
  await expect(
    services.locator('[data-service-sticky-index], [data-service-surface-gate]'),
  ).toHaveCount(0);
  await expect(services.locator('img, picture, svg')).toHaveCount(0);
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
  await expect(page.locator('[data-page-scrollbar-track]')).toHaveCount(0);
});
