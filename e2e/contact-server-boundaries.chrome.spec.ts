import { expect, test, type Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

interface ServerResult {
  ok: boolean;
  code?: string;
  submissionId?: string;
}

interface RequestIdentityOptions {
  e2eRequester?: string;
  forwardedFor?: string;
  now?: number;
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
  identity: RequestIdentityOptions,
) {
  const headers: Record<string, string> = {};
  if (identity.e2eRequester) headers['x-contact-e2e-requester'] = identity.e2eRequester;
  if (identity.forwardedFor) headers['x-forwarded-for'] = identity.forwardedFor;
  if (identity.now !== undefined) headers['x-contact-e2e-now'] = String(identity.now);

  const response = await page.request.post('/internal-e2e/contact-inquiry', {
    data: input,
    headers,
  });
  expect(response.status()).toBe(200);
  return response.json() as Promise<ServerResult>;
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
    { ...base, submissionId: 'invalid-too-young', formStartedAt: Date.now() + 60_000 },
    { ...base, submissionId: 'invalid-too-old', formStartedAt: Date.now() - 7_200_001 },
  ];

  for (const input of invalidInputs) {
    await expect(
      callContactServer(page, input, { e2eRequester: 'server-validation' }),
    ).resolves.toMatchObject({
      ok: false,
      code: 'INVALID',
    });
  }
});

test('deduplicates a submission ID and rate limits the fourth distinct inquiry in 15 minutes', async ({
  page,
}) => {
  await page.goto('/');
  const requester = { e2eRequester: 'deduplication-baseline' };
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

test('coalesces concurrent duplicate submissions before consuming rate-limit quota', async ({
  page,
}) => {
  await page.goto('/');
  const requester = { e2eRequester: 'concurrent-deduplication' };
  const duplicate = validInquiry('concurrent-idempotent-submission');

  const duplicateResults = await Promise.all(
    Array.from({ length: 5 }, () => callContactServer(page, duplicate, requester)),
  );

  expect(duplicateResults).toEqual(
    Array.from({ length: 5 }, () => ({
      ok: true,
      submissionId: 'concurrent-idempotent-submission',
      message: '문의가 정상적으로 접수되었습니다.',
    })),
  );
  await expect(
    callContactServer(page, validInquiry('concurrent-rate-slot-2'), requester),
  ).resolves.toMatchObject({ ok: true });
  await expect(
    callContactServer(page, validInquiry('concurrent-rate-slot-3'), requester),
  ).resolves.toMatchObject({ ok: true });
  await expect(
    callContactServer(page, validInquiry('concurrent-rate-slot-4'), requester),
  ).resolves.toMatchObject({ ok: false, code: 'RATE_LIMITED' });
});

test('clears a failed concurrent submission so the same ID can be retried', async ({ page }) => {
  await page.goto('/');
  const requester = { e2eRequester: 'concurrent-failure-retry' };
  const failedSubmission = {
    ...validInquiry('concurrent-failure-submission'),
    email: 'e2e-config-missing@futur.invalid',
  };

  const failedResults = await Promise.all(
    Array.from({ length: 3 }, () => callContactServer(page, failedSubmission, requester)),
  );

  expect(failedResults).toEqual(
    Array.from({ length: 3 }, () => ({
      ok: false,
      code: 'CONFIGURATION',
      message: '문의 전송 설정을 확인할 수 없습니다.',
      fallbackEmail: 'kjwoo@futur.co.kr',
    })),
  );
  await expect(
    callContactServer(page, validInquiry('concurrent-failure-submission'), requester),
  ).resolves.toMatchObject({
    ok: true,
    submissionId: 'concurrent-failure-submission',
  });
});

test('ignores caller-controlled forwarded IPs when proxy trust is disabled', async ({ page }) => {
  await page.goto('/');

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await expect(
      callContactServer(page, validInquiry(`untrusted-forwarded-${attempt}`), {
        e2eRequester: 'untrusted-forwarded-fixed-socket',
        forwardedFor: `203.0.113.${attempt + 1}`,
      }),
    ).resolves.toMatchObject({ ok: true });
  }

  await expect(
    callContactServer(page, validInquiry('untrusted-forwarded-fourth'), {
      e2eRequester: 'untrusted-forwarded-fixed-socket',
      forwardedFor: '203.0.113.99',
    }),
  ).resolves.toMatchObject({ ok: false, code: 'RATE_LIMITED' });
});

test('uses proxy-overwritten forwarded identities only when proxy trust is enabled', async ({
  page,
}) => {
  test.skip(process.env.CONTACT_TRUST_PROXY !== '1', 'requires explicit trusted-proxy mode');
  await page.goto('/');

  for (let attempt = 0; attempt < 4; attempt += 1) {
    await expect(
      callContactServer(page, validInquiry(`trusted-forwarded-${attempt}`), {
        forwardedFor: `198.51.100.${attempt + 1}`,
      }),
    ).resolves.toMatchObject({ ok: true });
  }
});

test('evicts the oldest requester deterministically at the rate-store capacity', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.metadata.contactCapacityTests !== true,
    'capacity limits are isolated by the task-owned server configuration',
  );
  await page.goto('/');

  for (let index = 0; index < 17; index += 1) {
    await callContactServer(page, validInquiry(`rate-capacity-seed-${index}`), {
      e2eRequester: `rate-capacity-requester-${index}`,
    });
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await expect(
      callContactServer(page, validInquiry(`rate-capacity-revisit-${attempt}`), {
        e2eRequester: 'rate-capacity-requester-0',
      }),
    ).resolves.toMatchObject({ ok: true });
  }
});

test('evicts the oldest idempotency record deterministically at capacity', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.metadata.contactCapacityTests !== true,
    'capacity limits are isolated by the task-owned server configuration',
  );
  await page.goto('/');

  for (let index = 0; index < 9; index += 1) {
    await callContactServer(page, validInquiry(`idempotency-capacity-${index}`), {
      e2eRequester: `idempotency-capacity-requester-${index}`,
    });
  }

  const firstRequester = { e2eRequester: 'idempotency-capacity-requester-0' };
  await expect(
    callContactServer(page, validInquiry('idempotency-capacity-0'), firstRequester),
  ).resolves.toMatchObject({ ok: true });
  await expect(
    callContactServer(page, validInquiry('idempotency-capacity-next-1'), firstRequester),
  ).resolves.toMatchObject({ ok: true });
  await expect(
    callContactServer(page, validInquiry('idempotency-capacity-next-2'), firstRequester),
  ).resolves.toMatchObject({ ok: false, code: 'RATE_LIMITED' });
});

test('expires rate entries after 15 minutes and idempotency entries after 24 hours', async ({
  page,
}) => {
  await page.goto('/');
  // Keep the synthetic clock at or before wall time so this parallel test cannot
  // expire another worker's in-flight process-local entries.
  const startedAt = Date.now() - 24 * 60 * 60 * 1_000 - 1;
  const rateIdentity = { e2eRequester: 'rate-ttl', now: startedAt };

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await expect(
      callContactServer(page, validInquiry(`rate-ttl-${attempt}`), rateIdentity),
    ).resolves.toMatchObject({ ok: true });
  }
  await expect(
    callContactServer(page, validInquiry('rate-ttl-after-window'), {
      ...rateIdentity,
      now: startedAt + 15 * 60 * 1_000 + 1,
    }),
  ).resolves.toMatchObject({ ok: true });

  const idempotencyIdentity = { e2eRequester: 'idempotency-ttl', now: startedAt };
  await expect(
    callContactServer(page, validInquiry('idempotency-ttl-original'), idempotencyIdentity),
  ).resolves.toMatchObject({ ok: true });

  const afterIdempotencyWindow = startedAt + 24 * 60 * 60 * 1_000 + 1;
  await expect(
    callContactServer(page, validInquiry('idempotency-ttl-original'), {
      ...idempotencyIdentity,
      now: afterIdempotencyWindow,
    }),
  ).resolves.toMatchObject({ ok: true });
  await expect(
    callContactServer(page, validInquiry('idempotency-ttl-next'), {
      ...idempotencyIdentity,
      now: afterIdempotencyWindow,
    }),
  ).resolves.toMatchObject({ ok: true });
  await expect(
    callContactServer(page, validInquiry('idempotency-ttl-next-2'), {
      ...idempotencyIdentity,
      now: afterIdempotencyWindow,
    }),
  ).resolves.toMatchObject({ ok: true });
  await expect(
    callContactServer(page, validInquiry('idempotency-ttl-limited'), {
      ...idempotencyIdentity,
      now: afterIdempotencyWindow,
    }),
  ).resolves.toMatchObject({ ok: false, code: 'RATE_LIMITED' });
});
