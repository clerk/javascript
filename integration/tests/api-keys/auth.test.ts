import { type User } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeAPIKey, FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withAPIKeys] })('auth() with api keys @xnextjs', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;
  let fakeBapiUser: User;
  let apiKey: FakeAPIKey;
  const u = createTestUtils({ app });

  test.beforeAll(async () => {
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

  test('should return 200 with a valid API key', async () => {
    const res = await fetch(app.serverUrl + '/api/api-key', {
      headers: {
        Authorization: `Bearer ${apiKey.secret}`,
      },
    });

    expect(res.status).toBe(200);
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
