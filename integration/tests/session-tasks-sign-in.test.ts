import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';
import { Application } from '../models/application';

test.describe('session tasks after sign-in flow @nextjs', () => {
  test.describe.configure({ mode: 'serial' });
  let app: Application;
  let fakeUser: FakeUser;

    let fakeUser: FakeUser;

    const m = createTestUtils({ app });
    fakeUser = m.services.users.createFakeUser();
    await m.services.users.createBapiUser(fakeUser);
  });

    test.afterAll(async () => {
      await fakeUser.deleteIfExists();
      await app.teardown();
    });

  test('navigate to task on after sign-in', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();
    await u.po.expect.toBeSignedIn();

    await expect(u.page.getByRole('button', { name: /create organization/i })).toBeVisible();
    expect(page.url()).toContain('add-organization');
  });
});
