import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withSignInOrUpEmailLinksFlow] })(
  '@nextjs sign-in-or-up email links flow',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeUser: FakeUser;
    let emailLinkOnlyUser: FakeUser;
    let emailLinkOnlyAddress: string;

    test.beforeAll(async () => {
      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser(test);
      emailLinkOnlyUser = u.services.users.createFakeUser(test, {
        fictionalEmail: false,
        withPassword: false,
      });
      if (!emailLinkOnlyUser.email) {
        throw new Error('Expected the email-link-only test user to have an email address');
      }
      emailLinkOnlyAddress = emailLinkOnlyUser.email;
      await u.services.users.createBapiUser(emailLinkOnlyUser);
    });

    test.afterAll(async () => {
      try {
        await Promise.all([fakeUser.deleteIfExists(), emailLinkOnlyUser.deleteIfExists()]);
      } finally {
        await app.teardown();
      }
    });

    test('sign up with email link', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.setIdentifier(fakeUser.email);
      await u.po.signIn.continue();
      await u.page.waitForAppUrl('/sign-in/create');

      const prefilledEmail = u.po.signUp.getEmailAddressInput();
      await expect(prefilledEmail).toHaveValue(fakeUser.email);

      await u.po.signUp.setPassword(fakeUser.password);
      await u.po.signUp.continue();

      await u.po.signUp.waitForEmailVerificationScreen();
      await u.tabs.runInNewTab(async u => {
        const verificationLink = await u.services.email.getVerificationLinkForEmailAddress(fakeUser.email);

        await u.po.testingToken.setup();
        await u.page.goto(verificationLink);
        await u.po.expect.toBeSignedIn();
        await u.page.close();
      });
      await u.po.expect.toBeSignedIn();
    });

    test('sign in with email link', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.setIdentifier(fakeUser.email);
      await u.po.signIn.continue();
      await u.page.waitForAppUrl('/sign-in/factor-one');
      // Defaults to password, so we need to switch to email link
      await u.page.getByRole('link', { name: /Use another method/i }).click();
      await u.page.getByRole('button', { name: /Email link to/i }).click();
      await page.getByRole('heading', { name: /Check your email/i }).waitFor();
      await u.tabs.runInNewTab(async u => {
        const verificationLink = await u.services.email.getVerificationLinkForEmailAddress(fakeUser.email);
        await u.po.testingToken.setup();
        await u.page.goto(verificationLink);
        await u.po.expect.toBeSignedIn();
        await u.page.close();
      });
      await u.po.expect.toBeSignedIn();
      await fakeUser.deleteIfExists();
    });

    test('completes an expired-freshness protected action through a same-browser email link', async ({
      page,
      context,
      browser,
    }) => {
      test.setTimeout(300_000);
      const u = createTestUtils({ app, page, context, browser });

      await u.po.signIn.goTo();
      await u.po.signIn.setIdentifier(emailLinkOnlyAddress);
      await u.po.signIn.continue();
      await u.page.getByRole('heading', { name: /Check your email/i }).waitFor();

      await u.tabs.runInNewTab(async callback => {
        const verificationLink = await callback.services.email.getVerificationLinkForEmailAddress(emailLinkOnlyAddress);
        await callback.po.testingToken.setup();
        await callback.page.goto(verificationLink);
        await callback.po.expect.toBeSignedIn();
        await callback.page.close();
      });
      await u.po.expect.toBeSignedIn();

      await expect
        .poll(
          () =>
            page.evaluate(async () => {
              const token = await window.Clerk.session?.getToken({ skipCache: true });
              if (!token) {
                return -1;
              }
              const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
              return JSON.parse(atob(payload)).fva?.[0] ?? -1;
            }),
          { intervals: [5_000], timeout: 120_000 },
        )
        .toBeGreaterThanOrEqual(1);

      const returnPath = '/action-with-use-reverification?return=protected-action';
      await u.page.goToRelative(returnPath);
      await u.page.getByRole('button', { name: /LogUserId/i }).click();
      await u.po.userVerification.waitForMounted();
      await u.page.getByRole('heading', { name: /Check your email/i }).waitFor();

      const mismatchedClientLink = await u.services.email.getVerificationLinkForEmailAddress(emailLinkOnlyAddress);
      await u.tabs.runInNewBrowser(async callback => {
        await callback.po.testingToken.setup();
        await callback.page.goto(mismatchedClientLink);
        await callback.page.getByRole('heading', { name: /Verification link is invalid for this browser/i }).waitFor();
        await callback.page.close();
      });

      await expect(u.page).toHaveURL(new RegExp(`${returnPath.replace('?', '\\?')}$`));
      await u.page.getByRole('button', { name: /Resend/i }).click();

      await u.tabs.runInNewTab(async callback => {
        const verificationLink = await callback.services.email.getVerificationLinkForEmailAddress(emailLinkOnlyAddress);
        await callback.po.testingToken.setup();
        await callback.page.goto(verificationLink);
        await callback.page.getByRole('heading', { name: /Verification complete/i }).waitFor();
        const callbackUrl = new URL(callback.page.url());
        expect(callbackUrl.pathname).toBe('/action-with-use-reverification');
        expect(callbackUrl.searchParams.get('return')).toBe('protected-action');
        await callback.page.close();
      });

      await u.po.userVerification.waitForClosed();
      await expect(u.page).toHaveURL(new RegExp(`${returnPath.replace('?', '\\?')}$`));
      await expect(u.page.getByText(/\{\s*"userId"\s*:\s*"user_[^"]+"\s*\}/i)).toBeVisible();
    });
  },
);
