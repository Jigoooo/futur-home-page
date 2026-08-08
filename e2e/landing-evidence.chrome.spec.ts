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

const PROJECT_RECORDS = [
  { tab: '웹 플랫폼', panel: 'record-panel-web', board: '결제·상태 흐름 보드' },
  { tab: '모바일 앱', panel: 'record-panel-mobile', board: '현장 입력 흐름 보드' },
  {
    tab: '업무 시스템',
    panel: 'record-panel-system',
    board: '역할·권한·상태 매트릭스',
  },
  {
    tab: '연동·자동화',
    panel: 'record-panel-automation',
    board: 'API·재시도·로그 지도',
  },
] as const;

async function expectSelectedRecord(page: Page, record: (typeof PROJECT_RECORDS)[number]) {
  const cases = page.locator('#cases');
  await expect(cases.getByRole('tab', { name: record.tab })).toHaveAttribute(
    'aria-selected',
    'true',
  );

  const panel = page.locator(`#${record.panel}`);
  await expect(panel).toBeVisible();
  await expect(panel.getByText(record.board, { exact: true })).toBeVisible();
}

async function waitForLandingReady(page: Page) {
  await expect(page.locator('body')).toHaveAttribute('data-landing-ready', 'true');
}

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
  const cases = page.locator('#cases');
  await expect(cases.locator('[data-stack-tag]')).toHaveCount(0);
  await expect(cases.getByText(/Payment|Camera|Admin Web|RBAC|Queue/, { exact: true })).toHaveCount(
    0,
  );
  await expect(cases.getByText('STACK', { exact: true })).toHaveCount(0);
});

test('does not promise fixed communication cadence or hard support SLAs', async ({ page }) => {
  await page.goto('/');
  await waitForLandingReady(page);

  await expect(
    page.getByText(/일일 단위|매일 업데이트|24\/7|SLA|4시간 내|24시간 이내/),
  ).toHaveCount(0);
  await page.getByRole('button', { name: '의사소통은 어떻게 진행되나요?' }).click();
  await expect(page.getByText(/프로젝트에서 합의한 주기/)).toBeVisible();
});

test('exposes every project record through working pointer and keyboard tabs', async ({ page }) => {
  await page.goto('/');
  await waitForLandingReady(page);

  const cases = page.locator('#cases');
  const tab = (name: string) => cases.getByRole('tab', { name });

  for (const record of PROJECT_RECORDS) {
    await tab(record.tab).click();
    await expectSelectedRecord(page, record);
  }

  await tab(PROJECT_RECORDS[3].tab).press('Home');
  await expectSelectedRecord(page, PROJECT_RECORDS[0]);

  for (let index = 1; index < PROJECT_RECORDS.length; index += 1) {
    await tab(PROJECT_RECORDS[index - 1].tab).press('ArrowRight');
    await expectSelectedRecord(page, PROJECT_RECORDS[index]);
  }

  await tab(PROJECT_RECORDS[3].tab).press('ArrowRight');
  await expectSelectedRecord(page, PROJECT_RECORDS[0]);

  await tab(PROJECT_RECORDS[0].tab).press('ArrowLeft');
  await expectSelectedRecord(page, PROJECT_RECORDS[3]);

  await tab(PROJECT_RECORDS[3].tab).press('Home');
  await expectSelectedRecord(page, PROJECT_RECORDS[0]);

  await tab(PROJECT_RECORDS[0].tab).press('End');
  await expectSelectedRecord(page, PROJECT_RECORDS[3]);
});

test('exposes artifact board structure to assistive technology', async ({ page }) => {
  await page.goto('/');
  await waitForLandingReady(page);

  const cases = page.locator('#cases');
  const artifactIcons = cases.locator('[data-artifact-board] figcaption > span');
  await expect(artifactIcons).toHaveText(['WEB', 'APP', 'SYS', 'API']);
  for (const icon of await artifactIcons.all()) {
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
  }
  const webPanel = page.locator('#record-panel-web');
  const webFlow = webPanel.getByRole('list', { name: '결제·상태 흐름' });
  await expect(webFlow).toBeVisible();
  await expect(webFlow.getByRole('listitem').first()).toContainText('신청 정보');
  await expect(webPanel.locator('dl')).toBeVisible();
  await expect(webPanel.locator('dt').first()).toHaveText('영역 1');
  await expect(webPanel.locator('dd').first()).toHaveText('사용자');
  await expect(webPanel.getByText('STRUCTURE', { exact: true })).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  await expect(webPanel.locator('dl[aria-hidden="true"], ol[aria-hidden="true"]')).toHaveCount(0);

  await cases.getByRole('tab', { name: '업무 시스템' }).click();
  const systemPanel = page.locator('#record-panel-system');
  const permissionsTable = systemPanel.getByRole('table', {
    name: '역할·권한·상태 매트릭스',
  });
  await expect(permissionsTable).toBeVisible();
  await expect(permissionsTable.getByRole('row', { name: /03 완료 승인 · 이력/ })).toBeVisible();
  await expect(systemPanel.getByText('STRUCTURE', { exact: true })).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  await expect(
    systemPanel.locator('dl[aria-hidden="true"], table[aria-hidden="true"]'),
  ).toHaveCount(0);
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
  await waitForLandingReady(page);

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
  const mobileCta = menu.getByRole('link', { name: '문의하기' });
  await expect(mobileCta).toBeVisible();
  await expect(mobileCta).toHaveCSS('color', 'rgb(255, 255, 255)');

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
