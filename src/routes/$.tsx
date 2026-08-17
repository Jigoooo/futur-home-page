import { createFileRoute, notFound } from '@tanstack/react-router';

import { RootNotFound } from '@/pages/root';

export const Route = createFileRoute('/$')({
  beforeLoad: () => {
    throw notFound();
  },
  component: RootNotFound,
  head: () => ({
    meta: [
      { title: '페이지를 찾을 수 없습니다 · FUTUR' },
      { name: 'robots', content: 'noindex,nofollow' },
    ],
  }),
  notFoundComponent: RootNotFound,
});
