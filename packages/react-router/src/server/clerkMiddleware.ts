import type { AuthObject } from '@clerk/backend';
import type { RequestState } from '@clerk/backend/internal';
import { AuthStatus, constants, createClerkRequest } from '@clerk/backend/internal';
import { logger } from '@clerk/shared/logger';
import { handleNetlifyCacheInDevInstance } from '@clerk/shared/netlifyCacheHandler';
import type { PendingSessionOptions } from '@clerk/shared/types';
import type { MiddlewareFunction } from 'react-router';
import { createContext } from 'react-router';

import { clerkClient } from './clerkClient';
import { resolveKeysWithKeylessFallback } from './keyless/utils';
import { loadOptions } from './loadOptions';
import { requestAuthStorage } from './requestAuthStorage';
import type { AdditionalStateOptions, ClerkMiddlewareOptions } from './types';
import { patchRequest } from './utils';

type RequestStateContextValue = {
  requestState: RequestState<any>;
  additionalState: AdditionalStateOptions;
};

export const authFnContext = createContext<((options?: PendingSessionOptions) => AuthObject) | null>(null);
export const requestStateContext = createContext<RequestStateContextValue | null>(null);

// Probe used to detect a React Router `context` that is reused across requests.
// React Router gives each request its own context, so this is unset on a fresh
// one; if a different request already stamped it, the app is sharing a single
// context across requests (commonly a custom server or getLoadContext that
// returns one RouterContextProvider). Auth stays correct regardless thanks to
// requestAuthStorage, but a shared context can still leak the app's own
// per-request values, so we warn once.
const sharedContextProbe = createContext<Request | null>(null);

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
    // Runs before the first await so the get/set is atomic per request: if the
    // context already carries a different request's marker, it is being shared.
    const probedRequest = args.context.get(sharedContextProbe);
    if (probedRequest && probedRequest !== args.request) {
      logger.warnOnce(
        'Clerk: The React Router `context` was reused across requests. clerkMiddleware() keeps each request\'s auth isolated, so sign-in state stays correct, but sharing one context across requests is unsupported and can leak your own per-request data. This usually comes from a custom server or `getLoadContext()` that returns a single RouterContextProvider; return a new RouterContextProvider() for each request instead.',
      );
    }
    args.context.set(sharedContextProbe, args.request);

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

    const authFn = (opts?: PendingSessionOptions) => requestState.toAuth(opts);
    const additionalState: AdditionalStateOptions = {
      __keylessClaimUrl,
      __keylessApiKeysUrl,
      signInForceRedirectUrl: loadedOptions.signInForceRedirectUrl,
      signUpForceRedirectUrl: loadedOptions.signUpForceRedirectUrl,
      signInFallbackRedirectUrl: loadedOptions.signInFallbackRedirectUrl,
      signUpFallbackRedirectUrl: loadedOptions.signUpFallbackRedirectUrl,
    };

    // Mirror the auth onto the React Router context for back-compat: anything
    // reading authFnContext / requestStateContext directly keeps working.
    args.context.set(authFnContext, authFn);
    args.context.set(requestStateContext, { requestState, additionalState });

    // Primary path: bind this request's auth to the async execution scope so
    // getAuth resolves it per-request even when the RR context is shared across
    // requests (see requestAuthStorage). next(), and every loader/action it
    // runs, executes inside this scope.
    return requestAuthStorage.run({ authFn, requestState, additionalState }, async () => {
      const response = await next();

      if (requestState.headers) {
        requestState.headers.forEach((value, key) => {
          response.headers.append(key, value);
        });
      }

      return response;
    });
  };
};
