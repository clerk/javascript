import { clerk } from '@clerk/testing/playwright';
import { createPageObjects } from '@clerk/testing/playwright/unstable';

import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils/usersService';
import { expect, test } from './fixtures';
import { createTestUser } from './helpers';

test.describe('chrome extension basic auth @chrome-extension', () => {
  test.describe.configure({ mode: 'serial' });

  const env = appConfigs.envs.withEmailCodes;
  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    fakeUser = await createTestUser(env);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
  });

  test('signs in with email and password', async ({ extensionPage }) => {
    const { signIn } = createPageObjects({ page: extensionPage, useTestingToken: false });
    await signIn.waitForMounted();
    await expect(extensionPage.locator('.cl-signIn-root')).toBeVisible();

    await signIn.setIdentifier(fakeUser.email);
    await signIn.continue();
    const passField = signIn.getPasswordInput();
    await passField.waitFor({ state: 'visible' });
    await passField.fill(fakeUser.password);
    await signIn.continue();

    // Wait for signed-in state
    await extensionPage.waitForSelector('[data-testid="user-id"]', { timeout: 30_000 });

    const userId = extensionPage.locator('[data-testid="user-id"]');
    await expect(userId).toHaveText(/^user_/);
  });

  test('shows UserButton when signed in and can sign out', async ({ extensionPage }) => {
    const { signIn, userButton } = createPageObjects({ page: extensionPage, useTestingToken: false });

    await signIn.waitForMounted();
    await signIn.setIdentifier(fakeUser.email);
    await signIn.continue();
    const passField = signIn.getPasswordInput();
    await passField.waitFor({ state: 'visible' });
    await passField.fill(fakeUser.password);
    await signIn.continue();

    // Wait for UserButton
    await userButton.waitForMounted();
    await expect(extensionPage.locator('.cl-userButtonTrigger')).toBeVisible();

    // Sign out via Clerk
    await clerk.signOut({ page: extensionPage });

    // Verify we're back to SignIn
    await signIn.waitForMounted();
    await expect(extensionPage.locator('.cl-signIn-root')).toBeVisible();
  });
});
