import type { CDPSession } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withPasskeys] })('passkeys @tanstack-react-start', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;
  let savedCredentials: any[] = [];

  test.beforeAll(async () => {
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser();
    await u.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  const setupVirtualAuthenticator = async (page: any): Promise<{ cdpSession: CDPSession; authenticatorId: string }> => {
    // Clerk's isValidBrowser() checks !navigator.webdriver, which is true in Playwright.
    // Override it so Clerk detects WebAuthn as supported.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    const cdpSession = await page.context().newCDPSession(page);
    await cdpSession.send('WebAuthn.enable');
    const { authenticatorId } = await cdpSession.send('WebAuthn.addVirtualAuthenticator', {
      options: {
        protocol: 'ctap2',
        transport: 'internal',
        hasResidentKey: true,
        hasUserVerification: true,
        isUserVerified: true,
      },
    });
    return { cdpSession, authenticatorId };
  };

  const teardownVirtualAuthenticator = async (cdpSession: CDPSession, authenticatorId: string) => {
    await cdpSession.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId });
    await cdpSession.send('WebAuthn.disable');
    await cdpSession.detach();
  };

  const dismissOrgDialog = async (page: any) => {
    await page.getByRole('button', { name: /I'll remove it myself/i }).click();
  };

  const openSecurityTabViaUserButton = async (u: ReturnType<typeof createTestUtils>) => {
    await u.po.userButton.waitForMounted();
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();
    await u.po.userButton.triggerManageAccount();
    await u.po.userProfile.waitForUserProfileModal();
    await u.po.userProfile.switchToSecurityTab();
  };

  test('register a passkey from UserProfile', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    const { cdpSession, authenticatorId } = await setupVirtualAuthenticator(page);

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });
    await u.page.goToAppHome();
    await dismissOrgDialog(page);
    await openSecurityTabViaUserButton(u);

    // Click "Add a passkey"
    await page.getByRole('button', { name: /add a passkey/i }).click();

    // The virtual authenticator auto-responds to navigator.credentials.create()
    await expect(page.locator('.cl-profileSectionItem__passkeys')).toBeVisible({ timeout: 10000 });

    // Save credentials so the sign-in test can import them into its own virtual authenticator
    const { credentials } = await cdpSession.send('WebAuthn.getCredentials', { authenticatorId });
    savedCredentials = credentials;

    await teardownVirtualAuthenticator(cdpSession, authenticatorId);
  });

  test('sign in with passkey', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    const { cdpSession, authenticatorId } = await setupVirtualAuthenticator(page);

    // Import credentials from the register test
    for (const credential of savedCredentials) {
      await cdpSession.send('WebAuthn.addCredential', { authenticatorId, credential });
    }

    await u.po.signIn.goTo();
    await page.getByRole('link', { name: /use passkey/i }).click();

    // The virtual authenticator auto-responds to navigator.credentials.get()
    await u.po.expect.toBeSignedIn();

    await teardownVirtualAuthenticator(cdpSession, authenticatorId);
  });

  test('rename a passkey', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    const { cdpSession, authenticatorId } = await setupVirtualAuthenticator(page);

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });
    await u.page.goToAppHome();
    await dismissOrgDialog(page);
    await openSecurityTabViaUserButton(u);

    // Register a passkey
    const passkeysBefore = await page.locator('.cl-profileSectionItem__passkeys').count();
    await page.getByRole('button', { name: /add a passkey/i }).click();
    await expect(page.locator('.cl-profileSectionItem__passkeys')).toHaveCount(passkeysBefore + 1, { timeout: 10000 });

    // Click three-dots menu on the newly added passkey (last one)
    await page
      .locator('.cl-profileSectionItem__passkeys')
      .last()
      .getByRole('button', { name: /open menu/i })
      .click();

    // Click "Rename"
    await page.getByRole('menuitem', { name: /rename/i }).click();

    // Enter new name
    const newName = 'My Renamed Passkey';
    await page.locator('input[name="passkeyName"]').fill(newName);
    await page.getByRole('button', { name: /save/i }).click();

    // Verify the updated name appears
    await expect(page.locator('.cl-profileSectionItem__passkeys').filter({ hasText: newName })).toBeVisible();

    // Clean up
    await teardownVirtualAuthenticator(cdpSession, authenticatorId);
  });

  test('remove a passkey', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    const { cdpSession, authenticatorId } = await setupVirtualAuthenticator(page);

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });
    await u.page.goToAppHome();
    await dismissOrgDialog(page);
    await openSecurityTabViaUserButton(u);

    // Count existing passkeys before registering a new one
    const passkeyItems = page.locator('.cl-profileSectionItem__passkeys');
    const countBefore = await passkeyItems.count();

    // Register a passkey
    await page.getByRole('button', { name: /add a passkey/i }).click();
    await expect(passkeyItems).toHaveCount(countBefore + 1, { timeout: 10000 });

    // Click three-dots menu on the newly added passkey (last one)
    await passkeyItems
      .last()
      .getByRole('button', { name: /open menu/i })
      .click();

    // Click "Remove"
    await page.getByRole('menuitem', { name: /remove/i }).click();

    // Confirm removal
    await page.getByRole('button', { name: /remove/i }).click();

    // Verify passkey count decreased
    await expect(passkeyItems).toHaveCount(countBefore, { timeout: 10000 });

    // Clean up
    await teardownVirtualAuthenticator(cdpSession, authenticatorId);
  });
});
