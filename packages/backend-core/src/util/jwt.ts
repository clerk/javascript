import { JWTExpiredError } from '../api/utils/Errors';
import { JWTPayload } from './types';
const DEFAULT_ADDITIONAL_CLOCK_SKEW = 0;

export function isExpired(
  payload: JWTPayload,
  additionalClockSkew = DEFAULT_ADDITIONAL_CLOCK_SKEW
) {
  // verify exp+nbf claims
  const now = Date.now() / 1000;

  if (payload.exp && now > payload.exp + additionalClockSkew) {
    throw new JWTExpiredError(`Token is expired`);
  }

  if (payload.nbf && now < payload.nbf - additionalClockSkew) {
    throw new Error(`Token is not active yet`);
  }
}

export function checkClaims(claims: JWTPayload) {
  if (!claims.iss || !claims.iss.startsWith('https://clerk')) {
    throw new Error(`Issuer is invalid: ${claims.iss}`);
  }
}
