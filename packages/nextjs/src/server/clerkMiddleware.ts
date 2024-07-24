import { AsyncLocalStorage } from 'node:async_hooks';

import type {
  AuthenticateRequestOptions,
  AuthObject,
  ClerkRequest,
  RedirectFun,
  RequestState,
} from '@clerk/backend/internal';
import { AuthStatus, constants, createClerkRequest, createRedirect } from '@clerk/backend/internal';
import { isClerkKeyError } from '@clerk/shared';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { NextMiddleware } from 'next/server';
import { NextResponse } from 'next/server';

import { isRedirect, serverRedirectWithAuth, setHeader } from '../utils';
import { withLogger } from '../utils/debugLogger';
import { clerkClient } from './clerkClient';
import { PUBLISHABLE_KEY, SECRET_KEY, SIGN_IN_URL, SIGN_UP_URL } from './constants';
import { errorThrower } from './errorThrower';
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

const CONTROL_FLOW_ERROR = {
  FORCE_NOT_FOUND: 'CLERK_PROTECT_REWRITE',
  REDIRECT_TO_URL: 'CLERK_PROTECT_REDIRECT_TO_URL',
  REDIRECT_TO_SIGN_IN: 'CLERK_PROTECT_REDIRECT_TO_SIGN_IN',
};

export type ClerkMiddlewareAuthObject = AuthObject & {
  protect: AuthProtect;
  redirectToSignIn: RedirectFun<Response>;
};

export type ClerkMiddlewareAuth = () => ClerkMiddlewareAuthObject;

type ClerkMiddlewareHandler = (
  auth: ClerkMiddlewareAuth,
  request: NextMiddlewareRequestParam,
  event: NextMiddlewareEvtParam,
) => NextMiddlewareReturn;

export type ClerkMiddlewareOptions = AuthenticateRequestOptions & { debug?: boolean };

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
   * export default clerkMiddleware(options);
   */
  (options?: ClerkMiddlewareOptions): NextMiddleware;
  /**
   * @example
   * export default clerkMiddleware;
   */
  (request: NextMiddlewareRequestParam, event: NextMiddlewareEvtParam): NextMiddlewareReturn;
}

export const clerkMiddlewareRequestDataStore = new AsyncLocalStorage<Partial<AuthenticateRequestOptions>>();

export const clerkMiddleware: ClerkMiddleware = withLogger('clerkMiddleware', logger => (...args: unknown[]): any => {
  const [request, event] = parseRequestAndEvent(args);
  const [handler, params] = parseHandlerAndOptions(args);
  if (params.debug) {
    logger.enable();
  }

  const publishableKey = params.publishableKey || PUBLISHABLE_KEY;
  const secretKey = params.secretKey || SECRET_KEY;
  const signInUrl = params.signInUrl || SIGN_IN_URL;
  const signUpUrl = params.signUpUrl || SIGN_UP_URL;

  const runOptions = {
    ...params,
    publishableKey,
    secretKey,
    signInUrl,
    signUpUrl,
  };

  const ephemeralMode = process.env.NODE_ENV === 'development' && (!params.publishableKey || !params.secretKey);
  let ephemeralPublishableKey: string | undefined;
  let ephemeralSecretKey: string | undefined;

  return clerkMiddlewareRequestDataStore.run(runOptions, () => {
    clerkClient().telemetry.record(
      eventMethodCalled('clerkMiddleware', {
        handler: Boolean(handler),
        satellite: Boolean(runOptions.isSatellite),
        proxy: Boolean(runOptions.proxyUrl),
      }),
    );

    const baseNextMiddleware: NextMiddleware = async (request, event) => {
      const publishableKey = assertKey(params.publishableKey || PUBLISHABLE_KEY || ephemeralPublishableKey || '', () =>
        errorThrower.throwMissingPublishableKeyError(),
      );
      const secretKey = assertKey(params.secretKey || SECRET_KEY || ephemeralSecretKey || '', () =>
        errorThrower.throwMissingSecretKeyError(),
      );

      const options = {
        ...runOptions,
        publishableKey,
        secretKey,
      };

      const clerkRequest = createClerkRequest(request);
      logger.debug('options', options);
      logger.debug('url', () => clerkRequest.toJSON());

      const requestState = await clerkClient().authenticateRequest(
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
        return new Response(null, { status: 307, headers: requestState.headers });
      } else if (requestState.status === AuthStatus.Handshake) {
        throw new Error('Clerk: handshake status without redirect');
      }

      const authObject = requestState.toAuth();
      logger.debug('auth', () => ({ auth: authObject, debug: authObject.debug() }));

      const redirectToSignIn = createMiddlewareRedirectToSignIn(clerkRequest);
      const protect = createMiddlewareProtect(clerkRequest, authObject, redirectToSignIn);
      const authObjWithMethods: ClerkMiddlewareAuthObject = Object.assign(authObject, { protect, redirectToSignIn });

      let handlerResult: Response = NextResponse.next();
      try {
        const userHandlerResult = await clerkMiddlewareRequestDataStore.run(options, async () =>
          handler?.(() => authObjWithMethods, request, event),
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

      decorateRequest(clerkRequest, handlerResult, requestState, params);

      return handlerResult;
    };

    const nextMiddleware: NextMiddleware = async (request, event) => {
      if (process.env.NODE_ENV !== 'development') {
        return await baseNextMiddleware(request, event);
      }

      try {
        if (ephemeralMode) {
          const params = Object.fromEntries(request.nextUrl.searchParams);
          const queryEphemeralPublishableKey = params[constants.QueryParameters.EphemeralPublishableKey];
          const queryEphemeralSecretKey = params[constants.QueryParameters.EphemeralSecretKey];

          if (queryEphemeralPublishableKey && ephemeralPublishableKey !== queryEphemeralPublishableKey) {
            ephemeralPublishableKey = queryEphemeralPublishableKey;
          }
          if (queryEphemeralSecretKey && ephemeralSecretKey !== queryEphemeralSecretKey) {
            ephemeralSecretKey = queryEphemeralSecretKey;
          }
        }

        const handlerResult = (await baseNextMiddleware(request, event)) as NextResponse;

        if (ephemeralMode) {
          // TODO: Set the cookie expiry to the same as the key
          handlerResult.cookies.set(constants.Cookies.EphemeralPublishableKey, ephemeralPublishableKey || '');
          handlerResult.cookies.set(constants.Cookies.EphemeralSecretKey, ephemeralSecretKey || '');
        } else {
          handlerResult.cookies.delete(constants.Cookies.EphemeralPublishableKey);
          handlerResult.cookies.delete(constants.Cookies.EphemeralSecretKey);
        }

        return handlerResult;
      } catch (e: any) {
        // And this is a clerkKeyError, return a no-op to allow the ClerkProvider to fetch the keys
        if (isClerkKeyError(e)) {
          return null;
        }
        throw e;
      }
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
});

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
  ] as [ClerkMiddlewareHandler | undefined, ClerkMiddlewareOptions];
};

export const createAuthenticateRequestOptions = (clerkRequest: ClerkRequest, options: ClerkMiddlewareOptions) => {
  return {
    ...options,
    ...handleMultiDomainAndProxy(clerkRequest, options),
  };
};

const createMiddlewareRedirectToSignIn = (
  clerkRequest: ClerkRequest,
): ClerkMiddlewareAuthObject['redirectToSignIn'] => {
  return (opts = {}) => {
    const err = new Error(CONTROL_FLOW_ERROR.REDIRECT_TO_SIGN_IN) as any;
    err.returnBackUrl = opts.returnBackUrl === null ? '' : opts.returnBackUrl || clerkRequest.clerkUrl.toString();
    throw err;
  };
};

const createMiddlewareProtect = (
  clerkRequest: ClerkRequest,
  authObject: AuthObject,
  redirectToSignIn: RedirectFun<Response>,
): ClerkMiddlewareAuthObject['protect'] => {
  return ((params, options) => {
    const notFound = () => {
      throw new Error(CONTROL_FLOW_ERROR.FORCE_NOT_FOUND) as any;
    };

    const redirect = (url: string) => {
      const err = new Error(CONTROL_FLOW_ERROR.REDIRECT_TO_URL) as any;
      err.redirectUrl = url;
      throw err;
    };

    // @ts-expect-error TS is not happy even though the types are correct
    return createProtect({ request: clerkRequest, redirect, notFound, authObject, redirectToSignIn })(params, options);
  }) as AuthProtect;
};

// Handle errors thrown by protect() and redirectToSignIn() calls,
// as we want to align the APIs between middleware, pages and route handlers
// Normally, middleware requires to explicitly return a response, but we want to
// avoid discrepancies between the APIs as it's easy to miss the `return` statement
// especially when copy-pasting code from one place to another.
// This function handles the known errors thrown by the APIs described above,
// and returns the appropriate response.
const handleControlFlowErrors = (e: any, clerkRequest: ClerkRequest, requestState: RequestState): Response => {
  switch (e.message) {
    case CONTROL_FLOW_ERROR.FORCE_NOT_FOUND:
      // Rewrite to a bogus URL to force not found error
      return setHeader(
        NextResponse.rewrite(`${clerkRequest.clerkUrl.origin}/clerk_${Date.now()}`),
        constants.Headers.AuthReason,
        'protect-rewrite',
      );
    case CONTROL_FLOW_ERROR.REDIRECT_TO_URL:
      return redirectAdapter(e.redirectUrl);
    case CONTROL_FLOW_ERROR.REDIRECT_TO_SIGN_IN:
      return createRedirect({
        redirectAdapter,
        baseUrl: clerkRequest.clerkUrl,
        signInUrl: requestState.signInUrl,
        signUpUrl: requestState.signUpUrl,
        publishableKey: requestState.publishableKey,
      }).redirectToSignIn({ returnBackUrl: e.returnBackUrl });
    default:
      throw e;
  }
};
