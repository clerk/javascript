import { test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils } from '../testUtils';

test.describe('Dev Browser JWT test', () => {
  const configs = [appConfigs.longRunning.next.appRouterWithEmailCodes];

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
        fakeUser = createTestUtils({ app }).services.users.createFakeUser();
      });

      test.afterAll(async () => {
        await fakeUser.deleteIfExists();
        await app.teardown();
      });

      test('sign up through accounts portal', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });
        await u.page.pause();
        await u.page.goToRelative('/protected');
        await u.page.waitForURL(/accounts/);
        await u.po.signIn.getGoToSignUp().click();
        await u.po.signUp.signUpWithEmailAndPassword({ email: fakeUser.email, password: fakeUser.password });
        await u.po.signUp.enterOtpCode(await u.services.email.getCodeForEmailAddress(fakeUser.email));
        await u.page.waitForURL(/protected/);
        await u.po.expect.toBeSignedIn();
      });

      test('sign in through accounts portal', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });
        await u.page.pause();
        await u.page.goToRelative('/protected');
        await u.page.waitForURL(/accounts/);
        await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
        await u.page.waitForURL(/protected/);
        await u.po.expect.toBeSignedIn();
      });

      test('Dev Browser JWT that gets appended to the URL when redirecting to Accounts Portal, overrides any existing Dev Browser JWT in AP', async () => {
        // TODO: Implement this test
      });

      /*
        - Try to access a protected page in localhost
        - You get redirected to Accounts Portal
        - Sign in with email and password
        - You get redirected back to localhost and are signed in
        - Delete cookies and storage on the browser on localhost
        - Try to access a protected page in localhost
        - Should be redirected to Accounts Portal and prompt to sign in
        - Sign in with email and password
        - Should be redirected back to localhost and are signed in
       */
      test('Deleting localhost Dev Browser JWT should clear the signed in state in Accounts Portal when redirected', async () => {
        // TODO: Implement this test
      });

      /*
      - Access Accounts Portal directly
      - Sign in with email and password
      - You get redirected to accounts/default-redirect and are signed in
      - Access a protected page in localhost
      - Should be redirected to Accounts Portal and prompt to sign in
      - Sign in with email and password
      - Should be redirected back to localhost and are signed in
     */
      test('Signing in to Accounts Portal directly and then trying to access localhost will redirect to Accounts Portal with a new Dev Browser', async () => {
        // TODO: Implement this test
      });
    });
  });
});
