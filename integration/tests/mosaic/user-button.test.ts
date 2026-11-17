import type { Organization } from '@clerk/backend';
import type { BrowserContext, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withPattern: ['next.appRouterMosaic.*'] })('Mosaic UserButton @mosaic', ({ app }) => {
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
      throw new AggregateError(failures, 'Mosaic UserButton cleanup failed');
    }
  });

  const path = '/user-button';
  const trigger = (page: Page) => page.getByRole('button', { name: /^Open account menu for / });
  const popup = (page: Page) => page.getByRole('dialog', { name: 'Account' });

  async function signIn({ page, context }: { page: Page; context: BrowserContext }) {
    const u = await createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.page.goToRelative(path);
    await u.po.expect.toBeSignedIn();
    await expect(trigger(page)).toBeVisible();
    return u;
  }

  test('renders nothing when signed out', async ({ page, context }) => {
    const u = await createTestUtils({ app, page, context });
    await u.page.goToRelative(path);
    await u.page.waitForClerkJsLoaded();

    await expect(trigger(page)).toHaveCount(0);
  });

  test('lists no organizations while one is active', async ({ page, context }) => {
    await signIn({ page, context });
    await page.evaluate(orgId => window.Clerk?.setActive({ organization: orgId }), organization.id);
    await page.waitForFunction(orgId => window.Clerk?.organization?.id === orgId, organization.id);

    await expect(trigger(page)).not.toContainText(organization.name);
    await trigger(page).click();
    await expect(popup(page).getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
    await expect(popup(page).getByText(organization.name)).toHaveCount(0);
    await expect(popup(page).getByText('Personal account')).toHaveCount(0);
    await expect(popup(page).getByRole('button', { name: 'Invite members' })).toHaveCount(0);
  });

  test('signs out', async ({ page, context }) => {
    const u = await signIn({ page, context });

    await trigger(page).click();
    await popup(page).getByRole('button', { name: 'Sign out', exact: true }).click();

    await u.po.expect.toBeSignedOut();
    await expect(trigger(page)).toHaveCount(0);
  });

  test('sends add account to the sign-in page', async ({ page, context }) => {
    await signIn({ page, context });

    await trigger(page).click();
    await popup(page).getByRole('button', { name: 'Add account' }).click();

    await page.waitForURL(url => url.pathname.startsWith('/sign-in'));
  });

  test('follows a custom menu link', async ({ page, context }) => {
    await signIn({ page, context });

    await trigger(page).click();
    await popup(page).getByRole('link', { name: 'Custom link' }).click();
    await expect(page.getByText('custom-link-target')).toBeVisible();
  });
});
