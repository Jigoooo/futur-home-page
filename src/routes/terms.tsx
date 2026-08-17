import { createFileRoute } from '@tanstack/react-router';

import { TermsPage } from '@/pages/legal/terms';

export const Route = createFileRoute('/terms')({
  component: TermsPage,
  head: () => ({
    links: [{ rel: 'canonical', href: 'https://futur.co.kr/terms' }],
    meta: [
      { title: '이용약관 · 퓨터' },
      {
        name: 'description',
        content: '퓨터(Futur) 웹사이트 이용 조건·절차·권리의무에 관한 이용약관.',
      },
      { name: 'robots', content: 'noindex,follow' },
      { property: 'og:url', content: 'https://futur.co.kr/terms' },
    ],
  }),
});
