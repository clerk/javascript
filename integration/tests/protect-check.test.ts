import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils } from '../testUtils';

const waitForProtectCheckSubmit = (page: Page) =>
  page.waitForResponse(
    response => response.request().method() === 'POST' && response.url().includes('/protect_check'),
    { timeout: 30_000 },
  );

test.describe('protect check @generic', () => {
  test.describe.configure({ mode: 'serial' });

  let app: Application;
  let fakeUser: FakeUser | undefined;

  test.beforeAll(async () => {
    test.setTimeout(150_000);
    app = await appConfigs.react.vite.clone().commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withProtectService);
    await app.dev();
  });

  test.afterEach(async () => {
    await fakeUser?.deleteIfExists();
    fakeUser = undefined;
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('passes the challenge on sign-up', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    fakeUser = u.services.users.createFakeUser(test);
    const protectCheckSubmit = waitForProtectCheckSubmit(page);

    await u.po.signUp.goTo();
    await u.po.signUp.signUpWithEmailAndPassword({ email: fakeUser.email!, password: fakeUser.password });

    expect((await protectCheckSubmit).ok()).toBe(true);
    await u.po.signUp.enterTestOtpCode();
    await u.po.expect.toBeSignedIn();
  });

  test('passes the challenge on sign-in', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    fakeUser = u.services.users.createFakeUser(test);
    await u.services.users.createBapiUser(fakeUser);
    const protectCheckSubmit = waitForProtectCheckSubmit(page);

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({
      email: fakeUser.email!,
      password: fakeUser.password,
      waitForSession: false,
    });

    expect((await protectCheckSubmit).ok()).toBe(true);
    await u.po.signIn.enterTestOtpCode();
    await u.po.expect.toBeSignedIn();
  });
});
