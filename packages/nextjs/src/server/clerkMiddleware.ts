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
import {
  decorateRequest,
  decorateResponseWithObservabilityHeaders,
  handleMultiDomainAndProxy,
  setRequestHeadersOnNextResponse,
} from './utils';

const PROTECT_REWRITE = 'CLERK_PROTECT_REWRITE';
const PROTECT_REDIRECT_TO_URL = 'CLERK_PROTECT_REDIRECT_TO_URL';
const PROTECT_REDIRECT_TO_SIGN_IN = 'CLERK_PROTECT_REDIRECT_TO_SIGN_IN';

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
      const res = new Response(null, { status: 307, headers: requestState.headers });
      return decorateResponseWithObservabilityHeaders(res, requestState);
    } else if (requestState.status === AuthStatus.Handshake) {
      throw new Error('Clerk: handshake status without redirect');
    }

    const authObject = requestState.toAuth();

    const authObjWithMethods: ClerkMiddlewareAuthObject = Object.assign(authObject, {
      protect: createMiddlewareProtect(clerkRequest, authObject),
      redirectToSignIn: createMiddlewareRedirectToSignIn(clerkRequest, requestState),
    });

    let handlerResult: Response = NextResponse.next();
    try {
      handlerResult = (await handler?.(() => authObjWithMethods, request, event)) || handlerResult;
    } catch (e: any) {
      switch (e.message) {
        case PROTECT_REWRITE:
          // Rewrite to a bogus URL to force not found error
          handlerResult = NextResponse.rewrite(`${clerkRequest.clerkUrl.origin}/clerk_${Date.now()}`);
          setHeader(handlerResult, constants.Headers.AuthReason, 'protect-rewrite');
          break;
        case PROTECT_REDIRECT_TO_URL:
          handlerResult = redirectAdapter(e.redirectUrl);
          break;
        case PROTECT_REDIRECT_TO_SIGN_IN:
          handlerResult = authObjWithMethods.redirectToSignIn();
          break;
        default:
          throw e;
      }
    }

    if (isRedirect(handlerResult)) {
      const res = setHeader(handlerResult, constants.Headers.AuthReason, 'redirect');
      return serverRedirectWithAuth(clerkRequest, res, options);
    }

    if (options.debug) {
      setRequestHeadersOnNextResponse(handlerResult, clerkRequest, { [constants.Headers.EnableDebug]: 'true' });
    }

    decorateRequest(clerkRequest, handlerResult, requestState);
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
  requestState: RequestState,
): ClerkMiddlewareAuthObject['redirectToSignIn'] => {
  return (opts = {}) => {
    return createRedirect({
      redirectAdapter,
      baseUrl: clerkRequest.clerkUrl,
      signInUrl: requestState.signInUrl,
      signUpUrl: requestState.signUpUrl,
      publishableKey: PUBLISHABLE_KEY,
    }).redirectToSignIn({
      returnBackUrl: opts.returnBackUrl === null ? '' : opts.returnBackUrl || clerkRequest.clerkUrl.toString(),
    });
  };
};

const createMiddlewareProtect = (
  clerkRequest: ClerkRequest,
  authObject: AuthObject,
): ClerkMiddlewareAuthObject['protect'] => {
  return ((params, options) => {
    const notFound = () => {
      throw new Error(PROTECT_REWRITE) as any;
    };

    const redirect = (url: string) => {
      const err = new Error(PROTECT_REDIRECT_TO_URL) as any;
      err.redirectUrl = url;
      throw err;
    };

    const redirectToSignIn = () => {
      throw new Error(PROTECT_REDIRECT_TO_SIGN_IN) as any;
    };

    // @ts-expect-error TS is not happy even though the types are correct
    return createProtect({ request: clerkRequest, redirect, notFound, authObject, redirectToSignIn })(params, options);
  }) as AuthProtect;
};
