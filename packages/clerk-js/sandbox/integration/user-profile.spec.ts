import { clerk } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

const rootElement = '.cl-userProfile-root';

test('user profile', async ({ page }) => {
  // Set a larger viewport to capture the full user profile
  await page.setViewportSize({ width: 1600, height: 900 });

  await page.goto('/sign-in');
  await clerk.loaded({ page });
  await clerk.signIn({
    page,
    signInParams: { strategy: 'email_code', identifier: 'sandbox+clerk_test@clerk.dev' },
  });
  await page.goto('/user-profile');
  await page.waitForSelector(rootElement, { state: 'attached' });
  await expect(page.locator(rootElement)).toHaveScreenshot('user-profile.png');
});
