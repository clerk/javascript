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
    await expect(u.po.page.getByRole('heading', { name: 'Pro' })).toBeVisible();
  });

  test('when signed out, clicking get started button navigates to sign in page', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.page.goToRelative('/pricing-table');
    await u.po.page.getByText('Get started').first().click();
    await u.po.signIn.waitForMounted();
    await expect(u.po.page.getByText('Checkout')).toBeHidden();
  });

  test('when signed in, clicking get started button opens checkout drawer', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.page.goToRelative('/pricing-table');
    await u.po.page.getByText('Get started').first().click();
    await expect(u.po.page.getByText('Checkout')).toBeVisible();
  });

  test('can subscribe to a plan', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.page.goToRelative('/pricing-table');
    // We have two plans, so subscribe to the first one
    await u.po.page.getByText('Get started').first().click();

    // Stripe uses multiple iframes, so we need to find the correct one
    const frame = u.po.page.frameLocator('iframe[src*="elements-inner-payment"]');
    await frame.getByLabel('Card number').fill('4242424242424242');
    await frame.getByLabel('Expiration date').fill('1234');
    await frame.getByLabel('Security code').fill('123');
    // await frame.getByLabel('ZIP code').fill('12345');

    await u.po.page.getByRole('button', { name: 'Pay $' }).click();
    await expect(u.po.page.getByText('Payment was successful!')).toBeVisible();
  });

  test('can manage and cancel subscription', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.page.goToRelative('/pricing-table');
    await u.po.page.getByText('Manage subscription').click();
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
      await u.po.page.getByText(/Billing/i).click();
      await u.po.page.getByRole('button', { name: 'View all plans' }).click();
      await expect(u.po.page.getByRole('heading', { name: 'Pro' })).toBeVisible();
    });
  });
});
