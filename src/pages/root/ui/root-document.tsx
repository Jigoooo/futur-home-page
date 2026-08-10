import { HeadContent, Scripts } from '@tanstack/react-router';
import type { ReactNode } from 'react';

export function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // TanStack's pre-hydration scroll restoration may leave an empty root style attribute.
    // Suppression stays on this framework-owned boundary so descendant mismatches still report.
    <html lang='ko' suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
