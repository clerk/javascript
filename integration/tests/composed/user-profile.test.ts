import { type BrowserContext, expect, type Page, test } from '@playwright/test';

import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';
import { stringPhoneNumber } from '../../testUtils/phoneUtils';

/**
 * E2E parity coverage for the experimental composed exports from `@clerk/ui/experimental`.
 *
 * The composed API (`UserProfileProvider`, `UserProfileAccountPanel`, `UserProfileEmailSection`,
 * ...) lets a developer compose the profile UI from flat exports. Its section wrappers render the
 * exact same underlying components as the standard `<UserProfile />` (e.g. `UserProfileEmailSection`
 * -> `AccountEmails` from `AccountSections`), so the trusted `user-profile.test.ts` flows apply
 * unchanged. This suite reuses the shared `@clerk/testing` page-object step helpers (`u.po.userProfile.*`)
 * and the same assertions as `user-profile.test.ts`, so if a composed export diverges from the
 * standard behavior an existing, trusted assertion fails.
 *
 * `user-profile.test.ts` is intentionally left untouched while this API is experimental. The only
 * differences handled locally here are the composed component's lack of chrome:
 *   - it does not render the `.cl-userProfile-root` wrapper, so the mount wait keys off a rendered
 *     affordance instead;
 *   - it has no Account/Security tabs — the page renders both panels, so security sections are
 *     already present (no `switchToSecurityTab()`).
 */

testAgainstRunningApps({ withPattern: ['next.appRouterBundledUI.*'] })(
  'composed UserProfile exports @composed',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });
    let fakeUser: FakeUser;

    test.beforeAll(async () => {
      const m = createTestUtils({ app });
      fakeUser = m.services.users.createFakeUser(test, {
        withUsername: true,
        fictionalEmail: true,
        withPhoneNumber: true,
      });
      await m.services.users.createBapiUser({
        ...fakeUser,
        username: undefined,
        phoneNumber: undefined,
      });
    });

    test.afterAll(async () => {
      await fakeUser?.deleteIfExists();
    });

    // Sign in as `user` and open the composed profile page. The composed provider renders null until
    // the user + environment are loaded and emits no `.cl-userProfile-root`, so we wait on a rendered
    // affordance (the profile section's "Update profile" action) rather than the standard root.
    const signInAndVisitComposedUserProfile = async (page: Page, context: BrowserContext, user: FakeUser) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: user.email, password: user.password });
      await u.po.expect.toBeSignedIn();
      await u.page.goToRelative('/composed/user');
      await u.page.getByText(/update profile/i).waitFor({ state: 'visible' });
      return u;
    };

    // The flows below reuse the shared `u.po.userProfile` step helpers and mirror the assertions in
    // `user-profile.test.ts` exactly; only navigation is composed-specific.

    test('can update the username', async ({ page, context }) => {
      const u = await signInAndVisitComposedUserProfile(page, context, fakeUser);

      await u.po.userProfile.clickSetUsername();
      await u.po.userProfile.waitForSectionCardOpened('username');
      await u.po.userProfile.typeUsername(fakeUser.username);
      await u.page.getByText(/Save/i).click();
      await u.po.userProfile.waitForSectionCardClosed('username');

      const username = await u.page.locator('.cl-profileSectionItem__username').innerText();
      expect(username).toContain(fakeUser.username);
    });

    test('can update first and last name', async ({ page, context }) => {
      const u = await signInAndVisitComposedUserProfile(page, context, fakeUser);

      await u.po.userProfile.clickToUpdateProfile();
      await u.po.userProfile.waitForSectionCardOpened('profile');
      await u.po.userProfile.typeFirstName('John');
      await u.po.userProfile.typeLastName('Doe');
      await u.page.getByText(/Save/i).click();
      await u.po.userProfile.waitForSectionCardClosed('profile');

      const fullName = await u.page.locator('.cl-profileSectionItem__profile').innerText();
      expect(fullName).toContain('John Doe');
    });

    test('can add a new email address', async ({ page, context }) => {
      const u = await signInAndVisitComposedUserProfile(page, context, fakeUser);

      await u.po.userProfile.clickAddEmailAddress();
      await u.po.userProfile.waitForSectionCardOpened('emailAddresses');
      const newFakeEmail = `new-${fakeUser.email}`;
      await u.po.userProfile.typeEmailAddress(newFakeEmail);
      await u.page.getByRole('button', { name: /^add$/i }).click();

      await u.po.userProfile.enterTestOtpCode();

      await expect(
        u.page.locator('.cl-profileSectionItem__emailAddresses').filter({ hasText: newFakeEmail }),
      ).toContainText(newFakeEmail);
    });

    test('can add a new phone number', async ({ page, context }) => {
      const u = await signInAndVisitComposedUserProfile(page, context, fakeUser);

      await u.po.userProfile.clickAddPhoneNumber();
      await u.po.userProfile.waitForSectionCardOpened('phoneNumbers');
      await u.po.userProfile.typePhoneNumber(fakeUser.phoneNumber);
      await u.page.getByRole('button', { name: /^add$/i }).click();

      await u.po.userProfile.enterTestOtpCode();

      const formattedPhoneNumber = stringPhoneNumber(fakeUser.phoneNumber);
      await expect(u.page.locator('.cl-profileSectionItem__phoneNumbers')).toContainText(formattedPhoneNumber);
    });

    test('can add mfa authentication with a phone number', async ({ page, context }) => {
      const u = await signInAndVisitComposedUserProfile(page, context, fakeUser);

      // No Security tab to switch to — the composed security panel is already rendered on the page.
      await u.page.getByText(/add two-step verification/i).click();
      await u.page.getByText(/sms code/i).click();

      const formattedPhoneNumber = stringPhoneNumber(fakeUser.phoneNumber);
      await u.page.getByRole('button', { name: formattedPhoneNumber }).click();

      await u.page.getByText(/sms code verification enabled/i).waitFor({ state: 'visible' });
    });

    test('can delete the account', async ({ page, context }) => {
      const m = createTestUtils({ app });
      const delFakeUser = m.services.users.createFakeUser(test, {
        withUsername: true,
        fictionalEmail: true,
        withPhoneNumber: true,
      });
      await m.services.users.createBapiUser({
        ...delFakeUser,
        username: undefined,
        phoneNumber: undefined,
      });

      try {
        const u = await signInAndVisitComposedUserProfile(page, context, delFakeUser);

        // The delete section is rendered directly in the composed security panel (no tab to switch).
        await u.page.getByRole('button', { name: /delete account/i }).click();
        await u.page.locator('input[name=deleteConfirmation]').fill('Delete account');
        await u.page.getByRole('button', { name: /delete account/i }).click();

        await u.po.expect.toBeSignedOut();

        const sessionCookieList = (await u.page.context().cookies()).filter(cookie =>
          cookie.name.startsWith('__session'),
        );
        expect(sessionCookieList).toHaveLength(0);
      } finally {
        await delFakeUser.deleteIfExists();
      }
    });
  },
);
