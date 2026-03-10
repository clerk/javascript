import 'dotenv/config';

import { getRequestListener } from '@hono/node-server';
import { clerkMiddleware, getAuth } from '@clerk/hono';
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

const expressApp = express();
const honoRequestListener = getRequestListener(app.fetch);

// Only route /api requests through hono; let vite-express handle the frontend
expressApp.use('/api', async (req: any, res: any) => {
  await honoRequestListener(req, res);
});

const port = parseInt(process.env.PORT as string) || 3002;
ViteExpress.listen(expressApp, port, () => console.log(`Server is listening on port ${port}...`));
