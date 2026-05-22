import { clerk } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

const rootElement = '.cl-signUp-root';

test('sign up - email verification', async ({ page }) => {
  await page.goto('/sign-up?scenario=SignUpVerifyEmail#/verify-email-address');
  await clerk.loaded({ page });
  await page.waitForSelector(rootElement, { state: 'attached' });
  await page.waitForSelector('input[name="code"]', { state: 'attached' });
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-up-verify-email.png');
});

test('sign up - phone verification', async ({ page }) => {
  await page.goto('/sign-up?scenario=SignUpVerifyPhone#/verify-phone-number');
  await clerk.loaded({ page });
  await page.waitForSelector(rootElement, { state: 'attached' });
  await page.waitForSelector('input[name="code"]', { state: 'attached' });
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-up-verify-phone.png');
});
