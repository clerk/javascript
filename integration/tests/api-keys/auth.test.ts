import { type User } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeAPIKey, FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withAPIKeys] })('auth() with API keys @xnextjs', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });

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

  test('should validate API key', async () => {
    const url = new URL('/api/machine', app.serverUrl);

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

  test('should handle multiple token types', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const url = new URL('/api/machine', app.serverUrl);

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
