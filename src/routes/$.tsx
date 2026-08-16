import { createFileRoute, notFound } from '@tanstack/react-router';

import { RootNotFound } from '@/pages/root';

export const Route = createFileRoute('/$')({
  beforeLoad: () => {
    throw notFound();
  },
  component: RootNotFound,
  notFoundComponent: RootNotFound,
});
