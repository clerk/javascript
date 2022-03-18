import { AuthStatus } from '@clerk/backend-core';
import Clerk, { sessions, users } from '@clerk/clerk-sdk-node';
import { ServerGetToken, ServerGetTokenOptions } from '@clerk/types';
import { GetServerSidePropsContext } from 'next';

import { AuthData, WithServerSideAuthOptions } from '../types';

/**
 * @internal
 * TODO: Share the same impl between nextjs/remix packages
 */
const createGetToken =
  (sessionId?: string, sessionToken?: string): ServerGetToken =>
  async (options: ServerGetTokenOptions = {}) => {
    if (!sessionId) {
      throw new Error('getToken cannot be called without a session');
    }
    if (options.template) {
      return sessions.getToken(sessionId, options.template);
    }
    return Promise.resolve(sessionToken);
  };

/**
 * @internal
 */
export async function getAuthData(
  ctx: GetServerSidePropsContext,
  opts: WithServerSideAuthOptions = {},
): Promise<AuthData | null> {
  const { headers, cookies } = ctx.req;
  const { loadSession, loadUser } = opts;

  const signedOutState = {
    sessionId: null,
    session: null,
    userId: null,
    user: null,
    getToken: createGetToken(undefined),
  };

  try {
    const { status, sessionClaims, interstitial } = await Clerk.base.getAuthState({
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

    const getToken = createGetToken(sessionClaims.sid as string, cookies['__session']);

    const [user, session] = await Promise.all([
      loadUser ? users.getUser(sessionClaims.sub as string) : Promise.resolve(undefined),
      loadSession ? sessions.getSession(sessionClaims.sid as string) : Promise.resolve(undefined),
    ]);

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
