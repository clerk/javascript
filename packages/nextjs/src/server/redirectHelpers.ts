import { constants, createRedirect } from '@clerk/backend/internal';
import { NextResponse } from 'next/server';

import { setHeader } from '../utils';
import { PUBLISHABLE_KEY, SIGN_IN_URL, SIGN_UP_URL } from './constants';

const redirectAdapter = (url: string) => {
  const res = NextResponse.redirect(url);
  return setHeader(res, constants.Headers.ClerkRedirectTo, 'true');
};

const redirectHelpers = createRedirect({
  redirectAdapter,
  signInUrl: SIGN_IN_URL,
  signUpUrl: SIGN_UP_URL,
  publishableKey: PUBLISHABLE_KEY,
  // We're setting baseUrl to '' here as we want to keep the legacy behavior of
  // the redirectToSignIn, redirectToSignUp helpers in the backend package.
  baseUrl: '',
});

/**
 * @deprecated
 * This function is deprecated and will be removed in a future release. Please use `auth().redirectToSignIn()` instead.
 */
export const redirectToSignIn = redirectHelpers.redirectToSignIn;

/**
 * @deprecated
 * This function is deprecated and will be removed in a future release. Please use `auth().redirectToSignIn()` instead.
 */
export const redirectToSignUp = redirectHelpers.redirectToSignUp;
