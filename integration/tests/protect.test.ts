import type { OrganizationMembershipRole } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeOrganization, FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withCustomRoles] })('authorization @nextjs', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let fakeAdmin: FakeUser;
  let fakeViewer: FakeUser;
  let fakeOrganization: FakeOrganization;

  test.beforeAll(async () => {
    const m = createTestUtils({ app });
    fakeAdmin = m.services.users.createFakeUser();
    const admin = await m.services.users.createBapiUser(fakeAdmin);
    fakeOrganization = await m.services.users.createFakeOrganization(admin.id);
    fakeViewer = m.services.users.createFakeUser();
    const viewer = await m.services.users.createBapiUser(fakeViewer);
    await m.services.clerk.organizations.createOrganizationMembership({
      organizationId: fakeOrganization.organization.id,
      role: 'org:viewer' as OrganizationMembershipRole,
      userId: viewer.id,
    });
  });

  test.afterAll(async () => {
    await fakeOrganization.delete();
    await fakeViewer.deleteIfExists();
    await fakeAdmin.deleteIfExists();
    await app.teardown();
  });

  test('Protect in RSCs and RCCs as `admin`', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();

    await u.po.organizationSwitcher.goTo();
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

    await u.page.goToRelative('/settings/rsc-protect');
    await expect(u.page.getByText(/User has access/i)).toBeVisible();
    await u.page.goToRelative('/settings/rcc-protect');
    await expect(u.page.getByText(/User has access/i)).toBeVisible();
    await u.page.goToRelative('/settings/useAuth-has');
    await expect(u.page.getByText(/User has access/i)).toBeVisible();
    await u.page.goToRelative('/settings/auth-has');
    await expect(u.page.getByText(/User has access/i)).toBeVisible();
    await u.page.goToRelative('/settings/auth-protect');
    await expect(u.page.getByText(/User has access/i)).toBeVisible();

    await u.page.goToRelative('/only-admin');
    await expect(u.page.getByText(/User is admin/i)).toBeVisible();

    // route handler
    await u.page.goToRelative('/api/settings/');
    await expect(u.page.getByText(/userId/i)).toBeVisible();
  });

  test('Protect in RSCs and RCCs as `signed-out user`', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    /**
     * Soft navigations
     */
    await u.page.goToRelative('/');
    await page.getByText('Page Protected').click();
    await page.waitForURL('**/sign-in?**');
    await u.po.signIn.waitForMounted();

    /**
     * Hard navigations
     */
    await u.page.goToRelative('/settings/rsc-protect');
    await expect(u.page.getByText(/User is not admin/i)).toBeVisible();
    await u.page.goToRelative('/settings/rcc-protect');
    await expect(u.page.getByText(/User is missing permissions/i)).toBeVisible();
    await u.page.goToRelative('/settings/useAuth-has');
    await expect(u.page.getByText(/User is not admin/i)).toBeVisible();
    await u.page.goToRelative('/settings/auth-has');
    await expect(u.page.getByText(/User is missing permissions/i)).toBeVisible();
    await u.page.goToRelative('/settings/auth-protect');
    await u.po.signIn.waitForMounted();
    await u.page.goToRelative('/protected');
    await u.po.signIn.waitForMounted();
    await u.page.goToRelative('/page-protected');
    await u.po.signIn.waitForMounted();
    await u.page.goToRelative('/only-admin');
    await u.po.signIn.waitForMounted();
  });

  test('Protect in RSCs and RCCs as `viewer`', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeViewer.email, password: fakeViewer.password });
    await u.po.expect.toBeSignedIn();

    await u.po.organizationSwitcher.goTo();
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

    await u.page.goToRelative('/settings/rsc-protect');
    await expect(u.page.getByText(/User is not admin/i)).toBeVisible();
    await u.page.goToRelative('/settings/rcc-protect');
    await expect(u.page.getByText(/User is missing permissions/i)).toBeVisible();
    await u.page.goToRelative('/settings/useAuth-has');
    await expect(u.page.getByText(/User is not admin/i)).toBeVisible();
    await u.page.goToRelative('/settings/auth-has');
    await expect(u.page.getByText(/User is missing permissions/i)).toBeVisible();
    await u.page.goToRelative('/settings/auth-protect');
    await expect(u.page.getByText(/this page could not be found/i)).toBeVisible();

    await u.page.goToRelative('/only-admin');
    await expect(u.page.getByText(/this page could not be found/i)).toBeVisible();

    // Route Handler
    await u.page.goToRelative('/api/settings/').catch(() => {});

    // Result of 404 response with empty body
    expect(await u.page.content()).toMatch(/^(<!DOCTYPE html>)/);
    expect(await u.page.content()).toMatch(/(No webpage was found)/);
    expect(await u.page.content()).toMatch(/(HTTP ERROR 404)/);
  });
});
