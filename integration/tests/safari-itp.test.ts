import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

/**
 * Tests Safari ITP (Intelligent Tracking Prevention) workaround
 *
 * Safari's ITP caps cookies set via fetch/XHR to 7 days. When the client cookie
 * is close to expiring (within 8 days), Clerk uses a full-page navigation through
 * the /v1/client/touch endpoint to refresh the cookie, bypassing the 7-day cap.
 *
 * The decorateUrl function in setActive() wraps redirect URLs with the touch
 * endpoint when the Safari ITP fix is needed.
 */
testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('Safari ITP @generic @nextjs', ({ app }) => {
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

  test('navigates through touch endpoint when cookie is close to expiration', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    // Intercept client responses and modify cookie_expires_at to be within 8 days
    // This makes isEligibleForTouch() return true
    await page.route('**/v1/client**', async route => {
      // Skip touch endpoint - we want to track that separately
      if (route.request().url().includes('/v1/client/touch')) {
        await route.continue();
        return;
      }
      const response = await route.fetch();
      const json = await response.json();

      // Set cookie to expire in 2 days (within the 8-day threshold)
      // The API returns milliseconds since epoch
      const twoDaysFromNow = Date.now() + 2 * 24 * 60 * 60 * 1000;
      json.response.cookie_expires_at = twoDaysFromNow;

      await route.fulfill({
        response,
        json,
      });
    });

    // Track if touch endpoint is called during navigation
    let touchEndpointCalled = false;
    let touchRedirectUrl: string | null = null;

    await page.route('**/v1/client/touch**', async route => {
      touchEndpointCalled = true;
      const url = new URL(route.request().url());
      touchRedirectUrl = url.searchParams.get('redirect_url');
      // Let the request continue normally
      await route.continue();
    });

    // Sign in
    await u.po.signIn.goTo();
    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();

    // Wait for navigation to complete
    await u.po.expect.toBeSignedIn();

    // Verify touch endpoint was called
    expect(touchEndpointCalled).toBe(true);
    expect(touchRedirectUrl).toBeTruthy();
  });

  test('does not use touch endpoint when cookie is not close to expiration', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    // Intercept client responses and set cookie_expires_at to be far in the future
    // This makes isEligibleForTouch() return false
    await page.route('**/v1/client**', async route => {
      // Skip touch endpoint - we want to track that separately
      if (route.request().url().includes('/v1/client/touch')) {
        await route.continue();
        return;
      }

      const response = await route.fetch();
      const json = await response.json();

      // Set cookie to expire in 30 days (outside the 8-day threshold)
      // The API returns milliseconds since epoch
      const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000;
      json.response.cookie_expires_at = thirtyDaysFromNow;

      await route.fulfill({
        response,
        json,
      });
    });

    // Track if touch endpoint is called
    let touchEndpointCalled = false;

    await page.route('**/v1/client/touch**', async route => {
      touchEndpointCalled = true;
      await route.continue();
    });

    // Sign in
    await u.po.signIn.goTo();
    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();

    // Wait for navigation to complete
    await u.po.expect.toBeSignedIn();

    // Verify touch endpoint was NOT called
    expect(touchEndpointCalled).toBe(false);
  });

  test('decorateUrl returns touch URL when client is eligible for touch', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    // Sign in first without mocking to get a valid session
    await u.po.signIn.goTo();
    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();
    await u.po.expect.toBeSignedIn();

    // Now test setActive with a navigate callback that captures decorateUrl behavior
    const result = await page.evaluate(async () => {
      const clerk = (window as any).Clerk;

      // Mock isEligibleForTouch to return true
      const originalIsEligibleForTouch = clerk.client.isEligibleForTouch.bind(clerk.client);
      clerk.client.isEligibleForTouch = () => true;

      let capturedDecorateUrl: ((url: string) => string) | undefined;
      let decoratedUrl: string | undefined;

      try {
        await clerk.setActive({
          session: clerk.session.id,
          navigate: ({ decorateUrl }: { decorateUrl: (url: string) => string }) => {
            capturedDecorateUrl = decorateUrl;
            decoratedUrl = decorateUrl('/dashboard');
          },
        });
      } finally {
        // Restore original
        clerk.client.isEligibleForTouch = originalIsEligibleForTouch;
      }

      return {
        decorateUrlCaptured: !!capturedDecorateUrl,
        decoratedUrl,
        containsTouch: decoratedUrl?.includes('/v1/client/touch') ?? false,
        containsRedirectUrl: decoratedUrl?.includes('redirect_url=') ?? false,
      };
    });

    expect(result.decorateUrlCaptured).toBe(true);
    expect(result.containsTouch).toBe(true);
    expect(result.containsRedirectUrl).toBe(true);
  });

  test('decorateUrl returns original URL when client is not eligible for touch', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    // Sign in first
    await u.po.signIn.goTo();
    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();
    await u.po.expect.toBeSignedIn();

    // Test setActive with navigate callback when isEligibleForTouch is false
    const result = await page.evaluate(async () => {
      const clerk = (window as any).Clerk;

      // Ensure isEligibleForTouch returns false
      const originalIsEligibleForTouch = clerk.client.isEligibleForTouch.bind(clerk.client);
      clerk.client.isEligibleForTouch = () => false;

      let decoratedUrl: string | undefined;

      try {
        await clerk.setActive({
          session: clerk.session.id,
          navigate: ({ decorateUrl }: { decorateUrl: (url: string) => string }) => {
            decoratedUrl = decorateUrl('/dashboard');
          },
        });
      } finally {
        // Restore original
        clerk.client.isEligibleForTouch = originalIsEligibleForTouch;
      }

      return {
        decoratedUrl,
        isOriginalUrl: decoratedUrl === '/dashboard',
        containsTouch: decoratedUrl?.includes('/v1/client/touch') ?? false,
      };
    });

    expect(result.isOriginalUrl).toBe(true);
    expect(result.containsTouch).toBe(false);
  });
});
