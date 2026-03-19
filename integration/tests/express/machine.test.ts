import { createClerkClient } from '@clerk/backend';
import { TokenType } from '@clerk/backend/internal';
import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import { instanceKeys } from '../../presets/envs';
import type { FakeMachineNetwork } from '../../testUtils';
import { createFakeMachineNetwork, createJwtM2MToken, createTestUtils } from '../../testUtils';

test.describe('Express machine authentication @express @machine', () => {
  test.describe('M2M auth', () => {
    test.describe.configure({ mode: 'parallel' });
    let app: Application;
    let network: FakeMachineNetwork;

    test.beforeAll(async () => {
      test.setTimeout(120_000);

      const client = createClerkClient({
        secretKey: instanceKeys.get('with-api-keys').sk,
      });
      network = await createFakeMachineNetwork(client);

      app = await appConfigs.express.vite
        .clone()
        .addFile(
          'src/server/main.ts',
          () => `
          import 'dotenv/config';
          import { clerkClient } from '@clerk/express';
          import express from 'express';
          import ViteExpress from 'vite-express';

          const app = express();

          app.get('/api/protected', async (req, res) => {
            const token = req.get('Authorization')?.split(' ')[1];
            try {
              const m2mToken = await clerkClient.m2m.verify({ token });
              res.json({ subject: m2mToken.subject, tokenType: '${TokenType.M2MToken}' });
            } catch {
              res.status(401).send('Unauthorized');
            }
          });

          const port = parseInt(process.env.PORT as string) || 3002;
          ViteExpress.listen(app, port, () => console.log('Server started'));
          `,
        )
        .commit();

      await app.setup();

      const env = appConfigs.envs.withAPIKeys
        .clone()
        .setEnvVariable('private', 'CLERK_MACHINE_SECRET_KEY', network.primaryServer.secretKey);
      await app.withEnv(env);
      await app.dev();
    });

    test.afterAll(async () => {
      await network.cleanup();
      await app.teardown();
    });

    test('rejects requests with invalid M2M tokens', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      const res = await u.page.request.get(app.serverUrl + '/api/protected', {
        headers: { Authorization: 'Bearer invalid' },
      });
      expect(res.status()).toBe(401);

      const res2 = await u.page.request.get(app.serverUrl + '/api/protected', {
        headers: { Authorization: 'Bearer mt_xxx' },
      });
      expect(res2.status()).toBe(401);
    });

    test('rejects M2M requests when sender machine lacks access to receiver machine', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      const res = await u.page.request.get(app.serverUrl + '/api/protected', {
        headers: { Authorization: `Bearer ${network.unscopedSenderToken.token}` },
      });
      expect(res.status()).toBe(401);
    });

    test('authorizes M2M requests when sender machine has proper access', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      const res = await u.page.request.get(app.serverUrl + '/api/protected', {
        headers: { Authorization: `Bearer ${network.scopedSenderToken.token}` },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.subject).toBe(network.scopedSender.id);
      expect(body.tokenType).toBe(TokenType.M2MToken);
    });

    test('authorizes after dynamically granting scope', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.services.clerk.machines.createScope(network.unscopedSender.id, network.primaryServer.id);
      const m2mToken = await u.services.clerk.m2m.createToken({
        machineSecretKey: network.unscopedSender.secretKey,
        secondsUntilExpiration: 60 * 30,
      });

      const res = await u.page.request.get(app.serverUrl + '/api/protected', {
        headers: { Authorization: `Bearer ${m2mToken.token}` },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.subject).toBe(network.unscopedSender.id);
      expect(body.tokenType).toBe(TokenType.M2MToken);
      await u.services.clerk.m2m.revokeToken({ m2mTokenId: m2mToken.id });
    });

    test('verifies JWT format M2M token via local verification', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      const client = createClerkClient({
        secretKey: instanceKeys.get('with-api-keys').sk,
      });
      const jwtToken = await createJwtM2MToken(client, network.scopedSender.secretKey);

      const res = await u.page.request.get(app.serverUrl + '/api/protected', {
        headers: { Authorization: `Bearer ${jwtToken.token}` },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.subject).toBe(network.scopedSender.id);
      expect(body.tokenType).toBe(TokenType.M2MToken);
    });
  });
});
