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

    let waitForClientImmediatly = page.waitForResponse(response => response.url().includes('/sign_ins'), {
      timeout: 3_000,
    });
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });

    const clientReponse = await waitForClientImmediatly;
    const d = await clientReponse.json();
    console.log('Response from `/sign_ins`', d.client.sessions[0].last_active_token);

    await u.po.expect.toBeSignedIn();

    const tokenFromClient = await page.evaluate(() => {
      return window.Clerk?.session.lastActiveToken.jwt.claims.__raw;
    });

    // console.log('tokenFromClient');
    // console.log(tokenFromClient);
    // console.log('');

    const tokenAfterSignIn = await page.evaluate(() => {
      return window.Clerk?.session?.getToken();
    });

    // await page.evaluate(async () => {
    //   console.log('tokenAfterSignIn', await window.Clerk?.session?.getToken());
    // });

    console.log('getToken() after sign in');
    console.log(tokenAfterSignIn);
    console.log('');

    // await page.waitForTimeout(1_000);

    // Simulate developer comming back and client fails to load.
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
    await page.reload();

    waitForClientImmediatly = page.waitForResponse(
      response => response.url().includes('/client?') && response.status() === 500,
      { timeout: 3_000 },
    );

    const waitForTokenImmediatly = page.waitForResponse(
      response =>
        response.url().includes('/tokens?') && response.status() === 200 && response.request().method() === 'POST',
      { timeout: 3_000 },
    );

    await page.waitForLoadState('domcontentloaded');

    await waitForClientImmediatly;
    const res = await waitForTokenImmediatly;
    console.log('Response from `/tokens`', await res.json());
    console.log('');

    // Wait for the client to be loaded. and the internal `getToken({skipped: true})` to have been completed.
    await u.po.clerk.toBeLoaded();

    // Read the newly refreshed token.
    const tokenOnClientOutage = await page.evaluate(() => {
      return window.Clerk?.session?.getToken();
    });

    console.log('tokenOnClientOutage');
    console.log(tokenOnClientOutage);
    console.log('');
    expect(tokenOnClientOutage).not.toEqual(tokenAfterSignIn);

    // await page.evaluate(async () => {
    //   console.log('tokenOnClientOutage', await window.Clerk?.session?.getToken());
    // });

    await u.po.expect.toBeSignedIn();
  });
});
