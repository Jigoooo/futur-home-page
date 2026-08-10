/// <reference types="node" />

import '@tanstack/react-start/server-only';

import { Resend } from 'resend';

import type { ContactInquiryInput } from '../model/contact-inquiry';

export type ContactMailResult = { ok: true } | { ok: false; code: 'CONFIGURATION' | 'DELIVERY' };

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!,
  );
}

function formatServices(input: ContactInquiryInput) {
  return input.services
    .map((service) => (service === '기타' ? `기타 (${input.otherService})` : service))
    .join(', ');
}

function isReservedTestAddress(email: string) {
  const domain = email.slice(email.lastIndexOf('@') + 1).toLowerCase();
  return domain === 'example.com' || domain.endsWith('.invalid');
}

function buildMessage(input: ContactInquiryInput) {
  const fields = [
    ['접수 ID', input.submissionId],
    ['담당자명', input.name],
    ['회사명', input.company || '-'],
    ['이메일', input.email],
    ['현재 단계', input.stage],
    ['필요한 서비스', formatServices(input)],
    ['예상 일정', input.timeline],
    ['예산 범위', input.budget],
    ['문의 내용', input.message],
  ] as const;

  return {
    text: fields.map(([label, value]) => `${label}: ${value}`).join('\n\n'),
    html: `<h1>새 프로젝트 상담 문의</h1>${fields
      .map(
        ([label, value]) =>
          `<p><strong>${escapeHtml(label)}</strong><br />${escapeHtml(value).replace(/\n/g, '<br />')}</p>`,
      )
      .join('')}`,
  };
}

export async function sendContactInquiryEmail(
  input: ContactInquiryInput,
): Promise<ContactMailResult> {
  if (process.env.PLAYWRIGHT_E2E === '1') {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return input.email === 'e2e-config-missing@futur.invalid'
      ? { ok: false, code: 'CONFIGURATION' }
      : { ok: true };
  }

  if (isReservedTestAddress(input.email)) return { ok: false, code: 'DELIVERY' };

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !from) return { ok: false, code: 'CONFIGURATION' };

  const { html, text } = buildMessage(input);
  const resend = new Resend(apiKey);

  try {
    const response = await resend.emails.send(
      {
        from,
        to: process.env.CONTACT_TO_EMAIL || 'kjwoo@futur.co.kr',
        replyTo: input.email,
        subject: `[Futur 문의] ${input.name} · ${input.company || '회사명 미입력'}`,
        html,
        text,
      },
      { idempotencyKey: `contact/${input.submissionId}` },
    );

    return response.error ? { ok: false, code: 'DELIVERY' } : { ok: true };
  } catch {
    return { ok: false, code: 'DELIVERY' };
  }
}
