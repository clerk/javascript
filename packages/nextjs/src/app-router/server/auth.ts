import type { AuthObject } from '@clerk/backend';
import { constants, createClerkRequest, createRedirect, type RedirectFun } from '@clerk/backend/internal';
import { notFound, redirect } from 'next/navigation';

import { PUBLISHABLE_KEY, SIGN_IN_URL, SIGN_UP_URL } from '../../server/constants';
import { createAsyncGetAuth } from '../../server/createGetAuth';
import { authAuthHeaderMissing } from '../../server/errors';
import { getAuthKeyFromRequest, getHeader } from '../../server/headers-utils';
import type { AuthProtect } from '../../server/protect';
import { createProtect } from '../../server/protect';
import { decryptClerkRequestData } from '../../server/utils';
import { isNextWithUnstableServerActions } from '../../utils/sdk-versions';
import { buildRequestLike } from './utils';

/**
 * `Auth` object of the currently active user and the `redirectToSignIn()` method.
 */
type Auth = AuthObject & {
  /**
   * The `auth()` helper returns the `redirectToSignIn()` method, which you can use to redirect the user to the sign-in page.
   *
   * @param [returnBackUrl] {string | URL} - The URL to redirect the user back to after they sign in.
   *
   * @note
   * `auth()` on the server-side can only access redirect URLs defined via [environment variables](https://clerk.com/docs/deployments/clerk-environment-variables#sign-in-and-sign-up-redirects) or [`clerkMiddleware` dynamic keys](https://clerk.com/docs/references/nextjs/clerk-middleware#dynamic-keys).
   */
  redirectToSignIn: RedirectFun<ReturnType<typeof redirect>>;
};

export interface AuthFn {
  (): Promise<Auth>;

  /**
   * `auth` includes a single property, the `protect()` method, which you can use in two ways:
   * - to check if a user is authenticated (signed in)
   * - to check if a user is authorized (has the correct roles or permissions) to access something, such as a component or a route handler
   *
   * The following table describes how auth.protect() behaves based on user authentication or authorization status:
   *
   * | Authenticated | Authorized | `auth.protect()` will |
   * | - | - | - |
   * | Yes | Yes | Return the [`Auth`](https://clerk.com/docs/references/backend/types/auth-object) object. |
   * | Yes | No | Return a `404` error. |
   * | No | No | Redirect the user to the sign-in page\*. |
   *
   * @important
   * \*For non-document requests, such as API requests, `auth.protect()` returns a `404` error to users who aren't authenticated.
   *
   * `auth.protect()` can be used to check if a user is authenticated or authorized to access certain parts of your application or even entire routes. See detailed examples in the [dedicated guide](https://clerk.com/docs/organizations/verify-user-permissions).
   */
  protect: AuthProtect;
}

/**
 * The `auth()` helper returns the [`Auth`](https://clerk.com/docs/references/backend/types/auth-object) object of the currently active user, as well as the [`redirectToSignIn()`](https://clerk.com/docs/references/nextjs/auth#redirect-to-sign-in) method.
 *
 * - Only available for App Router.
 * - Only works on the server-side, such as in Server Components, Route Handlers, and Server Actions.
 * - Requires [`clerkMiddleware()`](https://clerk.com/docs/references/nextjs/clerk-middleware) to be configured.
 */
export const auth: AuthFn = async () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('server-only');

  const request = await buildRequestLike();

  const stepsBasedOnSrcDirectory = async () => {
    if (isNextWithUnstableServerActions) {
      return [];
    }

    try {
      const isSrcAppDir = await import('../../server/fs/middleware-location.js').then(m => m.hasSrcAppDir());
      return [`Your Middleware exists at ./${isSrcAppDir ? 'src/' : ''}middleware.ts`];
    } catch {
      return [];
    }
  };
  const authObject = await createAsyncGetAuth({
    debugLoggerName: 'auth()',
    noAuthStatusMessage: authAuthHeaderMissing('auth', await stepsBasedOnSrcDirectory()),
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
  // eslint-disable-next-line @typescript-eslint/no-require-imports
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
