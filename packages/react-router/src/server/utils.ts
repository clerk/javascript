import { constants, debugRequestState } from '@clerk/backend/internal';
import cookie from 'cookie';
import type { AppLoadContext, UNSAFE_DataWithResponseInit } from 'react-router';

import { getPublicEnvVariables } from '../utils/env';
import type { RequestStateWithRedirectUrls } from './types';

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
  return cookie.parse(req.headers.get('cookie') || '');
};

export function assertValidHandlerResult(val: any, error?: string): asserts val is Record<string, unknown> | null {
  if ((val !== null && typeof val !== 'object') || Array.isArray(val)) {
    throw new Error(error || '');
  }
}

/**
 * `get` and `set` properties will only be available if v8_middleware flag is enabled
 * See: https://reactrouter.com/upgrading/future#futurev8_middleware
 */
export const IsOptIntoMiddleware = (context: AppLoadContext) => {
  return 'get' in context && 'set' in context;
};

export const injectRequestStateIntoResponse = async (
  response: Response,
  requestState: RequestStateWithRedirectUrls,
  context: AppLoadContext,
  includeClerkHeaders = false,
) => {
  const clone = new Response(response.body, response);
  const data = await clone.json();

  const { clerkState, headers } = getResponseClerkState(requestState, context);

  // set the correct content-type header in case the user returned a `Response` directly
  clone.headers.set(constants.Headers.ContentType, constants.ContentTypes.Json);

  // Only add Clerk headers if requested (for legacy mode)
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
export function getResponseClerkState(requestState: RequestStateWithRedirectUrls, context: AppLoadContext) {
  const { reason, message, isSignedIn, ...rest } = requestState;
  const clerkState = wrapWithClerkState({
    __clerk_ssr_state: rest.toAuth(),
    __publishableKey: requestState.publishableKey,
    __proxyUrl: requestState.proxyUrl,
    __domain: requestState.domain,
    __isSatellite: requestState.isSatellite,
    __signInUrl: requestState.signInUrl,
    __signUpUrl: requestState.signUpUrl,
    __afterSignInUrl: requestState.afterSignInUrl,
    __afterSignUpUrl: requestState.afterSignUpUrl,
    __signInForceRedirectUrl: requestState.signInForceRedirectUrl,
    __signUpForceRedirectUrl: requestState.signUpForceRedirectUrl,
    __signInFallbackRedirectUrl: requestState.signInFallbackRedirectUrl,
    __signUpFallbackRedirectUrl: requestState.signUpFallbackRedirectUrl,
    __clerk_debug: debugRequestState(requestState),
    __clerkJSUrl: getPublicEnvVariables(context).clerkJsUrl,
    __clerkJSVersion: getPublicEnvVariables(context).clerkJsVersion,
    __telemetryDisabled: getPublicEnvVariables(context).telemetryDisabled,
    __telemetryDebug: getPublicEnvVariables(context).telemetryDebug,
  });

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
  const clonedRequest = new Request(request.url, {
    headers: request.headers,
    method: request.method,
    redirect: request.redirect,
    cache: request.cache,
    signal: request.signal,
  });

  // If duplex is not set, set it to 'half' to avoid duplex issues with unidici
  if (clonedRequest.method !== 'GET' && clonedRequest.body !== null && !('duplex' in clonedRequest)) {
    (clonedRequest as unknown as { duplex: 'half' }).duplex = 'half';
  }

  return clonedRequest;
};
