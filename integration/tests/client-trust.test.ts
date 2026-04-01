import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withNeedsClientTrust] })(
  'client trust flow @generic @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

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

    test('sign in with email and password results in needs_client_trust', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Sign in with a new device
      await u.po.signIn.goTo();
      await u.po.signIn.setIdentifier(fakeUser.email);
      await u.po.signIn.continue();
      await u.po.signIn.setPassword(fakeUser.password);
      await u.po.signIn.continue();

      // After password is correctly entered, should navigate to client-trust route
      // This verifies that the sign-in status is 'needs_client_trust'
      await u.page.waitForURL(/\/sign-in\/client-trust/);

      // Should contain the new device verification notice
      await expect(u.page.getByText("You're signing in from a new device.")).toBeVisible();

      // User should not be signed in yet since client trust step is required
      await u.po.expect.toBeSignedOut();

      await u.po.signIn.enterTestOtpCode();
      await u.po.expect.toBeSignedIn();

      await u.po.userButton.toggleTrigger();
      await u.po.userButton.waitForPopover();
      await u.po.userButton.triggerSignOut();

      await u.po.expect.toBeSignedOut();

      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeUser.email,
        password: fakeUser.password,
      });

      // Sign in again with a now "known" device
      await u.po.expect.toBeSignedIn();
    });
  },
);
