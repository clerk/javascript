import type { AuthenticateRequestOptions, ClerkRequest } from '@clerk/backend/internal';
import { AuthStatus, constants, createClerkRequest } from '@clerk/backend/internal';
import type { NextMiddleware } from 'next/server';
import { NextResponse } from 'next/server';

import { isRedirect, setHeader } from '../utils';
import { appendDevBrowserOnCrossOrigin } from '../utils/appendDevBrowserOnCrossOrigin';
import { clerkClient } from './clerkClient';
import { PUBLISHABLE_KEY, SECRET_KEY } from './constants';
import type { NextMiddlewareEvtParam, NextMiddlewareRequestParam, NextMiddlewareReturn } from './types';
import {
  decorateRequest,
  decorateResponseWithObservabilityHeaders,
  handleMultiDomainAndProxy,
  setRequestHeadersOnNextResponse,
} from './utils';

type ClerkMiddlewareAuthObject = {
  protect: () => any;
  redirectToSignIn: () => any;
};

type ClerkMiddlewareHandler = (
  auth: ClerkMiddlewareAuthObject,
  request: NextMiddlewareRequestParam,
  event: NextMiddlewareEvtParam,
) => NextMiddlewareReturn;

type ClerkMiddlewareOptions = AuthenticateRequestOptions & { debug?: boolean };

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

    const authObj = requestState.toAuth();
    const handlerResult = (await handler?.(authObj, clerkRequest, event)) || NextResponse.next();

    if (isRedirect(handlerResult)) {
      const res = setHeader(handlerResult, constants.Headers.AuthReason, 'redirect');
      return appendDevBrowserOnCrossOrigin(clerkRequest, res, options);
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
    args.length === 2 ? args[1] : typeof args[0] === 'function' ? {} : args[0],
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
