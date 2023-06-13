import type { AuthObject, RequestAdapter } from '@clerk/backend';
import { constants, prunePrivateMetadata } from '@clerk/backend';
import cookie from 'cookie';
import type { GetServerDataProps } from 'gatsby';

import { API_KEY, SECRET_KEY } from './clerkClient';

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

const returnReferrerAsXForwardedHostToFixLocalDevGatsbyProxy = (headers: Map<string, unknown>) => {
  if (process.env.NODE_ENV !== 'development') {
    return headers.get(constants.Headers.ForwardedHost) as string;
  }

  const forwardedHost = headers.get(constants.Headers.ForwardedHost) as string;
  if (forwardedHost) {
    return forwardedHost;
  }

  const referrerUrl = new URL(headers.get(constants.Headers.Referrer) as string);
  const hostUrl = new URL('https://' + (headers.get(constants.Headers.Host) as string));

  if (isDevelopmentOrStaging(SECRET_KEY || API_KEY || '') && hostUrl.hostname === referrerUrl.hostname) {
    return referrerUrl.host;
  }

  return forwardedHost;
};

function isDevelopmentOrStaging(apiKey: string): boolean {
  return apiKey.startsWith('test_') || apiKey.startsWith('sk_test_');
}

export class GatsbyRequestAdapter implements RequestAdapter {
  readonly reqCookies: Record<string, string>;
  constructor(readonly context: GetServerDataProps) {
    this.reqCookies = parseCookies(context?.headers);
  }

  headers(key: string) {
    if (key === constants.Headers.ForwardedHost) {
      return returnReferrerAsXForwardedHostToFixLocalDevGatsbyProxy(this.context?.headers);
    }
    return (this.context?.headers?.get(key) as string) || undefined;
  }

  cookies(key: string) {
    return this.reqCookies?.[key] || undefined;
  }

  searchParams() {
    return new URL(this.context?.url)?.searchParams;
  }
}
