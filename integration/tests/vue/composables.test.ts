import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeOrganization, FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withCustomRoles] })('composable tests for @vue', ({ app }) => {
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

  test('useAuth() returns correct values when signed in', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/auth-state');
    await expect(u.page.locator('[data-auth-is-loaded]')).toContainText('true');
    await expect(u.page.locator('[data-auth-is-signed-in]')).toContainText('true');
    await expect(u.page.locator('[data-auth-user-id]')).not.toHaveText('');
    await expect(u.page.locator('[data-auth-session-id]')).not.toHaveText('');
  });

  test('useAuth() returns organization data when org is active', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    // Wait for org to be selected (the org switcher auto-selects)
    await u.page.waitForAppUrl('/');
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

    await u.page.goToRelative('/auth-state');
    await expect(u.page.locator('[data-auth-org-id]')).not.toHaveText('');
    await expect(u.page.locator('[data-auth-org-role]')).toContainText('org:admin');
  });

  test('useUser() returns user data when signed in', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/user-state');
    await expect(u.page.locator('[data-user-is-loaded]')).toContainText('true');
    await expect(u.page.locator('[data-user-is-signed-in]')).toContainText('true');
    await expect(u.page.locator('[data-user-id]')).not.toHaveText('');
    await expect(u.page.locator('[data-user-email]')).toContainText(fakeUser.email);
    await expect(u.page.locator('[data-user-first-name]')).toContainText(fakeUser.firstName);
    await expect(u.page.locator('[data-user-last-name]')).toContainText(fakeUser.lastName);
  });

  test('useSession() returns session data when signed in', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/session-state');
    await expect(u.page.locator('[data-session-is-loaded]')).toContainText('true');
    await expect(u.page.locator('[data-session-is-signed-in]')).toContainText('true');
    await expect(u.page.locator('[data-session-id]')).not.toHaveText('');
    await expect(u.page.locator('[data-session-status]')).toContainText('active');
  });

  test('useOrganization() returns organization data when org is active', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    // Wait for org to be selected
    await u.page.waitForAppUrl('/');
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

    await u.page.goToRelative('/org-state');
    await expect(u.page.locator('[data-org-is-loaded]')).toContainText('true');
    await expect(u.page.locator('[data-org-id]')).not.toHaveText('');
    await expect(u.page.locator('[data-org-name]')).toContainText(fakeOrganization.name);
    await expect(u.page.locator('[data-org-role]')).toContainText('org:admin');
  });
});
