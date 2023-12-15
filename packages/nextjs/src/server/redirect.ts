import { constants, redirect } from '@clerk/backend/internal';
import { NextResponse } from 'next/server';

import { setHeader } from '../utils';
import { PUBLISHABLE_KEY, SIGN_IN_URL, SIGN_UP_URL } from './constants';

const redirectAdapter = (url: string) => {
  const res = NextResponse.redirect(url);
  return setHeader(res, constants.Headers.ClerkRedirectTo, 'true');
};

export const { redirectToSignIn, redirectToSignUp } = redirect({
  redirectAdapter,
  signInUrl: SIGN_IN_URL,
  signUpUrl: SIGN_UP_URL,
  publishableKey: PUBLISHABLE_KEY,
});
