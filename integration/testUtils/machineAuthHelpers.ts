import { randomBytes } from 'node:crypto';

import type { ClerkClient, M2MToken, Machine, OAuthApplication, User } from '@clerk/backend';
import { createClerkClient } from '@clerk/backend';
import { TokenType } from '@clerk/backend/internal';
import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import type { ApplicationConfig } from '../models/applicationConfig';
import type { EnvironmentConfig } from '../models/environment';
import { appConfigs } from '../presets';
import { instanceKeys } from '../presets/envs';
import type { FakeAPIKey, FakeUser } from './usersService';
import { createTestUtils } from './index';

export type FakeMachineNetwork = {
  primaryServer: Machine;
  scopedSender: Machine;
  unscopedSender: Machine;
  scopedSenderToken: M2MToken;
  unscopedSenderToken: M2MToken;
  cleanup: () => Promise<void>;
};

async function createFakeMachineNetwork(clerkClient: ClerkClient): Promise<FakeMachineNetwork> {
  const fakeCompanyName = faker.company.name();

  const primaryServer = await clerkClient.machines.create({
    name: `${fakeCompanyName} Primary API Server`,
  });

  const scopedSender = await clerkClient.machines.create({
    name: `${fakeCompanyName} Scoped Sender`,
    scopedMachines: [primaryServer.id],
  });
  const scopedSenderToken = await clerkClient.m2m.createToken({
    machineSecretKey: scopedSender.secretKey,
    secondsUntilExpiration: 60 * 30,
  });

  const unscopedSender = await clerkClient.machines.create({
    name: `${fakeCompanyName} Unscoped Sender`,
  });
  const unscopedSenderToken = await clerkClient.m2m.createToken({
    machineSecretKey: unscopedSender.secretKey,
    secondsUntilExpiration: 60 * 30,
  });

  return {
    primaryServer,
    scopedSender,
    unscopedSender,
    scopedSenderToken,
    unscopedSenderToken,
    cleanup: async () => {
      await Promise.all([
        clerkClient.m2m.revokeToken({ m2mTokenId: scopedSenderToken.id }),
        clerkClient.m2m.revokeToken({ m2mTokenId: unscopedSenderToken.id }),
      ]);
      await Promise.all([
        clerkClient.machines.delete(scopedSender.id),
        clerkClient.machines.delete(unscopedSender.id),
        clerkClient.machines.delete(primaryServer.id),
      ]);
    },
  };
}

async function createJwtM2MToken(clerkClient: ClerkClient, senderSecretKey: string): Promise<M2MToken> {
  return clerkClient.m2m.createToken({
    machineSecretKey: senderSecretKey,
    secondsUntilExpiration: 60 * 30,
    tokenFormat: 'jwt',
  });
}

export type FakeOAuthApp = {
  oAuthApp: OAuthApplication;
  cleanup: () => Promise<void>;
};

async function createFakeOAuthApp(clerkClient: ClerkClient, callbackUrl: string): Promise<FakeOAuthApp> {
  const oAuthApp = await clerkClient.oauthApplications.create({
    name: `Integration Test OAuth App - ${Date.now()}`,
    redirectUris: [callbackUrl],
    scopes: 'profile email',
  });

  return {
    oAuthApp,
    cleanup: async () => {
      await clerkClient.oauthApplications.delete(oAuthApp.id);
    },
  };
}

export type ObtainOAuthAccessTokenParams = {
  page: Page;
  oAuthApp: OAuthApplication;
  redirectUri: string;
  fakeUser: { email?: string; password: string };
  signIn: {
    waitForMounted: (...args: any[]) => Promise<any>;
    signInWithEmailAndInstantPassword: (params: { email: string; password: string }) => Promise<any>;
  };
};

async function obtainOAuthAccessToken({
  page,
  oAuthApp,
  redirectUri,
  fakeUser,
  signIn,
}: ObtainOAuthAccessTokenParams): Promise<string> {
  const state = randomBytes(16).toString('hex');
  const authorizeUrl = new URL(oAuthApp.authorizeUrl);
  authorizeUrl.searchParams.set('client_id', oAuthApp.clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('scope', 'profile email');
  authorizeUrl.searchParams.set('state', state);

  await page.goto(authorizeUrl.toString());

  await signIn.waitForMounted();
  await signIn.signInWithEmailAndInstantPassword({
    email: fakeUser.email,
    password: fakeUser.password,
  });

  const consentButton = page.getByRole('button', { name: 'Allow' });
  await consentButton.waitFor({ timeout: 10000 });
  await consentButton.click();

  await page.waitForURL(/oauth\/callback/, { timeout: 10000 });
  const callbackUrl = new URL(page.url());
  const authCode = callbackUrl.searchParams.get('code');
  expect(authCode).toBeTruthy();

  expect(oAuthApp.clientSecret).toBeTruthy();
  const tokenResponse = await page.request.post(oAuthApp.tokenFetchUrl, {
    data: new URLSearchParams({
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: redirectUri,
      client_id: oAuthApp.clientId,
      client_secret: oAuthApp.clientSecret,
    }).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  expect(tokenResponse.status()).toBe(200);
  const tokenData = (await tokenResponse.json()) as { access_token?: string };
  expect(tokenData.access_token).toBeTruthy();

  return tokenData.access_token;
}

type RouteBuilder = (config: ApplicationConfig) => ApplicationConfig;

export type MachineAuthTestAdapter = {
  baseConfig: ApplicationConfig;
  apiKey: {
    path: string;
    addRoutes: RouteBuilder;
  };
  m2m: {
    path: string;
    addRoutes: RouteBuilder;
  };
  oauth: {
    verifyPath: string;
    callbackPath: string;
    addRoutes: RouteBuilder;
  };
};

const createApiKeysEnv = (): EnvironmentConfig => appConfigs.envs.withAPIKeys.clone();

const createMachineClient = () =>
  createClerkClient({
    secretKey: instanceKeys.get('with-api-keys').sk,
  });

const buildApp = async (adapter: MachineAuthTestAdapter, addRoutes: RouteBuilder): Promise<Application> => {
  const config = addRoutes(adapter.baseConfig.clone());
  return config.commit();
};

const createOAuthClient = (app: Application) =>
  createClerkClient({
    secretKey: app.env.privateVariables.get('CLERK_SECRET_KEY'),
    publishableKey: app.env.publicVariables.get('CLERK_PUBLISHABLE_KEY'),
  });

export const registerApiKeyAuthTests = (adapter: MachineAuthTestAdapter): void => {
  test.describe('API key auth', () => {
    test.describe.configure({ mode: 'parallel' });
    let app: Application;
    let fakeUser: FakeUser;
    let fakeBapiUser: User;
    let fakeAPIKey: FakeAPIKey;

    test.beforeAll(async () => {
      test.setTimeout(120_000);

      app = await buildApp(adapter, adapter.apiKey.addRoutes);
      await app.setup();
      await app.withEnv(createApiKeysEnv());
      await app.dev();

      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser();
      fakeBapiUser = await u.services.users.createBapiUser(fakeUser);
      fakeAPIKey = await u.services.users.createFakeAPIKey(fakeBapiUser.id);
    });

    test.afterAll(async () => {
      await fakeAPIKey?.revoke();
      await fakeUser?.deleteIfExists();
      await app?.teardown();
    });

    test('should return 401 if no API key is provided', async ({ request }) => {
      const res = await request.get(new URL(adapter.apiKey.path, app.serverUrl).toString());
      expect(res.status()).toBe(401);
    });

    test('should return 401 if API key is invalid', async ({ request }) => {
      const res = await request.get(new URL(adapter.apiKey.path, app.serverUrl).toString(), {
        headers: { Authorization: 'Bearer invalid_key' },
      });
      expect(res.status()).toBe(401);
    });

    test('should return 200 with auth object if API key is valid', async ({ request }) => {
      const res = await request.get(new URL(adapter.apiKey.path, app.serverUrl).toString(), {
        headers: { Authorization: `Bearer ${fakeAPIKey.secret}` },
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
        const res = await request.get(new URL(adapter.apiKey.path, app.serverUrl).toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(res.status()).toBe(401);
      });
    }

    test('should handle multiple token types', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const url = new URL(adapter.apiKey.path, app.serverUrl).toString();

      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();

      const getRes = await u.page.request.get(url);
      expect(getRes.status()).toBe(401);

      const postWithSessionRes = await u.page.request.post(url);
      const sessionData = await postWithSessionRes.json();
      expect(postWithSessionRes.status()).toBe(200);
      expect(sessionData.userId).toBe(fakeBapiUser.id);
      expect(sessionData.tokenType).toBe(TokenType.SessionToken);

      const postWithApiKeyRes = await u.page.request.post(url, {
        headers: { Authorization: `Bearer ${fakeAPIKey.secret}` },
      });
      const apiKeyData = await postWithApiKeyRes.json();
      expect(postWithApiKeyRes.status()).toBe(200);
      expect(apiKeyData.userId).toBe(fakeBapiUser.id);
      expect(apiKeyData.tokenType).toBe(TokenType.ApiKey);
    });
  });
};

export const registerM2MAuthTests = (adapter: MachineAuthTestAdapter): void => {
  test.describe('M2M auth', () => {
    test.describe.configure({ mode: 'parallel' });
    let app: Application;
    let network: FakeMachineNetwork;

    test.beforeAll(async () => {
      test.setTimeout(120_000);

      network = await createFakeMachineNetwork(createMachineClient());
      app = await buildApp(adapter, adapter.m2m.addRoutes);
      await app.setup();

      const env = createApiKeysEnv().setEnvVariable(
        'private',
        'CLERK_MACHINE_SECRET_KEY',
        network.primaryServer.secretKey,
      );
      await app.withEnv(env);
      await app.dev();
    });

    test.afterAll(async () => {
      await network?.cleanup();
      await app?.teardown();
    });

    test('rejects requests with invalid M2M tokens', async ({ request }) => {
      const url = new URL(adapter.m2m.path, app.serverUrl).toString();
      const res = await request.get(url);
      expect(res.status()).toBe(401);

      const res2 = await request.get(url, {
        headers: { Authorization: 'Bearer mt_xxx' },
      });
      expect(res2.status()).toBe(401);
    });

    test('rejects M2M requests when sender machine lacks access to receiver machine', async ({ request }) => {
      const res = await request.get(new URL(adapter.m2m.path, app.serverUrl).toString(), {
        headers: { Authorization: `Bearer ${network.unscopedSenderToken.token}` },
      });
      expect(res.status()).toBe(401);
    });

    test('authorizes M2M requests when sender machine has proper access', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      const res = await u.page.request.get(new URL(adapter.m2m.path, app.serverUrl).toString(), {
        headers: { Authorization: `Bearer ${network.scopedSenderToken.token}` },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.subject).toBe(network.scopedSender.id);
      expect(body.tokenType).toBe(TokenType.M2MToken);
    });

    test('verifies JWT format M2M token via local verification', async ({ request }) => {
      const jwtToken = await createJwtM2MToken(createMachineClient(), network.scopedSender.secretKey);

      const res = await request.get(new URL(adapter.m2m.path, app.serverUrl).toString(), {
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
        const res = await request.get(new URL(adapter.m2m.path, app.serverUrl).toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(res.status()).toBe(401);
      });
    }
  });
};

export const registerOAuthAuthTests = (adapter: MachineAuthTestAdapter): void => {
  test.describe('OAuth auth', () => {
    test.describe.configure({ mode: 'parallel' });
    let app: Application;
    let fakeUser: FakeUser;
    let fakeOAuth: FakeOAuthApp;

    test.beforeAll(async () => {
      test.setTimeout(120_000);

      app = await buildApp(adapter, adapter.oauth.addRoutes);
      await app.setup();
      await app.withEnv(createApiKeysEnv());
      await app.dev();

      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser();
      await u.services.users.createBapiUser(fakeUser);
      fakeOAuth = await createFakeOAuthApp(
        createOAuthClient(app),
        new URL(adapter.oauth.callbackPath, app.serverUrl).toString(),
      );
    });

    test.afterAll(async () => {
      await fakeOAuth?.cleanup();
      await fakeUser?.deleteIfExists();
      await app?.teardown();
    });

    test('verifies valid OAuth access token obtained through authorization flow', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const accessToken = await obtainOAuthAccessToken({
        page: u.page,
        oAuthApp: fakeOAuth.oAuthApp,
        redirectUri: new URL(adapter.oauth.callbackPath, app.serverUrl).toString(),
        fakeUser,
        signIn: u.po.signIn,
      });

      const res = await u.page.request.get(new URL(adapter.oauth.verifyPath, app.serverUrl).toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(res.status()).toBe(200);
      const authData = await res.json();
      expect(authData.userId).toBeDefined();
      expect(authData.tokenType).toBe(TokenType.OAuthToken);
    });

    test('rejects request without OAuth token', async ({ request }) => {
      const res = await request.get(new URL(adapter.oauth.verifyPath, app.serverUrl).toString());
      expect(res.status()).toBe(401);
    });

    test('rejects request with invalid OAuth token', async ({ request }) => {
      const res = await request.get(new URL(adapter.oauth.verifyPath, app.serverUrl).toString(), {
        headers: { Authorization: 'Bearer invalid_oauth_token' },
      });
      expect(res.status()).toBe(401);
    });

    for (const [tokenType, token] of [
      ['API key', 'ak_test_mismatch'],
      ['M2M', 'mt_test_mismatch'],
    ] as const) {
      test(`rejects ${tokenType} token on OAuth route (token type mismatch)`, async ({ request }) => {
        const res = await request.get(new URL(adapter.oauth.verifyPath, app.serverUrl).toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(res.status()).toBe(401);
      });
    }
  });
};
