import { expect, test } from '@playwright/test';

import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({})('billing hooks @billing', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });
  test.skip(!app.name.includes('next'), 'Skipping: Only runs on next');

  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser();
    await u.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test.describe('when signed out', () => {
    test('renders billing hooks with plans, but no statements and no subscription', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.page.goToRelative('/billing/hooks');

      await u.po.page.waitForClerkJsLoaded();

      await expect(u.po.page.getByText('Plans found')).toBeVisible();
      await expect(u.po.page.getByRole('heading', { name: 'Plan: Pro' })).toBeVisible();
      await expect(u.po.page.getByText('No statements found')).toBeVisible();
      await expect(u.po.page.getByText('No subscription found')).toBeVisible();
    });
  });

  test.describe('when signed in', () => {
    test.describe.configure({ mode: 'serial' });
    test('subscribes to a plan', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.page.goToRelative('/pricing-table?newSubscriptionRedirectUrl=/pricing-table');
      await u.po.pricingTable.waitForMounted();
      await u.po.pricingTable.startCheckout({ planSlug: 'plus' });
      await u.po.checkout.waitForMounted();
      await u.po.checkout.fillTestCard();
      await u.po.checkout.clickPayOrSubscribe();
      await expect(u.po.checkout.root.getByText('Payment was successful!')).toBeVisible();
      await u.po.checkout.confirmAndContinue();
    });

    test('renders billing hooks with plans, statements and subscription', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.page.goToRelative('/billing/hooks');

      await u.po.page.waitForClerkJsLoaded();

      await expect(u.po.page.getByText('Plans found')).toBeVisible();
      await expect(u.po.page.getByRole('heading', { name: 'Plan: Pro' })).toBeVisible();

      await expect(u.po.page.getByText('Statements found')).toBeVisible();
      await expect(u.po.page.getByText('Statement total: 99.96')).toBeVisible();

      await expect(u.po.page.getByRole('heading', { name: 'Subscribed to Plus' })).toBeVisible();

      await u.page.evaluate(async () => {
        await window.Clerk.signOut({
          redirectUrl: '/billing/hooks',
        });
      });

      await expect(u.po.page.getByText('Plans found')).toBeVisible();
      await expect(u.po.page.getByRole('heading', { name: 'Plan: Pro' })).toBeVisible();
      await expect(u.po.page.getByText('No statements found')).toBeVisible();
      await expect(u.po.page.getByText('No subscription found')).toBeVisible();

      await expect(u.po.page.getByRole('heading', { name: 'Subscribed to Plus' })).toBeHidden();
      await expect(u.po.page.getByText('Statements found', { exact: true })).toBeHidden();
      await expect(u.po.page.getByText('Statement total: 99.96', { exact: true })).toBeHidden();
    });
  });
});
