import { ClerkJWTClaims } from '@clerk/types';

type GetAuthDataFromClaimsOpts = {
  sessionClaims: ClerkJWTClaims;
};

export function getAuthDataFromClaims({ sessionClaims }: GetAuthDataFromClaimsOpts) {
  return {
    sessionId: sessionClaims.sid,
    userId: sessionClaims.sub,
    orgId: sessionClaims.org_id || null,
  };
}
