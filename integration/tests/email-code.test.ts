import { test } from '@playwright/test';

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

      test('sign up', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });
        await u.po.signUp.goTo();
        await u.po.signUp.signUpWithEmailAndPassword({ email: fakeUser.email, password: fakeUser.password });
        await u.po.signUp.enterOtpCode('424242');
        await u.po.expect.toBeSignedIn();
      });

      test('sign in', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });
        await u.po.signIn.goTo();
        await u.po.signIn.getIdentifierInput().fill(fakeUser.email);
        await u.po.signIn.continue();
        await u.po.signIn.getUseAnotherMethodLink().click();
        await u.po.signIn.getAltMethodsEmailCodeButton().click();
        await u.po.signIn.enterOtpCode('424242');
        await u.po.expect.toBeSignedIn();
      });
    });
  });
});
