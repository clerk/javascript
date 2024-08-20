import type { AuthObject } from '@clerk/backend';
import type { RedirectFun } from '@clerk/backend/internal';
import { constants, createClerkRequest, createRedirect } from '@clerk/backend/internal';
import type { CheckAuthorizationParamsWithCustomPermissions } from '@clerk/types';
import { notFound, redirect } from 'next/navigation';

import { buildClerkProps } from '../../server/buildClerkProps';
import { PUBLISHABLE_KEY, SIGN_IN_URL, SIGN_UP_URL } from '../../server/constants';
import { createGetAuth } from '../../server/createGetAuth';
import { authAuthHeaderMissing } from '../../server/errors';
import type { AuthProtect } from '../../server/protect';
import { createProtect } from '../../server/protect';
import { isServerActionRequest } from '../../server/standalone-protect';
import { decryptClerkRequestData, getAuthKeyFromRequest, getHeader } from '../../server/utils';
import { buildRequestLike } from './utils';

type Auth = AuthObject & { protect: AuthProtect; redirectToSignIn: RedirectFun<ReturnType<typeof redirect>> };

export const auth = (): Auth => {
  require('server-only');

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

    const encryptedRequestData = getHeader(request, constants.Headers.ClerkRequestData);
    const decryptedRequestData = decryptClerkRequestData(encryptedRequestData);

    return createRedirect({
      redirectAdapter: redirect,
      devBrowserToken: devBrowserToken,
      baseUrl: clerkRequest.clerkUrl.toString(),
      publishableKey: decryptedRequestData.publishableKey || PUBLISHABLE_KEY,
      signInUrl: decryptedRequestData.signInUrl || SIGN_IN_URL,
      signUpUrl: decryptedRequestData.signUpUrl || SIGN_UP_URL,
    }).redirectToSignIn({
      returnBackUrl: opts.returnBackUrl === null ? '' : opts.returnBackUrl || clerkUrl?.toString(),
    });
  };

  const protect = createProtect({ request, authObject, redirectToSignIn, notFound, redirect });

  return Object.assign(authObject, { protect, redirectToSignIn });
};

// export const standaloneProtect = (handler: any) => {
//   return (req: Request) => {
//     const request = buildRequestLike();
//     const authObject = createGetAuth({
//       debugLoggerName: 'auth()',
//       noAuthStatusMessage: authAuthHeaderMissing(),
//     })(request);
//
//     console.log('original req', req, authObject);
//     return handler(req);
//   };
// };

// export const standaloneProtect = createStandaloneProtect();

// return <T>(handlerOrComponent: T, params?: CheckAuthorizationParamsWithCustomPermissions & { fallback: any }): T => {
// };
export const protectRoute = <T extends (...args: any[]) => any>(
  handlerOrComponent: T,
  params?: CheckAuthorizationParamsWithCustomPermissions,
): T => {
  // @ts-ignore
  return async (...args: any[]) => {
    const request = buildRequestLike();
    const authObject = createGetAuth({
      debugLoggerName: 'auth()',
      noAuthStatusMessage: authAuthHeaderMissing(),
    })(request);

    const { headers } = request;

    const errorObj = {
      clerk_error: 'forbidden',
      reason: 'assurance',
      assurance: params?.assurance,
    };

    if (isServerActionRequest(headers)) {
      if (authObject.has(params!)) {
        return handlerOrComponent(...args) as T;
      }

      return errorObj;
    }

    if (authObject.has(params!)) {
      return handlerOrComponent(...args) as T;
    }

    return new Response(JSON.stringify(errorObj), {
      status: 403,
    });
  };
};

export const initialState = () => {
  return buildClerkProps(buildRequestLike());
};
