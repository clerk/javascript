import type { AuthObject } from '@clerk/backend';
import type { RequestState } from '@clerk/backend/internal';
import { AuthStatus, constants, createClerkRequest } from '@clerk/backend/internal';
import { handleNetlifyCacheInDevInstance } from '@clerk/shared/netlifyCacheHandler';
import type { PendingSessionOptions } from '@clerk/types';
import type { MiddlewareFunction } from 'react-router';
import { createContext } from 'react-router';

import { v8MiddlewareFlagError } from '../utils/errors';
import { clerkClient } from './clerkClient';
import { loadOptions } from './loadOptions';
import type { ClerkMiddlewareOptions } from './types';
import { IsOptIntoMiddleware, patchRequest } from './utils';

export const authFnContext = createContext<((options?: PendingSessionOptions) => AuthObject) | null>(null);
export const requestStateContext = createContext<RequestState<any> | null>(null);

/**
 * Middleware that integrates Clerk authentication into your React Router application.
 * It checks the request's cookies and headers for a session JWT and, if found,
 * attaches the Auth object to a context.
 *
 * @requires The `v8_middleware` future flag must be enabled in your config
 *
 * @example
 * // react-router.config.ts
 * export default {
 *   future: {
 *     v8_middleware: true,
 *   },
 * }
 *
 * // root.tsx
 * export const middleware: Route.MiddlewareFunction[] = [clerkMiddleware()]
 */
export const clerkMiddleware = (options?: ClerkMiddlewareOptions): MiddlewareFunction<Response> => {
  return async (args, next) => {
    if (!IsOptIntoMiddleware(args.context)) {
      throw new Error(v8MiddlewareFlagError);
    }

    const clerkRequest = createClerkRequest(patchRequest(args.request));
    const loadedOptions = loadOptions(args, options);
    const { audience, authorizedParties } = loadedOptions;
    const { signInUrl, signUpUrl, afterSignInUrl, afterSignUpUrl } = loadedOptions;
    const requestState = await clerkClient(args).authenticateRequest(clerkRequest, {
      audience,
      authorizedParties,
      signInUrl,
      signUpUrl,
      afterSignInUrl,
      afterSignUpUrl,
      acceptsToken: 'any',
    });

    const locationHeader = requestState.headers.get(constants.Headers.Location);
    if (locationHeader) {
      handleNetlifyCacheInDevInstance({
        locationHeader,
        requestStateHeaders: requestState.headers,
        publishableKey: requestState.publishableKey,
      });
      // Trigger a handshake redirect
      return new Response(null, { status: 307, headers: requestState.headers });
    }

    if (requestState.status === AuthStatus.Handshake) {
      throw new Error('Clerk: handshake status without redirect');
    }

    args.context.set(authFnContext, (options?: PendingSessionOptions) => requestState.toAuth(options));
    args.context.set(requestStateContext, requestState);

    const response = await next();

    if (requestState.headers) {
      requestState.headers.forEach((value, key) => {
        response.headers.append(key, value);
      });
    }

    return response;
  };
};
