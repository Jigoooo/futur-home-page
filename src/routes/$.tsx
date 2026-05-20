import { createFileRoute, notFound } from '@tanstack/react-router';

import { RootNotFound } from '@/pages/root';

export const Route = createFileRoute('/$')({
  beforeLoad: () => {
    if (import.meta.env.PROD) {
      throw notFound();
    }
  },
  component: RootNotFound,
  notFoundComponent: RootNotFound,
});
