import type { OrganizationMembershipRole } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeOrganization, FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({
  withEnv: [appConfigs.envs.withBillingJwtV2],
})('has() for JWT v2 @nextjs', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let fakeAdmin: FakeUser;
  let fakeReader: FakeUser;
  let fakeManager: FakeUser;
  let fakeOrganization: FakeOrganization;

  test.beforeAll(async () => {
    const m = createTestUtils({ app });
    fakeAdmin = m.services.users.createFakeUser();
    const admin = await m.services.users.createBapiUser(fakeAdmin);
    fakeOrganization = await m.services.users.createFakeOrganization(admin.id);
    fakeReader = m.services.users.createFakeUser();
    const reader = await m.services.users.createBapiUser(fakeReader);
    await m.services.clerk.organizations.createOrganizationMembership({
      organizationId: fakeOrganization.organization.id,
      role: 'org:impersonation_reader' as OrganizationMembershipRole,
      userId: reader.id,
    });
    fakeManager = m.services.users.createFakeUser();
    const manager = await m.services.users.createBapiUser(fakeManager);
    await m.services.clerk.organizations.createOrganizationMembership({
      organizationId: fakeOrganization.organization.id,
      role: 'org:manager' as OrganizationMembershipRole,
      userId: manager.id,
    });
  });

  test.afterAll(async () => {
    await fakeOrganization.delete();
    await fakeManager.deleteIfExists();
    await fakeAdmin.deleteIfExists();
    await fakeReader.deleteIfExists();
    await app.teardown();
  });

  test('`has()` in RSCs and RCCs as `admin`', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();

    await u.po.organizationSwitcher.goTo();
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

    await u.page.goToRelative('/jwt-v2-organizations');

    await expect(u.page.getByTestId('client-jwt').getByText(`"per": "create,delete,manage,read"`)).toBeVisible();
    await expect(u.page.getByTestId('server-jwt').getByText(`"per": "create,delete,manage,read"`)).toBeVisible();

    await expect(u.page.getByTestId('client-jwt').getByText(`"fpm": "12,12,9,14"`)).toBeVisible();
    await expect(u.page.getByTestId('server-jwt').getByText(`"fpm": "12,12,9,14"`)).toBeVisible();

    await expect(
      u.page.getByTestId('client-jwt').getByText(`"fea": "o:billing,o:impersonation,o:magic_links,o:posts"`),
    ).toBeVisible();
    await expect(
      u.page.getByTestId('server-jwt').getByText(`"fea": "o:billing,o:impersonation,o:magic_links,o:posts"`),
    ).toBeVisible();

    async function assertPermsRolesFeatures() {
      await expect(u.page.getByText(`has({ permission: "org:impersonation:read" }) -> true`)).toBeVisible();
      await expect(u.page.getByText(`has({ permission: "org:magic_links:create" }) -> true`)).toBeVisible();
      await expect(u.page.getByText(`has({ permission: "magic_links:create" }) -> true`)).toBeVisible();
      await expect(u.page.getByText(`has({ permission: "org:magic_links:read" }) -> true`)).toBeVisible();
      await expect(u.page.getByText(`has({ permission: "org:impersonation:manage" }) -> true`)).toBeVisible();
      await expect(u.page.getByText(`has({ role: "org:admin" }) -> true`)).toBeVisible();
      await expect(u.page.getByText(`has({ role: "org:manager" }) -> false`)).toBeVisible();
      await expect(u.page.getByText(`has({ role: "org:impersonation_reader" }) -> false`)).toBeVisible();
      await expect(u.page.getByText(`role -> org:admin`)).toBeVisible();
      await expect(u.page.getByText(`has({ feature: "org:impersonation" }) -> true`)).toBeVisible();
      await expect(u.page.getByText(`has({ feature: "org:magic_links" }) -> true`)).toBeVisible();
    }

    await u.page.goToRelative('/jwt-v2-organizations/has-ssr');
    await assertPermsRolesFeatures();

    await u.page.goToRelative('/jwt-v2-organizations/has-client');
    await assertPermsRolesFeatures();

    await u.page.goToRelative('/jwt-v2-organizations/has-server');
    await assertPermsRolesFeatures();
  });

  test('`has()` in RSCs and RCCs as `manager`', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeManager.email, password: fakeManager.password });
    await u.po.expect.toBeSignedIn();

    await u.po.organizationSwitcher.goTo();
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

    await u.page.goToRelative('/jwt-v2-organizations');

    await expect(u.page.getByTestId('client-jwt').getByText(`"per": "read"`)).toBeVisible();
    await expect(u.page.getByTestId('server-jwt').getByText(`"per": "read"`)).toBeVisible();

    await expect(u.page.getByTestId('client-jwt').getByText(`"fpm": "1"`)).toBeVisible();
    await expect(u.page.getByTestId('server-jwt').getByText(`"fpm": "1"`)).toBeVisible();

    await expect(u.page.getByTestId('client-jwt').getByText(`"fea": "o:magic_links"`)).toBeVisible();
    await expect(u.page.getByTestId('server-jwt').getByText(`"fea": "o:magic_links"`)).toBeVisible();

    async function assertPermsRolesFeatures() {
      await expect(u.page.getByText(`has({ permission: "org:impersonation:read" }) -> false`)).toBeVisible();
      await expect(u.page.getByText(`has({ permission: "org:magic_links:create" }) -> false`)).toBeVisible();
      await expect(u.page.getByText(`has({ permission: "org:magic_links:read" }) -> true`)).toBeVisible();
      await expect(u.page.getByText(`has({ permission: "org:impersonation:manage" }) -> false`)).toBeVisible();
      await expect(u.page.getByText(`has({ role: "org:admin" }) -> false`)).toBeVisible();
      await expect(u.page.getByText(`has({ role: "org:manager" }) -> true`)).toBeVisible();
      await expect(u.page.getByText(`has({ role: "org:impersonation_reader" }) -> false`)).toBeVisible();
      await expect(u.page.getByText(`role -> org:manager`)).toBeVisible();
      await expect(u.page.getByText(`has({ feature: "org:impersonation" }) -> false`)).toBeVisible();
      await expect(u.page.getByText(`has({ feature: "org:magic_links" }) -> true`)).toBeVisible();
    }

    await u.page.goToRelative('/jwt-v2-organizations/has-ssr');
    await assertPermsRolesFeatures();

    await u.page.goToRelative('/jwt-v2-organizations/has-client');
    await assertPermsRolesFeatures();

    await u.page.goToRelative('/jwt-v2-organizations/has-server');
    await assertPermsRolesFeatures();
  });

  test('`has()` in RSCs and RCCs as `impersonation_reader`', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeReader.email, password: fakeReader.password });
    await u.po.expect.toBeSignedIn();

    await u.po.organizationSwitcher.goTo();
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

    await u.page.goToRelative('/jwt-v2-organizations');

    await expect(u.page.getByTestId('client-jwt').getByText(`"per": "create,read"`)).toBeVisible();
    await expect(u.page.getByTestId('server-jwt').getByText(`"per": "create,read"`)).toBeVisible();

    await expect(u.page.getByTestId('client-jwt').getByText(`"fpm": "2,1"`)).toBeVisible();
    await expect(u.page.getByTestId('server-jwt').getByText(`"fpm": "2,1"`)).toBeVisible();

    await expect(u.page.getByTestId('client-jwt').getByText(`"fea": "o:impersonation,o:magic_links"`)).toBeVisible();
    await expect(u.page.getByTestId('server-jwt').getByText(`"fea": "o:impersonation,o:magic_links"`)).toBeVisible();

    async function assertPermsRolesFeatures() {
      await expect(u.page.getByText(`has({ permission: "org:impersonation:read" }) -> true`)).toBeVisible();
      await expect(u.page.getByText(`has({ permission: "org:magic_links:create" }) -> true`)).toBeVisible();
      await expect(u.page.getByText(`has({ permission: "org:magic_links:read" }) -> false`)).toBeVisible();
      await expect(u.page.getByText(`has({ permission: "org:impersonation:manage" }) -> false`)).toBeVisible();
      await expect(u.page.getByText(`has({ role: "org:admin" }) -> false`)).toBeVisible();
      await expect(u.page.getByText(`has({ role: "org:manager" }) -> false`)).toBeVisible();
      await expect(u.page.getByText(`has({ role: "org:impersonation_reader" }) -> true`)).toBeVisible();
      await expect(u.page.getByText(`has({ role: "impersonation_reader" }) -> true`)).toBeVisible();
      await expect(u.page.getByText(`role -> org:impersonation_reader`)).toBeVisible();
      await expect(u.page.getByText(`has({ feature: "org:impersonation" }) -> true`)).toBeVisible();
      await expect(u.page.getByText(`has({ feature: "org:magic_links" }) -> true`)).toBeVisible();
    }

    await u.page.goToRelative('/jwt-v2-organizations/has-ssr');
    await assertPermsRolesFeatures();

    await u.page.goToRelative('/jwt-v2-organizations/has-client');
    await assertPermsRolesFeatures();

    await u.page.goToRelative('/jwt-v2-organizations/has-server');
    await assertPermsRolesFeatures();
  });
});
