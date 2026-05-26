export const COMPANY_INFOS = {
  NAME: 'Futur',
  CEO: '김지우, 김진성',
  EMAIL: 'kjwoo@futur.co.kr',
  PHONE: '010-2355-7934',
  ADDRESS: '전라북도 익산시 인북로 3길 46 3층',
  ADDRESS_ENGLISH: {
    LOCALITY: 'Iksan-si',
    REGION: 'Jeollabuk-do',
    COUNTRY: 'KR',
  },
  BUSINESS_LICENSE: '731-01-03807',
  MAIL_ORDER_LICENSE: '2024-전북익산-0393',
  URL: 'https://futur.co.kr',
  LOGO_URL: 'https://futur.co.kr/logo_512x512.png',
  DESCRIPTION:
    '혁신적인 SI 솔루션으로 비즈니스의 미래를 설계합니다. 맞춤형 시스템 통합, 엔터프라이즈 솔루션, IT 전략 컨설팅을 제공합니다.',
  PRIVACY_OFFICER: {
    NAME: '김지우',
    POSITION: '대표',
    EMAIL: 'kjwoo@futur.co.kr',
  },
  LEGAL_EFFECTIVE_DATE: '2026-05-27',
} as const;

export type CompanyInfo = typeof COMPANY_INFOS;
