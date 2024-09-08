import { expect, test } from '@playwright/test';

import type { FakeOrganization, FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withPattern: ['astro.node.withCustomRoles'] })('basic flows for @astro', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let fakeAdmin: FakeUser;
  let fakeOrganization: FakeOrganization;
  let fakeAdmin2: FakeUser;
  let fakeOrganization2: FakeOrganization;

  test.beforeAll(async () => {
    const m = createTestUtils({ app });
    fakeAdmin = m.services.users.createFakeUser();
    const admin = await m.services.users.createBapiUser(fakeAdmin);
    fakeOrganization = await m.services.users.createFakeOrganization(admin.id);

    fakeAdmin2 = m.services.users.createFakeUser();
    const admin2 = await m.services.users.createBapiUser(fakeAdmin2);
    fakeOrganization2 = await m.services.users.createFakeOrganization(admin2.id);
  });

  test.afterAll(async () => {
    await fakeOrganization.delete();
    await fakeAdmin.deleteIfExists();

    await fakeOrganization2.delete();
    await fakeAdmin2.deleteIfExists();
    await app.teardown();
  });

  test('Clerk client loads on first visit and Sign In button renders', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();

    await u.page.waitForClerkJsLoaded();

    await u.po.expect.toBeSignedOut();

    await expect(u.page.getByRole('link', { name: /Login/i })).toBeVisible();
  });

  test('sign in with hash routing', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();

    await u.po.signIn.setIdentifier(fakeAdmin.email);
    await u.po.signIn.continue();
    await u.page.waitForURL(`${app.serverUrl}/sign-in#/factor-one`);

    await u.po.signIn.setPassword(fakeAdmin.password);
    await u.po.signIn.continue();

    await u.po.expect.toBeSignedIn();
  });

  test('renders user button', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.page.waitForAppUrl('/');
    await u.po.expect.toBeSignedIn();

    await u.po.userButton.waitForMounted();
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();

    await u.po.userButton.toHaveVisibleMenuItems([/Manage account/i, /Sign out$/i]);

    await u.po.userButton.triggerManageAccount();
    await u.po.userProfile.waitForUserProfileModal();

    await expect(u.page.getByText(/profile details/i)).toBeVisible();
  });

  test('renders user button with custom menu items', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.page.waitForAppUrl('/');
    await u.po.expect.toBeSignedIn();

    await u.po.userButton.waitForMounted();
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();

    // Check if custom menu items are visible
    await u.po.userButton.toHaveVisibleMenuItems([/Custom link/i, /Custom action/i, /Custom click/i]);

    // Click custom action and check for custom page availbility
    await u.page.getByRole('menuitem', { name: /Custom action/i }).click();
    await u.po.userProfile.waitForUserProfileModal();
    await expect(u.page.getByRole('heading', { name: 'Custom Terms Page' })).toBeVisible();

    // Close the modal and trigger the popover again
    await u.page.locator('.cl-modalCloseButton').click();
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();

    // Click custom action with click handler
    const eventPromise = u.page.evaluate(() => {
      return new Promise<string>(resolve => {
        document.addEventListener(
          'clerk:menu-item-click',
          (e: CustomEvent<string>) => {
            resolve(e.detail);
          },
          { once: true },
        );
      });
    });
    await u.page.getByRole('menuitem', { name: /Custom click/i }).click();
    expect(await eventPromise).toBe('custom_click');

    // Trigger the popover again
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();

    // Click custom link and check navigation
    await u.page.getByRole('menuitem', { name: /Custom link/i }).click();
    await u.page.waitForAppUrl('/user');
  });

  test('reorders default user button menu items and functions as expected', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.page.waitForAppUrl('/');
    await u.po.expect.toBeSignedIn();

    await u.po.userButton.waitForMounted();
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();

    // First item should now be the sign out button
    await u.page.getByRole('menuitem').first().click();
    await u.po.expect.toBeSignedOut();
  });

  test('render user profile with streamed data', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();
    await u.po.userButton.waitForMounted();
    await u.page.goToRelative('/user');
    await u.po.userProfile.waitForMounted();

    // Streams data from Astro.locals.currentUser()
    await expect(u.page.getByText(`"firstName":"${fakeAdmin.firstName}"`)).toBeVisible();
  });

  test('render user profile with custom pages and links', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
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

  test('redirects to sign-in when unauthenticated', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/user');
    await u.page.waitForURL(`${app.serverUrl}/sign-in?redirect_url=${encodeURIComponent(`${app.serverUrl}/user`)}`);
    await u.po.signIn.waitForMounted();
  });

  test('SignedIn, SignedOut SSR', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await expect(u.page.getByText('Go to this page to log in')).toBeVisible();
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();
    await expect(u.page.getByText('Go to this page to see your profile')).toBeVisible();
    await expect(u.page.getByText('Sign out!')).toBeVisible();
  });

  test('SignInButton renders and respects props', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.page.goToRelative('/buttons');
    await u.po.expect.toBeSignedOut();
    await u.page.waitForClerkJsLoaded();

    await u.page.getByRole('button', { name: /Sign in/i }).click();

    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });

    await u.page.waitForAppUrl('/user');

    await u.po.expect.toBeSignedIn();
  });

  test('SignUpButton renders and respects props', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeAdmin = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPhoneNumber: true,
      withUsername: true,
    });

    await u.page.goToRelative('/buttons');
    await u.page.waitForClerkJsLoaded();

    await u.page.getByRole('button', { name: /Sign up/i }).click();

    await u.po.signUp.waitForMounted();

    // Fill in sign up form
    await u.po.signUp.signUpWithEmailAndPassword({
      email: fakeAdmin.email,
      password: fakeAdmin.password,
    });

    // Verify email
    await u.po.signUp.enterTestOtpCode();

    await u.page.waitForAppUrl('/user');

    // Check if user is signed in
    await u.po.expect.toBeSignedIn();

    await fakeAdmin.deleteIfExists();
  });

  test('updateClerkOptions by changing localization on the fly', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    const selectElement = await u.page.$('select');
    const selectedOption = await selectElement.evaluate(el => (el as any).options[(el as any).selectedIndex].text);
    if (selectedOption !== 'English') {
      throw new Error('English option is not selected by default');
    }

    await expect(u.page.getByText('Welcome back! Please sign in to continue')).toBeVisible();
    await selectElement.selectOption({ label: 'French' });

    await expect(u.page.getByText('pour continuer vers')).toBeVisible();
  });

  test('render organization profile with custom pages and links in dedicated page', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/custom-pages/organization-profile?dedicatedPage=true');
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

  test('render organization profile with custom pages and links inside organization switcher', async ({
    page,
    context,
  }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/custom-pages/organization-profile?dedicatedPage=false');
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

    // Open organization profile inside organization switcher
    await u.po.organizationSwitcher.toggleTrigger();
    await u.page.waitForSelector('.cl-organizationSwitcherPopoverCard', { state: 'visible' });
    await u.page.locator('.cl-button__manageOrganization').click();

    // Check if custom pages and links are visible
    await expect(u.page.getByRole('button', { name: /Terms/i })).toBeVisible();
    await expect(u.page.getByRole('button', { name: /Homepage/i })).toBeVisible();

    // Navigate to custom page
    await u.page.getByRole('button', { name: /Terms/i }).click();
    await expect(u.page.getByRole('heading', { name: 'Custom Terms Page' })).toBeVisible();

    // Check reordered default label. Members tab is now the last item.
    await u.page.locator('.cl-navbarButton').last().click();
    await expect(u.page.getByRole('heading', { name: 'Members' })).toBeVisible();

    // Click custom link and check navigation
    await u.page.getByRole('button', { name: /Homepage/i }).click();
    await u.page.waitForAppUrl('/');
  });

  // ---- react/protect
  test('only admin react', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/react/sign-in#/?redirect_url=/react');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();
    await u.page.goToRelative('/react/only-admins');
    await expect(u.page.getByText("I'm an admin")).toBeVisible();
  });

  test('only member react', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/react/sign-in#/?redirect_url=/react/only-members');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();
    await expect(u.page.getByText('Not a member')).toBeVisible();
  });

  // --- react/components
  test('react/ render user button', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/react/sign-in#/?redirect_url=/react');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.page.waitForAppUrl('/react');
    await u.po.expect.toBeSignedIn();

    await u.po.userButton.waitForMounted();
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();

    await u.po.userButton.toHaveVisibleMenuItems([/Manage account/i, /Sign out$/i]);

    await u.po.userButton.triggerManageAccount();
    await u.po.userProfile.waitForUserProfileModal();

    await expect(u.page.getByText(/profile details/i)).toBeVisible();
  });

  test('react/ render user profile with streamed data', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/react/sign-in#/?redirect_url=/react');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();
    await u.po.userButton.waitForMounted();
    await u.page.goToRelative('/react/user');
    await u.po.userProfile.waitForMounted();

    await expect(u.page.getByText(`My name is: ${fakeAdmin.firstName}`)).toBeVisible();

    // Streams data from Astro.locals.currentUser()
    await expect(u.page.getByText(`"firstName":"${fakeAdmin.firstName}"`)).toBeVisible();
  });

  test('react/ SignedIn, SignedOut SSR', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/react');
    await expect(u.page.getByText('Go to this page to log in')).toBeVisible();
    await u.page.goToRelative('/react/sign-in#/?redirect_url=/react');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();
    await expect(u.page.getByText('Go to this page to see your profile')).toBeVisible();
    await expect(u.page.getByText('Sign out!')).toBeVisible();
  });

  test('react/ render content based on Clerk loaded status', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/utility');
    await expect(u.page.getByText('Clerk is loading')).toBeVisible();
    await expect(u.page.getByText('Clerk is loaded')).toBeHidden();
    await u.page.waitForClerkJsLoaded();
    await expect(u.page.getByText('Clerk is loaded')).toBeVisible();
    await expect(u.page.getByText('Clerk is loading')).toBeHidden();
  });

  // ----- redirect
  test('redirects to sign-in when unauthenticated (middleware)', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.getByRole('link', { name: 'User', exact: true }).click();
    await u.page.waitForURL(`${app.serverUrl}/sign-in?redirect_url=${encodeURIComponent(`${app.serverUrl}/user`)}`);
  });

  test('redirects to sign-in when unauthenticated (page)', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.getByRole('link', { name: 'Organization', exact: true }).click();
    await u.page.waitForURL(
      `${app.serverUrl}/sign-in?redirect_url=${encodeURIComponent(`${app.serverUrl}/organization`)}`,
    );
  });

  // ---- protect
  test('only admin', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin2.email, password: fakeAdmin2.password });
    await u.po.expect.toBeSignedIn();
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();
    await u.page.goToRelative('/only-admins');
    await expect(u.page.getByText("I'm an admin")).toBeVisible();
  });

  test('only member', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in#/?redirect_url=/only-members');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin2.email, password: fakeAdmin2.password });
    await u.po.expect.toBeSignedIn();
    await expect(u.page.getByText('Not a member')).toBeVisible();
  });
});
