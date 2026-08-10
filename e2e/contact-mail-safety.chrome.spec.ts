import { expect, test } from '@playwright/test';

import type { ContactInquiryInput } from '../src/pages/landing/model/contact-inquiry';
import { sendContactInquiryEmail } from '../src/pages/landing/server/contact-mail.server';

const TEST_INQUIRY: ContactInquiryInput = {
  submissionId: 'contact-mail-safety-test',
  name: '홍길동',
  company: '',
  email: 'contact@example.com',
  stage: '아이디어',
  timeline: '협의 후 결정',
  budget: '협의 필요',
  services: ['웹·앱 개발'],
  otherService: '',
  message: '회사 소개 페이지 개편과 상담 문의 전달 기능을 함께 의뢰하고 싶습니다.',
  collectionConsent: true,
  overseasTransferConsent: true,
  website: '',
  formStartedAt: Date.now() - 3_100,
};

test('never calls Resend for reserved test addresses outside Playwright mode', async () => {
  const originalFetch = globalThis.fetch;
  const originalEnvironment = new Map(
    ['PLAYWRIGHT_E2E', 'RESEND_API_KEY', 'CONTACT_FROM_EMAIL'].map((key) => [
      key,
      process.env[key],
    ]),
  );
  let fetchCalls = 0;

  process.env.PLAYWRIGHT_E2E = '0';
  process.env.RESEND_API_KEY = 're_test_key';
  process.env.CONTACT_FROM_EMAIL = 'FUTUR 문의 <contact@example.com>';
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return Response.json({ id: 'unexpected-delivery' });
  };

  try {
    for (const email of ['contact@example.com', 'e2e-config-missing@futur.invalid']) {
      const result = await sendContactInquiryEmail({ ...TEST_INQUIRY, email });
      expect(result).toEqual({ ok: false, code: 'DELIVERY' });
    }

    expect(fetchCalls).toBe(0);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of originalEnvironment) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
