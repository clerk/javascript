import type { User } from '@clerk/backend';
import { TokenType } from '@clerk/backend/internal';
import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import type { FakeAPIKey, FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';

test.describe('Next.js API key auth within clerkMiddleware() @machine', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;
  let fakeUser: FakeUser;
  let fakeBapiUser: User;
  let fakeAPIKey: FakeAPIKey;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouter
      .clone()
      .addFile(
        `src/middleware.ts`,
        () => `
        import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

        const isProtectedRoute = createRouteMatcher(['/api(.*)']);

        export default clerkMiddleware(async (auth, req) => {
          if (isProtectedRoute(req)) {
            await auth.protect({ token: 'api_key' });
          }
        });

        export const config = {
          matcher: [
            '/((?!.*\\..*|_next).*)', // Don't run middleware on static files
            '/', // Run middleware on index page
            '/(api|trpc)(.*)',
          ], // Run middleware on API routes
        };
        `,
      )
      .addFile(
        'src/app/api/me/route.ts',
        () => `
        import { auth } from '@clerk/nextjs/server';

        export async function GET() {
          const { userId, tokenType } = await auth({ acceptsToken: 'api_key' });

          return Response.json({ userId, tokenType });
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
});

test.describe('Next.js API key auth within routes @nextjs', () => {
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
        import { auth } from '@clerk/nextjs/server';

        export async function GET() {
          const { userId, tokenType } = await auth({ acceptsToken: 'api_key' });

          if (!userId) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          return Response.json({ userId, tokenType });
        }

        export async function POST() {
          const authObject = await auth({ acceptsToken: ['api_key', 'session_token'] });

          if (!authObject.isAuthenticated) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          return Response.json({ userId: authObject.userId, tokenType: authObject.tokenType });
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
