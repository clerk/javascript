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

  test.skip('Clerk client loads and sign in button renders', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();
    await u.po.expect.toBeSignedOut();
    await expect(u.page.getByRole('link', { name: /Sign in/i })).toBeVisible();
  });

  test.skip('render user button component when user completes sign in flow', async ({ page, context }) => {
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

    console.log(await u.page.content());
    // Check if custom menu items are visible
    await u.po.userButton.toHaveVisibleMenuItems([/Custom link/i, /Custom click/i]);

    // // Click custom action and check for custom page availbility
    // await u.page.getByRole('menuitem', { name: /Custom action/i }).click();
    // await u.po.userProfile.waitForUserProfileModal();
    // await expect(u.page.getByRole('heading', { name: 'Custom Terms Page' })).toBeVisible();

    // // Close the modal and trigger the popover again
    // await u.page.locator('.cl-modalCloseButton').click();
    // await u.po.userButton.toggleTrigger();
    // await u.po.userButton.waitForPopover();

    // // Click custom action with click handler
    // const eventPromise = u.page.evaluate(() => {
    //   return new Promise<string>(resolve => {
    //     document.addEventListener(
    //       'clerk:menu-item-click',
    //       (e: CustomEvent<string>) => {
    //         resolve(e.detail);
    //       },
    //       { once: true },
    //     );
    //   });
    // });
    // await u.page.getByRole('menuitem', { name: /Custom click/i }).click();
    // expect(await eventPromise).toBe('custom_click');

    // // Trigger the popover again
    // await u.po.userButton.toggleTrigger();
    // await u.po.userButton.waitForPopover();

    // // Click custom link and check navigation
    // await u.page.getByRole('menuitem', { name: /Custom link/i }).click();
    // await u.page.waitForAppUrl('/user');
  });

  test.skip('render user profile and current user data', async ({ page, context }) => {
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

  test.skip('redirects to sign-in when unauthenticated', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/profile');
    await u.page.waitForURL(`${app.serverUrl}/sign-in`);
    await u.po.signIn.waitForMounted();
  });

  test.skip('renders <Protect /> component contents to admins', async ({ page, context }) => {
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

  test.skip('<SignInButton /> renders and respects props', async ({ page, context }) => {
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

  test.skip('<SignUpButton /> renders and respects props', async ({ page, context }) => {
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
