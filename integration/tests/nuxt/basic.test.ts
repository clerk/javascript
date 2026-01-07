import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeOrganization, FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withCustomRoles] })('basic tests for @nuxt', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });

  let fakeUser: FakeUser;
  let fakeOrganization: FakeOrganization;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser();
    const user = await u.services.users.createBapiUser(fakeUser);
    fakeOrganization = await u.services.users.createFakeOrganization(user.id);
  });

  test.afterAll(async () => {
    await fakeOrganization.delete();
    await fakeUser.deleteIfExists();

    await app.teardown();
  });

  test.afterEach(async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.signOut();
    await u.page.context().clearCookies();
  });

  test('render user profile with SSR data', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.po.userButton.waitForMounted();
    await u.page.goToRelative('/user-profile');
    await u.po.userProfile.waitForMounted();

    // Fetched from an API endpoint (/api/me), which is server-rendered.
    // This also verifies that the server middleware is working.
    await expect(u.page.getByText(`First name: ${fakeUser.firstName}`)).toBeVisible();
    await expect(u.page.getByText(`Email: ${fakeUser.email}`)).toBeVisible();
  });

  test('redirects to sign-in when unauthenticated', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.page.goToRelative('/user-profile');
    await u.page.waitForURL(`${app.serverUrl}/sign-in`);
    await u.po.signIn.waitForMounted();
  });

  test('renders control components contents in SSR', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.page.goToAppHome();
    await expect(u.page.getByText('You are signed out')).toBeVisible();

    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();
    await expect(u.page.getByText('You are signed in!')).toBeVisible();
  });

  test('renders <Show /> component contents to admin', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.waitForAppUrl('/');
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();
    await u.page.goToRelative('/only-admin');
    await expect(u.page.getByText('I am an admin')).toBeVisible();
  });
});
