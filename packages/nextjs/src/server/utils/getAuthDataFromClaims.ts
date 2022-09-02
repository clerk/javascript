import { createGetToken } from '@clerk/backend-core';
import { ClerkJWTClaims } from '@clerk/types';

import { AuthData, SessionsApi } from '../types';

type GetAuthDataFromClaimsOpts = {
  sessionClaims: ClerkJWTClaims;
  sessions: SessionsApi;
  headerToken: string | undefined;
  cookieToken: string | undefined;
};

export function getAuthDataFromClaims({
  sessionClaims,
  sessions,
  headerToken,
  cookieToken,
}: GetAuthDataFromClaimsOpts): AuthData {
  return {
    sessionId: sessionClaims.sid,
    session: undefined, // currently not loaded here
    userId: sessionClaims.sub,
    user: undefined, // currently not loaded here
    orgId: sessionClaims.org_id,
    organization: undefined, // currently not loaded here
    getToken: createGetToken({
      headerToken: headerToken,
      cookieToken: cookieToken,
      sessionId: sessionClaims.sid,
      fetcher: (...args) => sessions.getToken(...args),
    }),
    claims: sessionClaims,
  };
}
