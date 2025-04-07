import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('resiliency @generic', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

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

    // Simulate developer coming back and client fails to load.
    await page.route('**/v1/client?**', route => {
      return route.fulfill({
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
      });
    });

    await page.waitForTimeout(1_000);
    await page.reload();

    const waitForClientImmediately = page.waitForResponse(
      response => response.url().includes('/client?') && response.status() === 500,
      { timeout: 3_000 },
    );

    const waitForTokenImmediately = page.waitForResponse(
      response =>
        response.url().includes('/tokens?') && response.status() === 200 && response.request().method() === 'POST',
      { timeout: 3_000 },
    );

    await page.waitForLoadState('domcontentloaded');

    await waitForClientImmediately;
    await waitForTokenImmediately;

    // Wait for the client to be loaded. and the internal `getToken({skipCache: true})` to have been completed.
    await u.po.clerk.toBeLoaded();

    // Read the newly refreshed token.
    const tokenOnClientOutage = await page.evaluate(() => {
      return window.Clerk?.session?.getToken();
    });

    expect(tokenOnClientOutage).not.toEqual(tokenAfterSignIn);

    await u.po.expect.toBeSignedIn();
  });

  test('resiliency to not break devBroswer - dummy client and is not created on `/client` 4xx errors', async ({
    page,
    context,
  }) => {
    // Simulate "Needs new dev browser, when db jwt exists but does not match the instance".

    const response = {
      status: 401,
      body: JSON.stringify({
        errors: [
          {
            message: '',
            long_message: '',
            code: 'dev_browser_unauthenticated',
          },
        ],
        clerk_trace_id: 'some-trace-id',
      }),
    };
    await page.route('**/v1/client?**', route => {
      return route.fulfill(response);
    });

    await page.route('**/v1/environment?**', route => {
      return route.fulfill(response);
    });

    const u = createTestUtils({ app, page, context });

    const waitForClientImmediately = page.waitForResponse(
      response => response.url().includes('/client?') && response.status() === 401,
      { timeout: 3_000 },
    );

    const waitForEnvironmentImmediately = page.waitForResponse(
      response => response.url().includes('/environment?') && response.status() === 401,
      { timeout: 3_000 },
    );

    await u.page.goToAppHome();
    await page.waitForLoadState('domcontentloaded');

    await waitForEnvironmentImmediately;
    const waitForDevBrowserImmediately = page.waitForResponse(
      response => response.url().includes('/dev_browser') && response.status() === 200,
      {
        timeout: 4_000,
      },
    );
    await waitForClientImmediately;

    // To remove specific route handlers
    await page.unrouteAll();

    await waitForDevBrowserImmediately;

    await u.po.clerk.toBeLoaded();
  });
});
