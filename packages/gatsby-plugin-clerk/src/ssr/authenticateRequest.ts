import type { GetServerDataProps } from 'gatsby';

import { API_KEY, clerkClient, constants, FRONTEND_API, PUBLISHABLE_KEY, SECRET_KEY } from './clerkClient';
import type { WithServerAuthOptions } from './types';
import { parseCookies } from './utils';

export function authenticateRequest(context: GetServerDataProps, options: WithServerAuthOptions) {
  const { headers } = context;
  const cookies = parseCookies(headers);
  const cookieToken = cookies[constants.Cookies.Session];
  const headerToken = (headers.get(constants.Headers.Authorization) as string)?.replace('Bearer ', '');

  return clerkClient.authenticateRequest({
    ...options,
    cookieToken,
    headerToken,
    clientUat: cookies[constants.Cookies.ClientUat],
    host: headers.get(constants.Headers.Host) as string,
    forwardedPort: headers.get(constants.Headers.ForwardedPort) as string,
    forwardedHost: returnReferrerAsXForwardedHostToFixLocalDevGatsbyProxy(headers),
    referrer: headers.get(constants.Headers.Referrer) as string,
    userAgent: headers.get(constants.Headers.UserAgent) as string,
    apiKey: API_KEY,
    secretKey: SECRET_KEY,
    frontendApi: FRONTEND_API,
    publishableKey: PUBLISHABLE_KEY,
  });
}

const returnReferrerAsXForwardedHostToFixLocalDevGatsbyProxy = (headers: Map<string, unknown>) => {
  const forwardedHost = headers.get(constants.Headers.ForwardedHost) as string;
  if (forwardedHost) {
    return forwardedHost;
  }

  const referrerUrl = new URL(headers.get(constants.Headers.Referrer) as string);
  const hostUrl = new URL('https://' + (headers.get(constants.Headers.Host) as string));

  if (
    process.env.NODE_ENV === 'development' &&
    isDevelopmentOrStaging(SECRET_KEY || API_KEY || '') &&
    hostUrl.hostname === referrerUrl.hostname
  ) {
    return referrerUrl.host;
  }

  return forwardedHost;
};

function isDevelopmentOrStaging(apiKey: string): boolean {
  return apiKey.startsWith('test_') || apiKey.startsWith('sk_test_');
}
