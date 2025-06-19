import { type User } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeAPIKey, FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withAPIKeys] })('auth() with API keys @xnextjs', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;
  let fakeBapiUser: User;
  let fakeAPIKey: FakeAPIKey;
  const u = createTestUtils({ app });

  test.beforeAll(async () => {
    fakeUser = u.services.users.createFakeUser();
    fakeBapiUser = await u.services.users.createBapiUser(fakeUser);
    fakeAPIKey = await u.services.users.createFakeAPIKey(fakeBapiUser.id);
  });

  test.afterAll(async () => {
    await fakeAPIKey.revoke();
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test('should validate API key authentication', async () => {
    // No API key provided
    const noKeyRes = await fetch(app.serverUrl + '/api/api-key');
    expect(noKeyRes.status).toBe(401);

    // Invalid API key
    const invalidKeyRes = await fetch(app.serverUrl + '/api/api-key', {
      headers: {
        Authorization: 'Bearer invalid_key',
      },
    });
    expect(invalidKeyRes.status).toBe(401);

    // Valid API key
    const validKeyRes = await fetch(app.serverUrl + '/api/api-key', {
      headers: {
        Authorization: `Bearer ${fakeAPIKey.secret}`,
      },
    });
    expect(validKeyRes.status).toBe(200);
  });

  test('should reject revoked API keys', async () => {
    // Create and immediately revoke a new key
    const tempKey = await u.services.users.createFakeAPIKey(fakeBapiUser.id);
    await tempKey.revoke();

    const res = await fetch(app.serverUrl + '/api/api-key', {
      headers: {
        Authorization: `Bearer ${tempKey.secret}`,
      },
    });
    expect(res.status).toBe(401);
  });

  test('should handle multiple token types correctly', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    // Sign in to get a session token
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    // GET endpoint (only accepts api_key)
    const getRes = await u.page.goToRelative('/api/api-key');
    expect(getRes.status()).toBe(401);

    const url = new URL('/api/api-key', app.serverUrl);

    // POST endpoint (accepts both api_key and session_token)
    // Test with session token
    const sessionCookie = (await context.cookies()).find(c => c.name === '__session');
    const postWithSessionRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionCookie?.value}`,
      },
    });
    const sessionData = await postWithSessionRes.json();
    expect(postWithSessionRes.status).toBe(200);
    expect(sessionData.userId).toBe(fakeBapiUser.id);

    // Test with API key
    const postWithApiKeyRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${fakeAPIKey.secret}`,
      },
    });
    const apiKeyData = await postWithApiKeyRes.json();
    expect(postWithApiKeyRes.status).toBe(200);
    expect(apiKeyData.userId).toBe(fakeBapiUser.id);
  });
});
