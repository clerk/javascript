import type { GetServerDataProps } from 'gatsby';

import {
  API_KEY,
  clerkClient,
  constants,
  createIsomorphicRequest,
  FRONTEND_API,
  PUBLISHABLE_KEY,
  SECRET_KEY,
} from './clerkClient';
import type { WithServerAuthOptions } from './types';

export function authenticateRequest(context: GetServerDataProps, options: WithServerAuthOptions) {
  return clerkClient.authenticateRequest({
    ...options,
    apiKey: API_KEY,
    secretKey: SECRET_KEY,
    frontendApi: FRONTEND_API,
    publishableKey: PUBLISHABLE_KEY,
    request: createIsomorphicRequest((Request, Headers) => {
      const headers = new Headers(Object.fromEntries(context.headers) as Record<string, string>);
      headers.set(
        constants.Headers.ForwardedHost,
        returnReferrerAsXForwardedHostToFixLocalDevGatsbyProxy(context.headers),
      );
      return new Request(context.url, {
        method: context.method,
        headers,
      });
    }),
  });
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
