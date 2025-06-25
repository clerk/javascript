import { clerk } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

const rootElement = '.cl-userButton-root';

test('user button', async ({ page }) => {
  await page.goto('/sign-in');
  await clerk.loaded({ page });
  await clerk.signIn({
    page,
    signInParams: { strategy: 'email_code', identifier: 'sandbox+clerk_test@clerk.dev' },
  });
  await page.goto('/user-button');
  await page.waitForSelector(rootElement, { state: 'attached' });
  await page.locator('.cl-userButtonTrigger').click();
  await expect(page).toHaveScreenshot('user-button.png');
});
