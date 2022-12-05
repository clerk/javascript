import { AuthState, default as Clerk } from '@clerk/backend';
import { LIB_VERSION } from '@clerk/clerk-react/dist/info';
import { json } from '@remix-run/server-runtime';
import cookie from 'cookie';

import { LoaderFunctionArgs, LoaderFunctionArgsWithAuth } from './types';

// Generate an internal utility Clerk Instance that can be used for its local utility functions.
// Since, the apiKey can not be set at this points across Remix runtimes, this clerk instance is
// not able to make Clerk Backend API requests. For now, we will just use an empty string to initiate
// the instance.
const __internalClerkInstance = Clerk({ apiKey: '' });

/**
 * Inject `auth`, `user` and `session` properties into `request`
 * @internal
 */
export function injectAuthIntoRequest(args: LoaderFunctionArgs, authState: AuthState): LoaderFunctionArgsWithAuth {
  const { user, session, userId, sessionId, getToken, sessionClaims } = authState;
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
 * See `packages/nextjs/src/middleware/utils/sanitizeAuthData.ts`
 * TODO: Make a shared function
 *
 * @internal
 */
export function sanitizeAuthData(authState: AuthState): any {
  if (!authState.isSignedIn) {
    return authState;
  }

  const user = authState.user ? { ...authState.user } : authState.user;
  const organization = authState.user ? { ...authState.user } : authState.user;
  __internalClerkInstance.toSSRResource(user);
  __internalClerkInstance.toSSRResource(organization);

  return { ...authState, user, organization };
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
export const interstitialJsonResponse = (authState: AuthState, opts: { loader: 'root' | 'nested' }) => {
  return json(
    wrapWithClerkState({
      __loader: opts.loader,
      __clerk_ssr_interstitial_html: __internalClerkInstance.localInterstitial({
        debugData: __internalClerkInstance.debugAuthState(authState),
        frontendApi: authState.frontendApi,
        pkgVersion: LIB_VERSION,
      }),
    }),
    { status: 401 },
  );
};

/**
 * @internal
 */
export const returnLoaderResultJsonResponse = (opts: { authState: AuthState; callbackResult?: any }) => {
  const { reason, message, isSignedIn, isInterstitial, ...rest } = opts.authState;
  return json({
    ...(opts.callbackResult || {}),
    ...wrapWithClerkState({
      __clerk_ssr_state: rest,
      __frontendApi: opts.authState.frontendApi,
      __clerk_debug: __internalClerkInstance.debugAuthState(opts.authState),
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
