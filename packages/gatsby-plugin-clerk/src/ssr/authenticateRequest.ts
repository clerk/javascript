import { Clerk } from '@clerk/backend';
import { isDevelopmentOrStaging } from '@clerk/backend-core/src/util/clerkApiKey';
import { GetServerDataProps } from 'gatsby';
import * as process from 'process';

import { WithServerAuthOptions } from './types';
import { parseCookies } from './utils';

export async function authenticateRequest(context: GetServerDataProps, options: WithServerAuthOptions) {
  const { loadSession, loadUser, loadOrganization, authorizedParties } = options;
  const { headers } = context;
  const cookies = parseCookies(headers);
  const cookieToken = cookies['__session'];
  const headerToken = (headers.get('authorization') as string)?.replace('Bearer ', '');
  const apiKey = process.env.CLERK_API_KEY || '';
  const frontendApi = process.env.GATSBY_CLERK_FRONTEND_API || '';
  if (!apiKey || !frontendApi) {
    // todo:
    throw new Error('missing key');
  }

  return Clerk({ apiKey }).authenticateRequest({
    apiKey,
    // TODO: do we need the key?
    // jwtKey,
    frontendApi,
    loadUser,
    loadSession,
    loadOrganization,
    cookieToken,
    headerToken,
    clientUat: cookies['__client_uat'],
    origin: headers.get('origin') as string,
    host: headers.get('host') as string,
    forwardedPort: headers.get('x-forwarded-port') as string,
    forwardedHost: returnReferrerAsXForwardedHostToFixLocalDevGatsbyProxy(headers),
    referrer: headers.get('referer') as string,
    userAgent: headers.get('user-agent') as string,
  });
}

const returnReferrerAsXForwardedHostToFixLocalDevGatsbyProxy = (headers: Map<string, unknown>) => {
  const forwardedHost = headers.get('x-forwarded-host') as string;
  if (forwardedHost) {
    return forwardedHost;
  }

  const referrerUrl = new URL(headers.get('referer') as string);
  const hostUrl = new URL('https://' + (headers.get('host') as string));

  if (
    process.env.NODE_ENV === 'development' &&
    isDevelopmentOrStaging(process.env.CLERK_API_KEY || '') &&
    hostUrl.hostname === referrerUrl.hostname
  ) {
    return referrerUrl.host;
  }

  return forwardedHost;
};
