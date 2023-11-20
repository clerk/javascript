import type { AuthObject, RequestState } from '@clerk/backend';
import { constants, debugRequestState, loadInterstitialFromLocal } from '@clerk/backend';
import type { AppLoadContext, defer } from '@remix-run/server-runtime';
import { json } from '@remix-run/server-runtime';
import cookie from 'cookie';

import { getEnvVariable } from '../utils';
import type { LoaderFunctionArgs, LoaderFunctionArgsWithAuth } from './types';

/**
 * Inject `auth`, `user` , `organization` and `session` properties into request
 * @internal
 */
export function injectAuthIntoRequest(args: LoaderFunctionArgs, authObject: AuthObject): LoaderFunctionArgsWithAuth {
  const { user, session, organization, ...rest } = authObject;
  const auth = { ...rest, actor: rest.sessionClaims?.act || null };

  Object.assign(args.request, { user, session, organization, auth });

  return args as LoaderFunctionArgsWithAuth;
}

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

export const unknownResponse = (requestState: RequestState) => {
  return json(null, { status: 401, headers: observabilityHeadersFromRequestState(requestState) });
};

export const interstitialJsonResponse = (
  requestState: RequestState,
  opts: { loader: 'root' | 'nested' },
  context: AppLoadContext,
) => {
  return json(
    wrapWithClerkState({
      __loader: opts.loader,
      __clerk_ssr_interstitial_html: loadInterstitialFromLocal({
        debugData: debugRequestState(requestState),
        publishableKey: requestState.publishableKey,
        // TODO: This needs to be the version of clerk/remix not clerk/react
        // pkgVersion: LIB_VERSION,
        clerkJSUrl: getEnvVariable('CLERK_JS', context),
        clerkJSVersion: getEnvVariable('CLERK_JS_VERSION', context),
        proxyUrl: requestState.proxyUrl,
        isSatellite: requestState.isSatellite,
        domain: requestState.domain,
        signInUrl: requestState.signInUrl,
      }),
    }),
    { status: 401, headers: observabilityHeadersFromRequestState(requestState) },
  );
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
  const { reason, message, isSignedIn, isInterstitial, ...rest } = requestState;
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
