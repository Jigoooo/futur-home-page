import { expect, test } from '@playwright/test';

const SECTION_ORDER = ['hero', 'services', 'technology', 'faq', 'footer'] as const;

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
    '사례 둘러보기',
  ]) {
    await expect(page.getByText(removedCopy, { exact: false })).toHaveCount(0);
  }
});

test('uses only the approved navigation anchors and removes the Hero action', async ({ page }) => {
  await page.goto('/');

  const nav = page.getByRole('navigation', { name: '주요 메뉴' });
  const hrefs = await nav
    .locator('a')
    .evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).getAttribute('href')));

  expect(hrefs).toEqual(['#services', '#technology', '#faq', '#footer']);

  const hero = page.locator('#hero');
  await expect(hero.getByRole('link')).toHaveCount(0);
});

test('routes FAQ inquiries through the factual Footer email without stale form copy', async ({
  page,
}) => {
  await page.goto('/');

  const faq = page.locator('#faq');
  await expect(faq).not.toContainText('문의 양식');

  const planningQuestion = faq.getByRole('button', { name: '기획서가 없어도 문의할 수 있나요?' });
  const costQuestion = faq.getByRole('button', { name: '비용과 일정은 어떻게 정해지나요?' });
  await expect(planningQuestion).toBeVisible();
  await expect(costQuestion).toBeVisible();
  await costQuestion.click();

  await expect(faq).toContainText('페이지 하단 이메일 kjwoo@futur.co.kr');
  await expect(page.locator('#footer a[href="mailto:kjwoo@futur.co.kr"]')).not.toHaveCount(0);
});
