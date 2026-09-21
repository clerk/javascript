import type { Organization } from '@clerk/backend';
import type { BrowserContext, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withPattern: ['next.appRouterMosaic.*'] })('Mosaic UserButton @mosaic', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;
  let otherFakeUser: FakeUser;
  let organizations: Organization[] = [];

  test.beforeAll(async () => {
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser(test);
    otherFakeUser = u.services.users.createFakeUser(test);
    const [user] = await Promise.all([
      u.services.users.createBapiUser(fakeUser),
      u.services.users.createBapiUser(otherFakeUser),
    ]);
    const suffix = Date.now();
    organizations = await Promise.all(
      ['Alpha', 'Beta'].map(name =>
        u.services.clerk.organizations.createOrganization({ name: `Mosaic ${name} ${suffix}`, createdBy: user.id }),
      ),
    );
  });

  test.afterAll(async () => {
    const u = createTestUtils({ app });
    await Promise.all(organizations.map(({ id }) => u.services.clerk.organizations.deleteOrganization(id)));
    await Promise.all([fakeUser.deleteIfExists(), otherFakeUser.deleteIfExists()]);
    await app.teardown();
  });

  const trigger = (page: Page) => page.getByRole('button', { name: /^Open account menu for / });
  const popup = (page: Page) => page.getByRole('dialog', { name: 'Account' });

  async function signIn({ page, context }: { page: Page; context: BrowserContext }, path = '/') {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.page.goToRelative(path);
    await u.po.expect.toBeSignedIn();
    await expect(trigger(page)).toBeVisible();
    return u;
  }

  async function runAccountAction(page: Page, label: 'Manage account' | 'Sign out') {
    await popup(page)
      .getByRole('button', { name: `Actions for ${fakeUser.email}` })
      .click();
    await page.getByRole('menuitem', { name: label }).click();
  }

  test('renders nothing while signed out', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();
    await u.po.expect.toBeSignedOut();

    await expect(page.getByText('signed-out-state')).toBeVisible();
    await expect(trigger(page)).toHaveCount(0);
  });

  test('opens the account menu for the signed-in user', async ({ page, context }) => {
    await signIn({ page, context });

    await trigger(page).click();

    await expect(popup(page)).toBeVisible();
    await expect(popup(page)).toContainText(fakeUser.email);
    for (const { name } of organizations) {
      await expect(popup(page)).toContainText(name);
    }
  });

  test('switches the active organization', async ({ page, context }) => {
    await signIn({ page, context });

    await trigger(page).click();
    await popup(page).getByRole('button', { name: 'Personal account' }).click();
    await page.waitForFunction(() => window.Clerk?.organization === null);
    await page.keyboard.press('Escape');
    await expect(popup(page)).toBeHidden();

    for (const { id, name } of organizations) {
      await trigger(page).click();
      await popup(page).getByRole('button', { name }).click();

      await page.waitForFunction(orgId => window.Clerk?.organization?.id === orgId, id);
      await page.keyboard.press('Escape');
      await expect(popup(page)).toBeHidden();
    }
  });

  test('manage account opens the UserProfile modal', async ({ page, context }) => {
    const u = await signIn({ page, context });

    await trigger(page).click();
    await runAccountAction(page, 'Manage account');

    await expect(popup(page)).toBeHidden();
    await u.po.userProfile.waitForUserProfileModal();
  });

  test('signs out', async ({ page, context }) => {
    const u = await signIn({ page, context });

    await trigger(page).click();
    await runAccountAction(page, 'Sign out');

    await u.po.expect.toBeSignedOut();
    await expect(trigger(page)).toHaveCount(0);
  });

  test('lists custom menu items in the given order and runs them', async ({ page, context }) => {
    await signIn({ page, context }, '/custom');

    await trigger(page).click();
    const action = popup(page).getByRole('button', { name: 'Custom action' });
    const link = popup(page).getByRole('link', { name: 'Custom link' });
    const [actionBox, linkBox] = await Promise.all([action.boundingBox(), link.boundingBox()]);
    expect(actionBox?.y).toBeLessThan(linkBox?.y ?? 0);

    await action.click();
    await expect(page.getByText('custom-action-count-1')).toBeVisible();
    await expect(popup(page)).toBeHidden();

    await trigger(page).click();
    await popup(page).getByRole('link', { name: 'Custom link' }).click();
    await expect(page.getByText('custom-link-target')).toBeVisible();
  });

  test('renders a custom page inside the UserProfile modal', async ({ page, context }) => {
    const u = await signIn({ page, context }, '/custom');

    await trigger(page).click();
    await runAccountAction(page, 'Manage account');
    await u.po.userProfile.waitForUserProfileModal();

    await page.locator('.cl-userProfile-root').getByText('Custom page').click();
    await expect(page.getByText('custom-page-content')).toBeVisible();
  });

  test('switches to another signed-in account', async ({ page, context }) => {
    const u = await signIn({ page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.setIdentifier(otherFakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword(otherFakeUser.password);
    await u.po.signIn.continue();
    await page.waitForFunction(
      email => window.Clerk?.user?.primaryEmailAddress?.emailAddress === email,
      otherFakeUser.email,
    );

    await u.page.goToAppHome();
    await trigger(page).click();
    await popup(page).getByRole('button', { name: 'Switch account' }).click();
    await page.getByRole('menuitem', { name: fakeUser.email }).click();

    await page.waitForFunction(
      email => window.Clerk?.user?.primaryEmailAddress?.emailAddress === email,
      fakeUser.email,
    );
  });
});
