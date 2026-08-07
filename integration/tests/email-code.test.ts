import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils } from '../testUtils';

test.describe('sign up and sign in with email code @generic', () => {
  const configs = [appConfigs.next.appRouter, appConfigs.react.vite];

  configs.forEach(config => {
    test.describe(`${config.name}`, () => {
      test.describe.configure({ mode: 'serial' });

      let app: Application;
      let fakeUser: FakeUser;

      test.beforeAll(async () => {
        app = await config.commit();
        await app.setup();
        await app.withEnv(appConfigs.envs.withEmailCodes);
        await app.dev();
        fakeUser = createTestUtils({ app }).services.users.createFakeUser({
          fictionalEmail: true,
        });
      });

      test.afterAll(async () => {
        await fakeUser.deleteIfExists();
        await app.teardown();
      });

      // TODO: move to its own test suite
      test('sign up', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });
        await u.po.signUp.goTo();
        await u.po.signUp.signUpWithEmailAndPassword({ email: fakeUser.email, password: fakeUser.password });
        await u.po.signUp.enterTestOtpCode();
        await u.po.expect.toBeSignedIn();
      });

      test('does not re-send the email code when the verification step is reloaded', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });
        const reloadUser = createTestUtils({ app }).services.users.createFakeUser({ fictionalEmail: true });

        try {
          await u.po.signUp.goTo();
          await u.po.signUp.signUpWithEmailAndPassword({
            email: reloadUser.email,
            password: reloadUser.password,
          });
          await u.po.signUp.waitForEmailVerificationScreen();

          // Count any /prepare_verification calls that happen after we land on the OTP screen.
          // Before the fix, reloading would re-mount SignUpEmailCodeCard and trigger a duplicate prepare.
          let prepareCount = 0;
          await page.context().route('**/prepare_verification*', async route => {
            prepareCount += 1;
            await route.continue();
          });

          await page.reload();
          await u.po.signUp.waitForEmailVerificationScreen();
          // Give clerk-js time to rehydrate the persisted sign-up and (formerly) call prepare on mount.
          await page.waitForTimeout(1000);

          expect(prepareCount).toBe(0);

          await u.po.signUp.enterTestOtpCode({ awaitPrepare: false });
          await u.po.expect.toBeSignedIn();
        } finally {
          await reloadUser.deleteIfExists();
        }
      });

      // TODO: remove
      test.skip('sign in has been moved to sign in flow test suite, this will be removed', async () => {});
    });
  });
});
