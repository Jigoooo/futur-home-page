import { createFileRoute } from '@tanstack/react-router';

import { TermsPage } from '@/pages/legal/terms';

export const Route = createFileRoute('/terms')({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: '이용약관 · FUTUR' },
      {
        name: 'description',
        content: 'FUTUR 웹사이트 이용 조건·절차·권리의무에 관한 이용약관.',
      },
      { name: 'robots', content: 'noindex,follow' },
    ],
  }),
});
