import { COMPANY_INFOS } from '@/entities/company';

export const phoneHref = `tel:${COMPANY_INFOS.PHONE.replaceAll('-', '')}`;
export const mailHref = `mailto:${COMPANY_INFOS.EMAIL}`;
