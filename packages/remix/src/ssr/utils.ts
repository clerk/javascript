import cookie from 'cookie';

import { AuthData } from './getAuthData';
import { LoaderFunctionArgs, LoaderFunctionArgsWithAuth } from './types';

/**
 * Wraps obscured clerk internals with a readable `clerkState` key.
 * This is intended to be passed by the user into <ClerkProvider>
 *
 * @internal
 */
export const wrapClerkState = (data: any) => {
  return { clerkState: { __internal_clerk_state: { ...data } } };
};

/**
 * Inject the `auth` attribute to the SSR provided context (ctx) object and
 * `user` and `session` attribute to the request (req) object.
 *
 * @internal
 */
export function injectAuthIntoArgs(ctx: LoaderFunctionArgs, authData: AuthData): LoaderFunctionArgsWithAuth {
  const { user, session, userId, sessionId } = authData;
  const auth = {
    userId,
    sessionId,
    getToken: authData.getToken,
  };
  return { ...ctx, auth, user, session };
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
