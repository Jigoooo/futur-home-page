import { Outlet } from '@tanstack/react-router';

import { RootDocument } from './root-document';

export function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}
