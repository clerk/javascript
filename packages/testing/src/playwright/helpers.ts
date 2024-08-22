import { setupClerkTestingToken } from '@clerk/testing/playwright';
import type { Clerk, SignOutOptions } from '@clerk/types';
import type { Page } from '@playwright/test';

import type { ClerkSignInParams, SetupClerkTestingTokenOptions } from '../common';
import { signInHelper } from '../common';

declare global {
  interface Window {
    Clerk: Clerk;
  }
}

type PlaywrightClerkLoadedParams = {
  page: Page;
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

  await page.evaluate(async params => {
    await signInHelper(window, params);
  }, signInParams);
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

export const clerk = {
  signIn,
  signOut,
  loaded,
};
