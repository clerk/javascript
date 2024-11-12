import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeOrganization, FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withCustomRoles] })('basic tests for @vue', ({ app }) => {
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

  test('Clerk client loads and sign in button renders', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();
    await u.po.expect.toBeSignedOut();
    await expect(u.page.getByRole('link', { name: /Sign in/i })).toBeVisible();
  });

  test('render user button component when user completes sign in flow', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.waitForAppUrl('/');
    await u.po.userButton.waitForMounted();
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();

    await u.po.userButton.toHaveVisibleMenuItems([/Manage account/i, /Sign out$/i]);
  });

  test('render user profile and current user data', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.waitForAppUrl('/');
    await u.page.goToRelative('/profile');
    await u.po.userProfile.waitForMounted();
    await expect(u.page.getByText(`Hello, ${fakeUser.firstName}`)).toBeVisible();
  });

  test('redirects to sign-in when unauthenticated', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/profile');
    await u.page.waitForURL(`${app.serverUrl}/sign-in`);
    await u.po.signIn.waitForMounted();
  });

  test('renders <Protect /> component contents to admins', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.waitForAppUrl('/');
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();
    await u.page.goToRelative('/admin');
    await expect(u.page.getByText('I am an admin')).toBeVisible();
  });
});
