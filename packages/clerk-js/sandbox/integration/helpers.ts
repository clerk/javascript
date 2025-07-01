import { clerk } from '@clerk/testing/playwright';
import { type Page } from '@playwright/test';

/**
 * Signs in a user using email code strategy for integration tests.
 * Navigates to sign-in page, waits for Clerk to load, then performs authentication.
 * @param page - The Playwright page instance
 * @example
 * ```ts
 * await signInWithEmailCode(page);
 * await page.goto('/protected-page');
 * ```
 */
export async function signInWithEmailCode(page: Page): Promise<void> {
  await page.goto('/sign-in');
  await clerk.loaded({ page });
  await clerk.signIn({
    page,
    signInParams: { strategy: 'email_code', identifier: 'sandbox+clerk_test@clerk.dev' },
  });
}
