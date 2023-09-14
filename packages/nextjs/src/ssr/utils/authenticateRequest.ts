import type { GetServerSidePropsContext } from 'next';

import { clerkClient } from '../../server';
import type { WithServerSideAuthOptions } from '../types';

/**
 * @internal
 */
export async function authenticateRequest(ctx: GetServerSidePropsContext, opts: WithServerSideAuthOptions = {}) {
  const { headers, cookies } = ctx.req;

  const cookieToken = cookies['__session'];
  const headerToken = headers.authorization?.replace('Bearer ', '');

  return clerkClient.authenticateRequest({
    ...opts,
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
