import { AuthStatus, createGetToken, createSignedOutState } from '@clerk/backend-core';
import Clerk, { sessions, users } from '@clerk/clerk-sdk-node';
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
  const { loadSession, loadUser, jwtKey, authorizedParties } = opts;

  try {
    const cookieToken = cookies['__session'];
    const headerToken = headers.authorization?.replace('Bearer ', '');
    const { status, sessionClaims, errorReason } = await Clerk.base.getAuthState({
      cookieToken,
      headerToken,
      clientUat: cookies['__client_uat'],
      origin: headers.origin,
      host: headers.host as string,
      forwardedPort: headers['x-forwarded-port'] as string,
      forwardedHost: headers['x-forwarded-host'] as string,
      referrer: headers.referer,
      userAgent: headers['user-agent'] as string,
      jwtKey,
      authorizedParties,
    });

    errorReason && ctx.res.setHeader('Auth-Result', errorReason);

    if (status === AuthStatus.Interstitial) {
      ctx.res.writeHead(401, { 'Content-Type': 'text/html' });
      ctx.res.end(await Clerk.fetchInterstitial());
      return null;
    }

    if (status === AuthStatus.SignedOut || !sessionClaims) {
      return createSignedOutState();
    }

    const sessionId = sessionClaims.sid;
    const userId = sessionClaims.sub;

    const getToken = createGetToken({
      sessionId,
      headerToken,
      cookieToken,
      fetcher: (...args) => sessions.getToken(...args),
    });

    const [user, session] = await Promise.all([
      loadUser ? users.getUser(userId) : Promise.resolve(undefined),
      loadSession ? sessions.getSession(sessionId) : Promise.resolve(undefined),
    ]);

    return { sessionId, userId, user, session, getToken, claims: sessionClaims };
  } catch (err) {
    return createSignedOutState();
  }
}
