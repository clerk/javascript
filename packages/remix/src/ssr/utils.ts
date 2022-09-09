import { json } from '@remix-run/server-runtime';
import cookie from 'cookie';

import { AuthData } from './getAuthData';
import { LoaderFunctionArgs, LoaderFunctionArgsWithAuth } from './types';

/**
 * Inject `auth`, `user` and `session` properties into `request`
 * @internal
 */
export function injectAuthIntoRequest(args: LoaderFunctionArgs, authData: AuthData): LoaderFunctionArgsWithAuth {
  const { user, session, userId, sessionId, getToken, claims } = authData;
  (args.request as any).auth = {
    userId,
    sessionId,
    getToken,
    actorId: claims?.act?.sub || null,
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
export function sanitizeAuthData(authData: AuthData): any {
  const user = authData.user ? { ...authData.user } : authData.user;
  if (user) {
    // @ts-expect-error;
    delete user['privateMetadata'];
  }
  return { ...authData, user };
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
export const throwInterstitialJsonResponse = (opts: { frontendApi: string; errorReason: string | undefined }) => {
  throw json(
    wrapWithClerkState({
      __clerk_ssr_interstitial: true,
      __frontendApi: opts.frontendApi,
      __lastAuthResult: opts.errorReason,
    }),
    { status: 401 },
  );
};

/**
 * @internal
 */
export const returnLoaderResultJsonResponse = (opts: {
  authData: AuthData | null;
  frontendApi: string;
  errorReason: string | undefined;
  callbackResult?: any;
}) => {
  return json({
    ...(opts.callbackResult || {}),
    ...wrapWithClerkState({
      __clerk_ssr_state: opts.authData,
      __frontendApi: opts.frontendApi,
      __lastAuthResult: opts.errorReason || '',
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
