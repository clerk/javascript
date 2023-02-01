import type { AuthObject, RequestState } from '@clerk/backend';
import { constants, debugRequestState, loadInterstitialFromLocal } from '@clerk/backend';
import { LIB_VERSION } from '@clerk/clerk-react/dist/info';
import { json } from '@remix-run/server-runtime';
import cookie from 'cookie';

import type { LoaderFunctionArgs, LoaderFunctionArgsWithAuth } from './types';

/**
 * Inject `auth`, `user` and `session` properties into `request`
 * @internal
 */
export function injectAuthIntoRequest(args: LoaderFunctionArgs, authObject: AuthObject): LoaderFunctionArgsWithAuth {
  const { user, session, userId, sessionId, getToken, sessionClaims } = authObject;
  (args.request as any).auth = {
    userId,
    sessionId,
    getToken,
    actor: sessionClaims?.act || null,
  };
  (args.request as any).user = user;
  (args.request as any).session = session;
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

export function assertObject(val: any, error?: string): asserts val is Record<string, unknown> {
  if (!val || typeof val !== 'object' || Array.isArray(val)) {
    throw new Error(error || '');
  }
}

export const interstitialJsonResponse = (requestState: RequestState, opts: { loader: 'root' | 'nested' }) => {
  return json(
    wrapWithClerkState({
      __loader: opts.loader,
      __clerk_ssr_interstitial_html: loadInterstitialFromLocal({
        debugData: debugRequestState(requestState),
        frontendApi: requestState.frontendApi,
        publishableKey: requestState.publishableKey,
        pkgVersion: LIB_VERSION,
      }),
    }),
    { status: 401 },
  );
};

export const injectRequestStateIntoResponse = async (response: Response, requestState: RequestState) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { reason, message, isSignedIn, isInterstitial, ...rest } = requestState;
  const clone = response.clone();
  const data = await clone.json();
  const clerkState = wrapWithClerkState({
    __clerk_ssr_state: rest,
    __frontendApi: requestState.frontendApi,
    __publishableKey: requestState.publishableKey,
    __clerk_debug: debugRequestState(requestState),
  });
  // set the correct content-type header in case the user returned a `Response` directly
  // without setting the header, instead of using the `json()` helper
  clone.headers.set(constants.Headers.ContentType, constants.ContentTypes.Json);
  return json({ ...(data || {}), ...clerkState }, clone);
};

/**
 * Wraps obscured clerk internals with a readable `clerkState` key.
 * This is intended to be passed by the user into <ClerkProvider>
 *
 * @internal
 */
export const wrapWithClerkState = (data: any) => {
  return { clerkState: { __internal_clerk_state: { ...data } } };
};
