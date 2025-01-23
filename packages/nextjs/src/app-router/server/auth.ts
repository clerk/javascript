import type { AuthObject } from '@clerk/backend';
import { constants, createClerkRequest, createRedirect, type RedirectFun } from '@clerk/backend/internal';
import { notFound, redirect } from 'next/navigation';

import { PUBLISHABLE_KEY, SIGN_IN_URL, SIGN_UP_URL } from '../../server/constants';
import { createGetAuth } from '../../server/createGetAuth';
import { authAuthHeaderMissing } from '../../server/errors';
import { getAuthKeyFromRequest, getHeader } from '../../server/headers-utils';
import type { AuthProtect } from '../../server/protect';
import { createProtect } from '../../server/protect';
import { decryptClerkRequestData } from '../../server/utils';
import { buildRequestLike } from './utils';
// import { canUseKeyless } from '../../utils/feature-flags';

type Auth = AuthObject & { redirectToSignIn: RedirectFun<ReturnType<typeof redirect>> };

export interface AuthFn {
  (): Promise<Auth>;
  protect: AuthProtect;
}

export const auth: AuthFn = async () => {
  require('server-only');

  const request = await buildRequestLike();

  // const isSrcAppDir = async () => {
  //   if (!canUseKeyless) {
  //     return '';
  //   }
  //
  //   const isSrcAppDir = await import('../../server/keyless-node.js').then(m => m.isSrcAppDir()).catch(() => false);
  //   return `- Your Middleware exists at <root>/${isSrcAppDir ? 'src/' : ''}middleware.ts\n`;
  // };
  const authObject = await createGetAuth({
    debugLoggerName: 'auth()',
    noAuthStatusMessage: authAuthHeaderMissing(
      'auth',
      // , await isSrcAppDir()
    ),
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

  return Object.assign(authObject, { redirectToSignIn });
};

auth.protect = async (...args: any[]) => {
  require('server-only');

  const request = await buildRequestLike();
  const authObject = await auth();

  const protect = createProtect({
    request,
    authObject,
    redirectToSignIn: authObject.redirectToSignIn,
    notFound,
    redirect,
  });

  return protect(...args);
};
