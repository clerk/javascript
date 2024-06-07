import type { AuthObject, RedirectFun } from '@clerk/backend/internal';
import { constants, createClerkRequest, createRedirect } from '@clerk/backend/internal';
import { notFound, redirect } from 'next/navigation';

import { buildClerkProps } from '../../server/buildClerkProps';
import { PUBLISHABLE_KEY, SIGN_IN_URL, SIGN_UP_URL } from '../../server/constants';
import { createGetAuth } from '../../server/createGetAuth';
import { authAuthHeaderMissing } from '../../server/errors';
import type { AuthProtect } from '../../server/protect';
import { createProtect } from '../../server/protect';
import { decryptClerkRequestData, getAuthKeyFromRequest, getHeader } from '../../server/utils';
import { buildRequestLike } from './utils';

type Auth = AuthObject & { protect: AuthProtect; redirectToSignIn: RedirectFun<ReturnType<typeof redirect>> };

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

    const requestData = getHeader(request, constants.Headers.ClerkRequestData);
    const decryptedRequestData = requestData ? decryptClerkRequestData(requestData) : {};

    return createRedirect({
      redirectAdapter: redirect,
      devBrowserToken: devBrowserToken,
      baseUrl: clerkRequest.clerkUrl.toString(),
      // TODO: Support runtime-value configuration of these options
      // via setting and reading headers from clerkMiddleware
      publishableKey: PUBLISHABLE_KEY,
      signInUrl: decryptedRequestData.signInUrl || SIGN_IN_URL,
      signUpUrl: decryptedRequestData.signUpUrl || SIGN_UP_URL,
    }).redirectToSignIn({
      returnBackUrl: opts.returnBackUrl === null ? '' : opts.returnBackUrl || clerkUrl?.toString(),
    });
  };

  const protect = createProtect({ request, authObject, redirectToSignIn, notFound, redirect });

  return Object.assign(authObject, { protect, redirectToSignIn });
};

export const initialState = () => {
  return buildClerkProps(buildRequestLike());
};
