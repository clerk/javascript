import type { ServerSideAuth } from '@clerk/types';
import cookie from 'cookie';
import type { GetServerDataProps } from 'gatsby';

import type { AuthData } from './getAuthData';
import type { GetServerDataPropsWithAuth } from './types';

/**
 * @internal
 */
export function injectAuthIntoContext(context: GetServerDataProps, authData: AuthData): GetServerDataPropsWithAuth {
  const { user, session, claims, ...auth } = authData || {};
  return {
    ...context,
    auth: {
      ...auth,
      claims,
      actor: claims?.act || null,
    } as ServerSideAuth,
    user: user || null,
    session: session || null,
  };
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
 * Wraps obscured clerk internals with a readable `clerkState` key.
 * This is intended to be passed by the user into <ClerkProvider>
 *
 * @internal
 */
export const wrapWithClerkState = (data: any) => {
  return { clerkState: { __internal_clerk_state: { ...data } } };
};

/**
 * TODO: Make a shared function
 *
 * @internal
 */
export const parseCookies = (headers: any) => {
  return cookie.parse(headers.get('cookie') || '');
};

/**
 * @internal
 */
export function injectSSRStateIntoProps(callbackResult: any, data: any) {
  return {
    ...callbackResult,
    props: { ...callbackResult.props, ...wrapWithClerkState(data) },
  };
}
