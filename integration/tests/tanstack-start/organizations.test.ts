import type { OrganizationMembershipRole } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeOrganization, FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withCustomRoles] })(
  'organization auth tests for @tanstack-react-start',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeAdmin: FakeUser;
    let fakeViewer: FakeUser;
    let fakeNonMember: FakeUser;
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
      fakeNonMember = m.services.users.createFakeUser();
      await m.services.users.createBapiUser(fakeNonMember);
    });

    test.afterAll(async () => {
      await fakeOrganization.delete();
      await fakeNonMember.deleteIfExists();
      await fakeViewer.deleteIfExists();
      await fakeAdmin.deleteIfExists();
      await app.teardown();
    });

    test('admin auth object includes orgId, orgRole, orgSlug after selecting org', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/');

      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeAdmin.email,
        password: fakeAdmin.password,
      });

      await u.po.userButton.waitForMounted();

      await u.po.organizationSwitcher.waitForMounted();
      await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

      await u.page.goToRelative('/me');

      const userId = await u.page.getByTestId('userId').textContent();
      const orgId = await u.page.getByTestId('orgId').textContent();
      const orgRole = await u.page.getByTestId('orgRole').textContent();
      const orgSlug = await u.page.getByTestId('orgSlug').textContent();

      expect(userId).toBeTruthy();
      expect(orgId).toBe(fakeOrganization.organization.id);
      expect(orgRole).toBe('org:admin');
      expect(orgSlug).toBeTruthy();
    });

    test('non-member auth object has null orgId', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/');

      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeNonMember.email,
        password: fakeNonMember.password,
      });

      await u.po.userButton.waitForMounted();

      await u.page.goToRelative('/me');

      const userId = await u.page.getByTestId('userId').textContent();
      const orgId = await u.page.getByTestId('orgId').textContent();

      expect(userId).toBeTruthy();
      expect(orgId).toBe('');
    });

    test('viewer org role is correctly reflected in auth response', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/');

      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeViewer.email,
        password: fakeViewer.password,
      });

      await u.po.userButton.waitForMounted();

      await u.po.organizationSwitcher.waitForMounted();
      await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

      await u.page.goToRelative('/me');

      const userId = await u.page.getByTestId('userId').textContent();
      const orgId = await u.page.getByTestId('orgId').textContent();
      const orgRole = await u.page.getByTestId('orgRole').textContent();

      expect(userId).toBeTruthy();
      expect(orgId).toBe(fakeOrganization.organization.id);
      expect(orgRole).toBe('org:viewer');
    });
  },
);
