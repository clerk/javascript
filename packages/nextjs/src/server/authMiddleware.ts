import type { AuthenticateRequestOptions, AuthObject, ClerkRequest } from '@clerk/backend/internal';
import { AuthStatus, constants, createClerkRequest, createRedirect } from '@clerk/backend/internal';
import { isDevelopmentFromSecretKey } from '@clerk/shared/keys';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { NextFetchEvent, NextMiddleware, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { isRedirect, mergeResponses, serverRedirectWithAuth, setHeader, stringifyHeaders } from '../utils';
import { withLogger } from '../utils/debugLogger';
import { clerkClient } from './clerkClient';
import { createAuthenticateRequestOptions } from './clerkMiddleware';
import { PUBLISHABLE_KEY, SECRET_KEY, SIGN_IN_URL, SIGN_UP_URL } from './constants';
import { informAboutProtectedRouteInfo, receivedRequestForIgnoredRoute } from './errors';
import { errorThrower } from './errorThrower';
import type { RouteMatcherParam } from './routeMatcher';
import { createRouteMatcher } from './routeMatcher';
import type { NextMiddlewareReturn } from './types';
import {
  apiEndpointUnauthorizedNextResponse,
  assertKey,
  decorateRequest,
  redirectAdapter,
  setRequestHeadersOnNextResponse,
} from './utils';

/**
 * The default ideal matcher that excludes the _next directory (internals) and all static files,
 * but it will match the root route (/) and any routes that start with /api or /trpc.
 */
export const DEFAULT_CONFIG_MATCHER = ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'];

/**
 * Any routes matching this path will be ignored by the middleware.
 * This is the inverted version of DEFAULT_CONFIG_MATCHER.
 */
export const DEFAULT_IGNORED_ROUTES = [`/((?!api|trpc))(_next.*|.+\\.[\\w]+$)`];
/**
 * Any routes matching this path will be treated as API endpoints by the middleware.
 */
export const DEFAULT_API_ROUTES = ['/api/(.*)', '/trpc/(.*)'];

type IgnoredRoutesParam = Array<RegExp | string> | RegExp | string | ((req: NextRequest) => boolean);
type ApiRoutesParam = IgnoredRoutesParam;

type WithExperimentalClerkUrl<T> = T & {
  /**
   * When a NextJs app is hosted on a platform different from Vercel
   * or inside a container (Netlify, Fly.io, AWS Amplify, docker etc),
   * req.url is always set to `localhost:3000` instead of the actual host of the app.
   *
   * The `authMiddleware` uses the value of the available req.headers in order to construct
   * and use the correct url internally. This url is then exposed as `experimental_clerkUrl`,
   * intended to be used within `beforeAuth` and `afterAuth` if needed.
   */
  experimental_clerkUrl: NextRequest['nextUrl'];
};

type BeforeAuthHandler = (
  req: WithExperimentalClerkUrl<NextRequest>,
  evt: NextFetchEvent,
) => NextMiddlewareReturn | false | Promise<false>;

type AfterAuthHandler = (
  auth: AuthObject & { isPublicRoute: boolean; isApiRoute: boolean },
  req: WithExperimentalClerkUrl<NextRequest>,
  evt: NextFetchEvent,
) => NextMiddlewareReturn;

type AuthMiddlewareParams = AuthenticateRequestOptions & {
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

/**
 * @deprecated `authMiddleware` is deprecated and will be removed in the next major version.
 * Use {@link clerkMiddleware}` instead.
 * Migration guide: https://clerk.com/docs/upgrade-guides/core-2/nextjs
 */
const authMiddleware: AuthMiddleware = (...args: unknown[]) => {
  const [params = {}] = args as [AuthMiddlewareParams?];
  const publishableKey = assertKey(params.publishableKey || PUBLISHABLE_KEY, () =>
    errorThrower.throwMissingPublishableKeyError(),
  );
  const secretKey = assertKey(params.secretKey || SECRET_KEY, () => errorThrower.throwMissingPublishableKeyError());
  const signInUrl = params.signInUrl || SIGN_IN_URL;
  const signUpUrl = params.signUpUrl || SIGN_UP_URL;

  const options = { ...params, publishableKey, secretKey, signInUrl, signUpUrl };

  const isIgnoredRoute = createRouteMatcher(options.ignoredRoutes || DEFAULT_IGNORED_ROUTES);
  const isPublicRoute = createRouteMatcher(withDefaultPublicRoutes(options.publicRoutes));
  const isApiRoute = createApiRoutes(options.apiRoutes);
  const defaultAfterAuth = createDefaultAfterAuth(isPublicRoute, isApiRoute, options);

  clerkClient().telemetry.record(
    eventMethodCalled('authMiddleware', {
      publicRoutes: Boolean(options.publicRoutes),
      ignoredRoutes: Boolean(options.ignoredRoutes),
      beforeAuth: Boolean(options.beforeAuth),
      afterAuth: Boolean(options.afterAuth),
    }),
  );

  return withLogger('authMiddleware', logger => async (_req: NextRequest, evt: NextFetchEvent) => {
    if (options.debug) {
      logger.enable();
    }
    const clerkRequest = createClerkRequest(_req);
    const nextRequest = withNormalizedClerkUrl(clerkRequest, _req);

    logger.debug('URL debug', {
      url: nextRequest.nextUrl.href,
      method: nextRequest.method,
      headers: stringifyHeaders(nextRequest.headers),
      nextUrl: nextRequest.nextUrl.href,
      clerkUrl: nextRequest.experimental_clerkUrl.href,
    });

    logger.debug('Options debug', { ...options, beforeAuth: !!options.beforeAuth, afterAuth: !!options.afterAuth });

    if (isIgnoredRoute(nextRequest)) {
      logger.debug({ isIgnoredRoute: true });
      if (isDevelopmentFromSecretKey(options.secretKey) && !options.ignoredRoutes) {
        console.warn(
          receivedRequestForIgnoredRoute(
            nextRequest.experimental_clerkUrl.href,
            JSON.stringify(DEFAULT_CONFIG_MATCHER),
          ),
        );
      }
      return setHeader(NextResponse.next(), constants.Headers.AuthReason, 'ignored-route');
    }

    const beforeAuthRes = await (options.beforeAuth && options.beforeAuth(nextRequest, evt));

    if (beforeAuthRes === false) {
      logger.debug('Before auth returned false, skipping');
      return setHeader(NextResponse.next(), constants.Headers.AuthReason, 'skip');
    } else if (beforeAuthRes && isRedirect(beforeAuthRes)) {
      logger.debug('Before auth returned redirect, following redirect');
      return setHeader(beforeAuthRes, constants.Headers.AuthReason, 'before-auth-redirect');
    }

    const requestState = await clerkClient().authenticateRequest(
      clerkRequest,
      createAuthenticateRequestOptions(clerkRequest, options),
    );

    const locationHeader = requestState.headers.get('location');
    if (locationHeader) {
      // triggering a handshake redirect
      return new Response(null, { status: 307, headers: requestState.headers });
    }

    if (requestState.status === AuthStatus.Handshake) {
      throw new Error('Clerk: unexpected handshake without redirect');
    }

    const auth = Object.assign(requestState.toAuth(), {
      isPublicRoute: isPublicRoute(nextRequest),
      isApiRoute: isApiRoute(nextRequest),
    });

    logger.debug(() => ({ auth: JSON.stringify(auth), debug: auth.debug() }));
    const afterAuthRes = await (options.afterAuth || defaultAfterAuth)(auth, nextRequest, evt);
    const finalRes = mergeResponses(beforeAuthRes, afterAuthRes) || NextResponse.next();
    logger.debug(() => ({ mergedHeaders: stringifyHeaders(finalRes.headers) }));

    if (isRedirect(finalRes)) {
      logger.debug('Final response is redirect, following redirect');
      return serverRedirectWithAuth(clerkRequest, finalRes, options);
    }

    if (options.debug) {
      setRequestHeadersOnNextResponse(finalRes, nextRequest, { [constants.Headers.EnableDebug]: 'true' });
      logger.debug(`Added ${constants.Headers.EnableDebug} on request`);
    }

    const result =
      decorateRequest(clerkRequest, finalRes, requestState, {
        secretKey,
        signInUrl: params.signInUrl,
        signUpUrl: params.signUpUrl,
      }) || NextResponse.next();

    if (requestState.headers) {
      requestState.headers.forEach((value, key) => {
        result.headers.append(key, value);
      });
    }

    return result;
  });
};

export { authMiddleware };

const createDefaultAfterAuth = (
  isPublicRoute: ReturnType<typeof createRouteMatcher>,
  isApiRoute: ReturnType<typeof createApiRoutes>,
  options: { signInUrl: string; signUpUrl: string; publishableKey: string; secretKey: string },
) => {
  return (auth: AuthObject, req: WithExperimentalClerkUrl<NextRequest>) => {
    if (!auth.userId && !isPublicRoute(req)) {
      if (isApiRoute(req)) {
        informAboutProtectedRoute(req.experimental_clerkUrl.pathname, options, true);
        return apiEndpointUnauthorizedNextResponse();
      } else {
        informAboutProtectedRoute(req.experimental_clerkUrl.pathname, options, false);
      }
      return createRedirect({
        redirectAdapter,
        signInUrl: options.signInUrl,
        signUpUrl: options.signUpUrl,
        publishableKey: options.publishableKey,
        // We're setting baseUrl to '' here as we want to keep the legacy behavior of
        // the redirectToSignIn, redirectToSignUp helpers in the backend package.
        baseUrl: '',
      }).redirectToSignIn({ returnBackUrl: req.experimental_clerkUrl.href });
    }
    return NextResponse.next();
  };
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

// - Default behavior:
//    If the route path is `['/api/(.*)*', '*/trpc/(.*)']`
//    or Request has `Content-Type: application/json`
//    or Request method is not-GET,OPTIONS,HEAD,
//    then this is considered an API route.
//
// - If the user has provided a specific `apiRoutes` prop in `authMiddleware` then all the above are discarded,
//   and only routes that match the user’s provided paths are considered API routes.
const createApiRoutes = (
  apiRoutes: RouteMatcherParam | undefined,
): ((req: WithExperimentalClerkUrl<NextRequest>) => boolean) => {
  if (apiRoutes) {
    return createRouteMatcher(apiRoutes);
  }
  const isDefaultApiRoute = createRouteMatcher(DEFAULT_API_ROUTES);
  return (req: WithExperimentalClerkUrl<NextRequest>) =>
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

const withNormalizedClerkUrl = (
  clerkRequest: ClerkRequest,
  nextRequest: NextRequest,
): WithExperimentalClerkUrl<NextRequest> => {
  const res = nextRequest.nextUrl.clone();
  res.port = clerkRequest.clerkUrl.port;
  res.protocol = clerkRequest.clerkUrl.protocol;
  res.host = clerkRequest.clerkUrl.host;
  return Object.assign(nextRequest, { experimental_clerkUrl: res });
};

const informAboutProtectedRoute = (
  path: string,
  options: AuthMiddlewareParams & { secretKey: string },
  isApiRoute: boolean,
) => {
  if (options.debug || isDevelopmentFromSecretKey(options.secretKey)) {
    console.warn(
      informAboutProtectedRouteInfo(
        path,
        !!options.publicRoutes,
        !!options.ignoredRoutes,
        isApiRoute,
        DEFAULT_IGNORED_ROUTES,
      ),
    );
  }
};
