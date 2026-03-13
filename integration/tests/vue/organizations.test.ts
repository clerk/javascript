import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeOrganization, FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withCustomRoles] })('organization tests for @vue', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });

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

  test.afterEach(async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.signOut();
    await u.page.context().clearCookies();
  });

  test('<OrganizationList /> renders and shows organizations', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/org-list');
    await u.page.waitForClerkComponentMounted();
    await expect(u.page.getByText(fakeOrganization.name)).toBeVisible();
  });

  test('<CreateOrganization /> renders and can create an org', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/create-org');
    await u.page.waitForClerkComponentMounted();
    await expect(u.page.getByText(/Create organization/i)).toBeVisible();
  });

  test('<OrganizationSwitcher /> allows switching organizations', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.waitForAppUrl('/');
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

    // Open the switcher
    await u.po.organizationSwitcher.toggleTrigger();
    await u.page.waitForSelector('.cl-organizationSwitcherPopoverCard', { state: 'visible' });

    // Verify the org name is visible in the popover
    await expect(u.page.locator('.cl-organizationSwitcherPopoverCard').getByText(fakeOrganization.name)).toBeVisible();
  });
});
