export const COMPANY_INFOS = {
  NAME: 'Futur',
  LEGAL_NAME_KO: '주식회사 퓨터',
  CEO: '김지영',
  EMAIL: 'kjwoo@futur.co.kr',
  PHONE: '010-2355-7934',
  ADDRESS: '서울특별시 송파구 삼전로10길 32, 202호(삼전동, GOOD PEOPLE)',
  ADDRESS_ENGLISH: {
    LOCALITY: 'Songpa-gu',
    REGION: 'Seoul',
    COUNTRY: 'KR',
  },
  BUSINESS_LICENSE: '841-86-03872',
  URL: 'https://futur.co.kr',
  LOGO_URL: 'https://futur.co.kr/organization-logo-512.png',
  DESCRIPTION:
    '웹·앱, SaaS·솔루션, 업무 시스템·SI, AI 통합·AX 구축과 운영·유지보수를 함께하는 개발 파트너입니다.',
  PRIVACY_OFFICER: {
    NAME: '김지영',
    POSITION: '대표',
    EMAIL: 'kjwoo@futur.co.kr',
  },
  LEGAL_EFFECTIVE_DATE: '2026-05-27',
} as const;

export type CompanyInfo = typeof COMPANY_INFOS;
