import { AuthStatus } from '@clerk/backend-core';
import Clerk, { sessions, users } from '@clerk/clerk-sdk-node';
import { GetSessionTokenOptions } from '@clerk/types';
import { GetServerSidePropsContext } from 'next';

import { AuthData, WithServerSideAuthOptions } from '../types';

/**
 * @internal
 */
export async function getAuthData(
  ctx: GetServerSidePropsContext,
  opts: WithServerSideAuthOptions = {},
): Promise<AuthData | null> {
  const { headers, cookies } = ctx.req;
  const { loadSession, loadUser } = opts;

  const getToken = async (options: GetSessionTokenOptions = {}) => {
    if (options.template) {
      throw new Error(
        'Retrieving a JWT template during SSR will be supported soon.',
      );
    }
    return cookies['__session'] || null;
  };

  const signedOutState = {
    sessionId: null,
    session: null,
    userId: null,
    user: null,
    getToken,
  };

  try {
    const { status, sessionClaims, interstitial } =
      await Clerk.base.getAuthState({
        cookieToken: cookies['__session'],
        clientUat: cookies['__client_uat'],
        headerToken: headers.authorization?.replace('Bearer ', ''),
        origin: headers.origin,
        host: headers.host as string,
        forwardedPort: headers['x-forwarded-port'] as string,
        forwardedHost: headers['x-forwarded-host'] as string,
        referrer: headers.referer,
        userAgent: headers['user-agent'] as string,
        fetchInterstitial: () => Clerk.fetchInterstitial(),
      });

    if (status === AuthStatus.Interstitial) {
      ctx.res.writeHead(401, { 'Content-Type': 'text/html' });
      ctx.res.end(interstitial);
      return null;
    }

    if (status === AuthStatus.SignedOut || !sessionClaims) {
      return signedOutState;
    }

    const user = loadUser
      ? await users.getUser(sessionClaims.sub as string)
      : undefined;
    const session = loadSession
      ? await sessions.getSession(sessionClaims.sid as string)
      : undefined;

    return {
      sessionId: sessionClaims.sid as string,
      userId: sessionClaims.sub as string,
      user,
      session,
      getToken,
    };
  } catch (err) {
    return signedOutState;
  }
}
