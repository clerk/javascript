import 'dotenv/config';

import { getRequestListener } from '@hono/node-server';
import { clerkMiddleware, getAuth } from '@clerk/hono';
import { verifyWebhook } from '@clerk/hono/webhooks';
import express from 'express';
import { Hono } from 'hono';
import ViteExpress from 'vite-express';

const app = new Hono();

const proxyEnabled = process.env.CLERK_PROXY_ENABLED === 'true';

app.use(
  '*',
  clerkMiddleware({
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
    ...(proxyEnabled ? { frontendApiProxy: { enabled: true } } : {}),
  }),
);

app.get('/protected', c => {
  const { userId } = getAuth(c);
  if (!userId) {
    return c.text('Unauthorized', 401);
  }

  return c.text('Protected API response');
});

app.get('/me', c => {
  const auth = getAuth(c);
  return c.json({
    userId: auth.userId,
    sessionId: auth.sessionId,
    orgId: auth.orgId ?? null,
    orgRole: auth.orgRole ?? null,
    orgSlug: auth.orgSlug ?? null,
  });
});

// Must match the secret in integration/tests/hono/webhook.test.ts
const TEST_WEBHOOK_SECRET = 'whsec_dGVzdF9zaWduaW5nX3NlY3JldF8zMl9jaGFyc19sb25n';

app.post('/webhooks/clerk', async c => {
  try {
    const evt = await verifyWebhook(c, { signingSecret: TEST_WEBHOOK_SECRET });
    return c.json({ success: true, type: evt.type, data: evt.data });
  } catch (err) {
    return c.json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }, 400);
  }
});

const expressApp = express();
const honoRequestListener = getRequestListener(app.fetch);

// Only route /api requests through hono; let vite-express handle the frontend
expressApp.use('/api', async (req: any, res: any) => {
  await honoRequestListener(req, res);
});

const port = parseInt(process.env.PORT as string) || 3002;
ViteExpress.listen(expressApp, port, () => console.log(`Server is listening on port ${port}...`));
