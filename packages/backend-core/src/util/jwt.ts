import { ClerkJWTClaims } from '@clerk/types';

import { TokenVerificationErrorReason } from '../types';
import { TokenVerificationError } from './errors';
const DEFAULT_ADDITIONAL_CLOCK_SKEW = 0;

/**
 *
 *
 * @export
 * @param {ClerkJWTClaims} payload
 * @param {*} [additionalClockSkew=DEFAULT_ADDITIONAL_CLOCK_SKEW]
 * @throws {TokenVerificationError}
 */
export function isExpired(payload: ClerkJWTClaims, additionalClockSkew = DEFAULT_ADDITIONAL_CLOCK_SKEW) {
  // verify exp+nbf claims
  const now = Date.now() / 1000;

  if (payload.exp && now > payload.exp + additionalClockSkew) {
    throw new TokenVerificationError(TokenVerificationErrorReason.Expired);
  }

  if (payload.nbf && now < payload.nbf - additionalClockSkew) {
    throw new TokenVerificationError(TokenVerificationErrorReason.NotActiveYet);
  }
}

export function checkClaims(claims: ClerkJWTClaims, authorizedParties?: string[]) {
  if (!claims.iss || !claims.iss.startsWith('https://clerk')) {
    throw new TokenVerificationError(TokenVerificationErrorReason.InvalidIssuer);
  }

  if (claims.azp && authorizedParties && authorizedParties.length > 0) {
    if (!authorizedParties.includes(claims.azp)) {
      throw new TokenVerificationError(TokenVerificationErrorReason.UnauthorizedParty);
    }
  }
}
