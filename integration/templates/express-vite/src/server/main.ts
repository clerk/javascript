import 'dotenv/config';

import { clerkMiddleware, getAuth } from '@clerk/express';
import { verifyWebhook } from '@clerk/express/webhooks';
import express from 'express';
import ViteExpress from 'vite-express';

const app = express();

const proxyEnabled = process.env.CLERK_PROXY_ENABLED === 'true';

app.use(express.json());

app.use(
  clerkMiddleware({
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
    ...(proxyEnabled ? { frontendApiProxy: { enabled: (url: URL) => url.pathname.startsWith('/api') } } : {}),
  }),
);

app.get('/api/protected', (req: any, res: any, _next: any) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).send('Unauthorized');
    return;
  }

  res.send('Protected API response');
});

app.get('/api/me', (req: any, res: any) => {
  const auth = getAuth(req);
  res.json({
    userId: auth.userId,
    sessionId: auth.sessionId,
    orgId: auth.orgId ?? null,
    orgRole: auth.orgRole ?? null,
    orgSlug: auth.orgSlug ?? null,
  });
});

// Must match the secret in integration/tests/express/webhook.test.ts
const TEST_WEBHOOK_SECRET = 'whsec_dGVzdF9zaWduaW5nX3NlY3JldF8zMl9jaGFyc19sb25n';

app.post('/api/webhooks/clerk', async (req: any, res: any) => {
  try {
    const evt = await verifyWebhook(req, { signingSecret: TEST_WEBHOOK_SECRET });
    res.json({ success: true, type: evt.type, data: evt.data });
  } catch (err) {
    res.status(400).json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

const port = parseInt(process.env.PORT as string) || 3002;
ViteExpress.listen(app, port, () => console.log(`Server is listening on port ${port}...`));
