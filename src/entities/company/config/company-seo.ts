import { COMPANY_INFOS } from './company-infos';

export const HOME_SEO = {
  canonicalUrl: `${COMPANY_INFOS.URL}/`,
  description:
    '퓨처(Futur)는 웹·앱, SaaS·솔루션, 업무 시스템·SI, AI 통합·AX 구축과 운영·유지보수를 함께하는 개발 파트너입니다.',
  imageAlt: '검은 배경 위 FUTUR 심볼과 BUILT FOR WHAT’S NEXT. 문구',
  imageUrl: `${COMPANY_INFOS.URL}/media/share/futur-main-og-v2.png`,
  title: 'FUTUR | 웹·앱·업무 시스템·AI 통합 개발',
} as const;

export function createCompanyStructuredData(): Record<string, unknown> {
  const organizationId = `${COMPANY_INFOS.URL}/#organization`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@id': `${COMPANY_INFOS.URL}/#website`,
        '@type': 'WebSite',
        alternateName: [COMPANY_INFOS.LEGAL_NAME_KO, COMPANY_INFOS.NAME],
        name: 'FUTUR',
        publisher: { '@id': organizationId },
        url: `${COMPANY_INFOS.URL}/`,
      },
      {
        '@id': organizationId,
        '@type': 'Organization',
        address: {
          '@type': 'PostalAddress',
          addressCountry: COMPANY_INFOS.ADDRESS_ENGLISH.COUNTRY,
          addressLocality: COMPANY_INFOS.ADDRESS_ENGLISH.LOCALITY,
          addressRegion: COMPANY_INFOS.ADDRESS_ENGLISH.REGION,
          streetAddress: COMPANY_INFOS.ADDRESS,
        },
        alternateName: COMPANY_INFOS.NAME,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: COMPANY_INFOS.EMAIL,
        },
        description: COMPANY_INFOS.DESCRIPTION,
        legalName: COMPANY_INFOS.LEGAL_NAME_KO,
        logo: {
          '@type': 'ImageObject',
          contentUrl: COMPANY_INFOS.LOGO_URL,
          height: 512,
          url: COMPANY_INFOS.LOGO_URL,
          width: 512,
        },
        name: 'FUTUR',
        url: `${COMPANY_INFOS.URL}/`,
      },
    ],
  };
}
