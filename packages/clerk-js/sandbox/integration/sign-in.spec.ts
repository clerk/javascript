import { clerk } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

const rootElement = '.cl-signIn-root';
const primaryButtonElement = '.cl-formButtonPrimary';
const secondaryButtonElement = '.cl-socialButtonsBlockButton__google';
const actionLinkElement = '.cl-footerActionLink';

test('sign in', async ({ page }) => {
  await page.goto('/sign-in');
  await clerk.loaded({ page });
  await page.waitForSelector(rootElement, { state: 'attached' });
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-in.png');
  await page.locator(primaryButtonElement).hover();
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-in-primary-button-hover.png');
  await page.locator(secondaryButtonElement).hover();
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-in-secondary-button-hover.png');
  await page.locator(actionLinkElement).hover();
  await expect(page.locator(rootElement)).toHaveScreenshot('sign-in-action-link-hover.png');
});

test('sign in with email', async ({ page }) => {
  await page.goto('/sign-in');

  await clerk.signIn({
    emailAddress: 'sandbox+clerk_test@clerk.dev',
    page,
  });

  await page.waitForFunction(() => window.Clerk?.user !== null);

  const userInfo = await page.evaluate(() => ({
    isSignedIn: window.Clerk?.user !== null && window.Clerk?.user !== undefined,
    email: window.Clerk?.user?.primaryEmailAddress?.emailAddress,
    userId: window.Clerk?.user?.id,
    isLoaded: window.Clerk?.loaded,
  }));

  expect(userInfo.isSignedIn).toBe(true);
  expect(userInfo.email).toBe('sandbox+clerk_test@clerk.dev');
  expect(userInfo.userId).toBeTruthy();
  expect(userInfo.isLoaded).toBe(true);
});
