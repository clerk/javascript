import { JWTPayload } from './types';

export function isExpired(
  payload: JWTPayload
) {
  // verify exp+nbf claims
  const now = Date.now() / 1000;

  if (payload.exp && payload.exp < now) {
    throw new Error(`Expired token`);
  }

  // TODO: Error handling logic based on nbf attribute and clock skew.
}

export function checkClaims(claims: JWTPayload) {
  if (!claims.iss || !claims.iss.startsWith('https://clerk')) {
    throw new Error(`Invalid issuer: ${claims.iss}`);
  }
}
