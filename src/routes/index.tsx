import { createFileRoute } from '@tanstack/react-router';

import { LandingPage } from '@/pages/landing';

export const Route = createFileRoute('/')({
  component: LandingPage,
  head: () => ({
    links: [
      {
        rel: 'preload',
        as: 'image',
        href: '/landing/hero-product-preview.webp',
        fetchPriority: 'high',
      },
    ],
  }),
});
