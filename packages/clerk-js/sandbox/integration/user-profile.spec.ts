import { expect, test } from '@playwright/test';

import { signInWithEmailCode } from './helpers';

const rootElement = '.cl-userProfile-root';

test('user profile', async ({ page }) => {
  // Set a larger viewport to capture the full user profile
  await page.setViewportSize({ width: 1600, height: 900 });

  await signInWithEmailCode(page);
  await page.goto('/user-profile');
  await page.waitForSelector(rootElement, { state: 'attached' });
  await expect(page.locator(rootElement)).toHaveScreenshot('user-profile.png');
});
