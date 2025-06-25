import { clerk } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

const rootElement = '.cl-organizationList-root';

test('organization list', async ({ page }) => {
  await page.goto('/sign-in');
  await clerk.loaded({ page });
  await clerk.signIn({
    page,
    signInParams: { strategy: 'email_code', identifier: 'sandbox+clerk_test@clerk.dev' },
  });
  await page.goto('/organization-list');
  await page.waitForSelector(rootElement, { state: 'attached' });
  await expect(page.locator(rootElement)).toHaveScreenshot('organization-list.png');
});
