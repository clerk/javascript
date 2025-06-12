import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withBilling] })('api keys @apiKeys', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser();
    await u.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test('renders API keys component', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.page.goToRelative('/api-keys');

    await u.po.apiKeys.waitForMounted();
    await expect(u.po.page.getByRole('heading', { name: 'API Keys' })).toBeVisible();
  });
});
