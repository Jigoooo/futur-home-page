import { createFileRoute } from '@tanstack/react-router';

import { PrivacyPage } from '@/pages/legal/privacy';

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: '개인정보 처리방침 · 퓨터' },
      {
        name: 'description',
        content: '퓨터(Futur)의 개인정보 수집·이용·보관·파기 등에 관한 처리방침 안내.',
      },
      { name: 'robots', content: 'noindex,follow' },
    ],
  }),
});
