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

  const trigger = (page: Page) => page.getByRole('button', { name: /^Open account menu for / });
  const popup = (page: Page) => page.getByRole('dialog', { name: 'Account' });

  async function signIn({ page, context }: { page: Page; context: BrowserContext }, path = '/') {
    const u = await createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.page.goToRelative(path);
    await u.po.expect.toBeSignedIn();
    await expect(trigger(page)).toBeVisible();
    return u;
  }

  async function openProfileSettings(page: Page) {
    await popup(page).getByRole('button', { name: 'Settings' }).click();
    const profileSettings = page.getByRole('menuitem', { name: 'Manage profile' });
    const profile = page.getByRole('tab', { name: 'Account', exact: true });
    await profileSettings.or(profile).first().waitFor();
    if (await profileSettings.isVisible()) {
      await profileSettings.click();
    }
  }

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
    await signIn({ page, context }, '/custom');

    await trigger(page).click();
    await popup(page).getByRole('link', { name: 'Custom link' }).click();
    await expect(page.getByText('custom-link-target')).toBeVisible();
  });

  test('opens the Mosaic UserProfile in a modal', async ({ page, context }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await signIn({ page, context });

    await trigger(page).click();
    await openProfileSettings(page);

    await expect(page.getByRole('tab', { name: 'Account', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.cl-userProfile-root')).toHaveCount(0);
    await expect(popup(page)).toBeHidden();
  });

  test('renders a custom page inside the UserProfile modal', async ({ page, context }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await signIn({ page, context }, '/custom');

    await trigger(page).click();
    await openProfileSettings(page);

    await page.getByRole('tab', { name: 'Custom page', exact: true }).click();
    await expect(page.getByText('custom-page-content')).toBeVisible();
  });
});
