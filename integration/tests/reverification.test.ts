import type { OrganizationMembershipRole } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeOrganization, FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';
import { stringPhoneNumber } from '../testUtils/phoneUtils';
import { fakerPhoneNumber } from '../testUtils/usersService';

const utils = [
  'action',
  // , 'route'
];
const capitalize = (type: string) => type[0].toUpperCase() + type.slice(1);

testAgainstRunningApps({ withEnv: [appConfigs.envs.withReverification] })(
  '@nextjs require @reverification',
  ({ app }) => {
    test.describe.configure({ mode: 'parallel' });

    let fakeAdmin: FakeUser;
    let fakeViewer: FakeUser;
    let fakeOrganization: FakeOrganization;

    test.beforeAll(async () => {
      const m = createTestUtils({ app });
      fakeAdmin = m.services.users.createFakeUser();
      const admin = await m.services.users.createBapiUser(fakeAdmin);
      fakeOrganization = await m.services.users.createFakeOrganization(admin.id);
      fakeViewer = m.services.users.createFakeUser();
      const viewer = await m.services.users.createBapiUser(fakeViewer);
      await m.services.clerk.organizations.createOrganizationMembership({
        organizationId: fakeOrganization.organization.id,
        role: 'org:viewer' as OrganizationMembershipRole,
        userId: viewer.id,
      });
    });

    test.afterAll(async () => {
      await fakeOrganization.delete();
      await fakeViewer.deleteIfExists();
      await fakeAdmin.deleteIfExists();
      await app.teardown();
    });

    test('reverification prompt on adding new email address', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeViewer.email, password: fakeViewer.password });
      await u.po.expect.toBeSignedIn();

      await u.po.userProfile.goTo();
      await u.po.userProfile.waitForMounted();

      await u.page.waitForFunction(async () => {
        await window.Clerk.session.startVerification({
          level: 'first_factor',
        });
      });

      await u.po.userProfile.clickAddEmailAddress();
      await u.po.userProfile.waitForSectionCardOpened('emailAddresses');

      const newFakeEmail = `new-${fakeViewer.email}`;
      await u.po.userProfile.typeEmailAddress(newFakeEmail);

      await u.page.getByRole('button', { name: /^add$/i }).click();

      await u.po.userVerification.waitForMounted();
      await u.po.userVerification.setPassword(fakeViewer.password);
      await u.po.userVerification.continue();
      await u.po.userVerification.waitForClosed();

      await u.po.userProfile.enterTestOtpCode();

      await expect(
        u.page.locator('.cl-profileSectionItem__emailAddresses').filter({
          hasText: newFakeEmail,
        }),
      ).toContainText(newFakeEmail);
    });

    test('reverification prompt on adding new phone number', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeViewer.email, password: fakeViewer.password });
      await u.po.expect.toBeSignedIn();

      await u.po.userProfile.goTo();
      await u.po.userProfile.waitForMounted();

      await u.page.waitForFunction(async () => {
        await window.Clerk.session.startVerification({
          level: 'first_factor',
        });
      });

      await u.po.userProfile.clickAddPhoneNumber();
      await u.po.userProfile.waitForSectionCardOpened('phoneNumbers');
      const newFakePhoneNumber = fakerPhoneNumber();

      await u.po.userProfile.typePhoneNumber(newFakePhoneNumber);

      await u.page.getByRole('button', { name: /^add$/i }).click();

      await u.po.userVerification.waitForMounted();

      await u.po.userVerification.setPassword(fakeViewer.password);
      await u.po.userVerification.continue();

      await u.po.userVerification.waitForClosed();

      await u.po.userProfile.enterTestOtpCode();

      const formatedPhoneNumber = stringPhoneNumber(newFakePhoneNumber);

      await expect(u.page.locator('.cl-profileSectionItem__phoneNumbers')).toContainText(formatedPhoneNumber);
    });

    test('reverification prompt can be cancelled when adding email', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeViewer.email, password: fakeViewer.password });
      await u.po.expect.toBeSignedIn();

      await u.po.userProfile.goTo();
      await u.po.userProfile.waitForMounted();

      await u.page.waitForFunction(async () => {
        await window.Clerk.session.startVerification({
          level: 'first_factor',
        });
      });

      await u.po.userProfile.clickAddEmailAddress();
      await u.po.userProfile.waitForSectionCardOpened('emailAddresses');

      const newFakeEmail = `new2-${fakeViewer.email}`;
      await u.po.userProfile.typeEmailAddress(newFakeEmail);

      await u.page.getByRole('button', { name: /^add$/i }).click();

      await u.po.userVerification.waitForMounted();

      await u.po.userVerification.closeReverificationModal();

      await u.po.userVerification.waitForClosed();
      await u.po.userProfile.enterTestOtpCode();

      await expect(u.page.locator('.cl-profileSectionItem__emailAddresses')).not.toContainText(newFakeEmail);
    });

    test('reverification prompt when deleting account', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const delFakeUser = u.services.users.createFakeUser({
        withUsername: true,
        fictionalEmail: true,
        withPhoneNumber: true,
      });
      const bapiFakeUser = await u.services.users.createBapiUser({
        ...delFakeUser,
        username: undefined,
        phoneNumber: undefined,
      });

      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: delFakeUser.email, password: delFakeUser.password });
      await u.po.expect.toBeSignedIn();

      await u.po.userProfile.goTo();
      await u.po.userProfile.waitForMounted();
      await u.po.userProfile.switchToSecurityTab();

      await u.page.waitForFunction(async () => {
        await window.Clerk.session.startVerification({
          level: 'first_factor',
        });
      });

      await u.page
        .getByRole('button', {
          name: /delete account/i,
        })
        .click();

      await u.page.locator('input[name=deleteConfirmation]').fill('Delete account');

      await u.page.locator('form').getByRole('button', { name: 'Delete account' }).click();

      await u.po.userVerification.waitForMounted();
      await u.po.userVerification.setPassword(delFakeUser.password);
      await u.po.userVerification.continue();
      await u.po.userVerification.waitForClosed();

      await u.po.expect.toBeSignedOut();

      await u.page.waitForAppUrl('/');

      const sessionCookieList = (await u.page.context().cookies()).filter(cookie =>
        cookie.name.startsWith('__session'),
      );

      expect(sessionCookieList.length).toBe(0);
    });

    utils.forEach(type => {
      test(`reverification error from ${capitalize(type)}`, async ({ page, context }) => {
        test.setTimeout(270_000);
        const u = createTestUtils({ app, page, context });

        await u.po.signIn.goTo();
        await u.po.signIn.waitForMounted();
        await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
        await u.po.expect.toBeSignedIn();

        await u.po.organizationSwitcher.goTo();
        await u.po.organizationSwitcher.waitForMounted();
        await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

        await u.page.goToRelative(`/requires-re-verification`);
        await u.page.getByRole('button', { name: /LogUserId/i }).click();
        await expect(u.page.getByText(/\{\s*"userId"\s*:\s*"user_[^"]+"\s*\}/i)).toBeVisible();

        const total = 1000 * 120;
        await page.waitForTimeout(total / 3);
        await page.waitForTimeout(total / 3);
        await u.po.userProfile.goTo();
        await page.waitForTimeout(total / 3);
        await u.page.goToRelative(`/requires-re-verification`);
        await u.page.getByRole('button', { name: /LogUserId/i }).click();
        await expect(
          u.page.getByText(
            /\{\s*"clerk_error"\s*:\s*\{\s*"type"\s*:\s*"forbidden"\s*,\s*"reason"\s*:\s*"reverification-error"\s*,\s*"metadata"\s*:\s*\{\s*"reverification"\s*:\s*\{\s*"level"\s*:\s*"second_factor"\s*,\s*"afterMinutes"\s*:\s*1\s*\}\s*\}\s*\}\s*\}/i,
          ),
        ).toBeVisible();
      });

      test(`reverification recovery from ${capitalize(type)}`, async ({ page, context }) => {
        test.setTimeout(270_000);
        const u = createTestUtils({ app, page, context });

        await u.po.signIn.goTo();
        await u.po.signIn.waitForMounted();
        await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
        await u.po.expect.toBeSignedIn();

        await u.po.organizationSwitcher.goTo();
        await u.po.organizationSwitcher.waitForMounted();
        await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

        await u.page.goToRelative(`/requires-re-verification`);
        await u.page.getByRole('button', { name: /LogUserId/i }).click();
        await expect(u.page.getByText(/\{\s*"userId"\s*:\s*"user_[^"]+"\s*\}/i)).toBeVisible();

        const total = 1000 * 120;
        await page.waitForTimeout(total / 3);
        await page.waitForTimeout(total / 3);
        await u.po.userProfile.goTo();
        await page.waitForTimeout(total / 3);
        await u.page.goToRelative(`/action-with-use-reverification`);
        await u.po.expect.toBeSignedIn();
        await u.page.getByRole('button', { name: /LogUserId/i }).click();
        await u.po.userVerification.waitForMounted();
      });
    });
  },
);
