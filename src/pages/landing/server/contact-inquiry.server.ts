/// <reference types="node" />

import '@tanstack/react-start/server-only';

import { getRequestHeaders, getRequestIP } from '@tanstack/react-start/server';
import { createHmac } from 'node:crypto';

import { sendContactInquiryEmail } from './contact-mail.server';
import { briefStages, budgetOptions, contactServices, timelineOptions } from '../config/contact';
import type { ContactInquiryInput, ContactInquiryResult } from '../model/contact-inquiry';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FORM_MIN_AGE_MS = 3_000;
const FORM_MAX_AGE_MS = 2 * 60 * 60 * 1_000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1_000;
const RATE_LIMIT_MAX = 3;
const IDEMPOTENCY_WINDOW_MS = 24 * 60 * 60 * 1_000;
const DEFAULT_RATE_LIMIT_CAPACITY = 4_096;
const DEFAULT_IDEMPOTENCY_CAPACITY = 8_192;
const rateLimitEntries = new Map<string, number[]>();
const deliveredSubmissions = new Map<string, { expiresAt: number; result: ContactInquiryResult }>();

const stageIds = new Set<string>(briefStages.map(({ value }) => value));
const timelineIds = new Set<string>(timelineOptions.map(({ value }) => value));
const budgetIds = new Set<string>(budgetOptions.map(({ value }) => value));
const serviceIds = new Set<string>([...contactServices.map(({ value }) => value), '기타']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTrimmedString(value: unknown, min: number, max: number) {
  return (
    typeof value === 'string' &&
    value === value.trim() &&
    value.length >= min &&
    value.length <= max
  );
}

function isValidInquiry(input: unknown): input is ContactInquiryInput {
  if (!isRecord(input)) return false;

  const now = Date.now();
  const formAge = now - Number(input.formStartedAt);
  const services = input.services;

  return (
    isTrimmedString(input.submissionId, 1, 100) &&
    isTrimmedString(input.name, 1, 50) &&
    isTrimmedString(input.company, 0, 100) &&
    typeof input.email === 'string' &&
    isTrimmedString(input.email, 3, 254) &&
    EMAIL_PATTERN.test(input.email) &&
    typeof input.stage === 'string' &&
    stageIds.has(input.stage) &&
    typeof input.timeline === 'string' &&
    timelineIds.has(input.timeline) &&
    typeof input.budget === 'string' &&
    budgetIds.has(input.budget) &&
    Array.isArray(services) &&
    services.length >= 1 &&
    services.length <= 5 &&
    new Set(services).size === services.length &&
    services.every((service) => typeof service === 'string' && serviceIds.has(service)) &&
    isTrimmedString(input.otherService, services.includes('기타') ? 1 : 0, 100) &&
    isTrimmedString(input.message, 20, 3_000) &&
    input.collectionConsent === true &&
    input.overseasTransferConsent === true &&
    input.website === '' &&
    Number.isFinite(input.formStartedAt) &&
    formAge >= FORM_MIN_AGE_MS &&
    formAge <= FORM_MAX_AGE_MS
  );
}

function getRateLimitSalt() {
  if (process.env.CONTACT_RATE_LIMIT_SALT) return process.env.CONTACT_RATE_LIMIT_SALT;
  if (process.env.PLAYWRIGHT_E2E === '1') return 'playwright-contact-rate-limit-salt';
  return null;
}

function getPositiveIntegerEnvironmentValue(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

function getRequestTime(headers: Headers) {
  if (process.env.PLAYWRIGHT_E2E !== '1') return Date.now();

  const e2eNow = Number(headers.get('x-contact-e2e-now'));
  return Number.isFinite(e2eNow) ? e2eNow : Date.now();
}

function getRequesterIdentity(headers: Headers) {
  if (process.env.PLAYWRIGHT_E2E === '1') {
    const e2eRequester = headers.get('x-contact-e2e-requester');
    if (e2eRequester) return `e2e:${e2eRequester}`;
  }

  const clientAddress =
    process.env.CONTACT_TRUST_PROXY === '1'
      ? getRequestIP({ xForwardedFor: true })
      : getRequestIP();

  return `client:${clientAddress || 'unavailable'}`;
}

function getRequesterContext(salt: string) {
  const headers = getRequestHeaders();
  const identity = getRequesterIdentity(headers);

  return {
    key: createHmac('sha256', salt).update(identity).digest('hex'),
    now: getRequestTime(headers),
  };
}

function evictOldestEntries<K, V>(store: Map<K, V>, capacity: number) {
  while (store.size >= capacity) {
    const oldestKey = store.keys().next().value as K | undefined;
    if (oldestKey === undefined) return;
    store.delete(oldestKey);
  }
}

function evictExpiredEntries(now: number) {
  for (const [key, timestamps] of rateLimitEntries) {
    const activeTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
    );

    if (activeTimestamps.length === 0) rateLimitEntries.delete(key);
    else if (activeTimestamps.length !== timestamps.length) {
      rateLimitEntries.set(key, activeTimestamps);
    }
  }

  for (const [key, entry] of deliveredSubmissions) {
    if (entry.expiresAt <= now) deliveredSubmissions.delete(key);
  }
}

function consumeRateLimit(key: string, now: number) {
  const attempts = rateLimitEntries.get(key) ?? [];

  if (attempts.length >= RATE_LIMIT_MAX) {
    return false;
  }

  if (!rateLimitEntries.has(key)) {
    evictOldestEntries(
      rateLimitEntries,
      getPositiveIntegerEnvironmentValue(
        'CONTACT_RATE_LIMIT_CAPACITY',
        DEFAULT_RATE_LIMIT_CAPACITY,
      ),
    );
  }
  attempts.push(now);
  rateLimitEntries.set(key, attempts);
  return true;
}

export async function deliverContactInquiry(input: unknown): Promise<ContactInquiryResult> {
  if (!isValidInquiry(input)) {
    return { ok: false, code: 'INVALID', message: '입력 내용을 다시 확인해 주세요.' };
  }

  const salt = getRateLimitSalt();
  if (!salt) {
    return {
      ok: false,
      code: 'CONFIGURATION',
      message: '문의 전송 설정을 확인할 수 없습니다.',
      fallbackEmail: 'kjwoo@futur.co.kr',
    };
  }

  const requester = getRequesterContext(salt);
  evictExpiredEntries(requester.now);
  const deduplicationKey = `${requester.key}:${input.submissionId}`;
  const previousSubmission = deliveredSubmissions.get(deduplicationKey);
  if (previousSubmission) return previousSubmission.result;

  if (!consumeRateLimit(requester.key, requester.now)) {
    return {
      ok: false,
      code: 'RATE_LIMITED',
      message: '문의가 연속으로 접수되었습니다. 잠시 후 다시 시도해 주세요.',
    };
  }

  const delivery = await sendContactInquiryEmail(input);
  if (!delivery.ok) {
    return delivery.code === 'CONFIGURATION'
      ? {
          ok: false,
          code: 'CONFIGURATION',
          message: '문의 전송 설정을 확인할 수 없습니다.',
          fallbackEmail: 'kjwoo@futur.co.kr',
        }
      : {
          ok: false,
          code: 'DELIVERY',
          message: '문의 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.',
        };
  }

  const result = {
    ok: true,
    submissionId: input.submissionId,
    message: '문의가 정상적으로 접수되었습니다.',
  } satisfies ContactInquiryResult;
  evictOldestEntries(
    deliveredSubmissions,
    getPositiveIntegerEnvironmentValue(
      'CONTACT_IDEMPOTENCY_CAPACITY',
      DEFAULT_IDEMPOTENCY_CAPACITY,
    ),
  );
  deliveredSubmissions.set(deduplicationKey, {
    expiresAt: requester.now + IDEMPOTENCY_WINDOW_MS,
    result,
  });
  return result;
}
