import { redirect } from '@clerk/backend';
import { NextResponse } from 'next/server';

import { FRONTEND_API, PUBLISHABLE_KEY, SIGN_IN_URL, SIGN_UP_URL } from './clerkClient';

const redirectAdapter = (url: string) => NextResponse.redirect(url);

export const { redirectToSignIn, redirectToSignUp } = redirect({
  redirectAdapter,
  signInUrl: SIGN_IN_URL,
  signUpUrl: SIGN_UP_URL,
  publishableKey: PUBLISHABLE_KEY,
  frontendApi: FRONTEND_API,
});

// TODO: This is a duplicate of the function in packages/shared/src/utils/keys.ts
// TODO: To be removed when we can import @clerk/shared
export const isDevOrStagingUrl = (url: string) => {
  if (!url) {
    return false;
  }

  const DEV_OR_STAGING_SUFFIXES = [
    '.lcl.dev',
    '.stg.dev',
    '.lclstage.dev',
    '.stgstage.dev',
    '.dev.lclclerk.com',
    '.stg.lclclerk.com',
    '.accounts.lclclerk.com',
    'accountsstage.dev',
    'accounts.dev',
  ];

  const { hostname } = new URL(url);

  return DEV_OR_STAGING_SUFFIXES.some(s => hostname.endsWith(s));
};
