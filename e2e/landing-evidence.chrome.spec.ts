import { expect, test, type Page } from '@playwright/test';

const SECTION_ORDER = [
  'hero',
  'why',
  'records',
  'services',
  'delivery',
  'team',
  'faq',
  'contact',
] as const;

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    body: document.body.scrollWidth - document.body.clientWidth,
  }));

  expect(overflow).toEqual({ document: 0, body: 0 });
}

test('presents the approved evidence-first section order without obsolete sections', async ({
  page,
}) => {
  await page.goto('/');

  const sectionOrder = await page
    .locator('main > [data-landing-section]')
    .evaluateAll((sections) =>
      sections.map((section) => section.getAttribute('data-landing-section')),
    );

  expect(sectionOrder).toEqual(SECTION_ORDER);
  await expect(page.getByText('Reviews', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Stack', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Process', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Operations', { exact: true })).toHaveCount(0);
});

test('uses qualitative evidence and semantic artifact boards instead of generated proof', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.locator('img[src*="/landing/"]')).toHaveCount(0);
  await expect(
    page.getByText(/30\+|95%\+|24h|24\/7|4시간 내|100%|8주|6주|12\+|14\+|8\+/),
  ).toHaveCount(0);
  await expect(page.locator('[data-artifact-board]')).toHaveCount(4);
  expect(
    await page.locator('[data-artifact-board]').evaluateAll((boards) =>
      boards.map((board) => ({
        tag: board.tagName,
        caption: board.querySelector('figcaption')?.textContent?.trim(),
      })),
    ),
  ).toEqual([
    { tag: 'FIGURE', caption: expect.stringContaining('결제·상태 흐름 보드') },
    { tag: 'FIGURE', caption: expect.stringContaining('현장 입력 흐름 보드') },
    { tag: 'FIGURE', caption: expect.stringContaining('역할·권한·상태 매트릭스') },
    { tag: 'FIGURE', caption: expect.stringContaining('API·재시도·로그 지도') },
  ]);
  await expect(page.locator('#cases [data-stack-tag]').first()).toBeVisible();
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
]) {
  test(`keeps the delivery map visible without overflow at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const deliveryMap = page.locator('[data-delivery-map]');
    await expect(deliveryMap).toBeVisible();
    await expect(deliveryMap.locator('figcaption')).toHaveText('FUTUR 프로젝트 전달 지도');
    await expect(deliveryMap.getByText('문제 · 사용자 흐름')).toBeVisible();
    await expect(deliveryMap.getByText('화면 · 데이터 구조')).toBeVisible();
    await expect(deliveryMap.getByText('배포 · 운영 기준')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
}

test('opens an accessible mobile menu with navigation and contact action', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const menuButton = page.locator('button[aria-controls="mobile-menu"]');
  await expect(menuButton).toBeVisible();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await menuButton.click();

  const menu = page.getByRole('dialog', { name: '모바일 메뉴' });
  await expect(menu).toBeVisible();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  await expect(menu.getByRole('link', { name: '프로젝트 기록' })).toBeVisible();
  await expect(menu.getByRole('link', { name: '문의하기' })).toBeVisible();

  await page.getByRole('button', { name: '메뉴 닫기' }).click();
  await expect(menu).toBeHidden();
  await expectNoHorizontalOverflow(page);
});
