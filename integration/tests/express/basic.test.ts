import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('basic tests for @express', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });

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

  test('authenticates protected routes when user is signed in using getAuth()', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/');

    await u.po.signIn.waitForMounted();
    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();

    await u.po.userButton.waitForMounted();

    const url = new URL('/api/protected', app.serverUrl);
    const res = await u.page.request.get(url.toString());
    expect(res.status()).toBe(200);
    expect(await res.text()).toBe('Protected API response');
  });

  test('rejects protected routes when user is not authenticated using getAuth()', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/');

    await u.po.signIn.waitForMounted();

    const url = new URL('/api/protected', app.serverUrl);
    const res = await u.page.request.get(url.toString());
    expect(res.status()).toBe(401);
    expect(await res.text()).toBe('Unauthorized');
  });

  test('authenticates protected routes when user is signed in using legacy req.auth approach', async ({
    page,
    context,
  }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/');

    await u.po.signIn.waitForMounted();
    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();

    await u.po.userButton.waitForMounted();

    const url = new URL('/api/legacy/protected', app.serverUrl);
    const res = await u.page.request.get(url.toString());
    expect(res.status()).toBe(200);
    expect(await res.text()).toBe('Protected API response');
  });

  test('rejects protected routes when user is not authenticated using legacy req.auth approach', async ({
    page,
    context,
  }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/');

    await u.po.signIn.waitForMounted();

    const url = new URL('/api/legacy/protected', app.serverUrl);
    const res = await u.page.request.get(url.toString());
    expect(res.status()).toBe(401);
    expect(await res.text()).toBe('Unauthorized');
  });
});
