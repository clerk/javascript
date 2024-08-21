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

/**
 * Detects a request that will trigger a server action
 * Can be used from the Edge Middleware and during rendering
 */
const isServerActionRequest = (req: Request) => {
  return (
    req.headers.get(constants.Headers.Accept)?.includes('text/x-component') &&
    !!req.headers.get(nextConstants.Headers.NextAction)
  );
};

/**
 * Attempts to detect when a request results in a page being displayed
 * *Attention*:
 * When used within the Edge Middleware this utility will mistakenly detect a Route Handler as a Page
 */
const isPageRequest = (req: Request): boolean => {
  return (
    (req.headers.get(constants.Headers.SecFetchDest) === 'document' ||
      req.headers.get(constants.Headers.SecFetchDest) === 'iframe' ||
      req.headers.get(constants.Headers.Accept)?.includes('text/html') ||
      isAppRouterInternalNavigation(req) ||
      isPagesRouterInternalNavigation(req)) &&
    !isServerActionRequest(req) &&
    !isAppRouteRoute(getPagePathAvailable())
  );
};

const isAppRouterInternalNavigation = (req: Request) =>
  // Since next@14.2.3 the `next-url` header is being stripped before it can reach the rendering server, and it is only available when executed inside the Next.js Edge Middleware
  (!!req.headers.get(nextConstants.Headers.NextUrl) || isAppPageRoute(getPagePathAvailable())) &&
  !isServerActionRequest(req);

/**
 * Detects usage inside a page.tsx file in App Router
 * Found in the Next.js repo
 * https://github.com/vercel/next.js/blob/0ac10d79720cc950df96bd9d4958c9be0c075b6f/packages/next/src/lib/is-app-page-route.ts
 */
export function isAppPageRoute(route: string): boolean {
  return route.endsWith('/page');
}

/**
 * Detects usage inside a route.tsx file in App Router
 * Found in the Next.js repo
 * github.com/vercel/next.js/blob/0ac10d79720cc950df96bd9d4958c9be0c075b6f/packages/next/src/lib/is-app-route-route.ts
 * In case we want to handle router handlers and server actions differently in the future
 */
export function isAppRouteRoute(route: string): boolean {
  return route.endsWith('/route');
}

/**
 * Returns a string that can either end with `/page` or `/route` indicating that the code run in the context of a page or a route handler.
 * These values are only available during rendering (RSC, Route Handlers, Server Actions), and will not be populated when executed inside the Next.js Edge Middleware
 */
const getPagePathAvailable = () => {
  const __fetch = globalThis.fetch;
  return isNextFetcher(__fetch) ? __fetch.__nextGetStaticStore().getStore()?.pagePath || '' : '';
};

const isPagesRouterInternalNavigation = (req: Request) => !!req.headers.get(nextConstants.Headers.NextjsData);
