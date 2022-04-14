import { AuthStatus, createGetToken, createSignedOutState, Session, User } from '@clerk/backend-core';
import Clerk, { sessions, users } from '@clerk/clerk-sdk-node';
import { ServerGetToken } from '@clerk/types';

import { RootAuthLoaderOptions } from './types';
import { parseCookies } from './utils';

export type AuthData = {
  sessionId: string | null;
  session: Session | undefined | null;
  userId: string | null;
  user: User | undefined | null;
  getToken: ServerGetToken;
  claims: Record<string, unknown> | null;
};

/**
 * @internal
 */
export async function getAuthData(
  req: Request,
  opts: RootAuthLoaderOptions = {},
): Promise<{ authData: AuthData | null; showInterstitial?: boolean; errorReason?: string }> {
  const { loadSession, loadUser, jwtKey, authorizedParties } = opts;
  const { headers } = req;
  const cookies = parseCookies(req);

  try {
    const cookieToken = cookies['__session'];
    const headerToken = headers.get('authorization')?.replace('Bearer ', '');
    const { status, sessionClaims, errorReason } = await Clerk.base.getAuthState({
      cookieToken,
      headerToken,
      clientUat: cookies['__client_uat'],
      origin: headers.get('origin'),
      host: headers.get('host') as string,
      forwardedPort: headers.get('x-forwarded-port') as string,
      forwardedHost: headers.get('x-forwarded-host') as string,
      referrer: headers.get('referer'),
      userAgent: headers.get('user-agent') as string,
      authorizedParties,
      jwtKey,
    });

    if (status === AuthStatus.Interstitial) {
      return { authData: null, showInterstitial: true, errorReason };
    }

    if (status === AuthStatus.SignedOut || !sessionClaims) {
      return { authData: createSignedOutState(), errorReason };
    }

    const sessionId = sessionClaims.sid;
    const userId = sessionClaims.sub;
    const [user, session] = await Promise.all([
      loadUser ? users.getUser(userId) : Promise.resolve(undefined),
      loadSession ? sessions.getSession(sessionId) : Promise.resolve(undefined),
    ]);

    const getToken = createGetToken({
      sessionId,
      cookieToken,
      headerToken,
      fetcher: (...args) => sessions.getToken(...args),
    });

    return { authData: { sessionId, userId, user, session, getToken, claims: sessionClaims } };
  } catch (e) {
    return { authData: createSignedOutState() };
  }
}
