import { clerk } from '@clerk/testing/playwright';
import { createPageObjects } from '@clerk/testing/playwright/unstable';

import type { FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';
import { expect, test } from './fixtures';

type ElectronWindow = Window & {
  __clerk_internal_electron?: {
    tokenCache?: Partial<Record<'clearToken' | 'getToken' | 'saveToken', unknown>>;
    oauthTransport?: Partial<Record<'getRedirectUrl' | 'open', unknown>>;
  };
};

test.describe('electron basic auth @electron', () => {
  test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;

  test.beforeAll(async ({ electronTestApp }) => {
    const u = createTestUtils({ app: electronTestApp });
    fakeUser = u.services.users.createFakeUser();
    await u.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser?.deleteIfExists();
  });

  test('exposes the preload bridge to the renderer', async ({ electronPage }) => {
    await expect(electronPage.locator('[data-testid="electron-app"]')).toBeVisible();

    await expect(
      electronPage.evaluate(() => {
        const bridge = (window as ElectronWindow).__clerk_internal_electron;

        return (
          typeof bridge?.tokenCache?.clearToken === 'function' &&
          typeof bridge?.tokenCache?.getToken === 'function' &&
          typeof bridge?.tokenCache?.saveToken === 'function' &&
          typeof bridge?.oauthTransport?.getRedirectUrl === 'function' &&
          typeof bridge?.oauthTransport?.open === 'function'
        );
      }),
    ).resolves.toBe(true);
  });

  test('signs in with email and password', async ({ electronPage }) => {
    const { signIn } = createPageObjects({ page: electronPage, useTestingToken: false });

    await signIn.waitForMounted();
    await expect(electronPage.locator('.cl-signIn-root')).toBeVisible();

    await signIn.setIdentifier(fakeUser.email!);
    await signIn.continue();
    await signIn.setPassword(fakeUser.password);
    await signIn.continue();

    await expect(electronPage.locator('[data-testid="user-id"]')).toHaveText(/^user_/, { timeout: 30_000 });
  });

  test('persists the signed-in session after relaunch', async ({ electronPage }) => {
    await expect(electronPage.locator('[data-testid="user-id"]')).toHaveText(/^user_/, { timeout: 30_000 });
    await expect(electronPage.locator('[data-testid="session-id"]')).toHaveText(/^sess_/, { timeout: 30_000 });
  });

  test('signs out and clears the session', async ({ electronPage }) => {
    await expect(electronPage.locator('.cl-userButtonTrigger')).toBeVisible({ timeout: 30_000 });
    await clerk.signOut({ page: electronPage });

    await expect(electronPage.locator('.cl-signIn-root')).toBeVisible({ timeout: 30_000 });
  });

  test('keeps the signed-out state after relaunch', async ({ electronPage }) => {
    await expect(electronPage.locator('.cl-signIn-root')).toBeVisible({ timeout: 30_000 });
  });
});
