import { AuthStatus, createGetToken, createSignedOutState } from '@clerk/backend-core';
import Clerk, { organizations, sessions, users } from '@clerk/clerk-sdk-node';
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
  const { loadSession, loadUser, loadOrg, jwtKey, authorizedParties } = opts;

  try {
    const cookieToken = cookies['__session'];
    const headerToken = headers.authorization?.replace('Bearer ', '');
    const { status, sessionClaims, interstitial, errorReason } = await Clerk.base.getAuthState({
      cookieToken,
      headerToken,
      clientUat: cookies['__client_uat'],
      origin: headers.origin,
      host: headers.host as string,
      forwardedPort: headers['x-forwarded-port'] as string,
      forwardedHost: headers['x-forwarded-host'] as string,
      referrer: headers.referer,
      userAgent: headers['user-agent'] as string,
      fetchInterstitial: () => Clerk.fetchInterstitial(),
      jwtKey,
      authorizedParties,
    });

    errorReason && ctx.res.setHeader('Auth-Result', errorReason);

    if (status === AuthStatus.Interstitial) {
      ctx.res.writeHead(401, { 'Content-Type': 'text/html' });
      ctx.res.end(interstitial);
      return null;
    }

    if (status === AuthStatus.SignedOut || !sessionClaims) {
      return createSignedOutState();
    }

    const sessionId = sessionClaims.sid;
    const userId = sessionClaims.sub;
    const organizationId = sessionClaims.org_id;

    const getToken = createGetToken({
      sessionId,
      headerToken,
      cookieToken,
      fetcher: (...args) => sessions.getToken(...args),
    });

    const [user, session, organization] = await Promise.all([
      loadUser ? users.getUser(userId) : Promise.resolve(undefined),
      loadSession ? sessions.getSession(sessionId) : Promise.resolve(undefined),
      loadOrg && organizationId ? organizations.getOrganization({ organizationId }) : Promise.resolve(undefined),
    ]);

    return { sessionId, userId, user, session, organization, getToken, claims: sessionClaims };
  } catch (err) {
    return createSignedOutState();
  }
}
