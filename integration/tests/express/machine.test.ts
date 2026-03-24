import type { User } from '@clerk/backend';
import { createClerkClient } from '@clerk/backend';
import { TokenType } from '@clerk/backend/internal';
import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import { instanceKeys } from '../../presets/envs';
import type { FakeAPIKey, FakeMachineNetwork, FakeOAuthApp, FakeUser } from '../../testUtils';
import {
  createFakeMachineNetwork,
  createFakeOAuthApp,
  createJwtM2MToken,
  createTestUtils,
  obtainOAuthAccessToken,
} from '../../testUtils';

test.describe('Express machine authentication @machine', () => {
  test.describe('API key auth', () => {
    test.describe.configure({ mode: 'parallel' });
    let app: Application;
    let fakeUser: FakeUser;
    let fakeBapiUser: User;
    let fakeAPIKey: FakeAPIKey;

    test.beforeAll(async () => {
      test.setTimeout(120_000);

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
          app.use(clerkMiddleware({ publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY }));

          app.get('/api/me', (req, res) => {
            const { userId, tokenType } = getAuth(req, { acceptsToken: 'api_key' });
            if (!userId) {
              return res.status(401).json({ error: 'Unauthorized' });
            }
            return res.json({ userId, tokenType });
          });

          const port = parseInt(process.env.PORT) || 3002;
          ViteExpress.listen(app, port, () => console.log('Server is listening on port ' + port));
          `,
        )
        .commit();

      await app.setup();
      await app.withEnv(appConfigs.envs.withAPIKeys);
      await app.dev();

      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser();
      fakeBapiUser = await u.services.users.createBapiUser(fakeUser);
      fakeAPIKey = await u.services.users.createFakeAPIKey(fakeBapiUser.id);
    });

    test.afterAll(async () => {
      await fakeAPIKey.revoke();
      await fakeUser.deleteIfExists();
      await app.teardown();
    });

    test('should return 401 if no API key is provided', async ({ request }) => {
      const url = new URL('/api/me', app.serverUrl);
      const res = await request.get(url.toString());
      expect(res.status()).toBe(401);
    });

    test('should return 401 if API key is invalid', async ({ request }) => {
      const url = new URL('/api/me', app.serverUrl);
      const res = await request.get(url.toString(), {
        headers: { Authorization: 'Bearer invalid_key' },
      });
      expect(res.status()).toBe(401);
    });

    test('should return 200 with auth object if API key is valid', async ({ request }) => {
      const url = new URL('/api/me', app.serverUrl);
      const res = await request.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${fakeAPIKey.secret}`,
        },
      });
      const apiKeyData = await res.json();
      expect(res.status()).toBe(200);
      expect(apiKeyData.userId).toBe(fakeBapiUser.id);
      expect(apiKeyData.tokenType).toBe(TokenType.ApiKey);
    });

    for (const [tokenType, token] of [
      ['M2M', 'mt_test_mismatch'],
      ['OAuth', 'oat_test_mismatch'],
    ] as const) {
      test(`rejects ${tokenType} token on API key route (token type mismatch)`, async ({ request }) => {
        const url = new URL('/api/me', app.serverUrl);
        const res = await request.get(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(res.status()).toBe(401);
      });
    }
  });

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
          import { clerkMiddleware, getAuth } from '@clerk/express';
          import express from 'express';
          import ViteExpress from 'vite-express';

          const app = express();
          app.use(clerkMiddleware({ publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY }));

          app.get('/api/m2m', (req, res) => {
            const { subject, tokenType, isAuthenticated } = getAuth(req, { acceptsToken: 'm2m_token' });
            if (!isAuthenticated) {
              return res.status(401).json({ error: 'Unauthorized' });
            }
            return res.json({ subject, tokenType });
          });

          const port = parseInt(process.env.PORT) || 3002;
          ViteExpress.listen(app, port, () => console.log('Server is listening on port ' + port));
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

    test('rejects requests with invalid M2M tokens', async ({ request }) => {
      const res = await request.get(app.serverUrl + '/api/m2m');
      expect(res.status()).toBe(401);

      const res2 = await request.get(app.serverUrl + '/api/m2m', {
        headers: { Authorization: 'Bearer mt_xxx' },
      });
      expect(res2.status()).toBe(401);
    });

    test('rejects M2M requests when sender machine lacks access to receiver machine', async ({ request }) => {
      const res = await request.get(app.serverUrl + '/api/m2m', {
        headers: { Authorization: `Bearer ${network.unscopedSenderToken.token}` },
      });
      expect(res.status()).toBe(401);
    });

    test('authorizes M2M requests when sender machine has proper access', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      const res = await u.page.request.get(app.serverUrl + '/api/m2m', {
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

      const res = await u.page.request.get(app.serverUrl + '/api/m2m', {
        headers: { Authorization: `Bearer ${m2mToken.token}` },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.subject).toBe(network.unscopedSender.id);
      expect(body.tokenType).toBe(TokenType.M2MToken);
      await u.services.clerk.m2m.revokeToken({ m2mTokenId: m2mToken.id });
    });

    test('verifies JWT format M2M token via local verification', async ({ request }) => {
      const client = createClerkClient({
        secretKey: instanceKeys.get('with-api-keys').sk,
      });
      const jwtToken = await createJwtM2MToken(client, network.scopedSender.secretKey);

      const res = await request.get(app.serverUrl + '/api/m2m', {
        headers: { Authorization: `Bearer ${jwtToken.token}` },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.subject).toBe(network.scopedSender.id);
      expect(body.tokenType).toBe(TokenType.M2MToken);
    });

    for (const [tokenType, token] of [
      ['API key', 'ak_test_mismatch'],
      ['OAuth', 'oat_test_mismatch'],
    ] as const) {
      test(`rejects ${tokenType} token on M2M route (token type mismatch)`, async ({ request }) => {
        const res = await request.get(app.serverUrl + '/api/m2m', {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(res.status()).toBe(401);
      });
    }
  });

  test.describe('OAuth auth', () => {
    test.describe.configure({ mode: 'parallel' });
    let app: Application;
    let fakeUser: FakeUser;
    let fakeOAuth: FakeOAuthApp;

    test.beforeAll(async () => {
      test.setTimeout(120_000);

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
          app.use(clerkMiddleware({ publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY }));

          app.get('/api/oauth-verify', (req, res) => {
            const { userId, tokenType } = getAuth(req, { acceptsToken: 'oauth_token' });
            if (!userId) {
              return res.status(401).json({ error: 'Unauthorized' });
            }
            return res.json({ userId, tokenType });
          });

          app.get('/api/oauth/callback', (req, res) => {
            return res.json({ message: 'OAuth callback received' });
          });

          const port = parseInt(process.env.PORT) || 3002;
          ViteExpress.listen(app, port, () => console.log('Server is listening on port ' + port));
          `,
        )
        .commit();

      await app.setup();
      await app.withEnv(appConfigs.envs.withAPIKeys);
      await app.dev();

      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser();
      await u.services.users.createBapiUser(fakeUser);

      const clerkClient = createClerkClient({
        secretKey: app.env.privateVariables.get('CLERK_SECRET_KEY'),
        publishableKey: app.env.publicVariables.get('CLERK_PUBLISHABLE_KEY'),
      });

      fakeOAuth = await createFakeOAuthApp(clerkClient, `${app.serverUrl}/api/oauth/callback`);
    });

    test.afterAll(async () => {
      await fakeOAuth.cleanup();
      await fakeUser.deleteIfExists();
      await app.teardown();
    });

    test('verifies valid OAuth access token obtained through authorization flow', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      const accessToken = await obtainOAuthAccessToken({
        page: u.page,
        oAuthApp: fakeOAuth.oAuthApp,
        redirectUri: `${app.serverUrl}/api/oauth/callback`,
        fakeUser,
        signIn: u.po.signIn,
      });

      const res = await u.page.request.get(new URL('/api/oauth-verify', app.serverUrl).toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(res.status()).toBe(200);
      const authData = await res.json();
      expect(authData.userId).toBeDefined();
      expect(authData.tokenType).toBe(TokenType.OAuthToken);
    });

    test('rejects request without OAuth token', async ({ request }) => {
      const url = new URL('/api/oauth-verify', app.serverUrl);
      const res = await request.get(url.toString());
      expect(res.status()).toBe(401);
    });

    test('rejects request with invalid OAuth token', async ({ request }) => {
      const url = new URL('/api/oauth-verify', app.serverUrl);
      const res = await request.get(url.toString(), {
        headers: { Authorization: 'Bearer invalid_oauth_token' },
      });
      expect(res.status()).toBe(401);
    });

    for (const [tokenType, token] of [
      ['API key', 'ak_test_mismatch'],
      ['M2M', 'mt_test_mismatch'],
    ] as const) {
      test(`rejects ${tokenType} token on OAuth route (token type mismatch)`, async ({ request }) => {
        const url = new URL('/api/oauth-verify', app.serverUrl);
        const res = await request.get(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(res.status()).toBe(401);
      });
    }
  });
});
