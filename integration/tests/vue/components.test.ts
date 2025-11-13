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

  test('render UserAvatar component when user completes sign in flow', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.po.userAvatar.goTo();
    await u.po.userAvatar.toBeVisible();
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
    await u.po.userButton.toHaveVisibleMenuItems([/Custom link/i, /Custom page/i, /Custom action/i]);

    // Click custom action
    await u.page.getByRole('menuitem', { name: /Custom action/i }).click();
    await expect(u.page.getByText('Is action clicked: true')).toBeVisible();

    // Trigger the popover again
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();

    // Click custom action and check for custom page availbility
    await u.page.getByRole('menuitem', { name: /Custom page/i }).click();
    await u.po.userProfile.waitForUserProfileModal();
    await expect(u.page.getByRole('heading', { name: 'Custom Terms Page' })).toBeVisible();

    // Close the modal and trigger the popover again
    await u.page.locator('.cl-modalCloseButton').click();
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

  test('render custom user profile pages and links inside user button', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.waitForAppUrl('/');
    await u.po.userButton.waitForMounted();

    // Open UserProfile modal through UserButton
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();
    await u.page.getByRole('menuitem', { name: /Manage account/i }).click();
    await u.po.userProfile.waitForUserProfileModal();

    // Verify custom pages and links are visible in the UserProfile
    await expect(u.page.getByRole('button', { name: /Terms/i })).toBeVisible();
    await expect(u.page.getByRole('button', { name: /Homepage/i })).toBeVisible();

    // Test custom UserProfilePage is accessible and renders correctly
    await u.page.getByRole('button', { name: /Terms/i }).click();
    await expect(u.page.getByRole('heading', { name: 'Custom Terms Page' })).toBeVisible();
    await expect(u.page.getByText('This is the custom terms page')).toBeVisible();

    // Test UserProfileLink navigation works
    await u.page.getByRole('button', { name: /Homepage/i }).click();
    await u.page.waitForAppUrl('/');
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

  test('render user profile with custom pages and links', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/custom-pages/user-profile');
    await u.po.userProfile.waitForMounted();

    // Check if custom pages and links are visible
    await expect(u.page.getByRole('button', { name: /Terms/i })).toBeVisible();
    await expect(u.page.getByRole('button', { name: /Homepage/i })).toBeVisible();

    // Navigate to custom page
    await u.page.getByRole('button', { name: /Terms/i }).click();
    await expect(u.page.getByRole('heading', { name: 'Custom Terms Page' })).toBeVisible();

    // Check reordered default label. Security tab is now the last item.
    await u.page.locator('.cl-navbarButton').last().click();
    await expect(u.page.getByRole('heading', { name: 'Security' })).toBeVisible();

    // Click custom link and check navigation
    await u.page.getByRole('button', { name: /Homepage/i }).click();
    await u.page.waitForAppUrl('/');
  });

  test('render organization profile with custom pages and links in a dedicated page', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/custom-pages/organization-profile');
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

    // Check if custom pages and links are visible
    await expect(u.page.getByRole('button', { name: /Terms/i })).toBeVisible();
    await expect(u.page.getByRole('button', { name: /Homepage/i })).toBeVisible();

    // Navigate to custom page
    await u.page.getByRole('button', { name: /Terms/i }).click();
    await expect(u.page.getByRole('heading', { name: 'Custom Terms Page' })).toBeVisible();

    // Check reordered default label. General tab is now the last item.
    await u.page.locator('.cl-navbarButton').last().click();
    await expect(u.page.getByRole('heading', { name: 'General' })).toBeVisible();

    // Click custom link and check navigation
    await u.page.getByRole('button', { name: /Homepage/i }).click();
    await u.page.waitForAppUrl('/');
  });

  test('render organization profile with custom pages and links inside an organization switcher', async ({
    page,
    context,
  }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/custom-pages/organization-profile');
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

    // Open organization profile inside organization switcher
    await u.po.organizationSwitcher.toggleTrigger();
    await u.page.waitForSelector('.cl-organizationSwitcherPopoverCard', { state: 'visible' });
    await u.page.locator('.cl-button__manageOrganization').click();

    // Get the organization profile dialog
    const dialog = u.page.getByRole('dialog');

    // Check if custom pages and links are visible within the dialog
    await expect(dialog.getByRole('button', { name: /Terms/i })).toBeVisible();
    await expect(dialog.getByRole('button', { name: /Homepage/i })).toBeVisible();

    // Navigate to custom page
    await dialog.getByRole('button', { name: /Terms/i }).click();
    await expect(dialog.getByRole('heading', { name: 'Custom Terms Page' })).toBeVisible();

    // Click custom link and check navigation
    await dialog.getByRole('button', { name: /Homepage/i }).click();
    await u.page.waitForAppUrl('/');
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

  test('Update Clerk options on the fly with updateClerkOptions()', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    // Navigate and wait for sign-in component to load
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();

    // Verify initial English state
    await expect(u.page.getByText('Welcome back! Please sign in to continue')).toBeVisible();

    // Change to French and verify
    await u.page.locator('select').selectOption({ label: 'French' });
    await expect(u.page.getByText('pour continuer vers')).toBeVisible();

    // Revert to English and verify
    await u.page.locator('select').selectOption({ label: 'English' });
    await expect(u.page.getByText('Welcome back! Please sign in to continue')).toBeVisible();
  });
});
