import type {
  briefStages,
  budgetOptions,
  contactServices,
  timelineOptions,
} from '../config/contact';

export type ContactStageId = (typeof briefStages)[number]['value'];
export type ContactTimelineId = (typeof timelineOptions)[number]['value'];
export type ContactBudgetId = (typeof budgetOptions)[number]['value'];
export type ContactServiceId = (typeof contactServices)[number]['value'] | '기타';

export interface ContactInquiryInput {
  submissionId: string;
  name: string;
  company: string;
  email: string;
  stage: ContactStageId;
  timeline: ContactTimelineId;
  budget: ContactBudgetId;
  services: ContactServiceId[];
  otherService: string;
  message: string;
  collectionConsent: boolean;
  overseasTransferConsent: boolean;
  website: string;
  formStartedAt: number;
}

export type ContactInquiryResult =
  | { ok: true; submissionId: string; message: string }
  | {
      ok: false;
      code: 'INVALID' | 'RATE_LIMITED' | 'CONFIGURATION' | 'DELIVERY';
      message: string;
      fallbackEmail?: string;
    };
