import { createRouter } from '@tanstack/react-router';

import { routeTree } from './routeTree.gen';

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        html.style.scrollBehavior = previous;
      });
    });
  });
}

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
