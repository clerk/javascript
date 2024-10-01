import type { OrganizationMembershipRole } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeOrganization, FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withReverification] })(
  '@nextjs authorization with protectComponent',
  ({ app }) => {
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

      await u.page.goToRelative('/settings-protect-wrappers/rsc-protect');
      await expect(u.page.getByText(/User has access/i)).toBeVisible();
      await u.page.goToRelative('/settings-protect-wrappers/rcc-protect');
      await expect(u.page.getByText(/User has access/i)).toBeVisible();
      await u.page.goToRelative('/settings-protect-wrappers/useAuth-has');
      await expect(u.page.getByText(/User has access/i)).toBeVisible();
      await u.page.goToRelative('/settings-protect-wrappers/auth-has');
      await expect(u.page.getByText(/User has access/i)).toBeVisible();
      await u.page.goToRelative('/settings-protect-wrappers/auth-protect');
      await expect(u.page.getByText(/User has access/i)).toBeVisible();

      // route handler
      await u.page.goToRelative('/api/settings-protect-wrappers/');
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
      await u.page.goToRelative('/settings-protect-wrappers/rsc-protect');
      await expect(u.page.getByText(/User is not admin/i)).toBeVisible();
      await u.page.goToRelative('/settings-protect-wrappers/rcc-protect');
      await expect(u.page.getByText(/User is missing permissions/i)).toBeVisible();
      await u.page.goToRelative('/settings-protect-wrappers/useAuth-has');
      await expect(u.page.getByText(/User is not admin/i)).toBeVisible();
      await u.page.goToRelative('/settings-protect-wrappers/auth-has');
      await expect(u.page.getByText(/User is missing permissions/i)).toBeVisible();
      await u.page.goToRelative('/settings-protect-wrappers/auth-protect');
      await u.po.signIn.waitForMounted();
      await u.page.goToRelative('/protected');
      await u.po.signIn.waitForMounted();
      await u.page.goToRelative('/protect-wrappers/page-protected');
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

      await u.page.goToRelative('/settings-protect-wrappers/rsc-protect');
      await expect(u.page.getByText(/User is not admin/i)).toBeVisible();
      await u.page.goToRelative('/settings-protect-wrappers/rcc-protect');
      await expect(u.page.getByText(/User is missing permissions/i)).toBeVisible();
      await u.page.goToRelative('/settings-protect-wrappers/useAuth-has');
      await expect(u.page.getByText(/User is not admin/i)).toBeVisible();
      await u.page.goToRelative('/settings-protect-wrappers/auth-has');
      await expect(u.page.getByText(/User is missing permissions/i)).toBeVisible();
      await u.page.goToRelative('/settings-protect-wrappers/auth-protect');
      await expect(u.page.getByText(/this page could not be found/i)).toBeHidden();

      // Route Handler
      await u.page.goToRelative('/api/settings-protect-wrappers/').catch(() => {});
      await expect(
        u.page.getByText(
          /\{\s*"clerk_error"\s*:\s*\{\s*"type"\s*:\s*".*?"\s*,\s*"reason"\s*:\s*".*?"\s*,\s*"metadata"\s*:\s*\{\s*"role"\s*:\s*".*?"\s*\}\s*\}\s*\}/i,
        ),
      ).toBeVisible();
    });
  },
);
