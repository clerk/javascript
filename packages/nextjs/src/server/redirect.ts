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
