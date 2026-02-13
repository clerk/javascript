import { createClerkClient } from '@clerk/backend';
import { test } from '@playwright/test';

import { appConfigs } from '../presets';
import { instanceKeys } from '../presets/envs';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';
import { createUserService } from '../testUtils/usersService';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('oauth flows @nextjs', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    // Create a clerkClient for the OAuth provider instance.
    const client = createClerkClient({
      secretKey: instanceKeys.get('oauth-provider').sk,
      publishableKey: instanceKeys.get('oauth-provider').pk,
    });
    const users = createUserService(client);
    fakeUser = users.createFakeUser({
      withUsername: true,
    });
    // Create the user on the OAuth provider instance so we do not need to sign up twice.
    await users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    const u = createTestUtils({ app });
    // Delete the user on the OAuth provider instance.
    await fakeUser.deleteIfExists();
    // Delete the user on the app instance.
    await u.services.users.deleteIfExists({ email: fakeUser.email });
    await app.teardown();
  });

  test('sign up with custom oauth provider', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signUp.goTo();

    await u.page.getByRole('button', { name: 'E2E OAuth Provider' }).click();
    await u.page.getByText('Sign in to oauth-provider').waitFor();

    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.enterTestOtpCode();

    // We can't use our `expect.toBeSignedIn` first because that would result in `true` on the OAuth provider instance.
    // We want to assert that we're signed in on our app instance, which will render the text 'SignedIn'.
    await u.page.getByText('SignedIn').waitFor();
    await u.po.expect.toBeSignedIn();
  });

  test('sign in with custom oauth provider', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();

    await u.page.getByRole('button', { name: 'E2E OAuth Provider' }).click();
    await u.page.getByText('Sign in to oauth-provider').waitFor();

    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.enterTestOtpCode();

    // We can't use our `expect.toBeSignedIn` first because that would result in `true` on the OAuth provider instance.
    // We want to assert that we're signed in on our app instance, which will render the text 'SignedIn'.
    await u.page.getByText('SignedIn').waitFor();
    await u.po.expect.toBeSignedIn();
  });

  test('sign in modal', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.page.goToRelative('/buttons');
    await u.page.waitForClerkJsLoaded();
    await u.po.expect.toBeSignedOut();

    await u.page.getByText('Sign in button (force)').click();

    await u.po.signIn.waitForModal();
    await u.page.getByRole('button', { name: 'E2E OAuth Provider' }).click();
    await u.page.getByText('Sign in to oauth-provider').waitFor();

    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.enterTestOtpCode();

    await u.page.waitForAppUrl('/protected');

    await u.po.expect.toBeSignedIn();
  });

  test('sign up modal', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    // The SignUpModal will only redirect to its provided forceRedirectUrl if the user is signing up; it will not
    // redirect if the sign up is transferred to a sign in.
    await u.services.users.deleteIfExists({ email: fakeUser.email });

    await u.page.goToRelative('/buttons');
    await u.page.waitForClerkJsLoaded();
    await u.po.expect.toBeSignedOut();

    await u.page.getByText('Sign up button (force)').click();

    await u.po.signUp.waitForModal();
    await u.page.getByRole('button', { name: 'E2E OAuth Provider' }).click();
    await u.page.getByText('Sign in to oauth-provider').waitFor();

    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.enterTestOtpCode();

    await u.page.waitForAppUrl('/protected');
  });

  test('sign in modal to sign up modal to transfer respects original forceRedirectUrl', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    // The user already exists on the OAuth provider instance, but we want to make sure that the user is created on the
    // app instance as well so that their sign up is transferred to a sign in.
    await u.services.users.getOrCreateUser(fakeUser);

    await u.page.goToRelative('/buttons');
    await u.page.waitForClerkJsLoaded();
    await u.po.expect.toBeSignedOut();

    // Call clerk.openSignIn with custom redirect URLs
    await u.page.evaluate(() => {
      window.Clerk.openSignIn({
        forceRedirectUrl: '/?from=signin',
        signUpForceRedirectUrl: '/?from=signup',
      });
    });

    await u.po.signIn.waitForModal();

    // Click the Sign Up button to switch to sign up mode
    await u.page.getByRole('dialog').getByRole('link', { name: 'Sign up' }).click();

    // Use OAuth provider
    await u.page.getByRole('button', { name: 'E2E OAuth Provider' }).click();
    await u.page.getByText('Sign in to oauth-provider').waitFor();

    // Sign in with existing account
    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.enterTestOtpCode();

    // Should redirect to the sign in redirect URL since we already had an account
    await u.page.waitForAppUrl('/?from=signin');
    await u.po.expect.toBeSignedIn();
  });

  test.describe('authenticateWithPopup', () => {
    test('SignIn with oauthFlow=popup opens popup', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.page.goToRelative('/buttons');
      await u.page.waitForClerkJsLoaded();
      await u.po.expect.toBeSignedOut();

      await u.page.getByText('Sign in button (force, popup)').click();

      await u.po.signIn.waitForModal();

      const popupPromise = context.waitForEvent('page');
      await u.page.getByRole('button', { name: 'E2E OAuth Provider' }).click();
      const popup = await popupPromise;
      const popupUtils = createTestUtils({ app, page: popup, context });
      await popupUtils.page.getByText('Sign in to oauth-provider').waitFor();

      await popupUtils.po.signIn.setIdentifier(fakeUser.email);
      await popupUtils.po.signIn.continue();
      await popupUtils.po.signIn.enterTestOtpCode();

      await u.page.waitForAppUrl('/protected');

      await u.po.expect.toBeSignedIn();
    });
  });
});

testAgainstRunningApps({ withPattern: ['react.vite.withLegalConsent'] })(
  'oauth popup with path-based routing @react',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeUser: FakeUser;

    test.beforeAll(async () => {
      const client = createClerkClient({
        secretKey: instanceKeys.get('oauth-provider').sk,
        publishableKey: instanceKeys.get('oauth-provider').pk,
      });
      const users = createUserService(client);
      fakeUser = users.createFakeUser({
        withUsername: true,
      });
      await users.createBapiUser(fakeUser);
    });

    test.afterAll(async () => {
      const u = createTestUtils({ app });
      await fakeUser.deleteIfExists();
      await u.services.users.deleteIfExists({ email: fakeUser.email });
      await app.teardown();
    });

    test('popup OAuth navigates through sso-callback with path-based routing', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.page.goToRelative('/sign-in-popup');
      await u.page.waitForClerkJsLoaded();
      await u.po.signIn.waitForMounted();

      const popupPromise = context.waitForEvent('page');
      await u.page.getByRole('button', { name: 'E2E OAuth Provider' }).click();
      const popup = await popupPromise;
      const popupUtils = createTestUtils({ app, page: popup, context });
      await popupUtils.page.getByText('Sign in to oauth-provider').waitFor();

      // Complete OAuth in the popup
      await popupUtils.po.signIn.setIdentifier(fakeUser.email);
      await popupUtils.po.signIn.continue();
      await popupUtils.po.signIn.enterTestOtpCode();

      // Because the user is new to the app and legal consent is required,
      // the sign-up can't complete in the popup. The popup sends return_url
      // back to the parent, which navigates to /sso-callback via pushState.
      // This exercises BaseRouter's history observation with path-based routing.
      await u.page.getByRole('heading', { name: 'Legal consent' }).waitFor();
      await u.page.getByLabel(/I agree to the/).check();
      await u.po.signIn.continue();

      await u.page.waitForAppUrl('/protected');
      await u.po.expect.toBeSignedIn();
    });
  },
);

testAgainstRunningApps({ withEnv: [appConfigs.envs.withLegalConsent] })(
  'oauth flows with legal consent @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeUser: FakeUser;

    test.beforeAll(async () => {
      // Create a clerkClient for the OAuth provider instance.
      const client = createClerkClient({
        secretKey: instanceKeys.get('oauth-provider').sk,
        publishableKey: instanceKeys.get('oauth-provider').pk,
      });
      const users = createUserService(client);
      fakeUser = users.createFakeUser({
        withUsername: true,
      });
      // Create the user on the OAuth provider instance so we do not need to sign up twice.
      await users.createBapiUser(fakeUser);
    });

    test.afterAll(async () => {
      const u = createTestUtils({ app });
      // Delete the user on the OAuth provider instance.
      await fakeUser.deleteIfExists();
      // Delete the user on the app instance.
      await u.services.users.deleteIfExists({ email: fakeUser.email });
      await app.teardown();
    });

    test('sign up via transfer with custom oauth provider', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();

      await u.page.getByRole('button', { name: 'E2E OAuth Provider' }).click();
      await u.page.getByText('Sign in to oauth-provider').waitFor();

      await u.po.signIn.setIdentifier(fakeUser.email);
      await u.po.signIn.continue();
      await u.po.signIn.enterTestOtpCode();

      await u.page.getByRole('heading', { name: 'Legal consent' }).waitFor();
      await u.page.getByLabel(/I agree to the/).check();
      await u.po.signIn.continue();

      // We can't use our `expect.toBeSignedIn` first because that would result in `true` on the OAuth provider instance.
      // We want to assert that we're signed in on our app instance, which will render the text 'SignedIn'.
      await u.page.getByText('SignedIn').waitFor();
      await u.po.expect.toBeSignedIn();
    });

    test('sign up via transfer modal', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.services.users.deleteIfExists({ email: fakeUser.email });

      await u.page.goToRelative('/buttons');
      await u.page.waitForClerkJsLoaded();
      await u.po.expect.toBeSignedOut();

      await u.page.getByText('Sign in button (force)').click();

      await u.po.signIn.waitForModal();
      await u.page.getByRole('button', { name: 'E2E OAuth Provider' }).click();
      await u.page.getByText('Sign in to oauth-provider').waitFor();

      await u.po.signIn.setIdentifier(fakeUser.email);
      await u.po.signIn.continue();
      await u.po.signIn.enterTestOtpCode();

      await u.page.getByRole('heading', { name: 'Legal consent' }).waitFor();
      await u.page.getByLabel(/I agree to the/).check();
      await u.po.signIn.continue();

      await u.page.waitForAppUrl('/protected');
    });

    test('redirects when attempting OAuth sign in with existing session in another tab', async ({
      page,
      context,
      browser,
    }) => {
      const u = createTestUtils({ app, page, context, browser });

      // Open sign-in page in both tabs before signing in
      await u.po.signIn.goTo();

      let secondTabUtils: any;
      await u.tabs.runInNewTab(async u2 => {
        secondTabUtils = u2;
        await u2.po.signIn.goTo();
      });

      // Sign in via OAuth on the first tab
      await u.page.getByRole('button', { name: 'E2E OAuth Provider' }).click();
      await u.page.getByText('Sign in to oauth-provider').waitFor();
      await u.po.signIn.setIdentifier(fakeUser.email);
      await u.po.signIn.continue();
      await u.po.signIn.enterTestOtpCode();
      await u.page.getByText('SignedIn').waitFor();
      await u.po.expect.toBeSignedIn();

      // Attempt to sign in via OAuth on the second tab (which already has sign-in mounted)
      await secondTabUtils.page.getByRole('button', { name: 'E2E OAuth Provider' }).click();

      // Should redirect and be signed in without error
      await secondTabUtils.po.expect.toBeSignedIn();
    });
  },
);
