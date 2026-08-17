/// <reference types="vite/client" />

import { createRootRoute } from '@tanstack/react-router';

import { RootComponent, RootDocument, RootNotFound } from '@/pages/root';
import '@fontsource-variable/space-grotesk';
import '@sun-typeface/suit/fonts/variable/woff2/SUIT-Variable.css';
import '../styles/tokens.css';
import '../styles/globals.css';

export const Route = createRootRoute({
  head: () => ({
    links: [
      { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
      { rel: 'icon', href: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { rel: 'icon', href: '/favicon-48.png', type: 'image/png', sizes: '48x48' },
      { rel: 'icon', href: '/favicon-96.png', type: 'image/png', sizes: '96x96' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'application-name', content: 'FUTUR' },
      { name: 'author', content: 'FUTUR' },
      { name: 'creator', content: 'FUTUR Team' },
      { name: 'publisher', content: 'FUTUR' },
      { name: 'theme-color', content: '#202523' },
      { name: 'color-scheme', content: 'dark light' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
  notFoundComponent: RootNotFound,
});
