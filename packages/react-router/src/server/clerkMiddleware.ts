import type { AuthObject } from '@clerk/backend';
import type { RequestState } from '@clerk/backend/internal';
import { AuthStatus, constants, createClerkRequest } from '@clerk/backend/internal';
import { handleNetlifyCacheInDevInstance } from '@clerk/shared/netlifyCacheHandler';
import type { PendingSessionOptions } from '@clerk/shared/types';
import type { MiddlewareFunction } from 'react-router';
import { createContext } from 'react-router';

import { clerkClient } from './clerkClient';
import { resolveKeysWithKeylessFallback } from './keyless/utils';
import { loadOptions } from './loadOptions';
import type { ClerkMiddlewareOptions, RequestStateWithRedirectUrls } from './types';
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

    const {
      publishableKey,
      secretKey,
      claimUrl: __keylessClaimUrl,
      apiKeysUrl: __keylessApiKeysUrl,
    } = await resolveKeysWithKeylessFallback(loadedOptions.publishableKey, loadedOptions.secretKey, args, options);

    if (publishableKey) {
      loadedOptions.publishableKey = publishableKey;
    }
    if (secretKey) {
      loadedOptions.secretKey = secretKey;
    }

    // Pick only the properties needed by authenticateRequest.
    // Used when manually providing options to the middleware.
    const {
      apiUrl,
      jwtKey,
      proxyUrl,
      isSatellite,
      domain,
      machineSecretKey,
      audience,
      authorizedParties,
      signInUrl,
      signUpUrl,
      organizationSyncOptions,
    } = loadedOptions;

    const requestState = await clerkClient(args, options).authenticateRequest(clerkRequest, {
      apiUrl,
      secretKey: loadedOptions.secretKey,
      jwtKey,
      proxyUrl,
      isSatellite,
      domain,
      publishableKey: loadedOptions.publishableKey,
      machineSecretKey,
      audience,
      authorizedParties,
      organizationSyncOptions,
      signInUrl,
      signUpUrl,
      acceptsToken: 'any',
    });

    const requestStateWithKeyless = Object.assign(requestState, {
      __keylessClaimUrl,
      __keylessApiKeysUrl,
    }) as RequestStateWithRedirectUrls;

    const locationHeader = requestStateWithKeyless.headers.get(constants.Headers.Location);
    if (locationHeader) {
      handleNetlifyCacheInDevInstance({
        locationHeader,
        requestStateHeaders: requestStateWithKeyless.headers,
        publishableKey: requestStateWithKeyless.publishableKey,
      });
      // Trigger a handshake redirect
      return new Response(null, { status: 307, headers: requestStateWithKeyless.headers });
    }

    if (requestStateWithKeyless.status === AuthStatus.Handshake) {
      throw new Error('Clerk: handshake status without redirect');
    }

    args.context.set(authFnContext, (opts?: PendingSessionOptions) => requestStateWithKeyless.toAuth(opts));
    args.context.set(requestStateContext, requestStateWithKeyless);

    const response = await next();

    if (requestStateWithKeyless.headers) {
      requestStateWithKeyless.headers.forEach((value, key) => {
        response.headers.append(key, value);
      });
    }

    return response;
  };
};
