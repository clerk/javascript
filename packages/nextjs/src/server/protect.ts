import type { AuthObject } from '@clerk/backend';
import type { RedirectFun, SignedInAuthObject } from '@clerk/backend/internal';
import { constants } from '@clerk/backend/internal';
import type {
  CheckAuthorizationParamsWithCustomPermissions,
  CheckAuthorizationWithCustomPermissions,
} from '@clerk/types';

import { constants as nextConstants } from '../constants';
import { isNextFetcher } from './nextFetcher';

type AuthProtectOptions = { unauthorizedUrl?: string; unauthenticatedUrl?: string };

/**
 * Throws a Nextjs notFound error if user is not authenticated or authorized.
 */
export interface AuthProtect {
  (params?: CheckAuthorizationParamsWithCustomPermissions, options?: AuthProtectOptions): SignedInAuthObject;

  (
    params?: (has: CheckAuthorizationWithCustomPermissions) => boolean,
    options?: AuthProtectOptions,
  ): SignedInAuthObject;

  (options?: AuthProtectOptions): SignedInAuthObject;
}

export const createProtect = (opts: {
  request: Request;
  authObject: AuthObject;
  /**
   * middleware and pages throw a notFound error if signed out
   * but the middleware needs to throw an error it can catch
   * use this callback to customise the behavior
   */
  notFound: () => never;
  /**
   * see {@link notFound} above
   */
  redirect: (url: string) => void;
  /**
   * protect() in middleware redirects to signInUrl if signed out
   * protect() in pages throws a notFound error if signed out
   * use this callback to customise the behavior
   */
  redirectToSignIn: RedirectFun<unknown>;
}): AuthProtect => {
  const { redirectToSignIn, authObject, redirect, notFound, request } = opts;

  return ((...args: any[]) => {
    const optionValuesAsParam = args[0]?.unauthenticatedUrl || args[0]?.unauthorizedUrl;
    const paramsOrFunction = optionValuesAsParam
      ? undefined
      : (args[0] as
          | CheckAuthorizationParamsWithCustomPermissions
          | ((has: CheckAuthorizationWithCustomPermissions) => boolean));
    const unauthenticatedUrl = (args[0]?.unauthenticatedUrl || args[1]?.unauthenticatedUrl) as string | undefined;
    const unauthorizedUrl = (args[0]?.unauthorizedUrl || args[1]?.unauthorizedUrl) as string | undefined;

    const handleUnauthenticated = () => {
      if (unauthenticatedUrl) {
        return redirect(unauthenticatedUrl);
      }
      if (isPageRequest(request)) {
        // TODO: Handle runtime values. What happens if runtime values are set in middleware and in ClerkProvider as well?
        return redirectToSignIn();
      }
      return notFound();
    };

    const handleUnauthorized = () => {
      if (unauthorizedUrl) {
        return redirect(unauthorizedUrl);
      }
      return notFound();
    };

    /**
     * User is not authenticated
     */
    if (!authObject.userId) {
      return handleUnauthenticated();
    }

    /**
     * User is authenticated
     */
    if (!paramsOrFunction) {
      return authObject;
    }

    /**
     * if a function is passed and returns false then throw not found
     */
    if (typeof paramsOrFunction === 'function') {
      if (paramsOrFunction(authObject.has)) {
        return authObject;
      }
      return handleUnauthorized();
    }

    /**
     * Checking if user is authorized when permission or role is passed
     */
    if (authObject.has(paramsOrFunction)) {
      return authObject;
    }

    return handleUnauthorized();
  }) as AuthProtect;
};

const isServerActionRequest = (req: Request) => {
  return (
    !!req.headers.get(nextConstants.Headers.NextUrl) &&
    (req.headers.get(constants.Headers.Accept)?.includes('text/x-component') ||
      req.headers.get(constants.Headers.ContentType)?.includes('multipart/form-data') ||
      !!req.headers.get(nextConstants.Headers.NextAction))
  );
};

const isPageRequest = (req: Request): boolean => {
  return (
    req.headers.get(constants.Headers.SecFetchDest) === 'document' ||
    req.headers.get(constants.Headers.SecFetchDest) === 'iframe' ||
    req.headers.get(constants.Headers.Accept)?.includes('text/html') ||
    isAppRouterInternalNavigation(req) ||
    isPagesRouterInternalNavigation(req)
  );
};

const isAppRouterInternalNavigation = (req: Request) =>
  (!!req.headers.get(nextConstants.Headers.NextUrl) && !isServerActionRequest(req)) || isPagePathAvailable();

const isPagePathAvailable = () => {
  const __fetch = globalThis.fetch;
  return Boolean(isNextFetcher(__fetch) ? __fetch.__nextGetStaticStore().getStore().pagePath : false);
};

const isPagesRouterInternalNavigation = (req: Request) => !!req.headers.get(nextConstants.Headers.NextjsData);

// /**
//  * In case we want to handle router handlers and server actions differently in the future
//  */
// const isApiRouteRequest = (req: Request) => {
//   return !isPageRequest(req) && !isServerActionRequest(req);
// };
