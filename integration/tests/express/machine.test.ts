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

import { clerkMiddleware } from '@clerk/express';
import express from 'express';
import ViteExpress from 'vite-express';
import { machineRoutes } from './routes/machine';

const app = express();

app.use(express.json());
app.use(
  clerkMiddleware({
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
  }),
);

app.use('/api', machineRoutes);

const port = parseInt(process.env.PORT as string) || 3002;
ViteExpress.listen(app, port, () => console.log(\`Server is listening on port \${port}...\`));
`;

const adapter: MachineAuthTestAdapter = {
  baseConfig: appConfigs.express.vite,
  apiKey: {
    path: '/api/me',
    addRoutes: config =>
      config
        .addFile(
          'src/server/routes/machine.ts',
          () => `
import { getAuth } from '@clerk/express';
import { Router } from 'express';

const router = Router();

router.get('/me', (req: any, res: any) => {
  const { userId, tokenType } = getAuth(req, { acceptsToken: 'api_key' });

  if (!userId) {
    res.status(401).send('Unauthorized');
    return;
  }

  res.json({ userId, tokenType });
});

router.post('/me', (req: any, res: any) => {
  const authObject = getAuth(req, { acceptsToken: ['api_key', 'session_token'] });

  if (!authObject.isAuthenticated) {
    res.status(401).send('Unauthorized');
    return;
  }

  res.json({ userId: authObject.userId, tokenType: authObject.tokenType });
});

export const machineRoutes = router;
        `,
        )
        .addFile('src/server/main.ts', () => createMainFile()),
  },
  m2m: {
    path: '/api/m2m',
    addRoutes: config =>
      config
        .addFile(
          'src/server/routes/machine.ts',
          () => `
import { getAuth } from '@clerk/express';
import { Router } from 'express';

const router = Router();

router.get('/m2m', (req: any, res: any) => {
  const { subject, tokenType, machineId } = getAuth(req, { acceptsToken: 'm2m_token' });

  if (!machineId) {
    res.status(401).send('Unauthorized');
    return;
  }

  res.json({ subject, tokenType });
});

export const machineRoutes = router;
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
          'src/server/routes/machine.ts',
          () => `
import { getAuth } from '@clerk/express';
import { Router } from 'express';

const router = Router();

router.get('/oauth-verify', (req: any, res: any) => {
  const { userId, tokenType } = getAuth(req, { acceptsToken: 'oauth_token' });

  if (!userId) {
    res.status(401).send('Unauthorized');
    return;
  }

  res.json({ userId, tokenType });
});

router.get('/oauth/callback', (_req: any, res: any) => {
  res.json({ message: 'OAuth callback received' });
});

export const machineRoutes = router;
        `,
        )
        .addFile('src/server/main.ts', () => createMainFile()),
  },
};

test.describe('Express machine authentication @machine', () => {
  registerApiKeyAuthTests(adapter);
  registerM2MAuthTests(adapter);
  registerOAuthAuthTests(adapter);
});
