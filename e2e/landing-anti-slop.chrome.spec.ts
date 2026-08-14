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

test('routes accordion FAQ inquiries through the factual Footer action without stale form copy', async ({
  page,
}) => {
  await page.goto('/');

  const faq = page.locator('#faq');
  await expect(faq).not.toContainText('문의 양식');
  await expect(faq.locator('[data-faq-item]')).toHaveCount(6);
  await expect(faq.locator('[data-faq-trigger]')).toHaveCount(6);
  await expect(faq.locator('[data-faq-trigger]').first()).toHaveAttribute('aria-expanded', 'true');
  await expect(
    faq.getByRole('heading', { level: 3, name: '기획서가 없어도 문의할 수 있나요?' }),
  ).toBeVisible();
  await expect(faq).toContainText('만들고 싶은 서비스나 해결하려는 문제를 가능한 한 자세히');
  await expect(faq).toContainText('서비스·SaaS·솔루션 개발');
  await expect(faq).toContainText('AI 통합·업무 혁신(AX)');
  await expect(
    faq.getByRole('heading', {
      level: 3,
      name: '운영 중인 서비스나 시스템도 맡길 수 있나요?',
    }),
  ).toBeVisible();
  await expect(faq).not.toContainText('NDA');
  await expect(faq).toContainText('이미 사용 중인 웹·앱, SaaS, 업무 시스템과 솔루션');
  await expect(faq).toContainText('기존 시스템이나 외부 서비스와 연동할 수 있나요?');
  await expect(faq).toContainText('AI 기능은 어떤 방식으로 도입하나요?');
  await expect(faq).toContainText('프로젝트는 어떤 방식으로 진행되나요?');
  await expect(
    page.locator('#footer').getByRole('link', { name: '문의하기', exact: true }),
  ).toHaveAttribute('href', 'mailto:kjwoo@futur.co.kr');
  await expect(page.locator('#footer a[href="mailto:kjwoo@futur.co.kr"]')).not.toHaveCount(0);
});
