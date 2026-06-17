import type { AuthObject } from '@clerk/backend';
import type { AuthenticateRequestOptions, RequestState } from '@clerk/backend/internal';
import { AuthStatus, constants, createClerkRequest } from '@clerk/backend/internal';
import { isDevelopmentFromPublishableKey } from '@clerk/shared/keys';
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

// The resolved AuthenticateRequestOptions for this request (keys, urls, domain,
// proxy, sync options, keyless-resolved keys). This is app/instance-level config,
// NOT user identity, so getAuth/rootAuthLoader can read it back and re-derive the
// current user from the request even if the surrounding context is shared.
export const requestOptionsContext = createContext<AuthenticateRequestOptions | null>(null);

// Probe used to detect a React Router `context` reused across requests. React
// Router gives each request its own context, so this is unset on a fresh one; if
// a different request already stamped it, the app is sharing one context across
// requests (commonly a custom server or getLoadContext that returns a single
// RouterContextProvider). getAuth re-derives identity per request so sign-in
// stays correct regardless, but a shared context can still leak the app's own
// per-request data, so we surface it (throw in dev, warn once in prod).
const sharedContextProbe = createContext<Request | null>(null);

const sharedContextMessage =
  'Clerk: The React Router `context` is being reused across requests. clerkMiddleware() resolves each request\'s auth from that request, so sign-in state stays correct, but sharing one context across requests is unsupported and can leak your application\'s own per-request data. This usually comes from a custom server or `getLoadContext()` that returns a single RouterContextProvider; return a new RouterContextProvider() for each request instead.';

/**
 * Re-derives the current request's auth state from `args.request`, using the
 * resolved (identity-free) options the middleware stashed on the context.
 *
 * Identity comes purely from this request's cookies/headers, so a context shared
 * across requests can never produce a cross-user result. The stashed options are
 * app/instance-level config (keys, urls), not user identity, so reading them from
 * a possibly-shared context is safe. Verification is networkless once the
 * middleware has warmed the JWKS cache for this process.
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
    // Runs before the first await so the read/write is atomic per request: if the
    // context already carries a different request's marker, it is being shared.
    const probedRequest = args.context.get(sharedContextProbe);
    const contextReused = !!(probedRequest && probedRequest !== args.request);
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

    // Surface a shared context: fail loud in development so it is caught before
    // production, log once in production (auth is already isolated per request).
    if (contextReused) {
      if (isDevelopmentFromPublishableKey(loadedOptions.publishableKey)) {
        throw new Error(sharedContextMessage);
      }
      logger.warnOnce(sharedContextMessage);
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

    // Stash the identity-free resolved options so getAuth/rootAuthLoader can
    // re-derive this request's user from the request itself (see
    // authenticateFromRequest). authFnContext/requestStateContext are still
    // written for back-compat, but identity is no longer read from them.
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
