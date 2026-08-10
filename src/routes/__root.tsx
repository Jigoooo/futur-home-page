/// <reference types="vite/client" />

import { createRootRoute } from '@tanstack/react-router';

import { COMPANY_INFOS } from '@/entities/company';
import { RootComponent, RootDocument, RootNotFound } from '@/pages/root';
import '../styles/tokens.css';
import '../styles/globals.css';

const heroTitle = 'FROM COMPLEX WORK TO SERVICES THAT WORK.';
const heroDescription =
  '웹·앱·업무 시스템의 사용자 흐름과 데이터 구조를 함께 설계하고, 배포 이후 운영까지 이어가는 SI 개발 파트너.';
const heroShareImage = `${COMPANY_INFOS.URL}/media/hero/futur-system-flow-og.webp`;

export const Route = createRootRoute({
  head: () => ({
    links: [
      { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' },
      { rel: 'icon', href: '/logo_48x48.png', type: 'image/png', sizes: '48x48' },
      { rel: 'icon', href: '/logo_96x96.png', type: 'image/png', sizes: '96x96' },
      { rel: 'icon', href: '/logo_144x144.png', type: 'image/png', sizes: '144x144' },
      { rel: 'apple-touch-icon', href: '/logo_180x180.png', sizes: '180x180' },
      { rel: 'canonical', href: COMPANY_INFOS.URL },
      {
        rel: 'preload',
        href: '/fonts/PretendardVariable.critical.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
    ],
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: `FUTUR | ${heroTitle}` },
      {
        name: 'description',
        content: heroDescription,
      },
      {
        name: 'keywords',
        content: 'SI, 시스템통합, 웹개발, 앱개발, 업무시스템, 익산, 유지보수, API연동',
      },
      { name: 'application-name', content: COMPANY_INFOS.NAME },
      { name: 'author', content: COMPANY_INFOS.NAME },
      { name: 'creator', content: 'FUTUR Team' },
      { name: 'publisher', content: COMPANY_INFOS.NAME },
      {
        name: 'robots',
        content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      },
      { name: 'theme-color', content: '#06152b' },
      { name: 'color-scheme', content: 'light' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'geo.region', content: 'KR-46' },
      { name: 'geo.placename', content: 'Iksan-si' },
      { name: 'geo.position', content: '35.9483;126.9578' },
      { name: 'ICBM', content: '35.9483, 126.9578' },
      { property: 'og:title', content: `FUTUR | ${heroTitle}` },
      {
        property: 'og:description',
        content: heroDescription,
      },
      { property: 'og:url', content: COMPANY_INFOS.URL },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'ko_KR' },
      { property: 'og:site_name', content: COMPANY_INFOS.NAME },
      { property: 'og:image', content: heroShareImage },
      { property: 'og:image:secure_url', content: heroShareImage },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'FUTUR landing preview' },
      { property: 'og:image:type', content: 'image/webp' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `FUTUR | ${heroTitle}` },
      {
        name: 'twitter:description',
        content: heroDescription,
      },
      { name: 'twitter:image', content: heroShareImage },
      { name: 'twitter:image:alt', content: 'FUTUR landing preview' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: COMPANY_INFOS.NAME,
          url: COMPANY_INFOS.URL,
          logo: COMPANY_INFOS.LOGO_URL,
          description: COMPANY_INFOS.DESCRIPTION,
          address: {
            '@type': 'PostalAddress',
            streetAddress: COMPANY_INFOS.ADDRESS,
            addressLocality: COMPANY_INFOS.ADDRESS_ENGLISH.LOCALITY,
            addressRegion: COMPANY_INFOS.ADDRESS_ENGLISH.REGION,
            addressCountry: COMPANY_INFOS.ADDRESS_ENGLISH.COUNTRY,
          },
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: COMPANY_INFOS.EMAIL,
            telephone: COMPANY_INFOS.PHONE,
          },
        }),
      },
    ],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
  notFoundComponent: RootNotFound,
});
