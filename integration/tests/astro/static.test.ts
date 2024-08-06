import { expect, test } from '@playwright/test';

import type { FakeOrganization, FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withPattern: ['astro.static.withCustomRoles'] })(
  'basic flows for @astro static output',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeAdmin: FakeUser;
    let fakeOrganization: FakeOrganization;

    test.beforeAll(async () => {
      const m = createTestUtils({ app });
      fakeAdmin = m.services.users.createFakeUser();
      const admin = await m.services.users.createBapiUser(fakeAdmin);
      fakeOrganization = await m.services.users.createFakeOrganization(admin.id);
    });

    test.afterAll(async () => {
      await fakeOrganization.delete();
      await fakeAdmin.deleteIfExists();
      await app.teardown();
    });

    test('Clerk client loads on first visit and Sign In button renders', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToAppHome();

      await u.page.waitForClerkJsLoaded();

      await u.po.expect.toBeSignedOut();

      await expect(u.page.getByRole('link', { name: /Login/i })).toBeVisible();
    });
  },
);
