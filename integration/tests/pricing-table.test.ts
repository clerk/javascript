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
      const u = createTestUtils({ app, page, context });
      await u.po.page.goToRelative('/billing/plan-details-btn');

      await u.po.page.waitForClerkJsLoaded();
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

    test('when signed out, clicking trial plan redirects to sign in', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.page.goToRelative('/pricing-table');

      await u.po.pricingTable.waitForMounted();
      await expect(u.po.page.getByText(/Start \d+-day free trial/i)).toBeVisible();
      await u.po.pricingTable.startCheckout({ planSlug: 'trial' });

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
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.page.goToRelative('/billing/checkout-btn');

      await u.po.page.waitForClerkJsLoaded();
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
      await expect(u.po.checkout.root.getByText('Payment was successful!')).toBeVisible();
      await expect(u.po.checkout.root.getByText('Visa ⋯ 4242')).toBeVisible();
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
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.page.goToRelative('/billing/subscription-details-btn');

      await u.po.page.waitForClerkJsLoaded();
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

  test('starts free trial subscription for new user', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    // Create a new user specifically for this trial test
    const trialUser = u.services.users.createFakeUser();
    await u.services.users.createBapiUser(trialUser);

    try {
      // Sign in the new user
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: trialUser.email,
        password: trialUser.password,
      });

      // Navigate to pricing table
      await u.po.page.goToRelative('/pricing-table');
      await u.po.pricingTable.waitForMounted();

      // Verify trial plan is displayed with trial CTA
      // Note: This assumes there's a plan with trial enabled in the test environment
      // The button text should show "Start [X]-day free trial" for trial-enabled plans
      await expect(u.po.page.getByText(/Start \d+-day free trial/i)).toBeVisible();

      // Start checkout for a trial plan (assuming 'pro' has trial enabled in test env)
      await u.po.pricingTable.startCheckout({ planSlug: 'trial' });
      await u.po.checkout.waitForMounted();

      // Verify checkout shows trial details
      await expect(u.po.checkout.root.getByText('Checkout')).toBeVisible();
      await expect(u.po.checkout.root.getByText('Free trial')).toBeVisible();
      await expect(u.po.checkout.root.getByText('Total Due after')).toBeVisible();

      await u.po.checkout.fillTestCard();
      await u.po.checkout.clickPayOrSubscribe();

      await expect(u.po.checkout.root.getByText(/Trial.*successfully.*started/i)).toBeVisible({
        timeout: 15_000,
      });
      await u.po.checkout.confirmAndContinue();

      await u.po.page.goToRelative('/pricing-table');
      await u.po.pricingTable.waitForMounted();

      // Verify the user is now shown as having an active free trial
      // The pricing table should show their current plan as active
      await u.po.pricingTable.waitToBeFreeTrial({ planSlug: 'trial' });

      await u.po.page.goToRelative('/user');
      await u.po.userProfile.waitForMounted();
      await u.po.userProfile.switchToBillingTab();

      await expect(
        u.po.page
          .locator('.cl-profileSectionContent__subscriptionsList')
          .getByText(/Trial/i)
          .locator('xpath=..')
          .getByText(/Free trial/i),
      ).toBeVisible({ timeout: 15000 });

      await expect(u.po.page.getByText(/Trial ends/i)).toBeVisible({ timeout: 15000 });

      await u.po.page.getByRole('button', { name: 'Manage' }).first().click();
      await u.po.subscriptionDetails.waitForMounted();
      await u.po.subscriptionDetails.root.locator('.cl-menuButtonEllipsisBordered').click();
      await u.po.subscriptionDetails.root.getByText('Cancel free trial').click();
      await u.po.subscriptionDetails.root.locator('.cl-drawerConfirmationRoot').waitFor({ state: 'visible' });
      await u.po.subscriptionDetails.root.getByRole('button', { name: 'Cancel free trial' }).click();
      await u.po.subscriptionDetails.waitForUnmounted();

      await expect(
        u.po.page
          .locator('.cl-profileSectionContent__subscriptionsList')
          .getByText(/Trial/i)
          .locator('xpath=..')
          .getByText(/Free trial/i),
      ).toBeVisible();

      // Verify the Free plan with Upcoming status exists
      await expect(
        u.po.page
          .locator('.cl-profileSectionContent__subscriptionsList')
          .getByText('Free')
          .locator('xpath=..')
          .getByText('Upcoming'),
      ).toBeVisible();

      await u.po.page.goToRelative('/pricing-table');
      await u.po.pricingTable.waitForMounted();

      // Start checkout for a trial plan (assuming 'pro' has trial enabled in test env)
      await u.po.pricingTable.startCheckout({ planSlug: 'trial' });
      await u.po.checkout.waitForMounted();

      // Verify checkout shows trial details
      await expect(u.po.checkout.root.getByText('Checkout')).toBeVisible();
      await expect(u.po.checkout.root.getByText('Free trial')).toBeHidden();
      await expect(u.po.checkout.root.getByText('Total Due after')).toBeHidden();
      await expect(u.po.checkout.root.getByText('Total Due Today')).toBeVisible();

      await u.po.checkout.root.getByRole('button', { name: /^pay\s\$/i }).waitFor({ state: 'visible' });
      await u.po.checkout.clickPayOrSubscribe();
      await expect(u.po.page.getByText('Payment was successful!')).toBeVisible();
      await u.po.checkout.confirmAndContinue();

      await u.po.page.goToRelative('/user');
      await u.po.userProfile.waitForMounted();
      await u.po.userProfile.switchToBillingTab();

      await expect(u.po.page.locator('.cl-profileSectionContent__subscriptionsList').getByText(/Trial/i)).toBeVisible({
        timeout: 5_000,
      });

      await expect(
        u.po.page
          .locator('.cl-profileSectionContent__subscriptionsList')
          .getByText(/Trial/i)
          .locator('xpath=..')
          .getByText(/Free trial/i),
      ).toBeHidden();

      // Verify the Free plan with Upcoming status exists
      await expect(
        u.po.page
          .locator('.cl-profileSectionContent__subscriptionsList')
          .getByText('Free')
          .locator('xpath=..')
          .getByText('Upcoming'),
      ).toBeHidden();
    } finally {
      // Clean up the trial user
      await trialUser.deleteIfExists();
    }
  });

  test('subscribing to other paid plans while on free trial is immediate cancellation', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    // Create a new user specifically for this trial test
    const trialUser = u.services.users.createFakeUser();
    await u.services.users.createBapiUser(trialUser);

    try {
      // Sign in the new user
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: trialUser.email,
        password: trialUser.password,
      });

      // Navigate to pricing table
      await u.po.page.goToRelative('/pricing-table');
      await u.po.pricingTable.waitForMounted();

      // Verify trial plan is displayed with trial CTA
      // Note: This assumes there's a plan with trial enabled in the test environment
      // The button text should show "Start [X]-day free trial" for trial-enabled plans
      await expect(u.po.page.getByText(/Start \d+-day free trial/i)).toBeVisible();

      // Start checkout for a trial plan (assuming 'pro' has trial enabled in test env)
      await u.po.pricingTable.startCheckout({ planSlug: 'trial' });
      await u.po.checkout.waitForMounted();
      await u.po.checkout.fillTestCard();
      await u.po.checkout.clickPayOrSubscribe();
      await u.po.checkout.confirmAndContinue();

      await u.po.page.waitForAppUrl('/');
      await u.po.page.goToRelative('/user');
      await u.po.userProfile.waitForMounted();
      await u.po.userProfile.switchToBillingTab();

      await expect(
        u.po.page
          .locator('.cl-profileSectionContent__subscriptionsList')
          .getByText(/Trial/i)
          .locator('xpath=..')
          .getByText(/Free trial/i),
      ).toBeVisible();

      await expect(u.po.page.getByText(/Trial ends/i)).toBeVisible();

      await u.po.page.goToRelative('/pricing-table');
      await u.po.pricingTable.waitForMounted();
      // Start checkout for a trial plan (assuming 'pro' has trial enabled in test env)
      await u.po.pricingTable.startCheckout({ planSlug: 'pro' });
      await u.po.checkout.waitForMounted();
      await u.po.checkout.root.getByRole('button', { name: /^pay\s\$/i }).waitFor({ state: 'visible' });
      await u.po.checkout.clickPayOrSubscribe();
      await u.po.checkout.confirmAndContinue();
      await u.po.page.waitForAppUrl('/');
      await u.po.page.goToRelative('/user');
      await u.po.userProfile.waitForMounted();
      await u.po.userProfile.switchToBillingTab();

      await expect(u.po.page.locator('.cl-profileSectionContent__subscriptionsList').getByText(/Pro/i)).toBeVisible({
        timeout: 5_000,
      });
      await expect(u.po.page.locator('.cl-profileSectionContent__subscriptionsList').getByText(/Trial/i)).toBeHidden();
    } finally {
      // Clean up the trial user
      await trialUser.deleteIfExists();
    }
  });

  test.describe('in UserProfile', () => {
    // test.describe.configure({ mode: 'serial' });
    test('renders pricing table, subscribes to a plan, revalidates payment method on complete and then downgrades to free', async ({
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
      await expect(u.po.page.getByText('Payment was successful!')).toBeVisible({
        timeout: 15_000,
      });

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
      await u.po.page
        .locator('.cl-profileSectionContent__subscriptionsList')
        .getByRole('button', { name: 'Manage' })
        .click();
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

      // Ensure the checkout gets hidden before opening again to force revalidation
      await u.po.checkout.root.waitFor({ state: 'hidden' });
      await u.po.pricingTable.startCheckout({ planSlug: 'plus', period: 'monthly' });
      await u.po.checkout.waitForMounted();
      await u.po.checkout.fillTestCard();
      await u.po.checkout.clickPayOrSubscribe();
      await u.po.checkout.confirmAndContinue();
      await u.po.pricingTable.startCheckout({ planSlug: 'pro', period: 'monthly' });
      await expect(u.po.page.getByText('- $9.99')).toBeVisible();

      await fakeUser.deleteIfExists();
    });

    test('adds payment method via checkout and resets stripe setup intent after failed payment', async ({
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

    test('displays billing history and navigates through statement and payment attempt details', async ({
      page,
      context,
    }) => {
      const u = createTestUtils({ app, page, context });

      const fakeUser = u.services.users.createFakeUser();
      await u.services.users.createBapiUser(fakeUser);

      try {
        await u.po.signIn.goTo();
        await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });

        await u.po.page.goToRelative('/user');
        await u.po.userProfile.waitForMounted();
        await u.po.userProfile.switchToBillingTab();

        const openBillingTab = async (label: RegExp) => {
          await page.getByRole('tab', { name: label }).click();
          await page
            .locator('.cl-userProfile-root [role="tabpanel"] .cl-table')
            .waitFor({ state: 'visible', timeout: 15000 });
        };
        const getBillingTableRows = () => {
          return page.locator('.cl-userProfile-root .cl-tableBody .cl-tableRow');
        };
        const waitForBillingTableRows = async (options?: { hasText?: string | RegExp }) => {
          const rows = getBillingTableRows();
          if (options?.hasText) {
            await rows
              .filter({
                hasText: options.hasText,
              })
              .first()
              .waitFor({ state: 'visible', timeout: 15000 });
          } else {
            await rows.first().waitFor({ state: 'visible', timeout: 15000 });
          }
          return rows;
        };
        const getBillingEmptyStateMessage = (text: string | RegExp) => {
          return page.locator('.cl-userProfile-root .cl-table').getByText(text);
        };
        const waitForStatementPage = async () => {
          const statementRoot = page.locator('.cl-statementRoot');
          await statementRoot.waitFor({ state: 'visible', timeout: 15000 });
          return statementRoot;
        };
        const waitForPaymentAttemptPage = async () => {
          const paymentAttemptRoot = page.locator('.cl-paymentAttemptRoot');
          await paymentAttemptRoot.waitFor({ state: 'visible', timeout: 15000 });
          return paymentAttemptRoot;
        };
        const goBackToPaymentsList = async () => {
          const paymentAttemptRoot = page.locator('.cl-paymentAttemptRoot');
          await Promise.all([
            page.waitForURL(/tab=payments/, { timeout: 15000 }),
            page.getByRole('link', { name: /Payments/i }).click(),
          ]);
          await paymentAttemptRoot.waitFor({ state: 'detached', timeout: 15000 });
        };

        await openBillingTab(/Statements/i);
        await expect(getBillingEmptyStateMessage('No statements to display')).toBeVisible();

        await u.po.page.goToRelative('/user');
        await u.po.userProfile.waitForMounted();
        await u.po.userProfile.switchToBillingTab();
        await u.po.page.getByRole('button', { name: 'Switch plans' }).click();

        await u.po.pricingTable.waitForMounted();
        await u.po.pricingTable.startCheckout({ planSlug: 'plus' });
        await u.po.checkout.waitForMounted();
        await u.po.checkout.fillTestCard();
        await u.po.checkout.clickPayOrSubscribe();
        await expect(u.po.page.getByText('Payment was successful!')).toBeVisible({
          timeout: 15000,
        });
        await u.po.checkout.confirmAndContinue();

        await u.po.pricingTable.startCheckout({ planSlug: 'pro', shouldSwitch: true });
        await u.po.checkout.waitForMounted();
        await u.po.checkout.root.getByText('Add payment method').click();
        await u.po.checkout.fillCard({
          number: '4100000000000019',
          expiration: '1234',
          cvc: '123',
          country: 'United States',
          zip: '12345',
        });
        await u.po.checkout.clickPayOrSubscribe();
        await expect(u.po.checkout.root.getByText('The card was declined.').first()).toBeVisible({
          timeout: 15000,
        });
        await u.po.checkout.closeDrawer();

        await u.po.page.goToRelative('/user');
        await u.po.userProfile.waitForMounted();
        await u.po.userProfile.switchToBillingTab();

        await openBillingTab(/Statements/i);
        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        await waitForBillingTableRows({ hasText: new RegExp(date, 'i') });
        await expect(getBillingEmptyStateMessage('No statements to display')).toBeHidden();

        const firstStatementRow = getBillingTableRows().first();
        await firstStatementRow.click();

        const statementRoot = await waitForStatementPage();
        await expect(
          statementRoot.locator('.cl-statementSectionContentDetailsHeaderTitle').filter({ hasText: /Plus/i }).first(),
        ).toBeVisible();

        const statementTotalText = (await statementRoot.locator('.cl-statementFooterValue').textContent())?.trim();
        expect(statementTotalText).toBeTruthy();

        await statementRoot
          .getByRole('button', { name: /View payment/i })
          .first()
          .click();
        const paymentAttemptRoot = await waitForPaymentAttemptPage();
        await expect(paymentAttemptRoot.locator('.cl-paymentAttemptHeaderBadge')).toHaveText(/paid/i);

        const paymentTotalText = (
          await paymentAttemptRoot.locator('.cl-paymentAttemptFooterValue').textContent()
        )?.trim();
        expect(paymentTotalText).toBe(statementTotalText);

        await expect(
          paymentAttemptRoot.locator('.cl-lineItemsTitle').filter({ hasText: /Plus/i }).first(),
        ).toBeVisible();

        await goBackToPaymentsList();
        await openBillingTab(/Payments/i);
        await waitForBillingTableRows({ hasText: /paid/i });
        await waitForBillingTableRows({ hasText: /Failed/i });
        await expect(getBillingEmptyStateMessage('No payment history')).toBeHidden();

        const failedPaymentRow = getBillingTableRows()
          .filter({ hasText: /Failed/i })
          .first();
        await failedPaymentRow.click();

        const failedPaymentAttemptRoot = await waitForPaymentAttemptPage();
        await expect(failedPaymentAttemptRoot.locator('.cl-paymentAttemptHeaderBadge')).toHaveText(/failed/i);
        await expect(
          failedPaymentAttemptRoot.locator('.cl-lineItemsTitle').filter({ hasText: /Pro/i }).first(),
        ).toBeVisible();

        await goBackToPaymentsList();
      } finally {
        await fakeUser.deleteIfExists();
      }
    });

    test('adds two payment methods and sets the last as default', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      const fakeUser = u.services.users.createFakeUser();
      await u.services.users.createBapiUser(fakeUser);

      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.page.goToRelative('/user');

      await u.po.userProfile.waitForMounted();
      await u.po.userProfile.switchToBillingTab();

      // Add first payment method
      await u.po.page.getByText('Add new payment method').click();
      await u.po.checkout.fillCard({
        number: '4242424242424242',
        expiration: '1234',
        cvc: '123',
        country: 'United States',
        zip: '12345',
      });
      await u.po.page.getByRole('button', { name: 'Add Payment Method' }).click();

      await expect(u.po.page.getByText(/visa/i)).toBeVisible();
      await expect(
        u.po.page
          .getByText(/visa/i)
          .locator('xpath=..')
          .getByText(/default/i),
      ).toBeVisible();

      // Add second payment method
      await u.po.page.getByText('Add new payment method').click();
      await u.po.checkout.fillCard({
        number: '5555555555554444',
        expiration: '1234',
        cvc: '123',
        country: 'United States',
        zip: '12345',
      });
      await u.po.page.getByRole('button', { name: 'Add Payment Method' }).click();

      await expect(u.po.page.getByText(/mastercard/i)).toBeVisible();

      // Open menu for the last payment method and make it default
      await u.po.page.locator('.cl-userProfile-root .cl-menuButtonEllipsis').last().click();
      await u.po.page.getByText('Make default').click();

      // Verify Mastercard is now default and Visa is not
      await expect(
        u.po.page
          .getByText(/mastercard/i)
          .locator('xpath=..')
          .getByText(/default/i),
      ).toBeVisible({ timeout: 15000 });
      await expect(
        u.po.page
          .getByText(/visa/i)
          .locator('xpath=..')
          .getByText(/default/i),
      ).toBeHidden();

      await fakeUser.deleteIfExists();
    });
  });
});
