import { expect, test } from '@playwright/test';

import type { FakeOrganization, FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

const INVITEE_EMAIL = 'one+clerk_test@clerk.dev';

test.describe.configure({ mode: 'serial' });

testAgainstRunningApps({})('per-seat pricing @billing', ({ app }) => {
  let fakeAdmin: FakeUser;
  let fakeOrganization: FakeOrganization;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });

    fakeAdmin = u.services.users.createFakeUser();
    const admin = await u.services.users.createBapiUser(fakeAdmin);
    fakeOrganization = await u.services.users.createFakeOrganization(admin.id);
  });

  test.afterAll(async () => {
    await fakeOrganization.delete();
    await fakeAdmin.deleteIfExists();
    await app.teardown();
  });

  test('invites a member after purchasing additional seats', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fillInviteForm = async () => {
      const emailInput = u.po.page.getByTestId('tag-input');
      await emailInput.fill(INVITEE_EMAIL);
      await emailInput.press('Enter');

      await u.po.page.getByRole('button', { name: /select role/i }).click();
      await u.po.page.getByRole('option', { name: /^member$/i }).click();
    };

    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({
      email: fakeAdmin.email,
      password: fakeAdmin.password,
    });
    await u.po.expect.toBeSignedIn();

    await u.po.organizationProfile.goTo();
    await u.po.organizationProfile.switchToBillingTab();
    await expect(u.po.page.getByRole('heading', { name: 'Billing' })).toBeVisible();

    await u.po.page.getByText(/^Switch plans$/).click();
    await u.po.pricingTable.waitForMounted();
    await u.po.pricingTable.startCheckout({ planSlug: 'bronze' });
    await u.po.checkout.waitForMounted();
    await u.po.checkout.fillTestCard();
    await u.po.checkout.clickPayOrSubscribe();
    await expect(u.po.checkout.root.getByText('Payment was successful!')).toBeVisible({
      timeout: 15_000,
    });
    await u.po.checkout.confirmAndContinue();

    await u.po.page.getByText(/^Members$/).click();
    await expect(u.po.page.getByRole('heading', { name: 'Members' })).toBeVisible();

    await u.po.page.getByRole('button', { name: 'Invite' }).click();
    await fillInviteForm();

    const purchaseSeatsButton = u.po.page.getByRole('button', { name: 'Purchase additional seats' });
    await expect(purchaseSeatsButton).toBeVisible();
    await purchaseSeatsButton.click();

    await u.po.checkout.waitForMounted();
    await u.po.checkout.clickPayOrSubscribe();
    await expect(u.po.checkout.root.getByText('Payment was successful!')).toBeVisible({
      timeout: 15_000,
    });
    await u.po.checkout.confirmAndContinue();
    await u.po.checkout.root.waitFor({ state: 'hidden', timeout: 15_000 });

    await u.po.organizationProfile.goTo();
    await u.po.page.getByText(/^Members$/).click();
    await expect(u.po.page.getByRole('heading', { name: 'Members' })).toBeVisible();
    await u.po.page.getByRole('button', { name: 'Invite' }).click();
    await fillInviteForm();

    const sendInvitationsButton = u.po.page.getByRole('button', { name: 'Send invitations' });
    await expect(sendInvitationsButton).toBeEnabled({ timeout: 15_000 });
    await sendInvitationsButton.click({ timeout: 15_000 });

    await expect(u.po.page.getByText('Invitations successfully sent')).toBeVisible({
      timeout: 15_000,
    });
    await u.po.page.getByRole('button', { name: 'Finish' }).click();

    await u.po.page.getByRole('tab', { name: /Invitations/i }).click();
    await expect(u.po.page.getByText(INVITEE_EMAIL)).toBeVisible({
      timeout: 15_000,
    });
  });
});
