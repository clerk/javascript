import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withBilling] })('pricing table @billing', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });

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
    test.describe.configure({ mode: 'parallel' });

    test('renders pricing table with plans', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.page.goToRelative('/pricing-table');

      await u.po.pricingTable.waitForMounted();
      await expect(u.po.page.getByRole('heading', { name: 'Pro' })).toBeVisible();
    });

    test('renders pricing details of a specific plan', async ({ page, context }) => {
      if (!app.name.includes('next')) {
        return;
      }
      const u = createTestUtils({ app, page, context });
      await u.po.page.goToRelative('/billing/plan-details-btn');

      await u.po.page.getByRole('button', { name: 'Plan details' }).click();

      await u.po.planDetails.waitForMounted();
      const { root } = u.po.planDetails;
      await expect(root.getByRole('heading', { name: 'Plus' })).toBeVisible();
      await expect(root.getByText('$9.99')).toBeVisible();
      await expect(root.getByText('This is the Plus plan!')).toBeVisible();
      await expect(root.getByText('Feature One')).toBeVisible();
      await expect(root.getByText('First feature')).toBeVisible();
      await expect(root.getByText('Feature Two')).toBeVisible();
      await expect(root.getByText('Second feature')).toBeVisible();
      await expect(root.getByText('Feature Three')).toBeVisible();
      await expect(root.getByText('Third feature')).toBeVisible();
    });

    test('when signed out, clicking subscribe button navigates to sign in page', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.page.goToRelative('/pricing-table');

      await u.po.pricingTable.waitForMounted();
      await u.po.pricingTable.startCheckout({ planSlug: 'plus' });
      await u.po.signIn.waitForMounted();
      await expect(u.po.page.getByText('Checkout')).toBeHidden();
    });
  });

  test.describe('when signed in flow', () => {
    test.describe.configure({ mode: 'serial' });

    test('when signed in, clicking get started button opens checkout drawer and shows free plan as active', async ({
      page,
      context,
    }) => {
      if (!app.name.includes('next')) {
        return;
      }
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

    test('when signed in, clicking checkout button open checkout drawer', async ({ page, context }) => {
      if (!app.name.includes('next')) {
        return;
      }
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.page.goToRelative('/billing/checkout-btn');

      await u.po.page.getByRole('button', { name: 'Checkout Now' }).click();
      await u.po.checkout.waitForMounted();
      await u.po.page.getByText(/^Checkout$/).click();
      await u.po.checkout.fillTestCard();
    });

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

    test('opens subscription details drawer', async ({ page, context }) => {
      if (!app.name.includes('next')) {
        return;
      }
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.page.goToRelative('/billing/subscription-details-btn');

      await u.po.page.getByRole('button', { name: 'Subscription details' }).click();

      await u.po.subscriptionDetails.waitForMounted();
      await expect(u.po.page.getByText('Plus')).toBeVisible();
      await expect(u.po.page.getByText('Subscription details')).toBeVisible();
      await expect(u.po.page.getByText('Current billing cycle')).toBeVisible();
      await expect(u.po.page.getByText('Next payment on')).toBeVisible();
      await expect(u.po.page.getByText('Next payment amount')).toBeVisible();
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
        // eslint-disable-next-line playwright/no-conditional-in-test
        if (app.name.includes('next')) {
          // Correctly updates RSCs with the new `pla` claim.
          await expect(u.po.page.getByText('user in pro')).toBeVisible({
            timeout: 5_000,
          });
        }
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

  test.describe('in UserProfile', () => {
    // test.describe.configure({ mode: 'serial' });
    test('renders pricing table, subscribes to a plan, revalidates payment sources on complete and then downgrades to free', async ({
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

      await u.po.pricingTable.waitForMounted();
      await expect(u.po.page.getByRole('heading', { name: 'Pro' })).toBeVisible();

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

    test('unsubscribes from a plan', async ({ page, context }) => {
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
      await u.po.page.locator('.cl-headerBackLink').getByText('Plans').click();

      await u.page.waitForTimeout(1000);
      await expect(u.po.page.locator('.cl-profileSectionContent__subscriptionsList').getByText('Plus')).toBeVisible();
      await u.po.page.getByRole('button', { name: 'Manage subscription' }).first().click();
      await u.po.subscriptionDetails.waitForMounted();
      await u.po.subscriptionDetails.root.locator('.cl-menuButtonEllipsisBordered').click();
      await u.po.subscriptionDetails.root.getByText('Cancel subscription').click();
      await u.po.subscriptionDetails.root.locator('.cl-drawerConfirmationRoot').waitFor({ state: 'visible' });
      await u.po.subscriptionDetails.root.getByText('Cancel subscription').click();
      await u.po.subscriptionDetails.waitForUnmounted();

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
      // It should unmount and remount the payment element
      await u.po.checkout.waitForStripeElements({ state: 'hidden' });
      await u.po.checkout.waitForStripeElements({ state: 'visible' });
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
            'You cannot subscribe to this plan by paying monthly. To subscribe to this plan, you need to choose to pay annually.',
          ),
      ).toBeVisible();

      await fakeUser.deleteIfExists();
    });
  });
});
