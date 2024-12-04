import type { AuthObject, ClerkClient } from '@clerk/backend';
import type { AuthenticateRequestOptions, ClerkRequest, RedirectFun, RequestState } from '@clerk/backend/internal';
import { AuthStatus, constants, createClerkRequest, createRedirect } from '@clerk/backend/internal';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { NextMiddleware, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { isRedirect, serverRedirectWithAuth, setHeader } from '../utils';
import { withLogger } from '../utils/debugLogger';
import { canUseKeyless__server } from '../utils/feature-flags';
import { clerkClient } from './clerkClient';
import { PUBLISHABLE_KEY, SECRET_KEY, SIGN_IN_URL, SIGN_UP_URL } from './constants';
import { errorThrower } from './errorThrower';
import { getKeylessCookieValue } from './keyless';
import { clerkMiddlewareRequestDataStorage, clerkMiddlewareRequestDataStore } from './middleware-storage';
import {
  isNextjsNotFoundError,
  isNextjsRedirectError,
  isRedirectToSignInError,
  nextjsNotFound,
  nextjsRedirectError,
  redirectToSignInError,
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

export type ClerkMiddlewareAuthObject = AuthObject & {
  redirectToSignIn: RedirectFun<Response>;
};

export interface ClerkMiddlewareAuth {
  (): Promise<ClerkMiddlewareAuthObject>;

  protect: AuthProtect;
}

type ClerkMiddlewareHandler = (
  auth: ClerkMiddlewareAuth,
  request: NextMiddlewareRequestParam,
  event: NextMiddlewareEvtParam,
) => NextMiddlewareReturn;

export type ClerkMiddlewareOptions = AuthenticateRequestOptions & {
  debug?: boolean;
};

type ClerkMiddlewareOptionsCallback = (req: NextRequest) => ClerkMiddlewareOptions;

/**
 * Middleware for Next.js that handles authentication and authorization with Clerk.
 * For more details, please refer to the docs: https://clerk.com/docs/references/nextjs/clerk-middleware
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

// @ts-expect-error TS is not happy here. Will dig into it
export const clerkMiddleware: ClerkMiddleware = (...args: unknown[]) => {
  const [request, event] = parseRequestAndEvent(args);
  const [handler, params] = parseHandlerAndOptions(args);

  return clerkMiddlewareRequestDataStorage.run(clerkMiddlewareRequestDataStore, () => {
    const baseNextMiddleware: NextMiddleware = withLogger('clerkMiddleware', logger => async (request, event) => {
      // Handles the case where `options` is a callback function to dynamically access `NextRequest`
      const resolvedParams = typeof params === 'function' ? params(request) : params;

      const keyless = getKeylessCookieValue(name => request.cookies.get(name)?.value);

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

      resolvedClerkClient.telemetry.record(
        eventMethodCalled('clerkMiddleware', {
          handler: Boolean(handler),
          satellite: Boolean(options.isSatellite),
          proxy: Boolean(options.proxyUrl),
        }),
      );

      if (options.debug) {
        logger.enable();
      }
      const clerkRequest = createClerkRequest(request);
      logger.debug('options', options);
      logger.debug('url', () => clerkRequest.toJSON());

      const requestState = await resolvedClerkClient.authenticateRequest(
        clerkRequest,
        createAuthenticateRequestOptions(clerkRequest, options),
      );

      logger.debug('requestState', () => ({
        status: requestState.status,
        // @ts-expect-error : FIXME
        headers: JSON.stringify(Object.fromEntries(requestState.headers)),
        reason: requestState.reason,
      }));

      const locationHeader = requestState.headers.get(constants.Headers.Location);
      if (locationHeader) {
        return new Response(null, { status: 307, headers: requestState.headers });
      } else if (requestState.status === AuthStatus.Handshake) {
        throw new Error('Clerk: handshake status without redirect');
      }

      const authObject = requestState.toAuth();
      logger.debug('auth', () => ({ auth: authObject, debug: authObject.debug() }));

      const redirectToSignIn = createMiddlewareRedirectToSignIn(clerkRequest);
      const protect = await createMiddlewareProtect(clerkRequest, authObject, redirectToSignIn);

      const authObjWithMethods: ClerkMiddlewareAuthObject = Object.assign(authObject, { redirectToSignIn });
      const authHandler = () => Promise.resolve(authObjWithMethods);
      authHandler.protect = protect;

      let handlerResult: Response = NextResponse.next();
      try {
        const userHandlerResult = await clerkMiddlewareRequestDataStorage.run(
          clerkMiddlewareRequestDataStore,
          async () => handler?.(authHandler, request, event),
        );
        handlerResult = userHandlerResult || handlerResult;
      } catch (e: any) {
        handlerResult = handleControlFlowErrors(e, clerkRequest, requestState);
      }

      // TODO @nikos: we need to make this more generic
      // and move the logic in clerk/backend
      if (requestState.headers) {
        requestState.headers.forEach((value, key) => {
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

      decorateRequest(clerkRequest, handlerResult, requestState, { ...resolvedParams, ...options });

      return handlerResult;
    });

    const nextMiddleware: NextMiddleware = async (request, event) => {
      if (!canUseKeyless__server) {
        return baseNextMiddleware(request, event);
      }

      const isSyncKeyless = request.nextUrl.pathname === '/clerk-sync-keyless';
      if (isSyncKeyless) {
        const returnUrl = request.nextUrl.searchParams.get('returnUrl');
        const url = new URL(request.url);
        url.pathname = '';

        const response = new NextResponse(null, {
          status: 307,
          headers: { location: returnUrl || url.toString() },
        });
        return response;
      }

      const resolvedParams = typeof params === 'function' ? params(request) : params;

      const keyless = getKeylessCookieValue(name => request.cookies.get(name)?.value);

      const isMissingPublishableKey = !(resolvedParams.publishableKey || PUBLISHABLE_KEY || keyless?.publishableKey);

      if (isMissingPublishableKey) {
        const res = NextResponse.next();

        setRequestHeadersOnNextResponse(res, request, {
          [constants.Headers.AuthStatus]: 'signed-out',
        });

        return res;
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
};

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

type AuthenticateRequest = Pick<ClerkClient, 'authenticateRequest'>['authenticateRequest'];

export const createAuthenticateRequestOptions = (
  clerkRequest: ClerkRequest,
  options: ClerkMiddlewareOptions,
): Parameters<AuthenticateRequest>[1] => {
  return {
    ...options,
    ...handleMultiDomainAndProxy(clerkRequest, options),
  };
};

const createMiddlewareRedirectToSignIn = (
  clerkRequest: ClerkRequest,
): ClerkMiddlewareAuthObject['redirectToSignIn'] => {
  return (opts = {}) => {
    const url = clerkRequest.clerkUrl.toString();
    redirectToSignInError(url, opts.returnBackUrl);
  };
};

const createMiddlewareProtect = (
  clerkRequest: ClerkRequest,
  authObject: AuthObject,
  redirectToSignIn: RedirectFun<Response>,
) => {
  return (async (params: any, options: any) => {
    const notFound = () => nextjsNotFound();

    const redirect = (url: string) =>
      nextjsRedirectError(url, {
        redirectUrl: url,
      });

    return createProtect({ request: clerkRequest, redirect, notFound, authObject, redirectToSignIn })(params, options);
  }) as unknown as Promise<AuthProtect>;
};

// Handle errors thrown by protect() and redirectToSignIn() calls,
// as we want to align the APIs between middleware, pages and route handlers
// Normally, middleware requires to explicitly return a response, but we want to
// avoid discrepancies between the APIs as it's easy to miss the `return` statement
// especially when copy-pasting code from one place to another.
// This function handles the known errors thrown by the APIs described above,
// and returns the appropriate response.
const handleControlFlowErrors = (e: any, clerkRequest: ClerkRequest, requestState: RequestState): Response => {
  if (isNextjsNotFoundError(e)) {
    // Rewrite to a bogus URL to force not found error
    return setHeader(
      NextResponse.rewrite(`${clerkRequest.clerkUrl.origin}/clerk_${Date.now()}`),
      constants.Headers.AuthReason,
      'protect-rewrite',
    );
  }

  if (isRedirectToSignInError(e)) {
    return createRedirect({
      redirectAdapter,
      baseUrl: clerkRequest.clerkUrl,
      signInUrl: requestState.signInUrl,
      signUpUrl: requestState.signUpUrl,
      publishableKey: requestState.publishableKey,
    }).redirectToSignIn({ returnBackUrl: e.returnBackUrl });
  }

  if (isNextjsRedirectError(e)) {
    return redirectAdapter(e.redirectUrl);
  }

  throw e;
};
