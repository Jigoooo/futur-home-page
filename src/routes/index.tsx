import { createFileRoute } from '@tanstack/react-router';

import { HOME_SEO, createCompanyStructuredData } from '@/entities/company';
import { LandingPage } from '@/pages/landing';

export const Route = createFileRoute('/')({
  component: LandingPage,
  head: () => ({
    links: [{ rel: 'canonical', href: HOME_SEO.canonicalUrl }],
    meta: [
      { title: HOME_SEO.title },
      { name: 'description', content: HOME_SEO.description },
      {
        name: 'robots',
        content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      },
      { property: 'og:title', content: HOME_SEO.title },
      { property: 'og:description', content: HOME_SEO.description },
      { property: 'og:url', content: HOME_SEO.canonicalUrl },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'ko_KR' },
      { property: 'og:site_name', content: 'FUTUR' },
      { property: 'og:image', content: HOME_SEO.imageUrl },
      { property: 'og:image:secure_url', content: HOME_SEO.imageUrl },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: HOME_SEO.imageAlt },
      { property: 'og:image:type', content: 'image/png' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: HOME_SEO.title },
      { name: 'twitter:description', content: HOME_SEO.description },
      { name: 'twitter:image', content: HOME_SEO.imageUrl },
      { name: 'twitter:image:alt', content: HOME_SEO.imageAlt },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(createCompanyStructuredData()),
      },
    ],
  }),
});
