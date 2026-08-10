import { expect, test } from '@playwright/test';

const SECTION_ORDER = [
  'hero',
  'services',
  'stack',
  'team',
  'process',
  'operations',
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

  for (const removedId of ['trust', 'cases', 'reviews', 'quality', 'review']) {
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
    '완료 프로젝트',
    '평균 회신 24시간',
    '빠른 범위 검토',
    '4시간 응답',
    '자동 NDA',
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

  expect(hrefs).toEqual(['#services', '#stack', '#team', '#process', '#faq', '#contact']);

  const hero = page.locator('#hero');
  await expect(hero.getByRole('link', { name: '프로젝트 문의하기' })).toBeVisible();
  await expect(hero.getByRole('link')).toHaveCount(1);
});
