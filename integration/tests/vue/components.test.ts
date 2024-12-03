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

  test('render user button with custom menu items', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.waitForAppUrl('/');
    await u.po.userButton.waitForMounted();
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();

    // Check if custom menu items are visible
    await u.po.userButton.toHaveVisibleMenuItems([/Custom link/i, /Custom action/i]);

    // Click custom action
    await u.page.getByRole('menuitem', { name: /Custom action/i }).click();
    await expect(u.page.getByText('Is action clicked: true')).toBeVisible();

    // Close the modal and trigger the popover again
    await u.page.locator('.cl-modalCloseButton').click();
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();

    // Trigger the popover again
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();

    // Click custom link and check navigation
    await u.page.getByRole('menuitem', { name: /Custom link/i }).click();
    await u.page.waitForAppUrl('/profile');
  });

  test('reorders default user button menu items and functions as expected', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.waitForAppUrl('/');
    await u.po.userButton.waitForMounted();
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();

    // First item should now be the sign out button
    await u.page.getByRole('menuitem').first().click();
    await u.po.expect.toBeSignedOut();
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

  test('<SignInButton /> renders and respects props', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/unstyled');
    await u.po.expect.toBeSignedOut();
    await u.page.waitForClerkJsLoaded();

    await u.page.getByRole('button', { name: /Sign in/i }).click();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });

    await u.page.waitForAppUrl('/');
    await u.po.expect.toBeSignedIn();
  });

  test('<SignUpButton /> renders and respects props', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeAdmin = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPhoneNumber: true,
      withUsername: true,
    });

    await u.page.goToRelative('/unstyled');
    await u.page.waitForClerkJsLoaded();

    await u.page.getByRole('button', { name: /Sign up/i }).click();
    await u.po.signUp.waitForMounted();
    await u.po.signUp.signUpWithEmailAndPassword({
      email: fakeAdmin.email,
      password: fakeAdmin.password,
    });

    await u.po.signUp.enterTestOtpCode();
    await u.page.waitForAppUrl('/');
    await u.po.expect.toBeSignedIn();

    await fakeAdmin.deleteIfExists();
  });
});
