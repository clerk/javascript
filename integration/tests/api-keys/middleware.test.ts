import type { User } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import type { FakeAPIKey, FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';

test.describe('auth() and API key within clerkMiddleware() xnextjs', () => {
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
        import { NextResponse } from 'next/server';
        import { auth } from '@clerk/nextjs/server';

        export async function GET() {
          const { userId } = await auth({ acceptsToken: 'api_key' });
          return NextResponse.json({ userId });
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

  test('should validate API key', async () => {
    const url = new URL('/api/me', app.serverUrl);

    // No API key provided
    const noKeyRes = await fetch(url);
    expect(noKeyRes.status).toBe(401);

    // Invalid API key
    const invalidKeyRes = await fetch(url, {
      headers: {
        Authorization: 'Bearer invalid_key',
      },
    });
    expect(invalidKeyRes.status).toBe(401);

    // Valid API key
    const validKeyRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${fakeAPIKey.secret}`,
      },
    });
    const apiKeyData = await validKeyRes.json();
    expect(validKeyRes.status).toBe(200);
    expect(apiKeyData.userId).toBe(fakeBapiUser.id);
  });
});
