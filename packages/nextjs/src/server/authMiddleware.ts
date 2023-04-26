import type { AuthObject } from '@clerk/backend';
import { constants } from '@clerk/backend';
import type { NextFetchEvent, NextMiddleware, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { isRedirect, mergeResponses, paths, setHeader } from '../utils';
import { authenticateRequest, handleInterstitialState, handleUnknownState } from './authenticateRequest';
import { receivedRequestForIgnoredRoute } from './errors';
import type { NextMiddlewareResult, WithAuthOptions } from './types';
import { decorateRequest } from './utils';

const TMP_SIGN_IN_URL = '/sign-in';
const TMP_SIGN_UP_URL = '/sign-up';
// const TMP_AFTER_SIGN_IN_URL = '/';
// const TMP_AFTER_SIGN_UP_URL = '/';

/**
 * The default ideal matcher that excludes the _next directory (internals) and all static files.
 */
export const DEFAULT_CONFIG_MATCHER = ['/((?!.*\\..*|_next).*)', '/'];

/**
 * Any routes matching this path will be ignored by the middleware.
 * This is the inverted version of DEFAULT_CONFIG_MATCHER.
 */
export const DEFAULT_IGNORED_ROUTES = ['/(.*\\..*|_next.*)'];

type RouteMatcherParam = Array<string | RegExp> | string | RegExp | ((req: NextRequest) => boolean);

type BeforeAuthHandler = (
  req: NextRequest,
  evt: NextFetchEvent,
) => NextMiddlewareResult | Promise<NextMiddlewareResult> | false;

type AfterAuthHandler = (
  auth: AuthObject & { isPublicRoute: boolean },
  req: NextRequest,
  evt: NextFetchEvent,
) => NextMiddlewareResult | Promise<NextMiddlewareResult>;

type AuthMiddlewareParams = WithAuthOptions & {
  /**
   * A function that is called before the authentication middleware is executed.
   * If a redirect response is returned, the middleware will respect it and redirect the user.
   * If false is returned, the auth middleware will not execute and the request will be handled as if the auth middleware was not present.
   */
  beforeAuth?: BeforeAuthHandler;
  /**
   * A function that is called after the authentication middleware is executed.
   * This function has access to the auth object and can be used to execute logic based on the auth state.
   */
  afterAuth?: AfterAuthHandler;
  /**
   * A list of routes that should be accessible without authentication.
   * You can use glob patterns to match multiple routes or a function to match against the request object.
   * Path patterns and regular expressions are supported, for example: `['/foo', '/bar(.*)'] or `[/^\/foo\/.*$/]`
   * The sign in and sign up URLs are included by default, unless a function is provided.
   * For more information, see: https://clerk.com/docs
   */
  publicRoutes?: RouteMatcherParam;
  /**
   * A list of routes that should be ignored by the middleware.
   * This list typically includes routes for static files or Next.js internals.
   * For improved performance, these routes should be skipped using the default config.matcher instead.
   */
  ignoredRoutes?: RouteMatcherParam;
  /**
   * Enables extra debug logging.
   */
  debug?: boolean;
};

interface AuthMiddleware {
  (): NextMiddleware;
  (params: AuthMiddlewareParams): NextMiddleware;
}

const authMiddleware: AuthMiddleware = (...args: unknown[]) => {
  const [params = {}] = args as [AuthMiddlewareParams?];
  const { beforeAuth, afterAuth, publicRoutes, ignoredRoutes, ...options } = params;

  const isIgnoredRoute = createRouteMatcher(ignoredRoutes || DEFAULT_IGNORED_ROUTES);
  const isPublicRoute = createRouteMatcher(withDefaultPublicRoutes(publicRoutes));
  const defaultAfterAuth = createDefaultAfterAuth(isPublicRoute);

  return async (req: NextRequest, evt: NextFetchEvent) => {
    if (isIgnoredRoute(req)) {
      console.warn(receivedRequestForIgnoredRoute(req.nextUrl.href, JSON.stringify(DEFAULT_CONFIG_MATCHER)));
      return setHeader(NextResponse.next(), constants.Headers.AuthReason, 'ignored-route');
    }

    const beforeAuthRes = await (beforeAuth && beforeAuth(req, evt));

    if (beforeAuthRes === false) {
      return setHeader(NextResponse.next(), constants.Headers.AuthReason, 'skip');
    } else if (beforeAuthRes && isRedirect(beforeAuthRes)) {
      return setHeader(beforeAuthRes, constants.Headers.AuthReason, 'redirect');
    }

    const requestState = await authenticateRequest(req, options);
    if (requestState.isUnknown) {
      return handleUnknownState(requestState);
    } else if (requestState.isInterstitial) {
      return handleInterstitialState(requestState, options);
    }

    const auth = Object.assign(requestState.toAuth(), { isPublicRoute: isPublicRoute(req) });
    const afterAuthRes = await (afterAuth || defaultAfterAuth)(auth, req, evt);
    const finalRes = mergeResponses(beforeAuthRes, afterAuthRes) || NextResponse.next();

    if (isRedirect(finalRes)) {
      return setHeader(finalRes, constants.Headers.AuthReason, 'redirect');
    }

    if (options.debug) {
      setHeader(finalRes, constants.Headers.EnableDebug, 'true');
    }

    return decorateRequest(req, finalRes, requestState);
  };
};

export { authMiddleware };

/**
 * Create a function that matches a request against the specified routes.
 * Precomputes the glob matchers for the public routes, so we don't have to
 * recompile the regular expressions on every request.
 */
export const createRouteMatcher = (routes: RouteMatcherParam) => {
  if (typeof routes === 'function') {
    return (req: NextRequest) => routes(req);
  }

  const routePatterns = [routes || ''].flat().filter(Boolean);
  const matchers = precomputePathRegex(routePatterns);
  return (req: NextRequest) => matchers.some(matcher => matcher.test(req.nextUrl.pathname));
};

const createDefaultAfterAuth = (isPublicRoute: ReturnType<typeof createRouteMatcher>) => {
  return (auth: AuthObject, req: NextRequest) => {
    if (!auth.userId && !isPublicRoute(req)) {
      // TODO: replace with redirectToSignIn
      const url = new URL(TMP_SIGN_IN_URL, req.nextUrl.origin);
      url.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(url.toString());
    }
    return NextResponse.next();
  };
};

const precomputePathRegex = (patterns: Array<string | RegExp>) => {
  return patterns.map(pattern => (pattern instanceof RegExp ? pattern : paths.toRegexp(pattern)));
};

const matchRoutesStartingWith = (path: string) => {
  path = path.replace(/\/$/, '');
  return new RegExp(`^${path}(/.*)?$`);
};

const withDefaultPublicRoutes = (publicRoutes: RouteMatcherParam | undefined) => {
  if (typeof publicRoutes === 'function') {
    return publicRoutes;
  }
  const routes = [publicRoutes || ''].flat().filter(Boolean);
  routes.push(matchRoutesStartingWith(TMP_SIGN_IN_URL));
  routes.push(matchRoutesStartingWith(TMP_SIGN_UP_URL));
  return routes;
};
