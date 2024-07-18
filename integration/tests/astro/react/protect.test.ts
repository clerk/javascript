import { expect, test } from '@playwright/test';

import type { FakeOrganization, FakeUser } from '../../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../../testUtils';

testAgainstRunningApps({
  withPattern: ['astro.node.withCustomRoles'],
})('protect @astro with react', ({ app }) => {
  test.skip();
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

  test('only admin react', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/react/sign-in#/?redirect_url=/react');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.toggleTrigger();
    await u.page.locator('.cl-organizationSwitcherPreviewButton').click();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();
    await u.page.goToRelative('/react/only-admins');
    await expect(u.page.getByText("I'm an admin")).toBeVisible();
  });

  test('only member react', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/react/sign-in#/?redirect_url=/react/only-members');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();
    await expect(u.page.getByText('Not a member')).toBeVisible();
  });
});
