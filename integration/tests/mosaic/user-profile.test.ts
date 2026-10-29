import type { Organization } from '@clerk/backend';
import type { BrowserContext, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withPattern: ['next.appRouterMosaic.*'] })('Mosaic UserProfile @mosaic', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;
  let organization: Organization;
  const cleanups: Array<() => Promise<unknown>> = [];

  test.beforeAll(async () => {
    const u = await createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser(test);
    cleanups.push(() => fakeUser.deleteIfExists());
    const user = await u.services.users.createBapiUser(fakeUser);
    organization = await u.services.clerk.organizations.createOrganization({
      name: `Mosaic ${Date.now()}`,
      createdBy: user.id,
    });
    cleanups.push(() => u.services.clerk.organizations.deleteOrganization(organization.id));
  });

  test.afterAll(async () => {
    const results = await Promise.allSettled(cleanups.map(cleanup => cleanup()));
    await app.teardown();
    const failures = results.flatMap(result => (result.status === 'rejected' ? [result.reason] : []));
    if (failures.length > 0) {
      throw new AggregateError(failures, 'Mosaic UserProfile cleanup failed');
    }
  });

  const path = '/user-profile';
  const tab = (page: Page, name: string) => page.getByRole('tab', { name, exact: true });

  async function signIn({ page, context }: { page: Page; context: BrowserContext }) {
    const u = await createTestUtils({ app, page, context });
    await page.setViewportSize({ width: 1280, height: 800 });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.page.goToRelative(path);
    await u.po.expect.toBeSignedIn();
    await expect(tab(page, 'Account')).toBeVisible();
    return u;
  }

  test('renders nothing when signed out', async ({ page, context }) => {
    const u = await createTestUtils({ app, page, context });
    await u.page.goToRelative(path);
    await u.page.waitForClerkJsLoaded();

    await expect(tab(page, 'Account')).toHaveCount(0);
  });

  test('opens on the account page with the signed-in user', async ({ page, context }) => {
    await signIn({ page, context });

    await expect(tab(page, 'Account')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText(fakeUser.email)).toBeVisible();
  });

  test("lists the active organization's pages after the account's", async ({ page, context }) => {
    await signIn({ page, context });

    await page.evaluate(orgId => window.Clerk?.setActive({ organization: orgId }), organization.id);
    await page.waitForFunction(orgId => window.Clerk?.organization?.id === orgId, organization.id);

    await tab(page, 'General').click();
    await expect(tab(page, 'General')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText(organization.name).first()).toBeVisible();
  });

  test('renders a custom page', async ({ page, context }) => {
    await signIn({ page, context });

    await tab(page, 'Custom page').click();
    await expect(page.getByText('custom-page-content')).toBeVisible();
  });
});
