import type { AuthObject } from '@clerk/backend';
import type { AuthenticateRequestOptions, RequestState } from '@clerk/backend/internal';
import { AuthStatus, constants, createClerkRequest } from '@clerk/backend/internal';
import { logger } from '@clerk/shared/logger';
import { handleNetlifyCacheInDevInstance } from '@clerk/shared/netlifyCacheHandler';
import type { PendingSessionOptions } from '@clerk/shared/types';
import type { MiddlewareFunction } from 'react-router';
import { createContext } from 'react-router';

import { clerkClient } from './clerkClient';
import { resolveKeysWithKeylessFallback } from './keyless/utils';
import { type DataFunctionArgs, loadOptions } from './loadOptions';
import type { AdditionalStateOptions, ClerkMiddlewareOptions } from './types';
import { IsOptIntoMiddleware, patchRequest } from './utils';

type RequestStateContextValue = {
  requestState: RequestState<any>;
  additionalState: AdditionalStateOptions;
};

export const authFnContext = createContext<((options?: PendingSessionOptions) => AuthObject) | null>(null);
export const requestStateContext = createContext<RequestStateContextValue | null>(null);
// Identity-free resolved options, reused by getAuth/rootAuthLoader to re-derive the request's user.
export const requestOptionsContext = createContext<AuthenticateRequestOptions | null>(null);
const sharedContextProbe = createContext<Request | null>(null);

const sharedContextMessage =
  "Clerk: The React Router `context` is being reused across requests. clerkMiddleware() resolves each request's auth from that request, so sign-in state stays correct, but sharing one context across requests is unsupported and can leak your application's own per-request data. This usually comes from a custom server or `getLoadContext()` that returns a single RouterContextProvider; return a new RouterContextProvider() for each request instead.";

/**
 * Re-derives the request's auth from `args.request` using the identity-free options
 * stashed by clerkMiddleware, so a shared context can never return another user.
 */
export async function authenticateFromRequest(
  args: DataFunctionArgs,
  acceptsToken: AuthenticateRequestOptions['acceptsToken'] = 'any',
): Promise<RequestState<any>> {
  const options = IsOptIntoMiddleware(args.context) ? args.context.get(requestOptionsContext) : null;
  if (!options) {
    throw new Error(
      'Clerk: clerkMiddleware() not detected. Make sure you have installed the clerkMiddleware in your root route.',
    );
  }

  return clerkClient(args, options).authenticateRequest(createClerkRequest(patchRequest(args.request)), {
    ...options,
    acceptsToken,
  });
}

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
    // A context reused across requests means the app is sharing one
    // RouterContextProvider. Auth stays correct (it is re-derived per request),
    // but a shared context can leak the app's own per-request data, so warn once.
    const probedRequest = args.context.get(sharedContextProbe);
    if (probedRequest && probedRequest !== args.request) {
      logger.warnOnce(sharedContextMessage);
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

    const authenticateOptions: AuthenticateRequestOptions = {
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
    };

    const requestState = await clerkClient(args, options).authenticateRequest(clerkRequest, authenticateOptions);

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

    const additionalState: AdditionalStateOptions = {
      __keylessClaimUrl,
      __keylessApiKeysUrl,
      signInForceRedirectUrl: loadedOptions.signInForceRedirectUrl,
      signUpForceRedirectUrl: loadedOptions.signUpForceRedirectUrl,
      signInFallbackRedirectUrl: loadedOptions.signInFallbackRedirectUrl,
      signUpFallbackRedirectUrl: loadedOptions.signUpFallbackRedirectUrl,
    };

    // Stash identity-free options for re-derivation; authFnContext/requestStateContext
    // remain for back-compat but identity is no longer read from them.
    args.context.set(requestOptionsContext, authenticateOptions);
    args.context.set(authFnContext, (opts?: PendingSessionOptions) => requestState.toAuth(opts));
    args.context.set(requestStateContext, { requestState, additionalState });

    const response = await next();

    if (requestState.headers) {
      requestState.headers.forEach((value, key) => {
        response.headers.append(key, value);
      });
    }

    return response;
  };
};
