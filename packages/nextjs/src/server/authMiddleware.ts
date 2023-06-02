import type { AuthObject } from '@clerk/backend';
import { constants } from '@clerk/backend';
import type Link from 'next/link';
import type { NextFetchEvent, NextMiddleware, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { isRedirect, mergeResponses, paths, setHeader, stringifyHeaders } from '../utils';
import { withLogger } from '../utils/debugLogger';
import { authenticateRequest, handleInterstitialState, handleUnknownState } from './authenticateRequest';
import { DEV_BROWSER_JWT_MARKER, setDevBrowserJWTInURL } from './devBrowser';
import { receivedRequestForIgnoredRoute } from './errors';
import { isDevOrStagingUrl, redirectToSignIn } from './redirect';
import type { NextMiddlewareResult, WithAuthOptions } from './types';
import { apiEndpointUnauthorizedNextResponse, decorateRequest, setRequestHeadersOnNextResponse } from './utils';

type WithPathPatternWildcard<T> = `${T & string}(.*)`;
type NextTypedRoute<T = Parameters<typeof Link>['0']['href']> = T extends string ? T : never;

// For extra safety, we won't recommend using a `/(.*)` route matcher.
type ExcludeRootPath<T> = T extends '/' ? never : T;

// We want to show suggestions but also allow for free-text input
// the (string & {}) type prevents the TS compiler from merging the typed union with the string type
// https://github.com/Microsoft/TypeScript/issues/29729#issuecomment-505826972
type RouteMatcherWithNextTypedRoutes =
  | WithPathPatternWildcard<ExcludeRootPath<NextTypedRoute>>
  | NextTypedRoute
  | (string & {});

/**
 * The default ideal matcher that excludes the _next directory (internals) and all static files,
 * but it will match the root route (/) and any routes that start with /api or /trpc.
 */
export const DEFAULT_CONFIG_MATCHER = ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'];

/**
 * Any routes matching this path will be ignored by the middleware.
 * This is the inverted version of DEFAULT_CONFIG_MATCHER.
 */
export const DEFAULT_IGNORED_ROUTES = ['/((?!api|trpc))(_next|.+\\..+)(.*)'];
/**
 * Any routes matching this path will be treated as API endpoints by the middleware.
 */
export const DEFAULT_API_ROUTES = ['/api/(.*)', '/trpc/(.*)'];

type RouteMatcherParam =
  | Array<RegExp | RouteMatcherWithNextTypedRoutes>
  | RegExp
  | RouteMatcherWithNextTypedRoutes
  | ((req: NextRequest) => boolean);

type IgnoredRoutesParam = Array<RegExp | string> | RegExp | string | ((req: NextRequest) => boolean);
type ApiRoutesParam = Array<RegExp | string> | RegExp | string | ((req: NextRequest) => boolean);

type BeforeAuthHandler = (
  req: NextRequest,
  evt: NextFetchEvent,
) => NextMiddlewareResult | Promise<NextMiddlewareResult> | false | Promise<false>;

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
  ignoredRoutes?: IgnoredRoutesParam;
  /**
   * A list of routes that should be treated as API endpoints.
   * When user is signed out, the middleware will return a 401 response for these routes, instead of redirecting the user.
   * If omitted, these default API routes will be used: `['/api/(.*)', '/trpc/(.*)']` together with some heuristics.
   */
  apiRoutes?: ApiRoutesParam;
  /**
   * Enables extra debug logging.
   */
  debug?: boolean;
};

export interface AuthMiddleware {
  (params?: AuthMiddlewareParams): NextMiddleware;
}

const authMiddleware: AuthMiddleware = (...args: unknown[]) => {
  const [params = {}] = args as [AuthMiddlewareParams?];
  const { beforeAuth, afterAuth, publicRoutes, ignoredRoutes, apiRoutes, ...options } = params;

  const isIgnoredRoute = createRouteMatcher(ignoredRoutes || DEFAULT_IGNORED_ROUTES);
  const isPublicRoute = createRouteMatcher(withDefaultPublicRoutes(publicRoutes));
  const isApiRoute = createApiRoutes(apiRoutes);
  const defaultAfterAuth = createDefaultAfterAuth(isPublicRoute, isApiRoute);

  return withLogger('authMiddleware', logger => async (req: NextRequest, evt: NextFetchEvent) => {
    if (options.debug) {
      logger.enable();
    }

    logger.debug('URL debug', { url: req.nextUrl.href, method: req.method, headers: stringifyHeaders(req.headers) });
    logger.debug('Options debug', { ...options, beforeAuth: !!beforeAuth, afterAuth: !!afterAuth });

    if (isIgnoredRoute(req)) {
      logger.debug({ isIgnoredRoute: true });
      console.warn(receivedRequestForIgnoredRoute(req.nextUrl.href, JSON.stringify(DEFAULT_CONFIG_MATCHER)));
      return setHeader(NextResponse.next(), constants.Headers.AuthReason, 'ignored-route');
    }

    const beforeAuthRes = await (beforeAuth && beforeAuth(req, evt));

    if (beforeAuthRes === false) {
      logger.debug('Before auth returned false, skipping');
      return setHeader(NextResponse.next(), constants.Headers.AuthReason, 'skip');
    } else if (beforeAuthRes && isRedirect(beforeAuthRes)) {
      logger.debug('Before auth returned redirect, following redirect');
      return setHeader(beforeAuthRes, constants.Headers.AuthReason, 'redirect');
    }

    const requestState = await authenticateRequest(req, options);
    if (requestState.isUnknown) {
      logger.debug('authenticateRequest state is unknown', requestState);
      return handleUnknownState(requestState);
    } else if (requestState.isInterstitial && isApiRoute(req)) {
      logger.debug('authenticateRequest state is interstitial in an API route', requestState);
      return handleUnknownState(requestState);
    } else if (requestState.isInterstitial) {
      logger.debug('authenticateRequest state is interstitial', requestState);
      return handleInterstitialState(requestState, options);
    }

    const auth = Object.assign(requestState.toAuth(), {
      isPublicRoute: isPublicRoute(req),
      isApiRoute: isApiRoute(req),
    });
    logger.debug(() => ({ auth: JSON.stringify(auth) }));
    const afterAuthRes = await (afterAuth || defaultAfterAuth)(auth, req, evt);
    const finalRes = mergeResponses(beforeAuthRes, afterAuthRes) || NextResponse.next();
    logger.debug(() => ({ mergedHeaders: stringifyHeaders(finalRes.headers) }));

    if (isRedirect(finalRes)) {
      logger.debug('Final response is redirect, following redirect');
      const res = setHeader(finalRes, constants.Headers.AuthReason, 'redirect');
      return appendDevBrowserOnDevOrStaging(req, res);
    }

    if (options.debug) {
      setRequestHeadersOnNextResponse(finalRes, req, { [constants.Headers.EnableDebug]: 'true' });
      logger.debug(`Added ${constants.Headers.EnableDebug} on request`);
    }

    return decorateRequest(req, finalRes, requestState);
  });
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

const createDefaultAfterAuth = (
  isPublicRoute: ReturnType<typeof createRouteMatcher>,
  isApiRoute: ReturnType<typeof createApiRoutes>,
) => {
  return (auth: AuthObject, req: NextRequest) => {
    if (!auth.userId && !isPublicRoute(req) && isApiRoute(req)) {
      return apiEndpointUnauthorizedNextResponse();
    } else if (!auth.userId && !isPublicRoute(req)) {
      return redirectToSignIn({ returnBackUrl: req.url });
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
  // TODO: refactor it to use common config file eg SIGN_IN_URL from ./clerkClient
  // we use process.env for now to support testing
  const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '';
  if (signInUrl) {
    routes.push(matchRoutesStartingWith(signInUrl));
  }
  // TODO: refactor it to use common config file eg SIGN_UP_URL from ./clerkClient
  // we use process.env for now to support testing
  const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '';
  if (signUpUrl) {
    routes.push(matchRoutesStartingWith(signUpUrl));
  }
  return routes;
};

// grabs the dev browser JWT from cookies and appends it to the redirect URL when redirecting to Clerk Hosted Pages
// because middleware runs on the server side, before clerk-js is loaded.
const appendDevBrowserOnDevOrStaging = (req: NextRequest, res: Response) => {
  const location = res.headers.get('location');
  if (!!location && isDevOrStagingUrl(location)) {
    const dbJwt = req.cookies.get(DEV_BROWSER_JWT_MARKER)?.value;
    const urlWithDevBrowser = setDevBrowserJWTInURL(location, dbJwt);
    return NextResponse.redirect(urlWithDevBrowser, res);
  }
  return res;
};

// - Default behavior:
//    If the route path is `['/api/(.*)*', '*/trpc/(.*)']`
//    or Request has `Content-Type: application/json`
//    or Request method is not-GET,OPTIONS,HEAD,
//    then this is considered an API route.
//
// - If the user has provided a specific `apiRoutes` prop in `authMiddleware` then all the above are discarded,
//   and only routes that match the user’s provided paths are considered API routes.
const createApiRoutes = (apiRoutes: RouteMatcherParam | undefined): ((req: NextRequest) => boolean) => {
  if (apiRoutes) {
    return createRouteMatcher(apiRoutes);
  }
  const isDefaultApiRoute = createRouteMatcher(DEFAULT_API_ROUTES);
  return (req: NextRequest) =>
    isDefaultApiRoute(req) || isRequestMethodIndicatingApiRoute(req) || isRequestContentTypeJson(req);
};

const isRequestContentTypeJson = (req: NextRequest): boolean => {
  const requestContentType = req.headers.get(constants.Headers.ContentType);
  return requestContentType === constants.ContentTypes.Json;
};

const isRequestMethodIndicatingApiRoute = (req: NextRequest): boolean => {
  const requestMethod = req.method.toLowerCase();
  return !['get', 'head', 'options'].includes(requestMethod);
};
