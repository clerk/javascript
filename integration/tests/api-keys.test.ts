import { createClerkClient, type User } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import { instanceKeys } from '../presets/envs';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withAPIKeys] })('api keys @xnextjs', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;
  let fakeBapiUser: User;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser();
    fakeBapiUser = await u.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test('should throw 401', async () => {
    const res = await fetch(app.serverUrl + '/api/api-key');

    expect(res.status).toBe(401);
  });

  test('should send 200', async () => {
    const client = createClerkClient({
      secretKey: instanceKeys.get('with-api-keys').sk,
      publishableKey: instanceKeys.get('with-api-keys').pk,
    });

    const apiKey = await client.apiKeys.create({
      type: 'api_key',
      subject: fakeBapiUser.id,
      name: `${fakeBapiUser.firstName} api key`,
    });
    console.log('api key created', apiKey);
    const { secret } = await client.apiKeys.getSecret(apiKey.id);
    console.log('secret', secret);
    const res = await fetch(app.serverUrl + '/api/api-key', {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    });

    await client.apiKeys.revoke({
      apiKeyId: apiKey.id,
    });

    expect(res.status).toBe(200);
  });
});
