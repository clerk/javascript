import { JWTPayload } from "./types";
const DEFAULT_ALLOWED_CLOCK_SKEW = 10;

export function isExpired(payload: JWTPayload, allowedClerkSkew = DEFAULT_ALLOWED_CLOCK_SKEW) {
  // verify exp+nbf claims
  const now = Date.now() / 1000;

  if (payload.exp && payload.exp < now) {
    throw new Error(`Expired token`);
  }

  if (payload.nbf && now < payload.nbf + allowedClerkSkew) {
    throw new Error(`Expired token`);
  }
}

export function checkClaims(claims: JWTPayload) {
  if (!claims.iss || !claims.iss.startsWith("https://clerk")) {
    throw new Error(`Invalid issuer: ${claims.iss}`);
  }
}
