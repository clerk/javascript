import type { GetServerSidePropsContext } from 'next';

import { API_KEY, clerkClient, FRONTEND_API, PROXY_URL, PUBLISHABLE_KEY, SECRET_KEY } from '../../server';
import type { WithServerSideAuthOptions } from '../types';

/**
 * @internal
 */
export function authenticateRequest(ctx: GetServerSidePropsContext, opts: WithServerSideAuthOptions = {}) {
  const { headers, cookies } = ctx.req;

  const cookieToken = cookies['__session'];
  const headerToken = headers.authorization?.replace('Bearer ', '');

  return clerkClient.authenticateRequest({
    ...opts,
    apiKey: API_KEY,
    secretKey: SECRET_KEY,
    frontendApi: FRONTEND_API,
    publishableKey: PUBLISHABLE_KEY,
    cookieToken,
    headerToken,
    clientUat: cookies['__client_uat'],
    origin: headers.origin,
    host: headers.host as string,
    forwardedPort: headers['x-forwarded-port'] as string,
    forwardedHost: headers['x-forwarded-host'] as string,
    referrer: headers.referer,
    userAgent: headers['user-agent'] as string,
    proxyUrl: PROXY_URL,
  });
}
