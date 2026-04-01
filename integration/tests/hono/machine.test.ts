import { test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { MachineAuthTestAdapter } from '../../testUtils/machineAuthHelpers';
import {
  registerApiKeyAuthTests,
  registerM2MAuthTests,
  registerOAuthAuthTests,
} from '../../testUtils/machineAuthHelpers';

const createAppFile = (routes: string) => `
import { clerkMiddleware, getAuth } from '@clerk/hono';
import { Hono } from 'hono';

const app = new Hono();

app.use('*', clerkMiddleware());

${routes}

export default app;
`;

const createMainFile = () => `
import 'dotenv/config';

import { serve } from '@hono/node-server';
import app from './app';

const port = parseInt(process.env.PORT as string) || 3002;
serve({ fetch: app.fetch, port }, () => console.log(\`Server is listening on port \${port}...\`));
`;

const adapter: MachineAuthTestAdapter = {
  baseConfig: appConfigs.hono.vite,
  apiKey: {
    path: '/api/me',
    addRoutes: config =>
      config
        .addFile('src/server/app.ts', () =>
          createAppFile(`
app.get('/api/me', c => {
  const { userId, tokenType } = getAuth(c, { acceptsToken: 'api_key' });

  if (!userId) {
    return c.text('Unauthorized', 401);
  }

  return c.json({ userId, tokenType });
});

app.post('/api/me', c => {
  const authObject = getAuth(c, { acceptsToken: ['api_key', 'session_token'] });

  if (!authObject.isAuthenticated) {
    return c.text('Unauthorized', 401);
  }

  return c.json({ userId: authObject.userId, tokenType: authObject.tokenType });
});
`),
        )
        .addFile('src/server/main.ts', () => createMainFile()),
  },
  m2m: {
    path: '/api/m2m',
    addRoutes: config =>
      config
        .addFile('src/server/app.ts', () =>
          createAppFile(`
app.get('/api/m2m', c => {
  const { subject, tokenType, isAuthenticated } = getAuth(c, { acceptsToken: 'm2m_token' });

  if (!isAuthenticated) {
    return c.text('Unauthorized', 401);
  }

  return c.json({ subject, tokenType });
});
`),
        )
        .addFile('src/server/main.ts', () => createMainFile()),
  },
  oauth: {
    verifyPath: '/api/oauth-verify',
    callbackPath: '/api/oauth/callback',
    addRoutes: config =>
      config
        .addFile('src/server/app.ts', () =>
          createAppFile(`
app.get('/api/oauth-verify', c => {
  const { userId, tokenType } = getAuth(c, { acceptsToken: 'oauth_token' });

  if (!userId) {
    return c.text('Unauthorized', 401);
  }

  return c.json({ userId, tokenType });
});

app.get('/api/oauth/callback', c => {
  return c.json({ message: 'OAuth callback received' });
});
`),
        )
        .addFile('src/server/main.ts', () => createMainFile()),
  },
};

test.describe('Hono machine authentication @machine', () => {
  registerApiKeyAuthTests(adapter);
  registerM2MAuthTests(adapter);
  registerOAuthAuthTests(adapter);
});
