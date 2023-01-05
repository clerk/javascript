import { GetServerSidePropsContext } from 'next';

import { API_KEY, clerkClient, FRONTEND_API, PUBLISHABLE_KEY } from '../../server';
import { WithServerSideAuthOptions } from '../types';

/**
 * @internal
 */
export async function authenticateRequest(ctx: GetServerSidePropsContext, opts: WithServerSideAuthOptions = {}) {
  const { headers, cookies } = ctx.req;

  const cookieToken = cookies['__session'];
  const headerToken = headers.authorization?.replace('Bearer ', '');

  return clerkClient.authenticateRequest({
    ...opts,
    apiKey: API_KEY,
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
  });
}
