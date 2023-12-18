import { constants } from '@clerk/backend/internal';
import cookie from 'cookie';
import type { GetServerDataProps } from 'gatsby';

import { SECRET_KEY } from '../constants';

/**
 * Wraps obscured clerk internals with a readable `clerkState` key.
 * This is intended to be passed by the user into <ClerkProvider>
 *
 * @internal
 */
export const wrapWithClerkState = (data: any) => {
  return { clerkState: { __internal_clerk_state: { ...data } } };
};

export const parseCookies = (headers: any) => {
  return cookie.parse(headers.get('cookie') || '');
};

export function injectSSRStateIntoProps(callbackResult: any, data: any) {
  return {
    ...callbackResult,
    props: { ...callbackResult.props, ...wrapWithClerkState(data) },
  };
}

export const gatsbyPropsToRequest = (context: GetServerDataProps): Request => {
  const headers = new Headers(Object.fromEntries(context.headers) as Record<string, string>);
  headers.set(constants.Headers.ForwardedHost, returnReferrerAsXForwardedHostToFixLocalDevGatsbyProxy(context.headers));
  return new Request(context.url, { method: context.method, headers });
};

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

  if (isDevelopmentOrStaging(SECRET_KEY || '') && hostUrl.hostname === referrerUrl.hostname) {
    return referrerUrl.host;
  }

  return forwardedHost;
};

function isDevelopmentOrStaging(apiKey: string): boolean {
  return apiKey.startsWith('test_') || apiKey.startsWith('sk_test_');
}
