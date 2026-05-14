import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeOrganization, FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })(
  'useOrganizationList loading state @nextjs',
  ({ app }) => {
    let fakeUser: FakeUser;
    let fakeOrganization: FakeOrganization;

    test.beforeAll(async () => {
      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser();
      const user = await u.services.users.createBapiUser(fakeUser);
      fakeOrganization = await u.services.users.createFakeOrganization(user.id);
    });

    test.afterAll(async () => {
      await fakeOrganization?.delete();
      await fakeUser?.deleteIfExists();
      await app.teardown();
    });

    test('should never emit isLoaded: true with empty data before memberships arrive', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();

      await u.page.goToRelative('/org-list-loading-state');

      // Wait for the hook to settle with real data
      await expect(u.page.getByTestId('data-length')).not.toHaveText('null');
      await expect(u.page.getByTestId('data-length')).not.toHaveText('0');
      await expect(u.page.getByTestId('is-loaded')).toHaveText('true');

      // Check if any buggy state was observed during the loading sequence
      const hasBuggyState = await u.page.getByTestId('has-buggy-state').textContent();
      expect(hasBuggyState).not.toContain('BUG DETECTED');

      // Also verify the state log directly — no entry should have isLoaded=true + data.length=0
      const buggyEntries = u.page.getByTestId('state-log').locator('li[data-buggy="true"]');
      await expect(buggyEntries).toHaveCount(0);
    });
  },
);
