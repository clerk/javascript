import { test } from '@playwright/test';

import type { Application } from '../models/application';
import { vercelDeployment } from '../models/deployment';
import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils } from '../testUtils';

test.describe('vercel deployment', () => {
  const configs = [appConfigs.next.appRouter];

  configs.forEach(config => {
    test.describe(`${config.name}`, () => {
      test.describe.configure({ mode: 'serial' });

      let app: Application;
      let fakeUser: FakeUser;

      test.beforeAll(async () => {
        test.setTimeout(120_000);
        app = await vercelDeployment(config);
        fakeUser = createTestUtils({ app }).services.users.createFakeUser();
      });

      test.afterAll(async () => {
        await fakeUser.deleteIfExists();
        await app.teardown();
      });

      test('sign up', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });
        await u.po.signUp.goTo();
        await u.po.signUp.signUpWithEmailAndPassword({ email: fakeUser.email, password: fakeUser.password });
        await u.po.signUp.enterOtpCode(await u.services.email.getCodeForEmailAddress(fakeUser.email));
        await u.po.expect.toBeSignedIn();
      });

      test('sign in', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });
        await u.po.signIn.goTo();
        await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
        await u.po.expect.toBeSignedIn();
        await u.page.waitForURL(app.serverUrl);
      });
    });
  });
});
