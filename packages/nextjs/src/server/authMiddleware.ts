import type { AuthObject } from '@clerk/backend';
import { constants } from '@clerk/backend';
import type Link from 'next/link';
import type { NextFetchEvent, NextMiddleware, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { isRedirect, mergeResponses, paths, setHeader, stringifyHeaders } from '../utils';
import { withLogger } from '../utils/debugLogger';
import { authenticateRequest, handleInterstitialState, handleUnknownState } from './authenticateRequest';
import { SECRET_KEY, TRUST_HOST } from './clerkClient';
import { DEV_BROWSER_JWT_MARKER, setDevBrowserJWTInURL } from './devBrowser';
import { receivedRequestForIgnoredRoute } from './errors';
import { redirectToSignIn } from './redirect';
import type { NextMiddlewareResult, WithAuthOptions } from './types';
import {
  apiEndpointUnauthorizedNextResponse,
  decorateRequest,
  isCrossOrigin,
  isDevelopmentFromApiKey,
  setRequestHeadersOnNextResponse,
} from './utils';

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

const INFINITE_REDIRECTION_LOOP_COOKIE = '__clerk_redirection_loop';

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
type ApiRoutesParam = IgnoredRoutesParam;

type WithClerkUrl<T> = T & {
  /**
   * When a NextJs app is hosted on a platform different from Vercel
   * or inside a container (Netlify, Fly.io, AWS Amplify, docker etc),
   * req.url is always set to `localhost:3000` instead of the actual host of the app.
   *
   * If the CLERK_TRUST_HOST environment variable is set to "true",
   * `authMiddleware` will use the value of the available req.headers in order to construct
   * and use the correct url internally. This url is then exposed as `experimental_clerkUrl`,
   * intended to be used within `beforeAuth` and `afterAuth` if needed.
   */
  experimental_clerkUrl: NextRequest['nextUrl'];
};

type BeforeAuthHandler = (
  req: WithClerkUrl<NextRequest>,
  evt: NextFetchEvent,
) => NextMiddlewareResult | Promise<NextMiddlewareResult> | false | Promise<false>;

type AfterAuthHandler = (
  auth: AuthObject & { isPublicRoute: boolean; isApiRoute: boolean },
  req: WithClerkUrl<NextRequest>,
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
   *
   * If omitted, the following heuristics will be used to determine an API endpoint:
   * - The route path is ['/api/(.*)', '/trpc/(.*)'],
   * - or the request has `Content-Type` set to `application/json`,
   * - or the request method is not one of: `GET`, `OPTIONS` ,` HEAD`
   *
   * @default undefined
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

  return withLogger('authMiddleware', logger => async (_req: NextRequest, evt: NextFetchEvent) => {
    if (options.debug) {
      logger.enable();
    }
    const req = withNormalizedClerkUrl(_req);

    logger.debug('URL debug', {
      url: req.nextUrl.href,
      method: req.method,
      headers: stringifyHeaders(req.headers),
      nextUrl: req.nextUrl.href,
      clerkUrl: req.experimental_clerkUrl.href,
    });
    logger.debug('Options debug', { ...options, beforeAuth: !!beforeAuth, afterAuth: !!afterAuth });

    if (isIgnoredRoute(req)) {
      logger.debug({ isIgnoredRoute: true });
      console.warn(
        receivedRequestForIgnoredRoute(req.experimental_clerkUrl.href, JSON.stringify(DEFAULT_CONFIG_MATCHER)),
      );
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
      const res = handleInterstitialState(requestState, options);
      return assertInfiniteRedirectionLoop(req, res);
    }

    const auth = Object.assign(requestState.toAuth(), {
      isPublicRoute: isPublicRoute(req),
      isApiRoute: isApiRoute(req),
    });
    logger.debug(() => ({ auth: JSON.stringify(auth), debug: auth.debug() }));
    const afterAuthRes = await (afterAuth || defaultAfterAuth)(auth, req, evt);
    const finalRes = mergeResponses(beforeAuthRes, afterAuthRes) || NextResponse.next();
    logger.debug(() => ({ mergedHeaders: stringifyHeaders(finalRes.headers) }));

    if (isRedirect(finalRes)) {
      logger.debug('Final response is redirect, following redirect');
      const res = setHeader(finalRes, constants.Headers.AuthReason, 'redirect');
      return appendDevBrowserOnCrossOrigin(req, res);
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
  return (auth: AuthObject, req: WithClerkUrl<NextRequest>) => {
    if (!auth.userId && !isPublicRoute(req) && isApiRoute(req)) {
      return apiEndpointUnauthorizedNextResponse();
    } else if (!auth.userId && !isPublicRoute(req)) {
      return redirectToSignIn({ returnBackUrl: req.experimental_clerkUrl.href });
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

// Grabs the dev browser JWT from cookies and appends it to the redirect URL when redirecting to cross-origin.
// Middleware runs on the server side, before clerk-js is loaded, that's why we need Cookies.
const appendDevBrowserOnCrossOrigin = (req: WithClerkUrl<NextRequest>, res: Response) => {
  const location = res.headers.get('location');
  const shouldAppendDevBrowser = res.headers.get(constants.Headers.ClerkRedirectTo) === 'true';
  if (
    shouldAppendDevBrowser &&
    !!location &&
    isDevelopmentFromApiKey(SECRET_KEY) &&
    isCrossOrigin(req.experimental_clerkUrl, location)
  ) {
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
const createApiRoutes = (apiRoutes: RouteMatcherParam | undefined): ((req: WithClerkUrl<NextRequest>) => boolean) => {
  if (apiRoutes) {
    return createRouteMatcher(apiRoutes);
  }
  const isDefaultApiRoute = createRouteMatcher(DEFAULT_API_ROUTES);
  return (req: WithClerkUrl<NextRequest>) =>
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

// When in development, we want to prevent infinite interstitial redirection loops.
// We incrementally set a `__clerk_redirection_loop` cookie, and when it loops 6 times, we throw an error.
// We also utilize the `referer` header to skip the prefetch requests.
const assertInfiniteRedirectionLoop = (req: NextRequest, res: NextResponse): NextResponse => {
  if (!isDevelopmentFromApiKey(SECRET_KEY)) {
    return res;
  }

  const infiniteRedirectsCounter = Number(req.cookies.get(INFINITE_REDIRECTION_LOOP_COOKIE)?.value) || 0;
  if (infiniteRedirectsCounter === 6) {
    throw new Error(INFINITE_REDIRECTION_LOOP_ERROR_MESSAGE);
  }

  // Skip the prefetch requests (when hovering a Next Link element)
  if (req.headers.get('referer') === req.url) {
    res.cookies.set({
      name: INFINITE_REDIRECTION_LOOP_COOKIE,
      value: `${infiniteRedirectsCounter + 1}`,
      maxAge: 3,
    });
  }
  return res;
};

const INFINITE_REDIRECTION_LOOP_ERROR_MESSAGE = `Clerk: Infinite redirect loop detected. That usually means that we were not able to determine the auth state for this request. A list of common causes and solutions follows.

Reason 1:
Your server's system clock is inaccurate. Clerk will continuously try to issue new tokens, as the existing ones will be treated as "expired" due to clock skew.
How to resolve:
-> Make sure your system's clock is set to the correct time (e.g. turn off and on automatic time synchronization).

Reason 2:
Your Clerk instance keys are incorrect, or you recently changed keys (Publishable Key, Secret Key).
How to resolve:
-> Make sure you're using the correct keys from the Clerk Dashboard. If you changed keys recently, make sure to clear your browser application data and cookies.

Reason 3:
A bug that may have already been fixed in the latest version of Clerk NextJS package.
How to resolve:
-> Make sure you are using the latest version of '@clerk/nextjs' and 'next'.
  `;

const getHeader = (req: NextRequest, key: string) => req.headers.get(key);
const getFirstValueFromHeader = (req: NextRequest, key: string) => getHeader(req, key)?.split(',')[0];

const withNormalizedClerkUrl = (req: NextRequest): WithClerkUrl<NextRequest> => {
  if (!TRUST_HOST) {
    return Object.assign(req, { experimental_clerkUrl: req.nextUrl });
  }

  const clerkUrl = req.nextUrl.clone();

  const host = getFirstValueFromHeader(req, constants.Headers.ForwardedHost);
  const protocol = getFirstValueFromHeader(req, constants.Headers.ForwardedProto);
  const port = getFirstValueFromHeader(req, constants.Headers.ForwardedPort);

  const isHttpRelatedProtocol = protocol && ['http', 'https'].includes(protocol);
  const isHttpRelatedPort = port && ['80', '443'].includes(port);
  if (isHttpRelatedProtocol && isHttpRelatedPort) {
    clerkUrl.port = '';
  }

  clerkUrl.protocol = protocol ?? clerkUrl.protocol;
  clerkUrl.host = host ?? clerkUrl.host;

  return Object.assign(req, { experimental_clerkUrl: clerkUrl });
};
