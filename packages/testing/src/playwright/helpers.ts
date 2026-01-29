import { createClerkClient } from '@clerk/backend';
import type { Clerk, SignOutOptions } from '@clerk/shared/types';
import type { Page } from '@playwright/test';

import type { ClerkSignInParams, SetupClerkTestingTokenOptions } from '../common';
import { signInHelper } from '../common';
import { setupClerkTestingToken } from './setupClerkTestingToken';

declare global {
  interface Window {
    Clerk: Clerk;
  }
}

type PlaywrightClerkLoadedParams = {
  page: Page;
};

type PlaywrightClerkSignInParamsWithEmail = {
  page: Page;
  emailAddress: string;
  setupClerkTestingTokenOptions?: SetupClerkTestingTokenOptions;
};

type ClerkHelperParams = {
  /**
   * Signs in a user using Clerk. This helper supports multiple sign-in strategies:
   * 1. Using signInParams object (password, phone_code, email_code strategies)
   * 2. Using emailAddress for automatic ticket-based sign-in
   *
   * Multi-factor is not supported.
   * This helper is using the `setupClerkTestingToken` internally.
   * It is required to call `page.goto` before calling this helper, and navigate to a not protected page that loads Clerk.
   *
   * For strategy-based sign-in:
   * If the strategy is password, the helper will sign in the user using the provided password and identifier.
   * If the strategy is phone_code, you are required to have a user with a test phone number as an identifier (e.g. +15555550100).
   * If the strategy is email_code, you are required to have a user with a test email as an identifier (e.g. your_email+clerk_test@example.com).
   *
   * For email-based sign-in:
   * The helper finds the user by email, creates a sign-in token using Clerk's backend API, and uses the ticket strategy.
   *
   * @example Strategy-based sign-in
   * import { clerk } from "@clerk/testing/playwright";
   *
   *  test("sign in with strategy", async ({ page }) => {
   *     await page.goto("/");
   *     await clerk.signIn({
   *       page,
   *       signInParams: { strategy: 'phone_code', identifier: '+15555550100' },
   *     });
   *     await page.goto("/protected");
   *   });
   *
   * @example Email-based sign-in
   * import { clerk } from "@clerk/testing/playwright";
   *
   *  test("sign in with email", async ({ page }) => {
   *     await page.goto("/");
   *     await clerk.signIn({ emailAddress: "bryce@clerk.dev", page });
   *     await page.goto("/protected");
   *   });
   */
  signIn: {
    (opts: PlaywrightClerkSignInParams): Promise<void>;
    (opts: PlaywrightClerkSignInParamsWithEmail): Promise<void>;
  };
  /**
   * Signs out the current user using Clerk.
   * It is required to call `page.goto` before calling this helper, and navigate to a page that loads Clerk.
   * @param opts.signOutOptions - A SignOutOptions object.
   * @param opts.page - The Playwright page object.
   *
   * @example
   * import { clerk } from "@clerk/testing/playwright";
   *
   *  test("sign out", async ({ page }) => {
   *     await page.goto("/");
   *     await clerk.signIn({
   *       page,
   *       signInParams: { strategy: 'phone_code', identifier: '+15555550100' },
   *     });
   *     await page.goto("/protected");
   *     await clerk.signOut({ page });
   *     await page.goto("/protected");
   *     // should redirect to sign in page
   *   });
   */
  signOut: (opts: PlaywrightClerkSignOutParams) => Promise<void>;
  /**
   * Asserts that Clerk has been loaded.
   * It is required to call `page.goto` before calling this helper, and navigate to a page that loads Clerk.
   *
   * @param opts.page - The Playwright page object.
   */
  loaded: (opts: PlaywrightClerkLoadedParams) => Promise<void>;
};

const loaded = async ({ page }: PlaywrightClerkLoadedParams) => {
  await page.waitForFunction(() => window.Clerk !== undefined);
  await page.waitForFunction(() => window.Clerk.loaded);
};

type PlaywrightClerkSignInParams = {
  page: Page;
  signInParams: ClerkSignInParams;
  setupClerkTestingTokenOptions?: SetupClerkTestingTokenOptions;
};

const signIn = async (opts: PlaywrightClerkSignInParams | PlaywrightClerkSignInParamsWithEmail) => {
  const context = opts.page.context();
  if (!context) {
    throw new Error('Page context is not available. Make sure the page is properly initialized.');
  }

  await setupClerkTestingToken({
    context,
    options: 'setupClerkTestingTokenOptions' in opts ? opts.setupClerkTestingTokenOptions : undefined,
  });
  await loaded({ page: opts.page });

  if ('emailAddress' in opts) {
    // Email-based sign-in using ticket strategy
    const { emailAddress, page } = opts;

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY environment variable is required for email-based sign-in');
    }

    const clerkClient = createClerkClient({ secretKey });

    try {
      // Find user by email
      const userList = await clerkClient.users.getUserList({ emailAddress: [emailAddress] });
      if (!userList.data || userList.data.length === 0) {
        throw new Error(`No user found with email: ${emailAddress}`);
      }

      const user = userList.data[0];

      const signInToken = await clerkClient.signInTokens.createSignInToken({
        userId: user.id,
        expiresInSeconds: 300, // 5 minutes
      });

      await page.evaluate(signInHelper, {
        signInParams: { strategy: 'ticket' as const, ticket: signInToken.token },
      });

      await page.waitForFunction(() => window.Clerk?.user !== null);
    } catch (err: any) {
      throw new Error(`Failed to sign in with email ${emailAddress}: ${err?.message}`);
    }
  } else {
    // Strategy-based sign-in: signIn(opts)
    const { page, signInParams } = opts;
    await page.evaluate(signInHelper, { signInParams });
  }
};

type PlaywrightClerkSignOutParams = {
  page: Page;
  signOutOptions?: SignOutOptions;
};

const signOut = async ({ page, signOutOptions }: PlaywrightClerkSignOutParams) => {
  await loaded({ page });

  await page.evaluate(async options => {
    await window.Clerk.signOut(options);
  }, signOutOptions);
};

export const clerk: ClerkHelperParams = {
  signIn: signIn as ClerkHelperParams['signIn'],
  signOut,
  loaded,
};
