import type { AuthObject } from '@clerk/backend';
import { prunePrivateMetadata } from '@clerk/backend';
import cookie from 'cookie';
import type { GetServerDataProps } from 'gatsby';

/**
 * @internal
 */
export function injectAuthIntoContext(context: GetServerDataProps, authData: AuthObject) {
  const { user, session } = authData || {};
  return {
    ...context,
    auth: authData,
    user: user || null,
    session: session || null,
  };
}

/**
 *  @internal
 */
export function sanitizeAuthObject<T extends Record<any, any>>(authObject: T): T {
  const user = authObject.user ? { ...authObject.user } : authObject.user;
  const organization = authObject.organization ? { ...authObject.organization } : authObject.organization;

  prunePrivateMetadata(user);
  prunePrivateMetadata(organization);

  return { ...authObject, user, organization };
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
