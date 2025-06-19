import type { User } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import type { FakeAPIKey, FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';

test.describe('auth.protect() with @xnextjs', () => {
  test.describe.configure({ mode: 'serial' });
  let app: Application;
  let fakeUser: FakeUser;
  let fakeBapiUser: User;
  let apiKey: FakeAPIKey;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouter
      .clone()
      .addFile(
        'src/app/api/api-key/route.ts',
        () => `
        import { NextResponse } from 'next/server';
        import { auth } from '@clerk/nextjs/server';

        export async function GET() {
          const { userId } = await auth.protect({ token: 'api_key' });
          return NextResponse.json({ userId });
        }

        export async function POST() {
          const { userId } = await auth.protect({ token: ['api_key', 'session_token'] });
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
    apiKey = await u.services.users.createFakeAPIKey(fakeBapiUser.id);
  });

  test.afterAll(async () => {
    await apiKey.revoke();
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test('should return 401 when no API key is provided', async () => {
    const res = await fetch(app.serverUrl + '/api/api-key');
    expect(res.status).toBe(401);
  });

  test('should return 401 when an invalid API key is provided', async () => {
    const res = await fetch(app.serverUrl + '/api/api-key', {
      headers: {
        Authorization: 'Bearer invalid_key',
      },
    });
    expect(res.status).toBe(401);
  });

  test('should return 401 when a malformed Authorization header is provided', async () => {
    const res = await fetch(app.serverUrl + '/api/api-key', {
      headers: {
        Authorization: 'malformed_header',
      },
    });
    expect(res.status).toBe(401);
  });

  test('should return 200 and userId with a valid API key', async () => {
    const res = await fetch(app.serverUrl + '/api/api-key', {
      headers: {
        Authorization: `Bearer ${apiKey.secret}`,
      },
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.userId).toBe(fakeBapiUser.id);
  });

  test('should return 401 when using a revoked API key', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const revokedKey = await u.services.users.createFakeAPIKey(fakeBapiUser.id);
    await revokedKey.revoke();

    const res = await fetch(app.serverUrl + '/api/api-key', {
      headers: {
        Authorization: `Bearer ${revokedKey.secret}`,
      },
    });

    expect(res.status).toBe(401);
  });

  test('should accept API key if in accepted tokens array', async () => {
    const res = await fetch(app.serverUrl + '/api/api-key', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.secret}`,
      },
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.userId).toBe(fakeBapiUser.id);
  });
});
