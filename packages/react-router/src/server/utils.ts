import type { RequestState } from '@clerk/backend/internal';
import { constants, debugRequestState } from '@clerk/backend/internal';
import { parse as parseCookie } from 'cookie';
import type { UNSAFE_DataWithResponseInit } from 'react-router';

import { getPublicEnvVariables } from '../utils/env';
import { canUseKeyless } from '../utils/feature-flags';
import type { AdditionalStateOptions } from './types';

// AppLoadContext was removed from React Router v8. Keep a structural type for the context shape we use.
type ReactRouterContext = Record<string, any> & {
  get?: <T>(context: unknown) => T | undefined;
  set?: <T>(context: unknown, value: T) => void;
};

export function isResponse(value: any): value is Response {
  return (
    value != null &&
    typeof value.status === 'number' &&
    typeof value.statusText === 'string' &&
    typeof value.headers === 'object' &&
    typeof value.body !== 'undefined'
  );
}

export function isDataWithResponseInit(value: any): value is UNSAFE_DataWithResponseInit<unknown> {
  return (
    typeof value === 'object' &&
    value != null &&
    'type' in value &&
    'data' in value &&
    'init' in value &&
    value.type === 'DataWithResponseInit'
  );
}

export function isRedirect(res: Response): boolean {
  return res.status >= 300 && res.status < 400;
}

export const parseCookies = (req: Request) => {
  return parseCookie(req.headers.get('cookie') || '');
};

export function assertValidHandlerResult(val: any, error?: string): asserts val is Record<string, unknown> | null {
  if ((val !== null && typeof val !== 'object') || Array.isArray(val)) {
    throw new Error(error || '');
  }
}

/**
 * `get` and `set` properties are available when React Router middleware is enabled.
 *
 * If you're using React Router v7, enable the v8_middleware future flag in your react-router.config.ts file.
 */
export const IsOptIntoMiddleware = (
  context: ReactRouterContext,
): context is ReactRouterContext & Required<Pick<ReactRouterContext, 'get' | 'set'>> => {
  return 'get' in context && 'set' in context;
};

export const injectRequestStateIntoResponse = async (
  response: Response,
  requestState: RequestState,
  context: ReactRouterContext,
  additionalStateOptions: AdditionalStateOptions = {},
  includeClerkHeaders = false,
) => {
  const clone = new Response(response.body, response);
  const data = await clone.json();

  const { clerkState, headers } = getResponseClerkState(requestState, context, additionalStateOptions);

  // set the correct content-type header in case the user returned a `Response` directly
  clone.headers.set(constants.Headers.ContentType, constants.ContentTypes.Json);

  // Only add Clerk headers if requested
  if (includeClerkHeaders) {
    headers.forEach((value, key) => {
      clone.headers.append(key, value);
    });
  }

  return Response.json({ ...(data || {}), ...clerkState }, clone);
};

/**
 * Returns the clerk state object and observability headers to be injected into a loader response.
 *
 * @internal
 */
export function getResponseClerkState(
  requestState: RequestState,
  context: ReactRouterContext,
  additionalStateOptions: AdditionalStateOptions = {},
) {
  const { reason, message, isSignedIn, ...rest } = requestState;
  const envVars = getPublicEnvVariables(context);
  const { __keylessClaimUrl, __keylessApiKeysUrl, ...redirectUrlOptions } = additionalStateOptions;

  const baseState: Record<string, unknown> = {
    __clerk_ssr_state: rest.toAuth(),
    __publishableKey: requestState.publishableKey,
    __proxyUrl: requestState.proxyUrl,
    __domain: requestState.domain,
    __isSatellite: requestState.isSatellite,
    __signInUrl: requestState.signInUrl,
    __signUpUrl: requestState.signUpUrl,
    __signInForceRedirectUrl: redirectUrlOptions.signInForceRedirectUrl,
    __signUpForceRedirectUrl: redirectUrlOptions.signUpForceRedirectUrl,
    __signInFallbackRedirectUrl: redirectUrlOptions.signInFallbackRedirectUrl,
    __signUpFallbackRedirectUrl: redirectUrlOptions.signUpFallbackRedirectUrl,
    __clerk_debug: debugRequestState(requestState),
    __clerkJSUrl: envVars.clerkJsUrl,
    __clerkJSVersion: envVars.clerkJsVersion,
    __clerkUIUrl: envVars.clerkUIUrl,
    __clerkUIVersion: envVars.clerkUIVersion,
    __prefetchUI: envVars.prefetchUI,
    __telemetryDisabled: envVars.telemetryDisabled,
    __telemetryDebug: envVars.telemetryDebug,
    __unsafeDisableDevelopmentModeConsoleWarning: envVars.unsafeDisableDevelopmentModeConsoleWarning,
  };

  if (canUseKeyless && __keylessClaimUrl) {
    baseState.__keylessClaimUrl = __keylessClaimUrl;
    baseState.__keylessApiKeysUrl = __keylessApiKeysUrl;
  }

  const clerkState = wrapWithClerkState(baseState);

  return {
    clerkState,
    headers: requestState.headers,
  };
}

/**
 * Wraps obscured clerk internals with a readable `clerkState` key.
 * This is intended to be passed by the user into <ClerkProvider>
 *
 * @internal
 */
export const wrapWithClerkState = (data: any) => {
  return { clerkState: { __internal_clerk_state: { ...data } } };
};

/**
 * Patches request to avoid duplex issues with unidici
 * For more information, see:
 * https://github.com/nodejs/node/issues/46221
 * https://github.com/whatwg/fetch/pull/1457
 * @internal
 */
export const patchRequest = (request: Request) => {
  // Omit `signal` from the clone: Node 24's bundled undici tightened the
  // instanceof AbortSignal check, which rejects cross-realm signals (e.g.
  // those carried by framework Request subclasses).
  const clonedRequest = new Request(request.url, {
    headers: request.headers,
    method: request.method,
    redirect: request.redirect,
    cache: request.cache,
  });

  // If duplex is not set, set it to 'half' to avoid duplex issues with unidici
  if (clonedRequest.method !== 'GET' && clonedRequest.body !== null && !('duplex' in clonedRequest)) {
    (clonedRequest as unknown as { duplex: 'half' }).duplex = 'half';
  }

  return clonedRequest;
};
