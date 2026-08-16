import { createFileRoute } from '@tanstack/react-router';

import { deliverContactInquiry } from '@/pages/landing/server/contact-inquiry.server';

export const Route = createFileRoute('/internal-e2e/contact-inquiry')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (process.env.PLAYWRIGHT_E2E !== '1') {
          return new Response(null, { status: 404 });
        }

        const input: unknown = await request.json();
        const result = await deliverContactInquiry(input);
        return Response.json(result);
      },
    },
  },
});
