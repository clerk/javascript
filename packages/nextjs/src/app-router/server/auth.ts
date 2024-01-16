import type { AuthObject, RedirectFun } from '@clerk/backend/internal';
import { createClerkRequest, createRedirect } from '@clerk/backend/internal';
import { notFound, redirect } from 'next/navigation';

import { PUBLISHABLE_KEY, SIGN_IN_URL, SIGN_UP_URL } from '../../server/constants';
import { authAuthHeaderMissing } from '../../server/errors';
import { buildClerkProps, createGetAuth } from '../../server/getAuth';
import type { AuthProtect } from '../../server/protect';
import { createProtect } from '../../server/protect';
import { buildRequestLike } from './utils';

type Auth = AuthObject & { protect: AuthProtect; redirectToSignIn: RedirectFun<ReturnType<typeof redirect>> };

export const auth = (): Auth => {
  const request = buildRequestLike();
  const authObject = createGetAuth({
    debugLoggerName: 'auth()',
    noAuthStatusMessage: authAuthHeaderMissing(),
  })(request);

  const protect = createProtect({ request, authObject, notFound, redirect });
  const redirectToSignIn = createRedirect({
    redirectAdapter: redirect,
    baseUrl: createClerkRequest(request).clerkUrl.toString(),
    // TODO: Support runtime-value configuration of these options
    // via setting and reading headers from clerkMiddleware
    publishableKey: PUBLISHABLE_KEY,
    signInUrl: SIGN_IN_URL,
    signUpUrl: SIGN_UP_URL,
  }).redirectToSignIn;

  return Object.assign(authObject, { protect, redirectToSignIn });
};

export const initialState = () => {
  return buildClerkProps(buildRequestLike());
};
