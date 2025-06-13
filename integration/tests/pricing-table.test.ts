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

  test('when signed out, clicking subscribe button navigates to sign in page', async ({ page, context }) => {
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

  test('when signed in, shows free plan as active', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.page.goToRelative('/pricing-table');

    await u.po.pricingTable.waitForMounted();
    await u.po.pricingTable.startCheckout({ planSlug: 'plus' });
    await u.po.pricingTable.waitToBeActive({ planSlug: 'free_user' });
    await expect(u.po.pricingTable.getPlanCardCTA({ planSlug: 'free_user' })).toBeHidden();
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
    await u.po.checkout.clickPayOrSubscribe();
    await expect(u.po.page.getByText('Payment was successful!')).toBeVisible();
    await u.po.checkout.confirmAndContinue();

    // eslint-disable-next-line playwright/no-conditional-in-test
    if (app.name.includes('next')) {
      // Correctly updates RSCs with the new `pla` claim.
      await expect(u.po.page.getByText('user in plus')).toBeVisible({
        timeout: 5_000,
      });
    }
  });

  test('can upgrade to a new plan with saved card', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.page.goToRelative('/pricing-table');

    await u.po.pricingTable.waitForMounted();
    await u.po.pricingTable.startCheckout({ planSlug: 'pro', shouldSwitch: true });
    await u.po.checkout.waitForMounted();
    await u.po.checkout.clickPayOrSubscribe();
    await expect(u.po.page.getByText('Payment was successful!')).toBeVisible();
  });

  test('can downgrade to previous plan', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.page.goToRelative('/pricing-table');

    await u.po.pricingTable.waitForMounted();
    await u.po.pricingTable.startCheckout({ planSlug: 'plus', shouldSwitch: true });
    await u.po.checkout.waitForMounted();

    await u.po.checkout.clickPayOrSubscribe();
    await expect(u.po.page.getByText('Success!')).toBeVisible();
  });

  test('user is prompted to add email before checkout', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    const fakeUser = u.services.users.createFakeUser({ withEmail: false, withPhoneNumber: true });
    await u.services.users.createBapiUser(fakeUser);

    await u.po.signIn.goTo();
    await u.po.signIn.usePhoneNumberIdentifier().click();
    await u.po.signIn.getIdentifierInput().fill(fakeUser.phoneNumber);
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();
    await u.po.expect.toBeSignedIn();
    await u.po.page.goToRelative('/pricing-table');

    await u.po.pricingTable.startCheckout({ planSlug: 'plus' });
    await u.po.checkout.waitForMounted();
    await expect(u.po.page.getByText('Checkout')).toBeVisible();
    await expect(u.po.page.getByText(/^Add an email address$/i)).toBeVisible();

    const newFakeUser = u.services.users.createFakeUser();
    await u.po.userProfile.typeEmailAddress(newFakeUser.email);

    await u.page.getByRole('button', { name: /^add$/i }).click();
    await u.po.userProfile.enterTestOtpCode();
    await u.po.checkout.clickPayOrSubscribe();

    await newFakeUser.deleteIfExists();
  });

  // test('can manage and cancel subscription', async ({ page, context }) => {
  //   const u = createTestUtils({ app, page, context });
  //   await u.po.signIn.goTo();
  //   await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
  //   await u.po.page.goToRelative('/pricing-table');

  //   await u.po.pricingTable.waitForMounted();
  //   await u.po.pricingTable.clickManageSubscription();
  //   await u.po.page.getByRole('button', { name: 'Cancel subscription' }).click();
  //   await u.po.page.getByRole('alertdialog').getByRole('button', { name: 'Cancel subscription' }).click();
  //   await expect(u.po.page.getByRole('button', { name: /resubscribe|re-subscribe/i }).first()).toBeVisible();
  // });

  test.describe('redirects', () => {
    test('default navigates to afterSignInUrl', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.page.goToRelative('/pricing-table');
      await u.po.pricingTable.waitForMounted();
      await u.po.pricingTable.startCheckout({ planSlug: 'pro' });
      await u.po.checkout.waitForMounted();
      await u.po.checkout.clickPayOrSubscribe();
      await expect(u.po.page.getByText('Success!')).toBeVisible();
      await page
        .locator('.cl-checkout-root')
        .getByRole('button', { name: /^continue$/i })
        .click();
      await u.page.waitForAppUrl('/');
    });

    test('navigates to supplied newSubscriptionRedirectUrl', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.page.goToRelative('/pricing-table?newSubscriptionRedirectUrl=/success');
      await u.po.pricingTable.waitForMounted();
      await u.po.pricingTable.startCheckout({ planSlug: 'plus' });
      await u.po.checkout.waitForMounted();
      await u.po.checkout.clickPayOrSubscribe();
      await expect(u.po.page.getByText('Success!')).toBeVisible();
      await page
        .locator('.cl-checkout-root')
        .getByRole('button', { name: /^continue$/i })
        .click();
      await u.page.waitForAppUrl('/success');
    });
  });

  test.describe('in UserProfile', () => {
    test('renders pricing table with plans', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.page.goToRelative('/user');

      await u.po.userProfile.waitForMounted();
      await u.po.userProfile.switchToBillingTab();
      await u.po.page.getByRole('button', { name: 'Switch plans' }).click();
      await u.po.pricingTable.waitForMounted();
      await expect(u.po.page.getByRole('heading', { name: 'Pro' })).toBeVisible();
    });

    test('can subscribe to a plan, revalidates payment sources on complete and then downgrades to free', async ({
      page,
      context,
    }) => {
      const u = createTestUtils({ app, page, context });

      const fakeUser = u.services.users.createFakeUser();
      await u.services.users.createBapiUser(fakeUser);

      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.page.goToRelative('/user');

      await u.po.userProfile.waitForMounted();
      await u.po.userProfile.switchToBillingTab();
      await expect(u.po.page.getByText(/Free/i)).toBeVisible();
      await u.po.page.getByRole('button', { name: 'Switch plans' }).click();
      await u.po.pricingTable.startCheckout({ planSlug: 'plus' });
      await u.po.checkout.waitForMounted();
      await u.po.checkout.fillTestCard();
      await u.po.checkout.clickPayOrSubscribe();
      await expect(u.po.page.getByText('Payment was successful!')).toBeVisible();

      await u.po.checkout.confirmAndContinue();
      await u.po.pricingTable.startCheckout({ planSlug: 'free_user', shouldSwitch: true });
      await u.po.checkout.waitForSubscribeButton();
      await expect(
        page.locator('.cl-checkout-root').getByRole('button', { name: /^pay with test card$/i }),
      ).toBeHidden();

      await u.po.checkout.waitForMounted();
      await u.po.checkout.clickPayOrSubscribe();
      await u.po.checkout.confirmAndContinue();

      await u.po.page.locator('.cl-headerBackLink').getByText('Plans').click();

      // Verify the Free plan with Upcoming status exists
      await expect(
        u.po.page
          .locator('.cl-profileSectionContent__subscriptionsList')
          .getByText('Free')
          .locator('xpath=..')
          .getByText('Upcoming'),
      ).toBeVisible();

      await fakeUser.deleteIfExists();
    });

    test('checkout always revalidates on open', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      const fakeUser = u.services.users.createFakeUser();
      await u.services.users.createBapiUser(fakeUser);

      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.page.goToRelative('/user');

      await u.po.userProfile.waitForMounted();
      await u.po.userProfile.switchToBillingTab();
      await u.po.page.getByRole('button', { name: 'Switch plans' }).click();
      await u.po.pricingTable.startCheckout({ planSlug: 'pro', period: 'monthly' });
      await u.po.checkout.waitForMounted();
      await u.po.checkout.closeDrawer();

      await u.po.checkout.waitForMounted();
      await u.po.pricingTable.startCheckout({ planSlug: 'plus', period: 'monthly' });
      await u.po.checkout.fillTestCard();
      await u.po.checkout.clickPayOrSubscribe();
      await u.po.checkout.confirmAndContinue();
      await u.po.pricingTable.startCheckout({ planSlug: 'pro', period: 'monthly' });
      await expect(u.po.page.getByText('- $9.99')).toBeVisible();

      await fakeUser.deleteIfExists();
    });

    test('adds payment source via checkout and resets stripe setup intent after failed payment', async ({
      page,
      context,
    }) => {
      const u = createTestUtils({ app, page, context });

      const fakeUser = u.services.users.createFakeUser();
      await u.services.users.createBapiUser(fakeUser);

      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.page.goToRelative('/user');

      await u.po.userProfile.waitForMounted();
      await u.po.userProfile.switchToBillingTab();
      await u.po.page.getByRole('button', { name: 'Switch plans' }).click();
      await u.po.pricingTable.startCheckout({ planSlug: 'pro', period: 'monthly' });
      await u.po.checkout.waitForMounted();
      await u.po.checkout.fillCard({
        number: '4100000000000019', // fraud card - always declines
        expiration: '1234',
        cvc: '123',
        country: 'United States',
        zip: '12345',
      });
      await u.po.checkout.clickPayOrSubscribe();
      await expect(u.po.page.locator('.cl-checkout-root').getByText('The card was declined.').first()).toBeVisible();
      await u.po.checkout.waitForStipeElements();
      await u.po.checkout.fillTestCard();
      await u.po.checkout.clickPayOrSubscribe();
      await expect(u.po.page.locator('.cl-checkout-root').getByText('Payment was successful!')).toBeVisible();

      await fakeUser.deleteIfExists();
    });

    test('displays notice then plan cannot change', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      const fakeUser = u.services.users.createFakeUser();
      await u.services.users.createBapiUser(fakeUser);

      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.page.goToRelative('/user');

      await u.po.userProfile.waitForMounted();
      await u.po.userProfile.switchToBillingTab();
      await u.po.page.getByRole('button', { name: 'Switch plans' }).click();
      await u.po.pricingTable.startCheckout({ planSlug: 'plus', period: 'annually' });
      await u.po.checkout.waitForMounted();
      await u.po.checkout.fillTestCard();
      await u.po.checkout.clickPayOrSubscribe();
      await expect(u.po.page.getByText('Payment was successful!')).toBeVisible();

      await u.po.checkout.confirmAndContinue();
      await u.po.pricingTable.startCheckout({ planSlug: 'pro', shouldSwitch: true, period: 'monthly' });
      await u.po.checkout.waitForMounted();
      await expect(
        page
          .locator('.cl-checkout-root')
          .getByText(
            'You cannot subscribe to this plan by paying monthly. To subscribe to this plan, you need to choose to pay annually',
          ),
      ).toBeVisible();

      await fakeUser.deleteIfExists();
    });
  });
});
