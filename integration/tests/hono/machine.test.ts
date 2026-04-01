import { test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { MachineAuthTestAdapter } from '../../testUtils/machineAuthHelpers';
import {
  registerApiKeyAuthTests,
  registerM2MAuthTests,
  registerOAuthAuthTests,
} from '../../testUtils/machineAuthHelpers';

const createMainFile = () => `
import 'dotenv/config';

import { getRequestListener } from '@hono/node-server';
import express from 'express';
import ViteExpress from 'vite-express';
import { app } from './app';

const expressApp = express();
const honoRequestListener = getRequestListener(app.fetch);

expressApp.use('/api', async (req: any, res: any) => {
  await honoRequestListener(req, res);
});

const port = parseInt(process.env.PORT as string) || 3002;
ViteExpress.listen(expressApp, port, () => console.log(\`Server is listening on port \${port}...\`));
`;

const adapter: MachineAuthTestAdapter = {
  baseConfig: appConfigs.hono.vite,
  apiKey: {
    path: '/api/me',
    addRoutes: config =>
      config
        .addFile(
          'src/server/app.ts',
          () => `
import { clerkMiddleware, getAuth } from '@clerk/hono';
import { Hono } from 'hono';

export const app = new Hono();

app.use(
  '*',
  clerkMiddleware({
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
  }),
);

app.get('/me', c => {
  const { userId, tokenType } = getAuth(c, { acceptsToken: 'api_key' });

  if (!userId) {
    return c.text('Unauthorized', 401);
  }

  return c.json({ userId, tokenType });
});

app.post('/me', c => {
  const authObject = getAuth(c, { acceptsToken: ['api_key', 'session_token'] });

  if (!authObject.isAuthenticated) {
    return c.text('Unauthorized', 401);
  }

  return c.json({ userId: authObject.userId, tokenType: authObject.tokenType });
});
        `,
        )
        .addFile('src/server/main.ts', () => createMainFile()),
  },
  m2m: {
    path: '/api/m2m',
    addRoutes: config =>
      config
        .addFile(
          'src/server/app.ts',
          () => `
import { clerkMiddleware, getAuth } from '@clerk/hono';
import { Hono } from 'hono';

export const app = new Hono();

app.use(
  '*',
  clerkMiddleware({
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
  }),
);

app.get('/m2m', c => {
  const { subject, tokenType, isAuthenticated } = getAuth(c, { acceptsToken: 'm2m_token' });

  if (!isAuthenticated) {
    return c.text('Unauthorized', 401);
  }

  return c.json({ subject, tokenType });
});
        `,
        )
        .addFile('src/server/main.ts', () => createMainFile()),
  },
  oauth: {
    verifyPath: '/api/oauth-verify',
    callbackPath: '/api/oauth/callback',
    addRoutes: config =>
      config
        .addFile(
          'src/server/app.ts',
          () => `
import { clerkMiddleware, getAuth } from '@clerk/hono';
import { Hono } from 'hono';

export const app = new Hono();

app.use(
  '*',
  clerkMiddleware({
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
  }),
);

app.get('/oauth-verify', c => {
  const { userId, tokenType } = getAuth(c, { acceptsToken: 'oauth_token' });

  if (!userId) {
    return c.text('Unauthorized', 401);
  }

  return c.json({ userId, tokenType });
});

app.get('/oauth/callback', c => {
  return c.json({ message: 'OAuth callback received' });
});
        `,
        )
        .addFile('src/server/main.ts', () => createMainFile()),
  },
};

test.describe('Hono machine authentication @machine', () => {
  registerApiKeyAuthTests(adapter);
  registerM2MAuthTests(adapter);
  registerOAuthAuthTests(adapter);
});
