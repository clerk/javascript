import { type BrowserContext, expect, type Page, test } from '@playwright/test';

import type { FakeOrganization, FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withPattern: ['next.appRouterBundledUI.*'] })(
  'composed OrganizationProfile exports @bundled-ui',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });
    let fakeUser: FakeUser;
    let fakeOrganization: FakeOrganization;

    test.beforeAll(async () => {
      const m = createTestUtils({ app });
      fakeUser = m.services.users.createFakeUser(test, { fictionalEmail: true });
      const user = await m.services.users.createBapiUser(fakeUser);
      fakeOrganization = await m.services.users.createFakeOrganization(user.id);
    });

    test.afterAll(async () => {
      // The delete test removes its own organization; ignore if this one is already gone.
      await fakeOrganization?.delete().catch(() => {});
      await fakeUser?.deleteIfExists();
    });

    // Sign in as `user` and open the composed organization profile page, waiting for the active org's
    // "Update profile" affordance (the composed provider renders null until an org is active).
    const signInAndVisitComposedOrganizationProfile = async (page: Page, context: BrowserContext, user: FakeUser) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: user.email, password: user.password });
      await u.po.expect.toBeSignedIn();
      await u.page.goToRelative('/composed/organization');
      await u.page.getByText(/update profile/i).waitFor({ state: 'visible' });
      return u;
    };

    test('renders the composed organization general sections', async ({ page, context }) => {
      const u = await signInAndVisitComposedOrganizationProfile(page, context, fakeUser);

      // The active organization's name is surfaced in the profile section, and the danger section
      // (delete/leave) renders for the admin.
      await expect(u.page.locator('.cl-profileSectionItem__organizationProfile')).toContainText(fakeOrganization.name);
      await expect(u.page.getByRole('button', { name: /delete organization/i })).toBeVisible();
    });

    test('can rename the organization', async ({ page, context }) => {
      const u = await signInAndVisitComposedOrganizationProfile(page, context, fakeUser);

      const newName = `${fakeOrganization.name}-renamed`;
      await u.page.getByText(/update profile/i).click();
      const nameInput = u.page.getByLabel('Name', { exact: true });
      await nameInput.fill(newName);
      await u.page.getByText(/Save/i).click();

      await expect(u.page.locator('.cl-profileSectionItem__organizationProfile')).toContainText(newName);

      // Assert the mutation actually reached the backend, not just the DOM.
      const updated = await u.services.clerk.organizations.getOrganization({
        organizationId: fakeOrganization.organization.id,
      });
      expect(updated.name).toBe(newName);
    });

    test('can delete the organization', async ({ page, context }) => {
      const m = createTestUtils({ app });
      const delFakeUser = m.services.users.createFakeUser(test, { fictionalEmail: true });
      const delUser = await m.services.users.createBapiUser(delFakeUser);
      const delOrg = await m.services.users.createFakeOrganization(delUser.id);

      try {
        const u = await signInAndVisitComposedOrganizationProfile(page, context, delFakeUser);

        await u.page.getByRole('button', { name: /delete organization/i }).click();

        // The confirmation card requires typing the organization name (its placeholder).
        await expect(u.page.getByText(/are you sure you want to delete this organization/i)).toBeVisible();
        await u.page.getByPlaceholder(delOrg.name).fill(delOrg.name);
        await u.page.getByRole('button', { name: /delete organization/i }).click();

        // Unlike the modal component, the composed provider renders null the moment the org is gone
        // (useOrganization() -> null), so there is no lingering success screen to assert on. The
        // observable parity outcome is that the deletion reached the backend.
        await expect
          .poll(
            async () => {
              try {
                await u.services.clerk.organizations.getOrganization({ organizationId: delOrg.organization.id });
                return true;
              } catch {
                return false;
              }
            },
            { timeout: 15_000 },
          )
          .toBe(false);
      } finally {
        await delFakeUser.deleteIfExists();
      }
    });

    test('renders the composed organization security page', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();
      await u.page.goToRelative('/composed/organization-security');

      // The composed security panel renders the same OrganizationSecurityPage the standard component
      // shows on its security route: the "Security" page header plus the SSO overview section. This is
      // the composed counterpart to the security tab (there are no composable sub-sections here).
      await expect(u.page.getByRole('heading', { name: /^security$/i })).toBeVisible();
      await expect(u.page.getByText(/^SSO$/)).toBeVisible();
      await expect(
        u.page.locator('.cl-profileSection__sso').getByRole('button', { name: /^configure$/i }),
      ).toBeVisible();
    });
  },
);
