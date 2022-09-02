import { signedOutGetToken } from '@clerk/backend-core';

import type { RequestLike } from '../types';
import { AuthData, AuthResult, SESSION_COOKIE_NAME, SessionsApi } from '../types';
import { getAuthDataFromClaims } from './getAuthDataFromClaims';
import { getAuthResultFromRequest, getCookie, getHeader } from './requestResponseUtils';

export function createGetAuth(sessions: SessionsApi) {
  return function getAuth(req: RequestLike): AuthData {
    // When the auth result is set, we trust that the middleware has already run
    // Then, we don't have to re-verify the JWT here,
    // we can just strip out the claims manually.

    const authResult = getAuthResultFromRequest(req);

    if (!authResult) {
      throw 'You need to use "withClerkMiddleware" in your Next.js middleware.js file. See https://clerk.dev/docs/quickstarts/get-started-with-nextjs.';
    }

    // Signed in case
    if (authResult === AuthResult.StandardSignedIn) {
      // Get the token from header or cookie

      const headerToken = getHeader(req, 'authorization')?.replace('Bearer ', '');
      const cookieToken = getCookie(req, SESSION_COOKIE_NAME);

      const token = headerToken || cookieToken || '';

      const sessionClaims = JSON.parse(atob(token.split('.')[1]));

      return getAuthDataFromClaims({
        sessionClaims,
        sessions,
        headerToken,
        cookieToken,
      });
    }

    // Signed out case assumed
    return {
      sessionId: null,
      userId: null,
      orgId: null,
      getToken: signedOutGetToken,
      claims: null,
    };
  };
}
