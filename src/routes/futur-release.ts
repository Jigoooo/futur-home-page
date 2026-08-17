import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/futur-release')({
  server: {
    handlers: {
      GET: () => {
        const releaseSha = process.env.FUTUR_RELEASE_SHA?.trim();
        const headers = {
          'Cache-Control': 'no-store',
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Robots-Tag': 'noindex, nofollow, nosnippet',
        };

        if (!releaseSha) {
          return new Response('release unavailable\n', { headers, status: 503 });
        }

        return new Response(`${releaseSha}\n`, { headers });
      },
    },
  },
});
