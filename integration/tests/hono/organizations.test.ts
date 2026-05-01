import type { OrganizationMembershipRole } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeOrganization, FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withCustomRoles] })(
  'organization auth tests for @hono',
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
      await u.po.signIn.setIdentifier(fakeAdmin.email);
      await u.po.signIn.continue();
      await u.po.signIn.setPassword(fakeAdmin.password);
      await u.po.signIn.continue();

      await u.po.userButton.waitForMounted();

      await u.po.organizationSwitcher.waitForMounted();
      await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

      const url = new URL('/api/me', app.serverUrl);
      const res = await u.page.request.get(url.toString());
      expect(res.status()).toBe(200);

      const json = await res.json();
      expect(json.userId).toBeTruthy();
      expect(json.orgId).toBe(fakeOrganization.organization.id);
      expect(json.orgRole).toBe('org:admin');
      expect(json.orgSlug).toBeTruthy();
    });

    test('non-member auth object has null orgId', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/');

      await u.po.signIn.waitForMounted();
      await u.po.signIn.setIdentifier(fakeNonMember.email);
      await u.po.signIn.continue();
      await u.po.signIn.setPassword(fakeNonMember.password);
      await u.po.signIn.continue();

      await u.po.userButton.waitForMounted();

      const url = new URL('/api/me', app.serverUrl);
      const res = await u.page.request.get(url.toString());
      expect(res.status()).toBe(200);

      const json = await res.json();
      expect(json.userId).toBeTruthy();
      expect(json.orgId).toBeNull();
    });

    test('viewer org role is correctly reflected in auth response', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/');

      await u.po.signIn.waitForMounted();
      await u.po.signIn.setIdentifier(fakeViewer.email);
      await u.po.signIn.continue();
      await u.po.signIn.setPassword(fakeViewer.password);
      await u.po.signIn.continue();

      await u.po.userButton.waitForMounted();

      await u.po.organizationSwitcher.waitForMounted();
      await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

      const url = new URL('/api/me', app.serverUrl);
      const res = await u.page.request.get(url.toString());
      expect(res.status()).toBe(200);

      const json = await res.json();
      expect(json.userId).toBeTruthy();
      expect(json.orgId).toBe(fakeOrganization.organization.id);
      expect(json.orgRole).toBe('org:viewer');
    });
  },
);
