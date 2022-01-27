import { JWTPayload } from './types';
const DEFAULT_ADDITIONAL_CLOCK_SKEW = 0;

export function isExpired(
  payload: JWTPayload,
  additionalClockSkew = DEFAULT_ADDITIONAL_CLOCK_SKEW
) {
  // verify exp+nbf claims
  const now = Date.now() / 1000;

  if (payload.exp && now > payload.exp + additionalClockSkew) {
    throw new Error(`Token is expired`);
  }

  if (payload.nbf && now < payload.nbf - additionalClockSkew) {
    throw new Error(`Token is not active yet`);
  }
}

export function checkClaims(claims: JWTPayload, authorizedParties?: string[]) {
  if (!claims.iss || !claims.iss.startsWith('https://clerk')) {
    throw new Error(`Issuer is invalid: ${claims.iss}`);
  }

  if (claims.azp && authorizedParties && authorizedParties.length !== 0) {
    if (!authorizedParties.includes(claims.azp as string)) {
      throw new Error(`Authorized party is invalid: ${claims.azp}`);
    }
  }
}
