import type { Organization } from '@clerk/backend';
import type { BrowserContext, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withPattern: ['next.appRouterMosaic.*'] })(
  'Mosaic OrganizationSwitcher @mosaic',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeUser: FakeUser;
    let organization: Organization;

    test.beforeAll(async () => {
      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser(test);
      const user = await u.services.users.createBapiUser(fakeUser);
      organization = await u.services.clerk.organizations.createOrganization({
        name: `Mosaic ${Date.now()}`,
        createdBy: user.id,
      });
    });

    test.afterAll(async () => {
      const u = createTestUtils({ app });
      const results = await Promise.allSettled([
        u.services.clerk.organizations.deleteOrganization(organization.id),
        fakeUser.deleteIfExists(),
      ]);
      await app.teardown();
      const failures = results.flatMap(result => (result.status === 'rejected' ? [result.reason] : []));
      if (failures.length > 0) {
        throw new AggregateError(failures, 'Mosaic OrganizationSwitcher cleanup failed');
      }
    });

    const path = '/organization-switcher';
    const trigger = (page: Page) => page.getByRole('button', { name: /^Open organization menu for / });
    const popup = (page: Page) => page.getByRole('dialog', { name: 'Organizations' });

    async function signIn({ page, context }: { page: Page; context: BrowserContext }) {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.page.goToRelative(path);
      await u.po.expect.toBeSignedIn();
      await expect(trigger(page)).toBeVisible();
      return u;
    }

    test('renders nothing when signed out', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative(path);
      await u.page.waitForClerkJsLoaded();

      await expect(trigger(page)).toHaveCount(0);
    });

    test('switches the active organization and keeps it across a reload', async ({ page, context }) => {
      const u = await signIn({ page, context });
      const { id, name } = organization;

      await trigger(page).click();
      await popup(page).getByRole('button', { name: 'Personal account' }).click();
      await page.waitForFunction(() => window.Clerk?.organization === null);
      await page.keyboard.press('Escape');
      await expect(popup(page)).toBeHidden();

      await trigger(page).click();
      await popup(page).getByRole('button', { name }).click();
      await page.waitForFunction(orgId => window.Clerk?.organization?.id === orgId, id);

      await u.page.reload();
      await u.page.waitForClerkJsLoaded();
      await page.waitForFunction(orgId => window.Clerk?.organization?.id === orgId, id);
      await expect(trigger(page)).toHaveAccessibleName(`Open organization menu for ${name}`);
    });

    test('follows a custom menu link', async ({ page, context }) => {
      await signIn({ page, context });

      await trigger(page).click();
      await popup(page).getByRole('link', { name: 'Custom link' }).click();
      await expect(page.getByText('custom-link-target')).toBeVisible();
    });

    test('renders a custom page inside the OrganizationProfile modal', async ({ page, context }) => {
      await signIn({ page, context });

      await trigger(page).click();
      await popup(page).getByRole('button', { name: 'Settings' }).click();

      const profile = page.locator('.cl-organizationProfile-root');
      await profile.getByText('Custom page').click();
      await expect(page.getByText('custom-page-content')).toBeVisible();
    });
  },
);
