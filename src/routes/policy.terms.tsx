import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/policy/terms')({
  beforeLoad: () => {
    throw redirect({ href: '/terms', statusCode: 301 });
  },
});
