import type { User } from '@clerk/backend';
import { TokenType } from '@clerk/backend/internal';
import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import { createTestUtils } from '../testUtils';
import type { MachineAuthTestAdapter } from '../testUtils/machineAuthHelpers';
import { registerApiKeyAuthTests, registerM2MAuthTests, registerOAuthAuthTests } from '../testUtils/machineAuthHelpers';
import type { FakeAPIKey, FakeUser } from '../testUtils/usersService';

const adapter: MachineAuthTestAdapter = {
  baseConfig: appConfigs.next.appRouter,
  apiKey: {
    path: '/api/me',
    addRoutes: config =>
      config.addFile(
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
      ),
  },
  m2m: {
    path: '/api/protected',
    addRoutes: config =>
      config.addFile(
        'src/app/api/protected/route.ts',
        () => `
        import { auth } from '@clerk/nextjs/server';

        export async function GET() {
          const { subject, tokenType, isAuthenticated } = await auth({ acceptsToken: 'm2m_token' });

          if (!isAuthenticated) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          return Response.json({ subject, tokenType });
        }
        `,
      ),
  },
  oauth: {
    verifyPath: '/api/protected',
    callbackPath: '/oauth/callback',
    addRoutes: config =>
      config
        .addFile(
          'src/app/api/protected/route.ts',
          () => `
          import { auth } from '@clerk/nextjs/server';

          export async function GET() {
            const { userId, tokenType } = await auth({ acceptsToken: 'oauth_token' });

            if (!userId) {
              return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }

            return Response.json({ userId, tokenType });
          }
          `,
        )
        .addFile(
          'src/app/oauth/callback/route.ts',
          () => `
          import { NextResponse } from 'next/server';

          export async function GET() {
            return NextResponse.json({ message: 'OAuth callback received' });
          }
          `,
        ),
  },
};

test.describe('Next.js machine authentication @machine', () => {
  registerApiKeyAuthTests(adapter);
  registerM2MAuthTests(adapter);
  registerOAuthAuthTests(adapter);

  test.describe('auth.protect() authorization with API keys', () => {
    test.describe.configure({ mode: 'parallel' });
    let app: Application;
    let fakeUser: FakeUser;
    let fakeBapiUser: User;
    let fakeAPIKey: FakeAPIKey;

    test.beforeAll(async () => {
      test.setTimeout(120_000);

      app = await appConfigs.next.appRouter
        .clone()
        .addFile(
          'src/app/api/protect/route.ts',
          () => `
          import { auth } from '@clerk/nextjs/server';

          export async function GET() {
            const { userId, tokenType } = await auth.protect({ token: 'api_key' });

            return Response.json({ userId, tokenType });
          }

          export async function POST() {
            const { userId } = await auth.protect({ role: 'org:admin' }, { token: ['session_token', 'api_key'] });

            return Response.json({ userId });
          }

          export async function PUT() {
            await auth.protect(() => false, { token: 'api_key' });

            return Response.json({ protected: true });
          }

          export async function PATCH() {
            const { userId, tokenType } = await auth.protect(() => true, { token: 'api_key' });

            return Response.json({ userId, tokenType });
          }
          `,
        )
        .commit();
      await app.setup();
      await app.withEnv(appConfigs.envs.withAPIKeys.clone());
      await app.dev();

      const u = await createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser(test);
      fakeBapiUser = await u.services.users.createBapiUser(fakeUser);
      fakeAPIKey = await u.services.users.createFakeAPIKey(fakeBapiUser.id);
    });

    test.afterAll(async () => {
      await fakeAPIKey?.revoke();
      await fakeUser?.deleteIfExists();
      await app?.teardown();
    });

    test('should return 200 if API key is valid and no authorization params are passed', async ({ request }) => {
      const res = await request.get(new URL('/api/protect', app.serverUrl).toString(), {
        headers: { Authorization: `Bearer ${fakeAPIKey.secret}` },
      });
      expect(res.status()).toBe(200);
      expect(await res.json()).toEqual({ userId: fakeBapiUser.id, tokenType: TokenType.ApiKey });
    });

    test('should return 401 if API key is valid but a role is required', async ({ request }) => {
      const res = await request.post(new URL('/api/protect', app.serverUrl).toString(), {
        headers: { Authorization: `Bearer ${fakeAPIKey.secret}` },
      });
      expect(res.status()).toBe(401);
    });

    test('should return 401 if API key is valid but the predicate returns false', async ({ request }) => {
      const res = await request.put(new URL('/api/protect', app.serverUrl).toString(), {
        headers: { Authorization: `Bearer ${fakeAPIKey.secret}` },
      });
      expect(res.status()).toBe(401);
    });

    test('should return 200 if API key is valid and the predicate returns true', async ({ request }) => {
      const res = await request.patch(new URL('/api/protect', app.serverUrl).toString(), {
        headers: { Authorization: `Bearer ${fakeAPIKey.secret}` },
      });
      expect(res.status()).toBe(200);
      expect(await res.json()).toEqual({ userId: fakeBapiUser.id, tokenType: TokenType.ApiKey });
    });
  });
});
