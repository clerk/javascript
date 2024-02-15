import type { RequestState } from '@clerk/backend/internal';
import { constants, debugRequestState } from '@clerk/backend/internal';
import { isTruthy } from '@clerk/shared/underscore';
import type { AppLoadContext, defer } from '@remix-run/server-runtime';
import { json } from '@remix-run/server-runtime';
import cookie from 'cookie';

import { getEnvVariable } from '../utils/utils';

export function isResponse(value: any): value is Response {
  return (
    value != null &&
    typeof value.status === 'number' &&
    typeof value.statusText === 'string' &&
    typeof value.headers === 'object' &&
    typeof value.body !== 'undefined'
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

const observabilityHeadersFromRequestState = (requestState: RequestState): Headers => {
  const headers = {} as Record<string, string>;

  if (requestState.message) {
    headers[constants.Headers.AuthMessage] = requestState.message;
  }
  if (requestState.reason) {
    headers[constants.Headers.AuthReason] = requestState.reason;
  }
  if (requestState.status) {
    headers[constants.Headers.AuthStatus] = requestState.status;
  }

  return new Headers(headers);
};

/**
 * Retrieve Clerk auth headers. Should be used only for debugging and not in production.
 * @internal
 */
export const getClerkDebugHeaders = (headers: Headers) => {
  return {
    [constants.Headers.AuthMessage]: headers.get(constants.Headers.AuthMessage),
    [constants.Headers.AuthReason]: headers.get(constants.Headers.AuthReason),
    [constants.Headers.AuthStatus]: headers.get(constants.Headers.AuthStatus),
  };
};

export const injectRequestStateIntoResponse = async (
  response: Response,
  requestState: RequestState,
  context: AppLoadContext,
) => {
  const clone = response.clone();
  const data = await clone.json();

  const { clerkState, headers } = getResponseClerkState(requestState, context);

  // set the correct content-type header in case the user returned a `Response` directly
  // without setting the header, instead of using the `json()` helper
  clone.headers.set(constants.Headers.ContentType, constants.ContentTypes.Json);
  headers.forEach((value, key) => {
    clone.headers.set(key, value);
  });

  return json({ ...(data || {}), ...clerkState }, clone);
};

export function injectRequestStateIntoDeferredData(
  data: ReturnType<typeof defer>,
  requestState: RequestState,
  context: AppLoadContext,
) {
  const { clerkState, headers } = getResponseClerkState(requestState, context);

  // Avoid creating a new object here to retain referential equality.
  data.data.clerkState = clerkState.clerkState;

  if (typeof data.init !== 'undefined') {
    data.init.headers = new Headers(data.init.headers);

    headers.forEach((value, key) => {
      // @ts-expect-error -- We are ensuring headers is defined above
      data.init.headers.set(key, value);
    });
  }

  return data;
}

/**
 * Returns the clerk state object and observability headers to be injected into a loader response.
 *
 * @internal
 */
export function getResponseClerkState(requestState: RequestState, context: AppLoadContext) {
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
    __clerk_debug: debugRequestState(requestState),
    __clerkJSUrl: getEnvVariable('CLERK_JS', context),
    __clerkJSVersion: getEnvVariable('CLERK_JS_VERSION', context),
    __telemetryDisabled: isTruthy(getEnvVariable('CLERK_TELEMETRY_DISABLED', context)),
    __telemetryDebug: isTruthy(getEnvVariable('CLERK_TELEMETRY_DEBUG', context)),
    __environment: getEnvVariable('NODE_ENV', context) || getEnvVariable('ENVIRONMENT', context),
  });

  const headers = observabilityHeadersFromRequestState(requestState);

  return {
    clerkState,
    headers,
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
