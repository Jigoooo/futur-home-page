import { test } from './fixtures/a11y-fixture';
import { runA11yScan } from './helpers/run-a11y-scan';

test.describe('/ 랜딩 페이지 정적 스캔', () => {
  test('전체 페이지 — axe-core WCAG 2.2 AA + best-practice', async ({ page }) => {
    await page.goto('/');
    await runA11yScan(page);
  });

  /**
   * id 가 부여된 섹션만 단독 스캔 (랜딩 페이지의 nav 앵커 대상).
   * 단독 스캔은 섹션별 회귀 격리에 유리하다 — 특정 컴포넌트가 위반을 일으키면
   * 전체 스캔보다 빠르게 위치를 좁혀준다.
   */
  const sections = [
    { id: '#quality', name: '품질 기준' },
    { id: '#services', name: '제공 영역' },
    { id: '#review', name: '검토 방식' },
    { id: '#process', name: '진행 방식' },
    { id: '#faq', name: 'FAQ(첫 항목만 펼침)' },
    { id: '#contact', name: 'Contact(초기 상태)' },
  ] as const;

  for (const { id, name } of sections) {
    test(`섹션 단독 — ${name}`, async ({ page }) => {
      await page.goto('/');
      await page.locator(id).scrollIntoViewIfNeeded();
      await runA11yScan(page, { include: id });
    });
  }
});
