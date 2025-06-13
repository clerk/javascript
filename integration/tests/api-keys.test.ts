import { test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withAPIKeys] })('api keys @apiKeys', ({ app }) => {
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

  test.skip('can create an API key', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.page.goToRelative('/api-keys');

    // TODO: Replace with custom page object
    await u.po.page.waitForSelector('.cl-apiKeys-root');

    await u.po.page.getByRole('button', { name: 'Add new key' }).click();
    await u.po.page.locator('input[name=name]').fill('test-key');
  });

  test.skip('can create an API key with description and expiration', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.page.goToRelative('/api-keys');

    // TODO: Replace with custom page object
    await u.po.page.waitForSelector('.cl-apiKeys-root');

    await u.po.page.getByRole('button', { name: 'Add new key' }).click();
    await u.po.page.locator('input[name=name]').fill('test-key');

    await u.po.page.getByRole('button', { name: 'Show advanced settings' }).click();

    await u.po.page.locator('input[name=description]').fill('test-description');
    await u.po.page.locator('input[name=expiration]').fill('2025-01-01');
  });

  test.skip('user is prompted before revoking and can revoke an API key', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.page.goToRelative('/api-keys');

    // TODO: Replace with custom page object
    await u.po.page.waitForSelector('.cl-apiKeys-root');
  });
});
