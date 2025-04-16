---
'@clerk/nextjs': patch
---

Add support for webhook verification with Next.js Pages Router.

```ts
// Next.js Pages Router
import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyWebhook } from '@clerk/nextjs/webhooks';

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const evt = await verifyWebhook(req);
    // Handle webhook event
    res.status(200).json({ received: true });
  } catch (err) {
    res.status(400).json({ error: 'Webhook verification failed' });
  }
}

// tRPC
import { verifyWebhook } from '@clerk/nextjs/webhooks';

const webhookRouter = router({
  webhook: publicProcedure
    .input(/** schema */)
    .mutation(async ({ ctx }) => {
      const evt = await verifyWebhook(ctx.req);
      // Handle webhook event
      return { received: true };
    }),
});
```
