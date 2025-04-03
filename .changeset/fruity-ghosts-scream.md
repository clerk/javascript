---
"@clerk/express": minor
---

Introduce a `verifyWebhook()` function to verify incoming Clerk webhook requests and process the payload. This function handles webhook signature verification using `Svix` and is now available across all backend and fullstack SDKs.

To get started, install [`svix`](https://www.npmjs.com/package/svix), which Clerk uses to verify its webhooks:

```shell
npm install svix
```

Then in your webhook route handler, import `verifyWebhook()` from the Express SDK:

```ts
import { verifyWebhook } from '@clerk/express/webhooks';

app.post(
  '/api/webhooks',
  bodyParser.raw({ type: 'application/json' }),

  async (req, res) => {
    try {
        const evt = await verifyWebhook(req);

        // Do something with payload
        const { id } = evt.data;
        const eventType = evt.type;
        console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
        console.log('Webhook payload:', body);

        return res.status(200).send('Webhook received')
    } catch (err) {
        console.log('Error: Could not verify webhook:', err.message)
        return res.status(400).send('Error: Verification error')
    }
  },
)
```

For more information on how to sync Clerk data to your app with webhooks, [see our guide](https://clerk.com/docs/webhooks/sync-data).