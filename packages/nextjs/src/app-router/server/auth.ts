import type { AuthObject } from '@clerk/backend';
import type { RedirectFun, SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend/internal';
import { constants, createClerkRequest, createRedirect } from '@clerk/backend/internal';
import { notFound, redirect } from 'next/navigation';

import { PUBLISHABLE_KEY, SIGN_IN_URL, SIGN_UP_URL } from '../../server/constants';
import { createGetAuth } from '../../server/createGetAuth';
import { authAuthHeaderMissing } from '../../server/errors';
import type { AuthProtect } from '../../server/protect';
import { createProtect } from '../../server/protect';
import { decryptClerkRequestData, getAuthKeyFromRequest, getHeader } from '../../server/utils';
import { buildRequestLike } from './utils';

type Auth = AuthObject & { redirectToSignIn: RedirectFun<ReturnType<typeof redirect>> };
<<<<<<< HEAD
type MachineAuth = Omit<AuthObject, 'SignedInAuthObject' | 'SignedOutAuthObject'> & {
=======
type MachineAuth = Exclude<AuthObject, SignedInAuthObject | SignedOutAuthObject> & {
>>>>>>> 24e3ef125 (auth function changes)
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

<<<<<<< HEAD
export function auth(options?: AuthOptions & { entity: 'user' }): Promise<Auth>;
export function auth(options?: AuthOptions & { entity: 'machine' }): Promise<MachineAuth>;
export async function auth(options?: AuthOptions): Promise<Auth>;
export async function auth(options?: AuthOptions) {
=======
export async function auth(options?: AuthOptions & { entity: 'user' }): Promise<Auth>;
export async function auth(options?: AuthOptions & { entity: 'machine' }): Promise<MachineAuth>;
export async function auth(options?: AuthOptions): Promise<Auth>;
export async function auth(options?: AuthOptions) {
  // export const auth: AuthFn = async (options?: AuthOptions) => {
>>>>>>> 24e3ef125 (auth function changes)
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

<<<<<<< HEAD
auth.protect = async (...args: Parameters<AuthProtect>) => {
=======
auth.protect = async (...args: any[]) => {
>>>>>>> 44cab6038 (chore(backend,nextjs,types): Prevent system permissions usage in server-side (#4816))
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
