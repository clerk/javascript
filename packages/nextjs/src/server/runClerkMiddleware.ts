import { AuthStatus, createGetToken } from '@clerk/backend-core';
import { NextRequest, NextResponse } from 'next/server';

import { sessions, vercelEdgeBase } from '../edge-middleware';

const DEFAULT_API_URL = process.env.CLERK_API_URL || 'https://api.clerk.dev';
const DEFAULT_API_VERSION = process.env.CLERK_API_VERSION || 'v1';

const INTERSTITIAL_URL = `${DEFAULT_API_URL}/${DEFAULT_API_VERSION}/internal/interstitial`;

type RunClerkMiddlewareOptions = {
  jwtKey?: string;
  authorizedParties?: string[];
};

export async function runClerkMiddleware(req: NextRequest, opts: RunClerkMiddlewareOptions = {}): Promise<any> {
  const { headers, cookies } = req;
  const { jwtKey, authorizedParties } = opts;

  try {
    const cookieToken = cookies.get('__session');
    const headerToken = headers.get('authorization')?.replace('Bearer ', '');
    const { status, sessionClaims } = await vercelEdgeBase.getAuthState({
      cookieToken,
      headerToken,
      clientUat: cookies.get('__client_uat'),
      origin: headers.get('origin'),
      host: headers.get('host') as string,
      forwardedPort: headers.get('x-forwarded-port'),
      forwardedHost: headers.get('x-forwarded-host'),
      referrer: headers.get('referer'),
      userAgent: headers.get('user-agent'),
      fetchInterstitial: () => null,
      jwtKey,
      authorizedParties,
    });

    const auth = {
      sessionId: sessionClaims?.sid,
      userId: sessionClaims?.sub,
      getToken: createGetToken({
        headerToken,
        cookieToken,
        sessionId: sessionClaims?.sid,
        fetcher: (...args) => sessions.getToken(...args),
      }),
      claims: sessionClaims,
    };

    if (status === AuthStatus.Interstitial) {
      return {
        response: NextResponse.rewrite(INTERSTITIAL_URL, {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_API_KEY}`,
          },
        }),
        auth,
      };
    }

    const response = NextResponse.next();
    response.headers.append(
      'Clerk-Auth-Middleware',
      JSON.stringify({ status, ...auth, getToken: undefined, cookieToken, headerToken }),
    );
    return {
      response,
      auth,
    };
  } catch (err) {
    return { response: null, auth: null };
  }
}
