import type { OrganizationMembershipRole } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeOrganization, FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withCustomRoles] })('Show component tests for @vue', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });

  let fakeUser: FakeUser;
  let fakeOrganization: FakeOrganization;
  let memberUser: FakeUser;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser();
    const user = await u.services.users.createBapiUser(fakeUser);
    fakeOrganization = await u.services.users.createFakeOrganization(user.id);

    // Create a member user (not admin) for fallback tests
    memberUser = u.services.users.createFakeUser();
    const bapiMember = await u.services.users.createBapiUser(memberUser);
    await u.services.clerk.organizations.createOrganizationMembership({
      organizationId: fakeOrganization.organization.id,
      role: 'org:viewer' as OrganizationMembershipRole,
      userId: bapiMember.id,
    });
  });

  test.afterAll(async () => {
    await fakeOrganization?.delete();
    await memberUser?.deleteIfExists();
    await fakeUser?.deleteIfExists();
    await app.teardown();
  });

  test.afterEach(async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.signOut();
    await u.page.context().clearCookies();
  });

  test('<Show when="signed-out"> renders when not authenticated', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/show-component');
    await u.page.waitForClerkJsLoaded();

    await expect(u.page.getByText('show-signed-out-content')).toBeVisible();
    await expect(u.page.getByText('show-signed-in-content')).toBeHidden();
  });

  test('<Show when="signed-in"> renders when authenticated', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/show-component');
    await expect(u.page.getByText('show-signed-in-content')).toBeVisible();
    await expect(u.page.getByText('show-signed-out-content')).toBeHidden();
  });

  test('<Show> with permission condition renders for admin with manage permission', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    // Wait for org to be selected
    await u.page.waitForAppUrl('/');
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

    await u.page.goToRelative('/show-component');
    await expect(u.page.getByText('show-permission-content')).toBeVisible();
    await expect(u.page.getByText('show-permission-fallback')).toBeHidden();
  });

  test('<Show> with role condition renders fallback for non-admin', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: memberUser.email, password: memberUser.password });
    await u.po.expect.toBeSignedIn();

    // Wait for org to be selected
    await u.page.waitForAppUrl('/');
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

    await u.page.goToRelative('/show-component');
    await expect(u.page.getByText('show-admin-fallback')).toBeVisible();
    await expect(u.page.getByText('show-admin-content')).toBeHidden();
  });
});
