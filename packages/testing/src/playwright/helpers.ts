import type { Clerk, SignOutOptions } from '@clerk/types';
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

type ClerkHelperParams = {
  /**
   * Signs in a user using Clerk. This helper supports only password, phone_code and email_code first factor strategies.
   * Multi-factor is not supported.
   * This helper is using the `setupClerkTestingToken` internally.
   * It is required to call `page.goto` before calling this helper, and navigate to a not protected page that loads Clerk.
   *
   * If the strategy is password, the helper will sign in the user using the provided password and identifier.
   * If the strategy is phone_code, you are required to have a user with a test phone number as an identifier (e.g. +15555550100).
   * If the strategy is email_code, you are required to have a user with a test email as an identifier (e.g. your_email+clerk_test@example.com).
   *
   * @param opts.signInParams.strategy - The sign in strategy. Supported strategies are 'password', 'phone_code' and 'email_code'.
   * @param opts.signInParams.identifier - The user's identifier. Could be a username, a phone number or an email.
   * @param opts.signInParams.password - The user's password. Required only if the strategy is 'password'.
   * @param opts.page - The Playwright page object.
   * @param opts.setupClerkTestingTokenOptions - The options for the `setupClerkTestingToken` function. Optional.
   *
   * @example
   * import { clerk } from "@clerk/testing/playwright";
   *
   *  test("sign in", async ({ page }) => {
   *     await page.goto("/");
   *     await clerk.signIn({
   *       page,
   *       signInParams: { strategy: 'phone_code', identifier: '+15555550100' },
   *     });
   *     await page.goto("/protected");
   *   });
   */
  signIn: (opts: PlaywrightClerkSignInParams) => Promise<void>;
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

const signIn = async ({ page, signInParams, setupClerkTestingTokenOptions }: PlaywrightClerkSignInParams) => {
  await setupClerkTestingToken({ page, options: setupClerkTestingTokenOptions });
  await loaded({ page });

  await page.evaluate(signInHelper, { signInParams });
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
  signIn,
  signOut,
  loaded,
};
