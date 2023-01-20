import { type AuthObject, type RequestState, debugRequestState, loadInterstitialFromLocal } from '@clerk/backend';
import { LIB_VERSION } from '@clerk/clerk-react/dist/info';
import { json } from '@remix-run/server-runtime';
import cookie from 'cookie';

import { LoaderFunctionArgs, LoaderFunctionArgsWithAuth } from './types';

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

/**
 * @internal
 */
export function isResponse(value: any): value is Response {
  return (
    value != null &&
    typeof value.status === 'number' &&
    typeof value.statusText === 'string' &&
    typeof value.headers === 'object' &&
    typeof value.body !== 'undefined'
  );
}

/**
 * @internal
 */
export function isRedirect(res: Response): boolean {
  return res.status >= 300 && res.status < 400;
}

/**
 * @internal
 */
export const parseCookies = (req: Request) => {
  return cookie.parse(req.headers.get('cookie') || '');
};

/**
 * @internal
 */
export function assertObject(val: any, error?: string): asserts val is Record<string, unknown> {
  if (!val || typeof val !== 'object' || Array.isArray(val)) {
    throw new Error(error || '');
  }
}

/**
 * @internal
 */
export const interstitialJsonResponse = (requestState: RequestState, opts: { loader: 'root' | 'nested' }) => {
  return json(
    wrapWithClerkState({
      __loader: opts.loader,
      __clerk_ssr_interstitial_html: loadInterstitialFromLocal({
        debugData: debugRequestState(requestState),
        frontendApi: requestState.frontendApi,
        proxyUrl: requestState.proxyUrl || '',
        publishableKey: requestState.publishableKey,
        pkgVersion: LIB_VERSION,
      }),
    }),
    { status: 401 },
  );
};

/**
 * @internal
 */
export const returnLoaderResultJsonResponse = (opts: { requestState: RequestState; callbackResult?: any }) => {
  const { reason, message, isSignedIn, isInterstitial, ...rest } = opts.requestState;
  return json({
    ...(opts.callbackResult || {}),
    ...wrapWithClerkState({
      __clerk_ssr_state: rest,
      __frontendApi: opts.requestState.frontendApi,
      __publishableKey: opts.requestState.publishableKey,
      __clerk_debug: debugRequestState(opts.requestState),
    }),
  });
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
