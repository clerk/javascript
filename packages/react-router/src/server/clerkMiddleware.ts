import type { AuthObject } from '@clerk/backend';
import type { RequestState } from '@clerk/backend/internal';
import { AuthStatus, constants, createClerkRequest } from '@clerk/backend/internal';
import { handleNetlifyCacheInDevInstance } from '@clerk/shared/netlifyCacheHandler';
import type { PendingSessionOptions } from '@clerk/shared/types';
import type { MiddlewareFunction } from 'react-router';
import { createContext } from 'react-router';

import { clerkClient } from './clerkClient';
import { loadOptions } from './loadOptions';
import type { ClerkMiddlewareOptions } from './types';
import { patchRequest } from './utils';

export const authFnContext = createContext<((options?: PendingSessionOptions) => AuthObject) | null>(null);
export const requestStateContext = createContext<RequestState<any> | null>(null);

/**
 * Middleware that integrates Clerk authentication into your React Router application.
 * It checks the request's cookies and headers for a session JWT and, if found,
 * attaches the Auth object to a context.
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
    const clerkRequest = createClerkRequest(patchRequest(args.request));
    const loadedOptions = loadOptions(args, options);

    // Pick only the properties needed by authenticateRequest.
    // Used when manually providing options to the middleware.
    const {
      apiUrl,
      secretKey,
      jwtKey,
      proxyUrl,
      isSatellite,
      domain,
      publishableKey,
      machineSecretKey,
      audience,
      authorizedParties,
      signInUrl,
      signUpUrl,
      organizationSyncOptions,
    } = loadedOptions;

    const requestState = await clerkClient(args).authenticateRequest(clerkRequest, {
      apiUrl,
      secretKey,
      jwtKey,
      proxyUrl,
      isSatellite,
      domain,
      publishableKey,
      machineSecretKey,
      audience,
      authorizedParties,
      organizationSyncOptions,
      signInUrl,
      signUpUrl,
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
