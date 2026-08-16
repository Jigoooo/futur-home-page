import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/policy/privacy')({
  beforeLoad: () => {
    throw redirect({ href: '/privacy', statusCode: 301 });
  },
});
