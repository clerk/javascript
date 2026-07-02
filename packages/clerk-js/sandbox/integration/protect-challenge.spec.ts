import { clerk } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

const primaryButtonElement = '.cl-formButtonPrimary';
const sdkChallengeUrl = 'https://protect.example.test/sdk-challenge.js';

/**
 * These tests encode the INTENDED post-resolution behavior: after a protect
 * check resolves, the user is routed to the next step (or the session is
 * activated for the `complete` case). They are currently expected to fail:
 * on the base branch the flow never advances once the check clears — the
 * protect-check card unmounts and no navigation/`setActive` happens (see the
 * review thread on #8329). When that is fixed, these flip to "unexpected
 * pass" — delete the `test.fail()` annotations to start enforcing.
 */
const BLOCKED_BY_POST_RESOLUTION_NAVIGATION_BUG =
  'blocked by protect-check post-resolution navigation bug on the base branch';

function isProtectCheckSubmit(method: string) {
  return method === 'PATCH' || method === 'POST';
}

test('sign up resolves a Protect challenge and continues to email verification', async ({ page }) => {
  test.fail(true, BLOCKED_BY_POST_RESOLUTION_NAVIGATION_BUG);
  await page.goto('/sign-up?scenario=ProtectChallenge');
  await clerk.loaded({ page });

  await page.locator('#emailAddress-field').fill(`protect-sign-up-${Date.now()}@example.com`);

  const sdkRequest = page.waitForRequest(sdkChallengeUrl);
  const protectCheckPatch = page.waitForRequest(
    request =>
      isProtectCheckSubmit(request.method()) &&
      request.url().includes('/v1/client/sign_ups/') &&
      request.url().includes('/protect_check'),
  );

  await page.locator(primaryButtonElement).click();

  await sdkRequest;
  await protectCheckPatch;

  await expect(page).toHaveURL(/verify-email-address/);
  await expect(page.getByText('Verify your email')).toBeVisible();
});

test('sign up can pause on a manual Protect challenge', async ({ page }) => {
  test.fail(true, BLOCKED_BY_POST_RESOLUTION_NAVIGATION_BUG);
  await page.goto('/sign-up?scenario=ProtectChallenge&protectChallengeMode=manual');
  await clerk.loaded({ page });

  let submittedProtectCheck = false;
  page.on('request', request => {
    if (
      isProtectCheckSubmit(request.method()) &&
      request.url().includes('/v1/client/sign_ups/') &&
      request.url().includes('/protect_check')
    ) {
      submittedProtectCheck = true;
    }
  });

  await page.locator('#emailAddress-field').fill(`protect-manual-sign-up-${Date.now()}@example.com`);

  const sdkRequest = page.waitForRequest(sdkChallengeUrl);
  await page.locator(primaryButtonElement).click();
  await sdkRequest;

  await expect(page.getByTestId('protect-challenge-sdk')).toBeVisible();
  await expect(page.getByTestId('protect-challenge-complete')).toBeVisible();
  expect(submittedProtectCheck).toBe(false);

  const protectCheckPatch = page.waitForRequest(
    request =>
      isProtectCheckSubmit(request.method()) &&
      request.url().includes('/v1/client/sign_ups/') &&
      request.url().includes('/protect_check'),
  );

  await page.getByTestId('protect-challenge-complete').click();
  await protectCheckPatch;

  await expect(page).toHaveURL(/verify-email-address/);
  await expect(page.getByText('Verify your email')).toBeVisible();
});

test('sign in resolves a Protect challenge and creates a session', async ({ page }) => {
  test.fail(true, BLOCKED_BY_POST_RESOLUTION_NAVIGATION_BUG);
  await page.goto('/sign-in?scenario=ProtectChallenge');
  await clerk.loaded({ page });

  await page.locator('#identifier-field').fill('protect-sign-in@example.com');
  await page.locator(primaryButtonElement).click();
  await expect(page).toHaveURL(/factor-one/);

  await page.locator('#password-field').fill('Password123!');

  const sdkRequest = page.waitForRequest(sdkChallengeUrl);
  const protectCheckPatch = page.waitForRequest(
    request =>
      isProtectCheckSubmit(request.method()) &&
      request.url().includes('/v1/client/sign_ins/') &&
      request.url().includes('/protect_check'),
  );

  await page.locator(primaryButtonElement).click();

  await sdkRequest;
  await protectCheckPatch;

  // Assert a real hydrated user (the mock session carries a full UserJSON),
  // not just a non-null placeholder. Bounded poll rather than
  // page.waitForFunction: a test-level timeout is not covered by the
  // test.fail() annotation above, but a failed assertion is.
  await expect.poll(() => page.evaluate(() => window.Clerk?.user?.id ?? null), { timeout: 10_000 }).toBeTruthy();
  await expect(page.locator('.cl-signIn-root')).toBeHidden();
});
