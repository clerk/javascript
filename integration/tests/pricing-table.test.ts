import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withBilling] })('pricing table @billing', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

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

  test('renders pricing table with plans', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.page.goToRelative('/pricing-table');

    await u.po.pricingTable.waitForMounted();
    await expect(u.po.page.getByRole('heading', { name: 'Pro' })).toBeVisible();
  });

  test('when signed out, clicking get started button navigates to sign in page', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.page.goToRelative('/pricing-table');

    await u.po.pricingTable.waitForMounted();
    await u.po.pricingTable.startCheckout({ planSlug: 'plus' });
    await u.po.signIn.waitForMounted();
    await expect(u.po.page.getByText('Checkout')).toBeHidden();
  });

  test('when signed in, clicking get started button opens checkout drawer', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.page.goToRelative('/pricing-table');

    await u.po.pricingTable.waitForMounted();
    await u.po.pricingTable.startCheckout({ planSlug: 'plus' });
    await u.po.checkout.waitForMounted();
    await expect(u.po.page.getByText('Checkout')).toBeVisible();
  });

  test('can subscribe to a plan', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.page.goToRelative('/pricing-table');

    await u.po.pricingTable.waitForMounted();
    await u.po.pricingTable.startCheckout({ planSlug: 'plus' });
    await u.po.checkout.waitForMounted();
    await u.po.checkout.fillTestCard();
    await u.po.checkout.continueWithNewCard();
    await expect(u.po.page.getByText('Payment was successful!')).toBeVisible();
  });

  test('can upgrade to a new plan with saved card', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.page.goToRelative('/pricing-table');

    await u.po.pricingTable.waitForMounted();
    await u.po.pricingTable.startCheckout({ planSlug: 'pro', shouldSwitch: true });
    await u.po.checkout.waitForMounted();
    await u.po.checkout.continueWithSavedCard();
    await expect(u.po.page.getByText('Payment was successful!')).toBeVisible();
  });

  test('can downgrade to previous plan with new card', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.page.goToRelative('/pricing-table');

    await u.po.pricingTable.waitForMounted();
    await u.po.pricingTable.startCheckout({ planSlug: 'plus', shouldSwitch: true });
    await u.po.checkout.waitForMounted();

    await u.po.checkout.clickAddNewPaymentMethod();
    await u.po.checkout.fillCard({
      number: '4000056655665556',
      expiration: '1234',
      cvc: '123',
      country: 'United States',
      zip: '12345',
    });
    await u.po.checkout.continueWithNewCard();
    await expect(u.po.page.getByText('Success!')).toBeVisible();
  });

  test('can manage and cancel subscription', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.page.goToRelative('/pricing-table');

    await u.po.pricingTable.waitForMounted();
    await u.po.pricingTable.clickManageSubscription();
    await u.po.page.getByRole('button', { name: 'Cancel subscription' }).click();
    await u.po.page.getByRole('alertdialog').getByRole('button', { name: 'Cancel subscription' }).click();
    await expect(u.po.page.getByRole('button', { name: 'Re-subscribe' }).first()).toBeVisible();
  });

  test.describe('in UserProfile', () => {
    test('renders pricing table with plans', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.page.goToRelative('/user');

      await u.po.userProfile.waitForMounted();
      await u.po.userProfile.switchToBillingTab();
      await u.po.page.getByRole('button', { name: 'View all plans' }).click();
      await u.po.pricingTable.waitForMounted();
      await expect(u.po.page.getByRole('heading', { name: 'Pro' })).toBeVisible();
    });
  });
});
