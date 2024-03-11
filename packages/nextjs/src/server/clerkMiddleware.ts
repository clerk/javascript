import type {
  AuthenticateRequestOptions,
  AuthObject,
  ClerkRequest,
  RedirectFun,
  RequestState,
} from '@clerk/backend/internal';
import { AuthStatus, constants, createClerkRequest, createRedirect } from '@clerk/backend/internal';
import type { NextMiddleware } from 'next/server';
import { NextResponse } from 'next/server';

import { isRedirect, serverRedirectWithAuth, setHeader } from '../utils';
import { clerkClient } from './clerkClient';
import { PUBLISHABLE_KEY, SECRET_KEY } from './constants';
import type { AuthProtect } from './protect';
import { createProtect } from './protect';
import type { NextMiddlewareEvtParam, NextMiddlewareRequestParam, NextMiddlewareReturn } from './types';
import { decorateRequest, handleMultiDomainAndProxy, setRequestHeadersOnNextResponse } from './utils';

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
 * For more details, please refer to the docs: https://clerk.com/docs/references/nextjs/clerkMiddleware
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

export const clerkMiddleware: ClerkMiddleware = (...args: unknown[]): any => {
  const [request, event] = parseRequestAndEvent(args);
  const [handler, options] = parseHandlerAndOptions(args);

  const nextMiddleware: NextMiddleware = async (request, event) => {
    const clerkRequest = createClerkRequest(request);

    const requestState = await clerkClient.authenticateRequest(
      clerkRequest,
      createAuthenticateRequestOptions(clerkRequest, options),
    );

    const locationHeader = requestState.headers.get(constants.Headers.Location);
    if (locationHeader) {
      return new Response(null, { status: 307, headers: requestState.headers });
    } else if (requestState.status === AuthStatus.Handshake) {
      throw new Error('Clerk: handshake status without redirect');
    }

    const authObject = requestState.toAuth();

    const redirectToSignIn = createMiddlewareRedirectToSignIn(clerkRequest);
    const protect = createMiddlewareProtect(clerkRequest, authObject, redirectToSignIn);
    const authObjWithMethods: ClerkMiddlewareAuthObject = Object.assign(authObject, { protect, redirectToSignIn });

    let handlerResult: Response = NextResponse.next();
    try {
      handlerResult = (await handler?.(() => authObjWithMethods, request, event)) || handlerResult;
    } catch (e: any) {
      handlerResult = handleControlFlowErrors(e, clerkRequest, requestState);
    }

    if (isRedirect(handlerResult)) {
      return serverRedirectWithAuth(clerkRequest, handlerResult, options);
    }

    if (options.debug) {
      setRequestHeadersOnNextResponse(handlerResult, clerkRequest, { [constants.Headers.EnableDebug]: 'true' });
    }

    decorateRequest(clerkRequest, handlerResult, requestState);

    // TODO @nikos: we need to make this more generic
    // and move the logic in clerk/backend
    if (requestState.headers) {
      requestState.headers.forEach((value, key) => {
        handlerResult.headers.append(key, value);
      });
    }

    return handlerResult;
  };

  // If we have a request and event, we're being called as a middleware directly
  // eg, export default clerkMiddleware;
  if (request && event) {
    return nextMiddleware(request, event);
  }

  // Otherwise, return a middleware that can be called with a request and event
  // eg, export default clerkMiddleware(auth => { ... });
  return nextMiddleware;
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
  ] as [ClerkMiddlewareHandler | undefined, ClerkMiddlewareOptions];
};

export const createAuthenticateRequestOptions = (clerkRequest: ClerkRequest, options: ClerkMiddlewareOptions) => {
  return {
    ...options,
    secretKey: options.secretKey || SECRET_KEY,
    publishableKey: options.publishableKey || PUBLISHABLE_KEY,
    ...handleMultiDomainAndProxy(clerkRequest, options),
  };
};

const redirectAdapter = (url: string | URL) => {
  return NextResponse.redirect(url, { headers: { [constants.Headers.ClerkRedirectTo]: 'true' } });
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
        publishableKey: PUBLISHABLE_KEY,
      }).redirectToSignIn({ returnBackUrl: e.returnBackUrl });
    default:
      throw e;
  }
};
