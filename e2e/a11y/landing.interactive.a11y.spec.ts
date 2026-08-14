import { test } from './fixtures/a11y-fixture';
import { runA11yScan } from './helpers/run-a11y-scan';

// dev/prod 서버 1개에 대해 인터랙션 spec 을 순차 실행 (병렬 시 race condition)
test.describe.configure({ mode: 'serial' });

test.describe('/ 랜딩 페이지 인터랙티브 상태 a11y', () => {
  test('Technology 전체 기술 펼침', async ({ page }) => {
    await page.goto('/#technology');
    await page.waitForFunction(() => {
      const landing = document.querySelector('[data-landing-page]');
      return landing && Object.keys(landing).some((key) => key.startsWith('__reactProps$'));
    });
    await page.locator('#technology details > summary').click();
    await runA11yScan(page, { include: '#technology' });
  });
});
