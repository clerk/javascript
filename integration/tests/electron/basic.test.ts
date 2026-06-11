import { createPageObjects } from '@clerk/testing/playwright/unstable';

import type { FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';
import { expect, test } from './fixtures';

test.describe('electron basic auth @electron', () => {
  test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;

  test.beforeAll(async ({ testApp }) => {
    const u = createTestUtils({ app: testApp });
    fakeUser = u.services.users.createFakeUser();
    await u.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
  });

  test('signs in with email and password', async ({ electronPage }) => {
    const { signIn } = createPageObjects({ page: electronPage, useTestingToken: false });

    await signIn.waitForMounted();
    await expect(electronPage.locator('.cl-signIn-root')).toBeVisible();

    await signIn.setIdentifier(fakeUser.email);
    await signIn.continue();
    const passField = signIn.getPasswordInput();
    await passField.waitFor({ state: 'visible' });
    await passField.fill(fakeUser.password);
    await signIn.continue();

    await expect(electronPage.locator('[data-testid="user-id"]')).toHaveText(/^user_/, { timeout: 30_000 });
  });
});
