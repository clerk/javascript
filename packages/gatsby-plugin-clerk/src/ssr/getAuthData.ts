import { AuthStatus, createGetToken, createSignedOutState, Session, User } from '@clerk/backend-core';
import { isDevelopmentOrStaging } from '@clerk/backend-core/src/util/clerkApiKey';
import Clerk, { sessions, users } from '@clerk/clerk-sdk-node';
import { ServerGetToken } from '@clerk/types';
import { GetServerDataProps } from 'gatsby';

import { WithServerAuthOptions } from './types';
import { parseCookies } from './utils';

export type AuthData = {
  sessionId: string | null;
  session: Session | undefined | null;
  userId: string | null;
  user: User | undefined | null;
  getToken: ServerGetToken;
};

type GetAuthDataReturn =
  | {
      authData: AuthData;
      showInterstitial?: undefined;
      errorReason?: string;
    }
  | {
      authData: null;
      showInterstitial: true;
      errorReason?: string;
    };

export async function getAuthData(
  context: GetServerDataProps,
  options: WithServerAuthOptions,
): Promise<GetAuthDataReturn> {
  const { loadSession, loadUser } = options;
  const { headers } = context;
  const cookies = parseCookies(headers);
  try {
    const cookieToken = cookies['__session'];
    const headerToken = (headers.get('authorization') as string)?.replace('Bearer ', '');

    const { status, sessionClaims, errorReason } = await Clerk.base.getAuthState({
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
    return { authData: { sessionId, userId, user, session, getToken } };
  } catch (e) {
    return { authData: createSignedOutState() };
  }
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
