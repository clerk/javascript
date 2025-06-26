import { clerk } from '@clerk/testing/playwright';
import { type Page } from '@playwright/test';

export async function signInWithEmailCode(page: Page) {
  await page.goto('/sign-in');
  await clerk.loaded({ page });
  await clerk.signIn({
    page,
    signInParams: { strategy: 'email_code', identifier: 'sandbox+clerk_test@clerk.dev' },
  });
}
