import { clerk } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

const rootElement = '.cl-oauthConsent-root';

test('oauth consent', async ({ page }) => {
  await page.goto('/oauth-consent');
  await clerk.loaded({ page });
  await page.waitForSelector(rootElement, { state: 'attached' });
  await expect(page.locator(rootElement)).toHaveScreenshot('oauth-consent.png');
});
