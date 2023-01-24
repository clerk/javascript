import { constants } from '@clerk/backend';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { API_KEY, FRONTEND_API, PUBLISHABLE_KEY, SECRET_KEY } from '@clerk/nextjs/dist/server';
import { GetServerDataProps } from 'gatsby';

import { WithServerAuthOptions } from './types';
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
    isDevelopmentOrStaging(process.env.CLERK_SECRET_KEY || process.env.CLERK_API_KEY || '') &&
    hostUrl.hostname === referrerUrl.hostname
  ) {
    return referrerUrl.host;
  }

  return forwardedHost;
};

function isDevelopmentOrStaging(apiKey: string): boolean {
  return apiKey.startsWith('test_') || apiKey.startsWith('sk_test_');
}
