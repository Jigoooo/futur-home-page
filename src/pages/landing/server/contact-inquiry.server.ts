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
const rateLimitEntries = new Map<string, number[]>();
const deliveredSubmissions = new Map<string, ContactInquiryResult>();

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

function getRequesterKey(salt: string) {
  const headers = getRequestHeaders();
  const requester =
    getRequestIP({ xForwardedFor: true }) ||
    headers.get('cf-connecting-ip') ||
    headers.get('user-agent') ||
    'unknown-requester';
  return createHmac('sha256', salt).update(requester).digest('hex');
}

function consumeRateLimit(key: string) {
  const now = Date.now();
  const attempts = (rateLimitEntries.get(key) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (attempts.length >= RATE_LIMIT_MAX) {
    rateLimitEntries.set(key, attempts);
    return false;
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

  const requesterKey = getRequesterKey(salt);
  const deduplicationKey = `${requesterKey}:${input.submissionId}`;
  const previousResult = deliveredSubmissions.get(deduplicationKey);
  if (previousResult) return previousResult;

  if (!consumeRateLimit(requesterKey)) {
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
  deliveredSubmissions.set(deduplicationKey, result);
  return result;
}
