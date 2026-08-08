import { expect, test, type Page } from '@playwright/test';

interface ServerResult {
  ok: boolean;
  code?: string;
  submissionId?: string;
}

function validInquiry(submissionId: string) {
  return {
    submissionId,
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
}

async function callContactServer(
  page: Page,
  input: ReturnType<typeof validInquiry>,
  requester: string,
) {
  return page.evaluate(
    async ({ payload, forwardedFor }) => {
      const modulePath = '/src/pages/landing/server/contact-inquiry.functions.ts';
      const server = (await import(/* @vite-ignore */ modulePath)) as {
        submitContactInquiry: (options: {
          data: typeof payload;
          headers: Record<string, string>;
        }) => Promise<ServerResult>;
      };

      return server.submitContactInquiry({
        data: payload,
        headers: { 'x-forwarded-for': forwardedFor },
      });
    },
    { payload: input, forwardedFor: requester },
  );
}

test('rejects invalid allowlists, bounds, consents, honeypot, and form age on the server', async ({
  page,
}) => {
  await page.goto('/');
  const base = validInquiry('server-boundary-base');
  const invalidInputs = [
    { ...base, submissionId: 'invalid-name', name: '가'.repeat(51) },
    { ...base, submissionId: 'invalid-company', company: '가'.repeat(101) },
    { ...base, submissionId: 'invalid-email', email: `${'a'.repeat(250)}@x.io` },
    { ...base, submissionId: 'invalid-service-count', services: [] },
    { ...base, submissionId: 'invalid-service-id', services: ['존재하지 않는 서비스'] },
    { ...base, submissionId: 'invalid-other', services: ['기타'], otherService: '가'.repeat(101) },
    { ...base, submissionId: 'invalid-message-short', message: '가'.repeat(19) },
    { ...base, submissionId: 'invalid-message-long', message: '가'.repeat(3_001) },
    { ...base, submissionId: 'invalid-collection-consent', collectionConsent: false },
    { ...base, submissionId: 'invalid-overseas-consent', overseasTransferConsent: false },
    { ...base, submissionId: 'invalid-honeypot', website: 'https://spam.invalid' },
    { ...base, submissionId: 'invalid-too-young', formStartedAt: Date.now() - 1_000 },
    { ...base, submissionId: 'invalid-too-old', formStartedAt: Date.now() - 7_200_001 },
  ];

  for (const input of invalidInputs) {
    await expect(callContactServer(page, input, '203.0.113.31')).resolves.toMatchObject({
      ok: false,
      code: 'INVALID',
    });
  }
});

test('deduplicates a submission ID and rate limits the fourth distinct inquiry in 15 minutes', async ({
  page,
}) => {
  await page.goto('/');
  const requester = '203.0.113.32';
  const duplicate = validInquiry('idempotent-submission');

  for (let attempt = 0; attempt < 4; attempt += 1) {
    await expect(callContactServer(page, duplicate, requester)).resolves.toMatchObject({
      ok: true,
      submissionId: 'idempotent-submission',
    });
  }

  await expect(
    callContactServer(page, validInquiry('rate-limit-distinct-2'), requester),
  ).resolves.toMatchObject({ ok: true });
  await expect(
    callContactServer(page, validInquiry('rate-limit-distinct-3'), requester),
  ).resolves.toMatchObject({ ok: true });
  await expect(
    callContactServer(page, validInquiry('rate-limit-distinct-4'), requester),
  ).resolves.toMatchObject({ ok: false, code: 'RATE_LIMITED' });
});
