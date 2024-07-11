import { expect, test } from '@playwright/test';

import type { FakeUser } from '../../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../../testUtils';

testAgainstRunningApps({ withPattern: ['astro.node.withCustomRoles'] })(
  'basic flows for @astro with react',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });
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

    test('SignedIn, SignedOut SSR', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/react');
      await expect(u.page.getByText('Go to this page to log in')).toBeVisible();
      await u.page.goToRelative('/sign-in#/?redirect_url=/react');
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();
      await expect(u.page.getByText('Go to this page to see your profile')).toBeVisible();
      await expect(u.page.getByText('Sign out!')).toBeVisible();
    });
  },
);
