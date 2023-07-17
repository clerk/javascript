import { test } from '@playwright/test';

import type { Application } from '../adapters/application';
import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils } from '../testUtils';

test.describe('sign in smoke test', () => {
  const configs = [appConfigs.longRunning.react.viteEmailLink, appConfigs.remix.remixNode];

  configs.forEach(config => {
    test.describe(`${config.name}`, () => {
      test.describe.configure({ mode: 'serial' });

      let app: Application;
      let fakeUser: FakeUser;

      test.beforeAll(async () => {
        app = await config.commit();
        await app.setup();
        await app.withEnv(appConfigs.instances.allEnabled);
        await app.dev();
        const u = createTestUtils({ app });
        fakeUser = u.services.users.createFakeUser();
        await u.services.users.createBapiUser(fakeUser);
      });

      test.afterAll(async () => {
        await fakeUser.deleteIfExists();
        await app.teardown();
      });

      test('sign in with email and password', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });
        await u.page.pause();
        await u.po.signIn.goTo();
        await u.po.signIn.setIdentifier(fakeUser.email);
        await u.po.signIn.continue();
        await u.po.signIn.setPassword(fakeUser.password);
        await u.po.signIn.continue();
        await u.po.expect.toBeSignedIn();
      });

      test('sign in with email and instant password', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });
        await u.po.signIn.goTo();
        await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
        await u.po.expect.toBeSignedIn();
        await u.page.pause();
      });
    });
  });
});
