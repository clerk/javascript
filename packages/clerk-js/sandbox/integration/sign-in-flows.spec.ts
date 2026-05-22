import { clerk } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

const rootElement = '.cl-signIn-root';

test('sign in - factor one (password)', async ({ page }) => {
  await page.goto('/sign-in?scenario=SignInFactorOnePassword#/factor-one');
  await clerk.loaded({ page });
  await page.waitForSelector(rootElement, { state: 'attached' });
  await page.waitForSelector('input[type="password"]', { state: 'attached' });
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-in-factor-one-password.png');
});

test('sign in - factor one (email code)', async ({ page }) => {
  await page.goto('/sign-in?scenario=SignInFactorOneEmailCode#/factor-one');
  await clerk.loaded({ page });
  await page.waitForSelector(rootElement, { state: 'attached' });
  await page.waitForSelector('input[name="code"]', { state: 'attached' });
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-in-factor-one-email-code.png');
});

test('sign in - factor one (phone code)', async ({ page }) => {
  await page.goto('/sign-in?scenario=SignInFactorOnePhoneCode#/factor-one');
  await clerk.loaded({ page });
  await page.waitForSelector(rootElement, { state: 'attached' });
  await page.waitForSelector('input[name="code"]', { state: 'attached' });
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-in-factor-one-phone-code.png');
});

test('sign in - factor two (totp)', async ({ page }) => {
  await page.goto('/sign-in?scenario=SignInFactorTwoTOTP#/factor-two');
  await clerk.loaded({ page });
  await page.waitForSelector(rootElement, { state: 'attached' });
  await page.waitForSelector('input[name="code"]', { state: 'attached' });
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-in-factor-two-totp.png');
});

test('sign in - factor two (backup code)', async ({ page }) => {
  await page.goto('/sign-in?scenario=SignInFactorTwoBackupCode#/factor-two');
  await clerk.loaded({ page });
  await page.waitForSelector(rootElement, { state: 'attached' });
  await page.waitForSelector('input[name="code"]', { state: 'attached' });
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-in-factor-two-backup-code.png');
});

test('sign in - reset password', async ({ page }) => {
  await page.goto('/sign-in?scenario=SignInResetPassword#/reset-password');
  await clerk.loaded({ page });
  await page.waitForSelector(rootElement, { state: 'attached' });
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-in-reset-password.png');
});
