import { expect, test } from '@playwright/test';

import type { FakeOrganization, FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withPattern: ['astro.static.withCustomRoles'] })(
  'basic flows for @astro hybrid output',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeAdmin: FakeUser;
    let fakeOrganization: FakeOrganization;
    let fakeAdmin2: FakeUser;
    let fakeOrganization2: FakeOrganization;

    test.beforeAll(async () => {
      const m = createTestUtils({ app });
      fakeAdmin = m.services.users.createFakeUser();
      const admin = await m.services.users.createBapiUser(fakeAdmin);
      fakeOrganization = await m.services.users.createFakeOrganization(admin.id);

      fakeAdmin2 = m.services.users.createFakeUser();
      const admin2 = await m.services.users.createBapiUser(fakeAdmin2);
      fakeOrganization2 = await m.services.users.createFakeOrganization(admin2.id);
    });

    test.afterAll(async () => {
      await fakeOrganization.delete();
      await fakeAdmin.deleteIfExists();

      await fakeOrganization2.delete();
      await fakeAdmin2.deleteIfExists();
      await app.teardown();
    });

    test('render SignedIn and SignedOut contents (prerendered)', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToAppHome();

      await u.page.waitForClerkJsLoaded();

      await u.po.expect.toBeSignedOut();
      await expect(u.page.getByText('Signed out')).toBeVisible();
      await expect(u.page.getByText('Signed in')).toBeHidden();

      await u.page.getByRole('button', { name: /Sign in/i }).click();

      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
      await u.po.expect.toBeSignedIn();

      await expect(u.page.getByText('Signed out')).toBeHidden();
      await expect(u.page.getByText('Signed in')).toBeVisible();
    });

    test('render SignedIn and SignedOut contents (SSR)', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/ssr');

      await u.page.waitForClerkJsLoaded();

      await u.po.expect.toBeSignedOut();
      await expect(u.page.getByText('Signed out')).toBeVisible();
      await expect(u.page.getByText('Signed in')).toBeHidden();

      await u.page.getByRole('button', { name: /Sign in/i }).click();

      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
      await u.po.expect.toBeSignedIn();

      await expect(u.page.getByText('Signed out')).toBeHidden();
      await expect(u.page.getByText('Signed in')).toBeVisible();
    });

    test('render Protect contents for admin', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToAppHome();

      await u.page.waitForClerkJsLoaded();

      // Sign in
      await u.page.getByRole('button', { name: /Sign in/i }).click();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
      await u.po.expect.toBeSignedIn();

      // Select an organization
      await u.po.organizationSwitcher.waitForMounted();
      await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

      await u.page.goToRelative('/only-admins');

      await expect(u.page.getByText("I'm an admin")).toBeVisible();
    });

    test('render Show fallback', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToAppHome();

      await u.page.waitForClerkJsLoaded();

      // Sign in
      await u.page.getByRole('button', { name: /Sign in/i }).click();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
      await u.po.expect.toBeSignedIn();

      await u.page.goToRelative('/only-members');

      await expect(u.page.getByText('Not a member')).toBeVisible();
    });
  },
);
