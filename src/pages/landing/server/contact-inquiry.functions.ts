import { createServerFn } from '@tanstack/react-start';

import { deliverContactInquiry } from './contact-inquiry.server';
import type { ContactInquiryInput } from '../model/contact-inquiry';

export const submitContactInquiry = createServerFn({ method: 'POST' })
  .inputValidator((data: ContactInquiryInput) => data)
  .handler(({ data }) => deliverContactInquiry(data));
