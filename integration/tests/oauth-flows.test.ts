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
    // redirect if the sign up is transfered to a sign in.
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
});
