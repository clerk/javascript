import { expect, test } from '@playwright/test';

import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withPattern: ['astro.node.withCustomRoles'] })('basic flows for @astro', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });
  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    const m = createTestUtils({ app });
    fakeUser = m.services.users.createFakeUser();
    await m.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
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

    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.page.waitForURL(`${app.serverUrl}/sign-in#/factor-one`);

    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();

    await u.po.expect.toBeSignedIn();
  });

  test('render user button', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
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

  test('render user profile with streamed data', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();
    await u.po.userButton.waitForMounted();
    await u.page.goToRelative('/user');
    await u.po.userProfile.waitForMounted();

    // Streams data from Astro.locals.currentUser()
    await expect(u.page.getByText(`"firstName":"${fakeUser.firstName}"`)).toBeVisible();
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
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
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
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });

    await u.page.waitForAppUrl('/user');

    await u.po.expect.toBeSignedIn();
  });

  test('SignUpButton renders and respects props', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser({
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
      email: fakeUser.email,
      password: fakeUser.password,
    });

    // Verify email
    await u.po.signUp.enterTestOtpCode();

    await u.page.waitForAppUrl('/user');

    // Check if user is signed in
    await u.po.expect.toBeSignedIn();

    await fakeUser.deleteIfExists();
  });

  test('test updateClerkOptions by changing localization on the fly', async ({ page, context }) => {
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
});
