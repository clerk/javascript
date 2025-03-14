import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('resiliency @generic', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });

  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser();
    await u.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test('signed in users can get a fresh session token when Client fails to load', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    const tokenAfterSignIn = await page.evaluate(() => {
      return window.Clerk?.session?.getToken();
    });

    // Simulate developer comming back and client fails to load.
    await page.route('**/v1/client?**', route =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({
          errors: [
            {
              message: 'Oops, an unexpected error occurred',
              long_message:
                "There was an internal error on our servers. We've been notified and are working on fixing it.",
              code: 'internal_clerk_error',
            },
          ],
          clerk_trace_id: 'some-trace-id',
        }),
      }),
    );
    await page.reload();

    const waitForTokenImmediatly = page.waitForResponse(
      response =>
        response.url().includes('/tokens?') && response.status() === 200 && response.request().method() === 'POST',
      { timeout: 3_000 },
    );

    await page.waitForLoadState('domcontentloaded');

    await waitForTokenImmediatly;

    const tokenOnClientOutage = await page.evaluate(() => {
      return window.Clerk?.session?.getToken();
    });

    expect(tokenOnClientOutage).not.toEqual(tokenAfterSignIn);

    await u.po.expect.toBeSignedIn();
  });
});
