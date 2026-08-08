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

test('does not promise fixed communication cadence or hard support SLAs', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByText(/일일 단위|매일 업데이트|24\/7|SLA|4시간 내|24시간 이내/),
  ).toHaveCount(0);
  await page.getByRole('button', { name: '의사소통은 어떻게 진행되나요?' }).click();
  await expect(page.getByText(/프로젝트에서 합의한 주기/)).toBeVisible();
});

test('exposes every project record through working pointer and keyboard tabs', async ({ page }) => {
  await page.goto('/');

  const cases = page.locator('#cases');
  const tab = (name: string) => cases.getByRole('tab', { name });
  const records = [
    { tab: '웹 플랫폼', panel: 'record-panel-web', board: '결제·상태 흐름 보드', stack: 'Payment' },
    { tab: '모바일 앱', panel: 'record-panel-mobile', board: '현장 입력 흐름 보드', stack: 'Expo' },
    {
      tab: '업무 시스템',
      panel: 'record-panel-system',
      board: '역할·권한·상태 매트릭스',
      stack: 'RBAC',
    },
    {
      tab: '연동·자동화',
      panel: 'record-panel-automation',
      board: 'API·재시도·로그 지도',
      stack: 'Queue',
    },
  ] as const;

  for (const record of records) {
    const recordTab = tab(record.tab);
    await recordTab.click();
    await expect(recordTab).toHaveAttribute('aria-selected', 'true');
    const panel = page.locator(`#${record.panel}`);
    await expect(panel).toBeVisible();
    await expect(panel.getByText(record.board, { exact: true })).toBeVisible();
    await expect(panel.locator('[data-stack-tag]', { hasText: record.stack })).toBeVisible();
  }

  const automationTab = tab('연동·자동화');
  await automationTab.press('Home');
  await expect(tab('웹 플랫폼')).toHaveAttribute('aria-selected', 'true');
  await tab('웹 플랫폼').press('ArrowRight');
  await expect(tab('모바일 앱')).toHaveAttribute('aria-selected', 'true');
  await tab('모바일 앱').press('End');
  await expect(automationTab).toHaveAttribute('aria-selected', 'true');
});

test('exposes artifact board structure to assistive technology', async ({ page }) => {
  await page.goto('/');

  const cases = page.locator('#cases');
  const webPanel = page.locator('#record-panel-web');
  await expect(webPanel.getByRole('list', { name: '결제·상태 흐름' })).toBeVisible();
  await expect(webPanel.locator('dl')).toBeVisible();
  await expect(webPanel.locator('[data-artifact-board] [aria-hidden="true"]')).toHaveCount(0);

  await cases.getByRole('tab', { name: '업무 시스템' }).click();
  const systemPanel = page.locator('#record-panel-system');
  await expect(systemPanel.getByRole('table', { name: '역할·권한·상태 매트릭스' })).toBeVisible();
  await expect(systemPanel.locator('[data-artifact-board] [aria-hidden="true"]')).toHaveCount(0);
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

test('opens a keyboard-safe mobile disclosure menu and restores trigger focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const menuButton = page.locator('button[aria-controls="mobile-menu"]');
  await expect(menuButton).toBeVisible();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await menuButton.click();

  const menu = page.getByRole('navigation', { name: '모바일 메뉴' });
  await expect(menu).toBeVisible();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  const firstLink = menu.getByRole('link', { name: '프로젝트 기록' });
  await expect(firstLink).toBeVisible();
  await expect(firstLink).toBeFocused();
  await expect(menu.getByRole('link', { name: '문의하기' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(menuButton).toBeFocused();
  await expectNoHorizontalOverflow(page);
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`keeps standard contact and footer surfaces within 20-28px radius at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const surfaces = page.locator('[data-standard-surface]');
    await expect(surfaces).toHaveCount(4);
    const radii = await surfaces.evaluateAll((elements) =>
      elements.map((element) => Number.parseFloat(getComputedStyle(element).borderTopLeftRadius)),
    );
    expect(radii.every((radius) => radius >= 20 && radius <= 28)).toBe(true);
  });
}
