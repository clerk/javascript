import type { M2MToken, Machine } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import { createTestUtils } from '../../testUtils';

test.describe('M2M Token Authentication @machine', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;

  let primaryApiServer: Machine;
  let emailServer: Machine;
  let m2mToken: M2MToken;

  test.beforeAll(async () => {
    app = await appConfigs.express.vite
      .clone()
      .addFile(
        'src/server/main.ts',
        () => `
        import 'dotenv/config';
        import { clerkMiddleware, getAuth } from '@clerk/express';
        import express from 'express';
        import ViteExpress from 'vite-express';

        const app = express();

        app.use(clerkMiddleware());

        app.get('/api/protected', (req, res) => {
          const { machineId } = getAuth(req, { acceptsToken: 'm2m_token' });
          
          if (machineId) {
            return res.send('Authorized');
          } else {
            return res.status(401).send('Unauthorized');
          }
        });

        const port = parseInt(process.env.PORT as string) || 3002;
        ViteExpress.listen(app, port, () => console.log(\`Server is listening on port \${port}...\`));
        `,
      )
      .commit();

    await app.setup();
    await app.withEnv(appConfigs.envs.withAPIKeys);
    await app.dev();

    const u = createTestUtils({ app });

    try {
      primaryApiServer = await u.services.clerk.machines.create({
        name: 'Primary API Server',
      });

      emailServer = await u.services.clerk.machines.create({
        name: 'Email Server',
        scopedMachines: [primaryApiServer.id],
      });
      m2mToken = await u.services.clerk.m2mTokens.create({
        machineSecretKey: emailServer.secretKey,
        secondsUntilExpiration: 60 * 30, // 30 minutes
      });
    } catch (error) {
      console.error('ERROR IN BEFORE ALL', error);
    }
  });

  test.afterAll(async () => {
    const u = createTestUtils({ app });
    if (emailServer) {
      await u.services.clerk.machines.delete(emailServer.id);
    }
    if (primaryApiServer) {
      await u.services.clerk.machines.delete(primaryApiServer.id);
    }
    if (m2mToken) {
      await u.services.clerk.m2mTokens.revoke({
        m2mTokenId: m2mToken.id,
      });
    }
    await app.teardown();
  });

  test('should return 401 if no M2M token is provided', async ({ request }) => {
    const url = new URL('/api/protected', app.serverUrl);
    const res = await request.get(url.toString());
    expect(res.status()).toBe(401);
  });
});
