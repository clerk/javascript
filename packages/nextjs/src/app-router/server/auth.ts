import type { AuthObject, RedirectFun } from '@clerk/backend/internal';
import { constants, createClerkRequest, createRedirect } from '@clerk/backend/internal';
import { notFound, redirect } from 'next/navigation';

import { buildClerkProps } from '../../server/buildClerkProps';
import { PUBLISHABLE_KEY, SIGN_IN_URL, SIGN_UP_URL } from '../../server/constants';
import { createGetAuth } from '../../server/createGetAuth';
import { authAuthHeaderMissing } from '../../server/errors';
import type { AuthProtect } from '../../server/protect';
import { createProtect } from '../../server/protect';
import { getAuthKeyFromRequest } from '../../server/utils';
import { buildRequestLike } from './utils';

type Auth = AuthObject & { protect: AuthProtect; redirectToSignIn: RedirectFun<ReturnType<typeof redirect>> };

let forbidden = notFound;
let unauthorized = notFound;

export const auth = (): Auth => {
  const request = buildRequestLike();
  const authObject = createGetAuth({
    debugLoggerName: 'auth()',
    noAuthStatusMessage: authAuthHeaderMissing(),
  })(request);

  const clerkUrl = getAuthKeyFromRequest(request, 'ClerkUrl');

  const redirectToSignIn: RedirectFun<never> = (opts = {}) => {
    const clerkRequest = createClerkRequest(request);
    const devBrowserToken =
      clerkRequest.clerkUrl.searchParams.get(constants.QueryParameters.DevBrowser) ||
      clerkRequest.cookies.get(constants.Cookies.DevBrowser);

    return createRedirect({
      redirectAdapter: redirect,
      devBrowserToken: devBrowserToken,
      baseUrl: clerkRequest.clerkUrl.toString(),
      // TODO: Support runtime-value configuration of these options
      // via setting and reading headers from clerkMiddleware
      publishableKey: PUBLISHABLE_KEY,
      signInUrl: SIGN_IN_URL,
      signUpUrl: SIGN_UP_URL,
    }).redirectToSignIn({
      returnBackUrl: opts.returnBackUrl === null ? '' : opts.returnBackUrl || clerkUrl?.toString(),
    });
  };

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    forbidden = require('next/navigation').forbidden;
  } catch (e) {
    /* empty */
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    unauthorized = require('next/navigation').unauthorized;
  } catch (e) {
    /* empty */
  }

  const protect = createProtect({ request, authObject, redirectToSignIn, notFound, forbidden, unauthorized, redirect });

  return Object.assign(authObject, { protect, redirectToSignIn });
};

export const initialState = () => {
  return buildClerkProps(buildRequestLike());
};
