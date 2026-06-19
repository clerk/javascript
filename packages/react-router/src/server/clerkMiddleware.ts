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

/** @internal Not part of the public API. Used internally to detect middleware presence; may be removed in a major. */
export const authFnContext = createContext<((options?: PendingSessionOptions) => AuthObject) | null>(null);
/** @internal Not part of the public API. Used internally for additionalState; may be removed in a major. */
export const requestStateContext = createContext<RequestStateContextValue | null>(null);
// Request-INDEPENDENT config (the static clerkMiddleware options plus resolved keys)
// used to re-derive auth on a Request-instance miss. It deliberately does NOT hold
// resolved request-derived values (domain/proxyUrl/isSatellite); those are
// re-resolved per request from args.request, so a shared context can't leak one
// request's resolved options to another.
export const middlewareConfigContext = createContext<ClerkMiddlewareOptions | null>(null);
const sharedContextProbe = createContext<Request | null>(null);

const sharedContextMessage =
  "Clerk: The React Router `context` is being reused across requests. clerkMiddleware() resolves each request's auth from that request, so sign-in state stays correct, but sharing one context across requests is unsupported and can leak your application's own per-request data. This usually comes from a custom server or `getLoadContext()` that returns a single RouterContextProvider; return a new RouterContextProvider() for each request instead.";

// Keyed by the Request, never the shared context: the runtime builds a distinct
// Request per incoming request, so two concurrent requests can't collide here even
// when they share one RouterContextProvider. Holds the in-flight promise so
// concurrent reads of the same Request share a single re-derivation.
const requestStateByRequest = new WeakMap<Request, Promise<RequestState<any>>>();

// The options authenticateRequest needs, picked from a resolved loadOptions() result.
// Both clerkMiddleware's first pass and resolveRequestState's Request-miss fallback build
// their authenticate options here, so the two paths can never drift into authenticating the
// same request with different options.
function pickAuthenticateOptions(options: ReturnType<typeof loadOptions>): AuthenticateRequestOptions {
  return {
    apiUrl: options.apiUrl,
    secretKey: options.secretKey,
    jwtKey: options.jwtKey,
    proxyUrl: options.proxyUrl,
    isSatellite: options.isSatellite,
    domain: options.domain,
    publishableKey: options.publishableKey,
    machineSecretKey: options.machineSecretKey,
    audience: options.audience,
    authorizedParties: options.authorizedParties,
    organizationSyncOptions: options.organizationSyncOptions,
    signInUrl: options.signInUrl,
    signUpUrl: options.signUpUrl,
    acceptsToken: 'any',
  };
}

/**
 * Auth state for this request. Reuses what clerkMiddleware already resolved (keyed
 * by Request, so handshake/refresh and any machine-token verification happen once
 * per request). On a Request-instance miss (e.g. React Router's action -> loader
 * revalidation), it re-authenticates from this request's own cookies and caches
 * the in-flight promise so concurrent and repeat reads on that Request reuse it.
 */
export async function resolveRequestState(args: DataFunctionArgs): Promise<RequestState<any>> {
  const cached = requestStateByRequest.get(args.request);
  if (cached) {
    return cached;
  }

  const config = IsOptIntoMiddleware(args.context) ? args.context.get(middlewareConfigContext) : null;
  if (!config) {
    throw new Error(
      'Clerk: clerkMiddleware() not detected. Make sure you have installed the clerkMiddleware in your root route.',
    );
  }

  // Re-resolve options from THIS request: domain/proxyUrl/isSatellite are derived
  // from args.request, and `config` carries only request-independent values (static
  // options + resolved keys), so this can't pick up another request's resolved
  // options even when the context is shared. Identity comes from args.request.
  const options = loadOptions(args, config);
  // A miss is a Request the middleware never authenticated, e.g. React Router hands loaders
  // a fresh GET request when revalidating after an action. We re-derive identity from that
  // request's own cookies. Any refresh/handshake headers this re-derive produces are NOT
  // emitted: getAuth returns only an auth object, and rootAuthLoader suppresses Clerk headers
  // when the middleware ran, so there is no response to attach them to here. Because refresh
  // and handshake are GET-only on the backend, a POST action's middleware pass produces no
  // such headers, so this is the only place a GET-loader re-derive could. That matches the
  // prior behavior (a loader never emitted these) and is not a cross-user concern; the next
  // top-level GET navigation runs the middleware and refreshes/handshakes there.
  // Cache the promise before awaiting so concurrent callers share one re-derive;
  // drop it on failure so a transient error isn't cached for the request's lifetime.
  const requestStatePromise = clerkClient(args, config).authenticateRequest(
    createClerkRequest(patchRequest(args.request)),
    pickAuthenticateOptions(options),
  );
  requestStateByRequest.set(args.request, requestStatePromise);
  try {
    return await requestStatePromise;
  } catch (error) {
    requestStateByRequest.delete(args.request);
    throw error;
  }
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

    const requestState = await clerkClient(args, options).authenticateRequest(
      clerkRequest,
      pickAuthenticateOptions(loadedOptions),
    );

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

    // Stored on requestStateContext and read back by rootAuthLoader from the (possibly
    // shared) context, NOT keyed by Request. Every field here must stay request-independent
    // (static options or env), which is what makes it safe to read off a shared context. Do
    // not add a value derived from args.request / headers here, or it can bleed across
    // requests that share one RouterContextProvider; re-resolve such a value per request.
    const additionalState: AdditionalStateOptions = {
      __keylessClaimUrl,
      __keylessApiKeysUrl,
      signInForceRedirectUrl: loadedOptions.signInForceRedirectUrl,
      signUpForceRedirectUrl: loadedOptions.signUpForceRedirectUrl,
      signInFallbackRedirectUrl: loadedOptions.signInFallbackRedirectUrl,
      signUpFallbackRedirectUrl: loadedOptions.signUpFallbackRedirectUrl,
    };

    // Request-independent config (static options + resolved keys) for the re-derive
    // fallback when the Request instance differs. Deliberately excludes resolved
    // domain/proxyUrl/isSatellite, which are re-resolved per request from args.request.
    const middlewareConfig: ClerkMiddlewareOptions = {
      ...options,
      secretKey: loadedOptions.secretKey,
      publishableKey: loadedOptions.publishableKey,
      jwtKey: loadedOptions.jwtKey,
      machineSecretKey: loadedOptions.machineSecretKey,
    };

    // Cache the resolved state keyed by this Request so getAuth/rootAuthLoader reuse
    // it. authFnContext/requestStateContext remain for back-compat.
    requestStateByRequest.set(args.request, Promise.resolve(requestState));
    args.context.set(middlewareConfigContext, middlewareConfig);
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
