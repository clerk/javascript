import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withSignInOrUpEmailLinksFlow] })(
  'sign-in-or-up email links flow @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeUser: FakeUser;

    test.beforeAll(() => {
      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser({
        fictionalEmail: false,
        withPassword: true,
      });
    });

    test.afterAll(async () => {
      await app.teardown();
    });

    test('sign up with email link', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.setIdentifier(fakeUser.email);
      await u.po.signIn.continue();
      await u.page.waitForAppUrl('/sign-in/create');

      const prefilledEmail = await u.po.signUp.getEmailAddressInput().inputValue();
      expect(prefilledEmail).toBe(fakeUser.email);

      await u.po.signUp.setPassword(fakeUser.password);
      await u.po.signUp.continue();

      await u.po.signUp.waitForEmailVerificationScreen();
      await u.tabs.runInNewTab(async u => {
        const verificationLink = await u.services.email.getVerificationLinkForEmailAddress(fakeUser.email);
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
        await u.page.goto(verificationLink);
        await u.po.expect.toBeSignedIn();
        await u.page.close();
      });
      await u.po.expect.toBeSignedIn();
      await fakeUser.deleteIfExists();
    });
  },
);
