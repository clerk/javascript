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

/**
 * Signs in a user using the new email-based ticket strategy for integration tests.
 * Finds the user by email, creates a sign-in token, and uses the ticket strategy.
 * @param page - The Playwright page instance
 * @param emailAddress - The email address of the user to sign in (defaults to sandbox test user)
 * @example
 * ```ts
 * await signInWithEmail(page);
 * await page.goto('/protected-page');
 * ```
 */
export async function signInWithEmail(page: Page, emailAddress = 'sandbox+clerk_test@clerk.dev'): Promise<void> {
  await page.goto('/sign-in');
  await clerk.signIn({ emailAddress, page });
}
