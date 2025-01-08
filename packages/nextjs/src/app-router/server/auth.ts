import type { AuthObject } from '@clerk/backend';
import { constants, createClerkRequest, createRedirect, type RedirectFun } from '@clerk/backend/internal';
import { notFound, redirect } from 'next/navigation';

import { PUBLISHABLE_KEY, SIGN_IN_URL, SIGN_UP_URL } from '../../server/constants';
import { createGetAuth } from '../../server/createGetAuth';
import { authAuthHeaderMissing } from '../../server/errors';
import type { AuthProtect } from '../../server/protect';
import { createProtect } from '../../server/protect';
import { decryptClerkRequestData, getAuthKeyFromRequest, getHeader } from '../../server/utils';
import { buildRequestLike } from './utils';

type Auth = AuthObject & { redirectToSignIn: RedirectFun<ReturnType<typeof redirect>> };
type MachineAuth = Omit<AuthObject, 'SignedInAuthObject' | 'SignedOutAuthObject'> & {
  redirectToSignIn: RedirectFun<ReturnType<typeof redirect>>;
};

type AuthOptions = { entity?: 'user' | 'machine' };

export interface AuthFn {
  (options?: AuthOptions): Promise<Auth>;
  protect: AuthProtect;
}
export interface MachineAuthFn {
  (options?: AuthOptions): Promise<MachineAuth>;
  protect: AuthProtect;
}

export function auth(options?: AuthOptions & { entity: 'user' }): Promise<Auth>;
export function auth(options?: AuthOptions & { entity: 'machine' }): Promise<MachineAuth>;
export async function auth(options?: AuthOptions): Promise<Auth>;
export async function auth(options?: AuthOptions) {
  require('server-only');

  const request = await buildRequestLike();
  const authObject = createGetAuth({
    debugLoggerName: 'auth()',
    noAuthStatusMessage: authAuthHeaderMissing(),
    options,
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
}

auth.protect = async (...args: Parameters<AuthProtect>) => {
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
