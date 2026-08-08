import { expect, test, type Page } from '@playwright/test';

async function completeContactForm(page: Page, email: string) {
  const form = page.getByRole('form', { name: '프로젝트 상담 양식' });

  await page.waitForFunction(() => {
    const contactForm = document.querySelector('[data-landing-contact-form]');
    return contactForm && Object.keys(contactForm).some((key) => key.startsWith('__reactProps$'));
  });

  await form.getByLabel('웹·앱 개발').check({ force: true });
  await form.getByLabel('담당자명').fill('홍길동');
  await form.getByLabel('이메일').fill(email);
  await form
    .getByLabel('문의 내용')
    .fill('회사 소개 페이지 개편과 상담 문의 전달 기능을 함께 의뢰하고 싶습니다.');
  await form.getByLabel('개인정보 수집·이용에 동의합니다.').check({ force: true });
  const overseasConsent = form.getByLabel('개인정보 국외 이전에 동의합니다.');
  await expect(overseasConsent).toBeVisible();
  await overseasConsent.check({ force: true });
  await page.waitForTimeout(3_100);

  return form;
}

test('submits an inquiry, reports delivery truthfully, and resets only after success', async ({
  page,
}) => {
  await page.goto('/#contact');
  const form = await completeContactForm(page, 'contact-success@example.com');
  const submitButton = form.locator('button[type="submit"]');

  await submitButton.click();

  await expect(submitButton).toBeDisabled();
  await expect(submitButton).toHaveText(/전송 중/);
  await expect(form.locator('output')).toContainText('문의가 정상적으로 접수되었습니다.');
  await expect(form.getByLabel('담당자명')).toHaveValue('');
  await expect(form.getByLabel('이메일')).toHaveValue('');
  await expect(form.getByLabel('웹·앱 개발')).not.toBeChecked();
  await expect(form.getByLabel('개인정보 수집·이용에 동의합니다.')).not.toBeChecked();
  await expect(form.getByLabel('개인정보 국외 이전에 동의합니다.')).not.toBeChecked();
});

test('preserves inquiry values and offers direct email when delivery is unavailable', async ({
  page,
}) => {
  await page.goto('/#contact');
  const form = await completeContactForm(page, 'e2e-config-missing@futur.invalid');

  await form.getByRole('button', { name: '상담 신청하기' }).click();

  await expect(form.getByRole('alert')).toContainText('문의 전송 설정을 확인할 수 없습니다.');
  await expect(form.getByRole('link', { name: '이메일로 직접 문의하기' })).toHaveAttribute(
    'href',
    'mailto:kjwoo@futur.co.kr',
  );
  await expect(form.getByLabel('담당자명')).toHaveValue('홍길동');
  await expect(form.getByLabel('이메일')).toHaveValue('e2e-config-missing@futur.invalid');
  await expect(form.getByLabel('웹·앱 개발')).toBeChecked();
  await expect(form.getByLabel('개인정보 수집·이용에 동의합니다.')).toBeChecked();
  await expect(form.getByLabel('개인정보 국외 이전에 동의합니다.')).toBeChecked();
});

test('discloses stage, schedule, and budget as required contact fields', async ({ page }) => {
  await page.goto('/privacy');
  const collectedItems = page.locator('section').filter({
    has: page.getByRole('heading', { name: '2. 처리 항목' }),
  });

  await expect(collectedItems.getByText('필수', { exact: true }).locator('..')).toContainText(
    '프로젝트 단계, 일정, 예산 범위',
  );
  await expect(collectedItems.getByText('선택', { exact: true }).locator('..')).toContainText(
    '회사명',
  );
});
