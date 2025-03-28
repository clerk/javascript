---
"@clerk/astro": minor
"@clerk/backend": minor
"@clerk/express": minor
"@clerk/fastify": minor
"@clerk/nextjs": minor
"@clerk/nuxt": minor
"@clerk/react-router": minor
"@clerk/tanstack-react-start": minor
---

Introduced `verifyWebhook` function to verify incoming Clerk webhook requests and process the payload. This function handles webhook signature verification using `Svix` and is now available across all backend and full-stack SDKs.

To get started, install [`svix`](https://www.npmjs.com/package/svix), which Clerk uses to verify webhooks:

```ts
npm install svix
```

Then in your webhook route handler, import `verifyWebhook` from your preferred SDK (this example uses Next.js):

```ts
// app/api/webhooks/route.ts
import { verifyWebhook } from '@clerk/nextjs/webhooks';

export async function POST(req: Request) {
  try {
    const evt = await verifyWebhook(req);

    // Do something with payload
    const { id } = evt.data;
    const eventType = evt.type;
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
    console.log('Webhook payload:', body);

    return new Response('Webhook received', { status: 200 });
  } catch (err) {
    console.error('Error: Could not verify webhook:', err);
    return new Response('Error: Verification error', {
      status: 400,
    });
  }
}
```

For more information on how to sync Clerk data to your app with webhooks, [see our guide](https://clerk.com/docs/webhooks/sync-data#create-the-endpoint).