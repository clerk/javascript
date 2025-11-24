import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

const make500ClerkResponse = () => ({
  status: 500,
  body: JSON.stringify({
    errors: [
      {
        message: 'Oops, an unexpected error occurred',
        long_message: "There was an internal error on our servers. We've been notified and are working on fixing it.",
        code: 'internal_clerk_error',
      },
    ],
    clerk_trace_id: 'some-trace-id',
  }),
});

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

  test.describe('loading resiliency', () => {
    test('signed in users can get a fresh session token when Client fails to load', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();

      const tokenAfterSignIn = await page.evaluate(() => {
        return window.Clerk?.session?.getToken();
      });

      // Simulate developer coming back and client fails to load.
      await page.route('**/v1/client?**', route => route.fulfill(make500ClerkResponse()));

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

    test('resiliency to not break devBrowser - dummy client and is not created on `/client` 4xx errors', async ({
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

      const u = createTestUtils({ app, page, context, useTestingToken: false });

      await page.route('**/v1/client?**', route => {
        return route.fulfill(response);
      });

      await page.route('**/v1/environment?**', route => {
        return route.fulfill(response);
      });

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

    test.describe('Clerk.status', () => {
      test('normal flow shows correct states and transitions', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });
        await u.page.goToRelative('/clerk-status');

        // Initial state checks
        await expect(page.getByText('Status: loading', { exact: true })).toBeVisible();
        await expect(page.getByText('Clerk is loading', { exact: true })).toBeVisible();
        await expect(page.getByText('Clerk is NOT loaded', { exact: true })).toBeVisible();
        await expect(page.getByText('Clerk is out')).toBeHidden();
        await expect(page.getByText('Clerk is degraded')).toBeHidden();
        await expect(page.getByText('(comp) Waiting for clerk to fail, ready or regraded.')).toBeVisible();
        await u.po.clerk.toBeLoading();

        // Wait for loading to complete and verify final state
        await expect(page.getByText('Status: ready', { exact: true })).toBeVisible();
        await u.po.clerk.toBeLoaded();
        await u.po.clerk.toBeReady();
        await expect(page.getByText('Clerk is ready', { exact: true })).toBeVisible();
        await expect(page.getByText('Clerk is ready or degraded (loaded)')).toBeVisible();
        await expect(page.getByText('Clerk is loaded', { exact: true })).toBeVisible();
        await expect(page.getByText('(comp) Clerk is loaded,(ready or degraded)')).toBeVisible();

        // Verify loading component is no longer visible
        await expect(page.getByText('(comp) Waiting for clerk to fail, ready or regraded.')).toBeHidden();
      });

      test('clerk-js hotloading failed', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });

        await page.route('**/clerk.browser.js', route => route.abort());

        await u.page.goToRelative('/clerk-status');

        // Initial state checks
        await expect(page.getByText('Status: loading', { exact: true })).toBeVisible();
        await expect(page.getByText('Clerk is loading', { exact: true })).toBeVisible();
        await expect(page.getByText('Clerk is NOT loaded', { exact: true })).toBeVisible();

        // Wait for loading to complete and verify final state
        // Account for the new 15-second script loading timeout plus buffer for UI updates
        await expect(page.getByText('Status: error', { exact: true })).toBeVisible({
          timeout: 16_000,
        });
        await expect(page.getByText('Clerk is out', { exact: true })).toBeVisible();
        await expect(page.getByText('Clerk is ready or degraded (loaded)')).toBeHidden();
        await expect(page.getByText('Clerk is loaded', { exact: true })).toBeHidden();
        await expect(page.getByText('(comp) Clerk is loaded,(ready or degraded)')).toBeHidden();
        await expect(page.getByText('Clerk is NOT loaded', { exact: true })).toBeVisible();

        // Verify loading component is no longer visible
        await expect(page.getByText('Clerk is loading', { exact: true })).toBeHidden();
      });

      test('clerk-js client fails and status degraded', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });

        await page.route('**/v1/client?**', route => route.fulfill(make500ClerkResponse()));

        await u.page.goToRelative('/clerk-status');

        // Initial state checks
        await expect(page.getByText('Status: loading', { exact: true })).toBeVisible();
        await expect(page.getByText('Clerk is loading', { exact: true })).toBeVisible();
        await expect(page.getByText('Clerk is NOT loaded', { exact: true })).toBeVisible();

        // Wait for loading to complete and verify final state
        await expect(page.getByText('Status: degraded', { exact: true })).toBeVisible({
          timeout: 10_000,
        });
        await u.po.clerk.toBeDegraded();
        await expect(page.getByText('Clerk is degraded', { exact: true })).toBeVisible();
        await expect(page.getByText('Clerk is ready', { exact: true })).toBeHidden();
        await expect(page.getByText('Clerk is ready or degraded (loaded)')).toBeVisible();
        await expect(page.getByText('Clerk is loaded', { exact: true })).toBeVisible();
        await expect(page.getByText('(comp) Clerk is loaded,(ready or degraded)')).toBeVisible();
        await expect(page.getByText('Clerk is NOT loaded', { exact: true })).toBeHidden();
        await expect(page.getByText('(comp) Clerk is degraded')).toBeVisible();

        // Verify loading component is no longer visible
        await expect(page.getByText('Clerk is loading', { exact: true })).toBeHidden();
      });

      test('clerk-js environment fails and status degraded', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });

        await page.route('**/v1/environment?**', route => route.fulfill(make500ClerkResponse()));

        await u.page.goToRelative('/clerk-status');

        // Initial state checks
        await expect(page.getByText('Status: loading', { exact: true })).toBeVisible();
        await expect(page.getByText('Clerk is loading', { exact: true })).toBeVisible();
        await expect(page.getByText('Clerk is NOT loaded', { exact: true })).toBeVisible();
        await u.po.clerk.toBeLoading();

        // Wait for loading to complete and verify final state
        await expect(page.getByText('Status: degraded', { exact: true })).toBeVisible();
        await u.po.clerk.toBeDegraded();
        await expect(page.getByText('Clerk is degraded', { exact: true })).toBeVisible();
        await expect(page.getByText('Clerk is ready', { exact: true })).toBeHidden();
        await expect(page.getByText('Clerk is ready or degraded (loaded)')).toBeVisible();
        await expect(page.getByText('Clerk is loaded', { exact: true })).toBeVisible();
        await expect(page.getByText('(comp) Clerk is loaded,(ready or degraded)')).toBeVisible();
        await expect(page.getByText('Clerk is NOT loaded', { exact: true })).toBeHidden();
        await expect(page.getByText('(comp) Clerk is degraded')).toBeVisible();

        // Verify loading component is no longer visible
        await expect(page.getByText('Clerk is loading', { exact: true })).toBeHidden();
      });
    });
  });

  test.describe('clerk-js script loading', () => {
    test('recovers from transient network failure on clerk-js script load', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      let requestCount = 0;
      await page.route('**/clerk.browser.js', route => {
        requestCount++;
        // Fail the first request, allow subsequent requests
        if (requestCount === 1) {
          return route.abort('failed');
        }
        return route.continue();
      });

      await u.page.goToRelative('/clerk-status');

      // Initial state should show loading
      await expect(page.getByText('Status: loading', { exact: true })).toBeVisible();

      // Wait for Clerk to eventually load after retry
      // Account for retry delay + script load time + initialization
      await expect(page.getByText('Status: ready', { exact: true })).toBeVisible({
        timeout: 20_000,
      });

      await u.po.clerk.toBeLoaded();
      await expect(page.getByText('Clerk is loaded', { exact: true })).toBeVisible();

      // Verify retry happened
      expect(requestCount).toBeGreaterThan(1);
    });

    test('recovers from HTTP 500 error on clerk-js script load', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      let requestCount = 0;
      await page.route('**/clerk.browser.js', route => {
        requestCount++;
        // Return 500 error on first request, succeed on subsequent
        if (requestCount === 1) {
          return route.fulfill({
            status: 500,
            body: 'Internal Server Error',
          });
        }
        return route.continue();
      });

      await u.page.goToRelative('/clerk-status');

      // Initial state should show loading
      await expect(page.getByText('Status: loading', { exact: true })).toBeVisible();

      // Wait for Clerk to eventually load after retry
      await expect(page.getByText('Status: ready', { exact: true })).toBeVisible({
        timeout: 20_000,
      });

      await u.po.clerk.toBeLoaded();

      // Verify retry happened
      expect(requestCount).toBeGreaterThan(1);
    });

    test('recovers from HTTP 503 service unavailable with retry', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      let requestCount = 0;
      await page.route('**/clerk.browser.js', route => {
        requestCount++;
        // Return 503 error on first two requests, succeed on third
        if (requestCount <= 2) {
          return route.fulfill({
            status: 503,
            body: 'Service Unavailable',
          });
        }
        return route.continue();
      });

      await u.page.goToRelative('/clerk-status');

      // Wait for Clerk to eventually load after multiple retries
      await expect(page.getByText('Status: ready', { exact: true })).toBeVisible({
        timeout: 25_000,
      });

      await u.po.clerk.toBeLoaded();

      // Verify multiple retries happened
      expect(requestCount).toBeGreaterThan(2);
    });

    test('fails with error status after exhausting all retries', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Block all clerk.browser.js requests permanently
      await page.route('**/clerk.browser.js', route => route.abort('failed'));

      await u.page.goToRelative('/clerk-status');

      // Initial state should show loading
      await expect(page.getByText('Status: loading', { exact: true })).toBeVisible();

      // Wait for error status after all retries are exhausted
      // This should take longer due to exponential backoff
      await expect(page.getByText('Status: error', { exact: true })).toBeVisible({
        timeout: 30_000,
      });

      await expect(page.getByText('Clerk is out', { exact: true })).toBeVisible();
      await expect(page.getByText('Clerk is NOT loaded', { exact: true })).toBeVisible();
    });

    test('handles slow network with eventual success', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      let requestCount = 0;
      await page.route('**/clerk.browser.js', async route => {
        requestCount++;
        // First request times out (simulate by very long delay)
        if (requestCount === 1) {
          // Wait longer than typical timeout, then abort
          await new Promise(resolve => setTimeout(resolve, 3000));
          return route.abort('timedout');
        }
        // Second request succeeds normally
        return route.continue();
      });

      await u.page.goToRelative('/clerk-status');

      // Wait for Clerk to eventually load
      await expect(page.getByText('Status: ready', { exact: true })).toBeVisible({
        timeout: 25_000,
      });

      await u.po.clerk.toBeLoaded();
    });
  });
});
