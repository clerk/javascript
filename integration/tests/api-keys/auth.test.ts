import type { User } from '@clerk/backend';
import { TokenType } from '@clerk/backend/internal';
import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import type { FakeAPIKey, FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';

test.describe('auth() with API keys @nextjs', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;
  let fakeUser: FakeUser;
  let fakeBapiUser: User;
  let fakeAPIKey: FakeAPIKey;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouter
      .clone()
      .addFile(
        'src/app/api/me/route.ts',
        () => `
        import { NextResponse } from 'next/server';
        import { auth } from '@clerk/nextjs/server';

        export async function GET() {
          const { userId, tokenType } = await auth({ acceptsToken: 'api_key' });

          if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          return NextResponse.json({ userId, tokenType });
        }

        export async function POST() {
          const authObject = await auth({ acceptsToken: ['api_key', 'session_token'] });

          if (!authObject.isAuthenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          return NextResponse.json({ userId: authObject.userId, tokenType: authObject.tokenType });
        }
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

  test('should validate API key', async ({ page, context }) => {
    const url = new URL('/api/me', app.serverUrl);
    const u = createTestUtils({ app, page, context });

    // No API key provided
    const noKeyRes = await u.page.request.get(url.toString());
    expect(noKeyRes.status()).toBe(401);

    // Invalid API key
    const invalidKeyRes = await u.page.request.get(url.toString(), {
      headers: {
        Authorization: 'Bearer invalid_key',
      },
    });
    expect(invalidKeyRes.status()).toBe(401);

    // Valid API key
    const validKeyRes = await u.page.request.get(url.toString(), {
      headers: {
        Authorization: `Bearer ${fakeAPIKey.secret}`,
      },
    });
    const apiKeyData = await validKeyRes.json();
    expect(validKeyRes.status()).toBe(200);
    expect(apiKeyData.userId).toBe(fakeBapiUser.id);
    expect(apiKeyData.tokenType).toBe(TokenType.ApiKey);
  });

  test('should handle multiple token types', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const url = new URL('/api/me', app.serverUrl);

    // Sign in to get a session token
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    // GET endpoint (only accepts api_key)
    const getRes = await u.page.request.get(url.toString());
    expect(getRes.status()).toBe(401);

    // POST endpoint (accepts both api_key and session_token)
    // Test with session token
    const postWithSessionRes = await u.page.request.post(url.toString());
    const sessionData = await postWithSessionRes.json();
    expect(postWithSessionRes.status()).toBe(200);
    expect(sessionData.userId).toBe(fakeBapiUser.id);
    expect(sessionData.tokenType).toBe(TokenType.SessionToken);

    // Test with API key
    const postWithApiKeyRes = await u.page.request.post(url.toString(), {
      headers: {
        Authorization: `Bearer ${fakeAPIKey.secret}`,
      },
    });
    const apiKeyData = await postWithApiKeyRes.json();
    expect(postWithApiKeyRes.status()).toBe(200);
    expect(apiKeyData.userId).toBe(fakeBapiUser.id);
    expect(apiKeyData.tokenType).toBe(TokenType.ApiKey);
  });
});

test.describe('auth.protect() with API keys @nextjs', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;
  let fakeUser: FakeUser;
  let fakeBapiUser: User;
  let fakeAPIKey: FakeAPIKey;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouter
      .clone()
      .addFile(
        'src/app/api/me/route.ts',
        () => `
        import { NextResponse } from 'next/server';
        import { auth } from '@clerk/nextjs/server';

        export async function GET() {
          const { userId, tokenType } = await auth.protect({ token: 'api_key' });
          return NextResponse.json({ userId, tokenType });
        }

        export async function POST() {
          const { userId, tokenType } = await auth.protect({ token: ['api_key', 'session_token'] });
          return NextResponse.json({ userId, tokenType });
        }
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

  test.skip('should validate API key', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const url = new URL('/api/me', app.serverUrl);

    // No API key provided
    const noKeyRes = await u.page.request.get(url.toString());
    expect(noKeyRes.status()).toBe(401);

    // Invalid API key
    const invalidKeyRes = await u.page.request.get(url.toString(), {
      headers: {
        Authorization: 'Bearer invalid_key',
      },
    });
    expect(invalidKeyRes.status()).toBe(401);

    // Valid API key
    const validKeyRes = await u.page.request.get(url.toString(), {
      headers: {
        Authorization: `Bearer ${fakeAPIKey.secret}`,
      },
    });
    const apiKeyData = await validKeyRes.json();
    expect(validKeyRes.status()).toBe(200);
    expect(apiKeyData.userId).toBe(fakeBapiUser.id);
    expect(apiKeyData.tokenType).toBe(TokenType.ApiKey);
  });

  test('should handle multiple token types', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const url = new URL('/api/me', app.serverUrl);

    // Sign in to get a session token
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    // GET endpoint (only accepts api_key)
    const getRes = await u.page.request.get(url.toString(), {
      headers: {
        'Sec-Fetch-Dest': 'document',
      },
    });
    expect(getRes.status()).toBe(401);

    // POST endpoint (accepts both api_key and session_token)
    // Test with session token
    const postWithSessionRes = await u.page.request.post(url.toString());
    const sessionData = await postWithSessionRes.json();
    expect(postWithSessionRes.status()).toBe(200);
    expect(sessionData.userId).toBe(fakeBapiUser.id);
    expect(sessionData.tokenType).toBe(TokenType.SessionToken);

    // Test with API key
    const postWithApiKeyRes = await u.page.request.post(url.toString(), {
      headers: {
        Authorization: `Bearer ${fakeAPIKey.secret}`,
      },
    });
    const apiKeyData = await postWithApiKeyRes.json();
    expect(postWithApiKeyRes.status()).toBe(200);
    expect(apiKeyData.userId).toBe(fakeBapiUser.id);
    expect(apiKeyData.tokenType).toBe(TokenType.ApiKey);
  });
});
