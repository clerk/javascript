import type { User } from '@clerk/backend';
import { TokenType } from '@clerk/backend/internal';
import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import type { FakeAPIKey, FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';

test.describe('Astro machine authentication within routes @machine', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;
  let fakeUser: FakeUser;
  let fakeBapiUser: User;
  let fakeAPIKey: FakeAPIKey;

  test.beforeAll(async () => {
    test.setTimeout(90_000); // Wait for app to be ready

    app = await appConfigs.astro.node
      .clone()
      .addFile(
        'src/pages/api/auth/me.ts',
        () => `
        import type { APIRoute } from 'astro';

        const unautorized = () =>
            new Response('Unauthorized', {
                status: 401,
            });

        export const GET: APIRoute = ({ locals }) => {
            const { userId, tokenType } = locals.auth({ acceptsToken: 'api_key' });

            if (!userId) {
                return unautorized();
            }

            return Response.json({ userId, tokenType });
        };
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
    const url = new URL('/api/auth/me', app.serverUrl);
    const res = await request.get(url.toString());
    expect(res.status()).toBe(401);
  });

  test('should return 401 if API key is invalid', async ({ request }) => {
    const url = new URL('/api/auth/me', app.serverUrl);
    const res = await request.get(url.toString(), {
      headers: { Authorization: 'Bearer invalid_key' },
    });
    expect(res.status()).toBe(401);
  });

  test('should return 200 with auth object if API key is valid', async ({ request }) => {
    const url = new URL('/api/auth/me', app.serverUrl);
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

test.describe('Astro machine authentication within clerkMiddleware() @machine', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;
  let fakeUser: FakeUser;
  let fakeBapiUser: User;
  let fakeAPIKey: FakeAPIKey;

  test.beforeAll(async () => {
    test.setTimeout(90_000); // Wait for app to be ready
    app = await appConfigs.astro.node
      .clone()
      .addFile(
        `src/middleware.ts`,
        () => `
        import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

        const isProtectedRoute = createRouteMatcher(['/api(.*)']);

        export const onRequest = clerkMiddleware((auth, context) => {
          const { userId } = auth({ acceptsToken: 'api_key' })

          if (!userId && isProtectedRoute(context.request)) {
            return new Response('Unauthorized', { status: 401 });
          }
        });
        `,
      )
      .addFile(
        'src/pages/api/auth/me.ts',
        () => `
        import type { APIRoute } from 'astro';

        export const GET: APIRoute = ({ locals, request }) => {
          const { userId, tokenType } = locals.auth({ acceptsToken: 'api_key' })

          return Response.json({ userId, tokenType });
        };`,
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
    const url = new URL('/api/auth/me', app.serverUrl);
    const res = await request.get(url.toString());
    expect(res.status()).toBe(401);
  });

  test('should return 401 if API key is invalid', async ({ request }) => {
    const url = new URL('/api/auth/me', app.serverUrl);
    const res = await request.get(url.toString(), {
      headers: { Authorization: 'Bearer invalid_key' },
    });
    expect(res.status()).toBe(401);
  });

  test('should return 200 with auth object if API key is valid', async ({ request }) => {
    const url = new URL('/api/auth/me', app.serverUrl);
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
