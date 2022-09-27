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
    userId: sessionClaims.sub,
    orgId: sessionClaims.org_id,
    getToken: createGetToken({
      headerToken: headerToken,
      cookieToken: cookieToken,
      sessionId: sessionClaims.sid,
      fetcher: (...args) => sessions.getToken(...args),
    }),
    claims: sessionClaims,
  };
}
