import type { AuthObject, ClerkClient } from '@clerk/backend';
import type {
  AuthenticatedState,
  AuthenticateRequestOptions,
  ClerkRequest,
  RedirectFun,
  RequestState,
  SignedInAuthObject,
  SignedOutAuthObject,
  UnauthenticatedState,
} from '@clerk/backend/internal';
import {
  AuthStatus,
  constants,
  createClerkRequest,
  createRedirect,
  getAuthObjectForAcceptedToken,
  isMachineTokenByPrefix,
  isTokenTypeAccepted,
  makeAuthObjectSerializable,
  TokenType,
} from '@clerk/backend/internal';
import { parsePublishableKey } from '@clerk/shared/keys';
import { notFound as nextjsNotFound } from 'next/navigation';
import type { NextMiddleware, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import type { AuthFn } from '../app-router/server/auth';
import type { GetAuthOptions } from '../server/createGetAuth';
import { isRedirect, serverRedirectWithAuth, setHeader } from '../utils';
import { withLogger } from '../utils/debugLogger';
import { canUseKeyless } from '../utils/feature-flags';
import { clerkClient } from './clerkClient';
import { PUBLISHABLE_KEY, SECRET_KEY, SIGN_IN_URL, SIGN_UP_URL } from './constants';
import { type ContentSecurityPolicyOptions, createContentSecurityPolicyHeaders } from './content-security-policy';
import { errorThrower } from './errorThrower';
import { getHeader } from './headers-utils';
import { getKeylessCookieValue } from './keyless';
import { clerkMiddlewareRequestDataStorage, clerkMiddlewareRequestDataStore } from './middleware-storage';
import {
  isNextjsNotFoundError,
  isNextjsRedirectError,
  isNextjsUnauthorizedError,
  isRedirectToSignInError,
  isRedirectToSignUpError,
  nextjsRedirectError,
  redirectToSignInError,
  redirectToSignUpError,
  unauthorized,
} from './nextErrors';
import type { AuthProtect } from './protect';
import { createProtect } from './protect';
import type { NextMiddlewareEvtParam, NextMiddlewareRequestParam, NextMiddlewareReturn } from './types';
import {
  assertKey,
  decorateRequest,
  handleMultiDomainAndProxy,
  redirectAdapter,
  setRequestHeadersOnNextResponse,
} from './utils';

export type ClerkMiddlewareSessionAuthObject = (SignedInAuthObject | SignedOutAuthObject) & {
  redirectToSignIn: RedirectFun<Response>;
  redirectToSignUp: RedirectFun<Response>;
};

/**
 * @deprecated Use `ClerkMiddlewareSessionAuthObject` instead.
 */
export type ClerkMiddlewareAuthObject = ClerkMiddlewareSessionAuthObject;

export type ClerkMiddlewareAuth = AuthFn;

type ClerkMiddlewareHandler = (
  auth: ClerkMiddlewareAuth,
  request: NextMiddlewareRequestParam,
  event: NextMiddlewareEvtParam,
) => NextMiddlewareReturn;

type AuthenticateAnyRequestOptions = Omit<AuthenticateRequestOptions, 'acceptsToken'>;

/**
 * The `clerkMiddleware()` function accepts an optional object. The following options are available.
 * @interface
 */
export interface ClerkMiddlewareOptions extends AuthenticateAnyRequestOptions {
  /**
   * If true, additional debug information will be logged to the console.
   */
  debug?: boolean;

  /**
   * When set, automatically injects a Content-Security-Policy header(s) compatible with Clerk.
   */
  contentSecurityPolicy?: ContentSecurityPolicyOptions;
}

type ClerkMiddlewareOptionsCallback = (req: NextRequest) => ClerkMiddlewareOptions | Promise<ClerkMiddlewareOptions>;

/**
 * Middleware for Next.js that handles authentication and authorization with Clerk.
 * For more details, please refer to the docs: https://clerk.com/docs/reference/nextjs/clerk-middleware
 */
interface ClerkMiddleware {
  /**
   * @example
   * export default clerkMiddleware((auth, request, event) => { ... }, options);
   */
  (handler: ClerkMiddlewareHandler, options?: ClerkMiddlewareOptions): NextMiddleware;

  /**
   * @example
   * export default clerkMiddleware((auth, request, event) => { ... }, (req) => options);
   */
  (handler: ClerkMiddlewareHandler, options?: ClerkMiddlewareOptionsCallback): NextMiddleware;

  /**
   * @example
   * export default clerkMiddleware(options);
   */
  (options?: ClerkMiddlewareOptions): NextMiddleware;

  /**
   * @example
   * export default clerkMiddleware;
   */
  (request: NextMiddlewareRequestParam, event: NextMiddlewareEvtParam): NextMiddlewareReturn;
}

/**
 * The `clerkMiddleware()` helper integrates Clerk authentication into your Next.js application through Middleware. `clerkMiddleware()` is compatible with both the App and Pages routers.
 */
export const clerkMiddleware = ((...args: unknown[]): NextMiddleware | NextMiddlewareReturn => {
  const [request, event] = parseRequestAndEvent(args);
  const [handler, params] = parseHandlerAndOptions(args);

  const middleware = clerkMiddlewareRequestDataStorage.run(clerkMiddlewareRequestDataStore, () => {
    const baseNextMiddleware: NextMiddleware = withLogger('clerkMiddleware', logger => async (request, event) => {
      // Handles the case where `options` is a callback function to dynamically access `NextRequest`
      const resolvedParams = typeof params === 'function' ? await params(request) : params;

      const keyless = await getKeylessCookieValue(name => request.cookies.get(name)?.value);

      const publishableKey = assertKey(
        resolvedParams.publishableKey || PUBLISHABLE_KEY || keyless?.publishableKey,
        () => errorThrower.throwMissingPublishableKeyError(),
      );

      const secretKey = assertKey(resolvedParams.secretKey || SECRET_KEY || keyless?.secretKey, () =>
        errorThrower.throwMissingSecretKeyError(),
      );
      const signInUrl = resolvedParams.signInUrl || SIGN_IN_URL;
      const signUpUrl = resolvedParams.signUpUrl || SIGN_UP_URL;

      const options = {
        publishableKey,
        secretKey,
        signInUrl,
        signUpUrl,
        ...resolvedParams,
      };

      // Propagates the request data to be accessed on the server application runtime from helpers such as `clerkClient`
      clerkMiddlewareRequestDataStore.set('requestData', options);
      const resolvedClerkClient = await clerkClient();

      if (options.debug) {
        logger.enable();
      }
      const clerkRequest = createClerkRequest(request);
      logger.debug('options', options);
      logger.debug('url', () => clerkRequest.toJSON());

      const authHeader = request.headers.get(constants.Headers.Authorization);
      if (authHeader && authHeader.startsWith('Basic ')) {
        logger.debug('Basic Auth detected');
      }

      const cspHeader = request.headers.get(constants.Headers.ContentSecurityPolicy);
      if (cspHeader) {
        logger.debug('Content-Security-Policy detected', () => ({
          value: cspHeader,
        }));
      }

      const requestState = await resolvedClerkClient.authenticateRequest(
        clerkRequest,
        createAuthenticateRequestOptions(clerkRequest, options),
      );

      logger.debug('requestState', () => ({
        status: requestState.status,
        headers: JSON.stringify(Object.fromEntries(requestState.headers)),
        reason: requestState.reason,
      }));

      const locationHeader = requestState.headers.get(constants.Headers.Location);
      if (locationHeader) {
        const res = NextResponse.redirect(locationHeader);
        requestState.headers.forEach((value, key) => {
          if (key === constants.Headers.Location) {
            return;
          }
          res.headers.append(key, value);
        });
        return res;
      } else if (requestState.status === AuthStatus.Handshake) {
        throw new Error('Clerk: handshake status without redirect');
      }

      const authObject = requestState.toAuth();
      logger.debug('auth', () => ({ auth: authObject, debug: authObject.debug() }));

      const redirectToSignIn = createMiddlewareRedirectToSignIn(clerkRequest);
      const redirectToSignUp = createMiddlewareRedirectToSignUp(clerkRequest);
      const protect = await createMiddlewareProtect(clerkRequest, authObject, redirectToSignIn);

      const authHandler = createMiddlewareAuthHandler(requestState, redirectToSignIn, redirectToSignUp);
      authHandler.protect = protect;

      let handlerResult: Response = NextResponse.next();
      try {
        const userHandlerResult = await clerkMiddlewareRequestDataStorage.run(
          clerkMiddlewareRequestDataStore,
          async () => handler?.(authHandler, request, event),
        );
        handlerResult = userHandlerResult || handlerResult;
      } catch (e: any) {
        handlerResult = handleControlFlowErrors(e, clerkRequest, request, requestState);
      }
      if (options.contentSecurityPolicy) {
        const { headers } = createContentSecurityPolicyHeaders(
          (parsePublishableKey(publishableKey)?.frontendApi ?? '').replace('$', ''),
          options.contentSecurityPolicy,
        );

        headers.forEach(([key, value]) => {
          setHeader(handlerResult, key, value);
        });

        logger.debug('Clerk generated CSP', () => ({
          headers,
        }));
      }

      // TODO @nikos: we need to make this more generic
      // and move the logic in clerk/backend
      if (requestState.headers) {
        requestState.headers.forEach((value, key) => {
          if (key === constants.Headers.ContentSecurityPolicy) {
            logger.debug('Content-Security-Policy detected', () => ({
              value,
            }));
          }
          handlerResult.headers.append(key, value);
        });
      }

      if (isRedirect(handlerResult)) {
        logger.debug('handlerResult is redirect');
        return serverRedirectWithAuth(clerkRequest, handlerResult, options);
      }

      if (options.debug) {
        setRequestHeadersOnNextResponse(handlerResult, clerkRequest, { [constants.Headers.EnableDebug]: 'true' });
      }

      const keylessKeysForRequestData =
        // Only pass keyless credentials when there are no explicit keys
        secretKey === keyless?.secretKey
          ? {
              publishableKey: keyless?.publishableKey,
              secretKey: keyless?.secretKey,
            }
          : {};

      decorateRequest(
        clerkRequest,
        handlerResult,
        requestState,
        resolvedParams,
        keylessKeysForRequestData,
        authObject.tokenType === 'session_token' ? null : makeAuthObjectSerializable(authObject),
      );

      return handlerResult;
    });

    const keylessMiddleware: NextMiddleware = async (request, event) => {
      /**
       * This mechanism replaces a full-page reload. Ensures that middleware will re-run and authenticate the request properly without the secret key or publishable key to be missing.
       */
      if (isKeylessSyncRequest(request)) {
        return returnBackFromKeylessSync(request);
      }

      const resolvedParams = typeof params === 'function' ? await params(request) : params;
      const keyless = await getKeylessCookieValue(name => request.cookies.get(name)?.value);

      const isMissingPublishableKey = !(resolvedParams.publishableKey || PUBLISHABLE_KEY || keyless?.publishableKey);
      const authHeader = getHeader(request, constants.Headers.Authorization)?.replace('Bearer ', '') ?? '';

      /**
       * In keyless mode, if the publishable key is missing, let the request through, to render `<ClerkProvider/>` that will resume the flow gracefully.
       */
      if (isMissingPublishableKey && !isMachineTokenByPrefix(authHeader)) {
        const res = NextResponse.next();
        setRequestHeadersOnNextResponse(res, request, {
          [constants.Headers.AuthStatus]: 'signed-out',
        });
        return res;
      }

      return baseNextMiddleware(request, event);
    };

    const nextMiddleware: NextMiddleware = async (request, event) => {
      if (canUseKeyless) {
        return keylessMiddleware(request, event);
      }

      return baseNextMiddleware(request, event);
    };

    // If we have a request and event, we're being called as a middleware directly
    // eg, export default clerkMiddleware;
    if (request && event) {
      return nextMiddleware(request, event);
    }

    // Otherwise, return a middleware that can be called with a request and event
    // eg, export default clerkMiddleware(auth => { ... });
    return nextMiddleware;
  });

  return middleware;
}) as ClerkMiddleware;

const parseRequestAndEvent = (args: unknown[]) => {
  return [args[0] instanceof Request ? args[0] : undefined, args[0] instanceof Request ? args[1] : undefined] as [
    NextMiddlewareRequestParam | undefined,
    NextMiddlewareEvtParam | undefined,
  ];
};

const parseHandlerAndOptions = (args: unknown[]) => {
  return [
    typeof args[0] === 'function' ? args[0] : undefined,
    (args.length === 2 ? args[1] : typeof args[0] === 'function' ? {} : args[0]) || {},
  ] as [ClerkMiddlewareHandler | undefined, ClerkMiddlewareOptions | ClerkMiddlewareOptionsCallback];
};

const isKeylessSyncRequest = (request: NextMiddlewareRequestParam) =>
  request.nextUrl.pathname === '/clerk-sync-keyless';

const returnBackFromKeylessSync = (request: NextMiddlewareRequestParam) => {
  const returnUrl = request.nextUrl.searchParams.get('returnUrl');
  const url = new URL(request.url);
  url.pathname = '';

  return NextResponse.redirect(returnUrl || url.toString());
};

type AuthenticateRequest = Pick<ClerkClient, 'authenticateRequest'>['authenticateRequest'];

export const createAuthenticateRequestOptions = (
  clerkRequest: ClerkRequest,
  options: ClerkMiddlewareOptions,
): Parameters<AuthenticateRequest>[1] => {
  return {
    ...options,
    ...handleMultiDomainAndProxy(clerkRequest, options),
    // TODO: Leaving the acceptsToken as 'any' opens up the possibility of
    // an economic attack. We should revisit this and only verify a token
    // when auth() or auth.protect() is invoked.
    acceptsToken: 'any',
  };
};

const createMiddlewareRedirectToSignIn = (
  clerkRequest: ClerkRequest,
): ClerkMiddlewareSessionAuthObject['redirectToSignIn'] => {
  return (opts = {}) => {
    const url = clerkRequest.clerkUrl.toString();
    redirectToSignInError(url, opts.returnBackUrl);
  };
};

const createMiddlewareRedirectToSignUp = (
  clerkRequest: ClerkRequest,
): ClerkMiddlewareSessionAuthObject['redirectToSignUp'] => {
  return (opts = {}) => {
    const url = clerkRequest.clerkUrl.toString();
    redirectToSignUpError(url, opts.returnBackUrl);
  };
};

const createMiddlewareProtect = (
  clerkRequest: ClerkRequest,
  rawAuthObject: AuthObject,
  redirectToSignIn: RedirectFun<Response>,
) => {
  return (async (params: any, options: any) => {
    const notFound = () => nextjsNotFound();

    const redirect = (url: string) =>
      nextjsRedirectError(url, {
        redirectUrl: url,
      });

    const requestedToken = params?.token || options?.token || TokenType.SessionToken;
    const authObject = getAuthObjectForAcceptedToken({ authObject: rawAuthObject, acceptsToken: requestedToken });

    return createProtect({
      request: clerkRequest,
      redirect,
      notFound,
      unauthorized,
      authObject,
      redirectToSignIn,
    })(params, options);
  }) as unknown as Promise<AuthProtect>;
};

/**
 * Modifies the auth object based on the token type.
 * - For session tokens: adds redirect functions to the auth object
 * - For machine tokens: validates token type and returns appropriate auth object
 */
const createMiddlewareAuthHandler = (
  requestState: AuthenticatedState<'session_token'> | UnauthenticatedState<'session_token'>,
  redirectToSignIn: RedirectFun<Response>,
  redirectToSignUp: RedirectFun<Response>,
): ClerkMiddlewareAuth => {
  const authHandler = async (options?: GetAuthOptions) => {
    const rawAuthObject = requestState.toAuth({ treatPendingAsSignedOut: options?.treatPendingAsSignedOut });
    const acceptsToken = options?.acceptsToken ?? TokenType.SessionToken;

    const authObject = getAuthObjectForAcceptedToken({
      authObject: rawAuthObject,
      acceptsToken,
    });

    if (authObject.tokenType === TokenType.SessionToken && isTokenTypeAccepted(TokenType.SessionToken, acceptsToken)) {
      return Object.assign(authObject, {
        redirectToSignIn,
        redirectToSignUp,
      });
    }

    return authObject;
  };

  return authHandler as ClerkMiddlewareAuth;
};

// Handle errors thrown by protect() and redirectToSignIn() calls,
// as we want to align the APIs between middleware, pages and route handlers
// Normally, middleware requires to explicitly return a response, but we want to
// avoid discrepancies between the APIs as it's easy to miss the `return` statement
// especially when copy-pasting code from one place to another.
// This function handles the known errors thrown by the APIs described above,
// and returns the appropriate response.
const handleControlFlowErrors = (
  e: any,
  clerkRequest: ClerkRequest,
  nextRequest: NextRequest,
  requestState: RequestState,
): Response => {
  if (isNextjsUnauthorizedError(e)) {
    const response = new NextResponse(null, { status: 401 });

    // RequestState.toAuth() returns a session_token type by default.
    // We need to cast it to the correct type to check for OAuth tokens.
    const authObject = (requestState as RequestState<TokenType>).toAuth();
    if (authObject && authObject.tokenType === TokenType.OAuthToken) {
      // Following MCP spec, we return WWW-Authenticate header on 401 responses
      // to enable OAuth 2.0 authorization server discovery (RFC9728).
      // See https://modelcontextprotocol.io/specification/draft/basic/authorization#2-3-1-authorization-server-location
      const publishableKey = parsePublishableKey(requestState.publishableKey);
      return setHeader(
        response,
        'WWW-Authenticate',
        `Bearer resource_metadata="https://${publishableKey?.frontendApi}/.well-known/oauth-protected-resource"`,
      );
    }

    return response;
  }

  if (isNextjsNotFoundError(e)) {
    // Rewrite to a bogus URL to force not found error
    return setHeader(
      // This is an internal rewrite purely to trigger a not found error. We do not want Next.js to think that the
      // destination URL is a valid page, so we use `nextRequest.url` as the base for the fake URL, which Next.js
      // understands is an internal URL and won't run middleware against the request.
      NextResponse.rewrite(new URL(`/clerk_${Date.now()}`, nextRequest.url)),
      constants.Headers.AuthReason,
      'protect-rewrite',
    );
  }

  const isRedirectToSignIn = isRedirectToSignInError(e);
  const isRedirectToSignUp = isRedirectToSignUpError(e);

  if (isRedirectToSignIn || isRedirectToSignUp) {
    const redirect = createRedirect({
      redirectAdapter,
      baseUrl: clerkRequest.clerkUrl,
      signInUrl: requestState.signInUrl,
      signUpUrl: requestState.signUpUrl,
      publishableKey: requestState.publishableKey,
      sessionStatus: requestState.toAuth()?.sessionStatus,
    });

    const { returnBackUrl } = e;
    return redirect[isRedirectToSignIn ? 'redirectToSignIn' : 'redirectToSignUp']({ returnBackUrl });
  }

  if (isNextjsRedirectError(e)) {
    return redirectAdapter(e.redirectUrl);
  }

  throw e;
};
