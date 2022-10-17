import { ClerkJWTClaims, JWT } from '@clerk/types';

import crypto from '../runtime/crypto';
import { TokenVerificationError, TokenVerificationErrorReason } from './errors';

const DEFAULT_CLOCK_SKEW_IN_SECONDS = 0;

function now() {
  return Date.now() / 1000;
}

function isExpired({ exp }: ClerkJWTClaims, clockSkewInSeconds = DEFAULT_CLOCK_SKEW_IN_SECONDS) {
  return exp && now() > exp + clockSkewInSeconds;
}

function isNotActiveYet({ nbf }: ClerkJWTClaims, clockSkewInSeconds = DEFAULT_CLOCK_SKEW_IN_SECONDS) {
  return nbf && now() < nbf - clockSkewInSeconds;
}

function hasValidIssuer({ iss }: ClerkJWTClaims) {
  return iss && !iss.startsWith('https://clerk');
}

function hasValidAZP({ azp }: ClerkJWTClaims, authorizedParties: string[]) {
  return azp && authorizedParties.includes(azp);
}

async function hasValidSignature(jwt: JWT, jwk: JsonWebKey) {
  const { header, payload, signature } = jwt.encoded;
  const encoder = new TextEncoder();
  const data = encoder.encode([header, payload].join('.'));
  const signatureBuffer = new Uint8Array(Array.from(signature).map(c => c.charCodeAt(0)));

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    true,
    ['verify'],
  );

  return crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, signatureBuffer, data);
}

export function decodeJwt(token: string): JWT {
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    throw new TokenVerificationError(TokenVerificationErrorReason.MalformedToken);
  }

  const [rawHeader, rawPayload, rawSignature] = tokenParts;

  // TODO: https://stackoverflow.com/questions/54062583/how-to-verify-a-signed-jwt-with-subtlecrypto-of-the-web-crypto-API
  const header = JSON.parse(atob(rawHeader));
  const payload = JSON.parse(atob(rawPayload));
  const signature = atob(rawSignature.replace(/_/g, '/').replace(/-/g, '+'));

  return {
    // TODO: Remove when claims is deprecated
    claims: payload,
    header,
    payload,
    signature,
    encoded: {
      header: rawHeader,
      payload: rawPayload,
      signature: rawSignature,
    },
  };
}

export type VerifyJwtOptions = {
  authorizedParties?: string[];
  clockSkewInSeconds?: number;
  key: JsonWebKey;
};

export async function verifyJwt(
  token: string,
  { key, clockSkewInSeconds, authorizedParties }: VerifyJwtOptions,
): Promise<ClerkJWTClaims> {
  const jwt = decodeJwt(token);
  const { claims } = jwt;

  if (!(await hasValidSignature(jwt, key))) {
    throw new TokenVerificationError(TokenVerificationErrorReason.VerificationFailed);
  }

  if (isExpired(claims, clockSkewInSeconds)) {
    throw new TokenVerificationError(TokenVerificationErrorReason.Expired);
  }

  if (isNotActiveYet(claims, clockSkewInSeconds)) {
    throw new TokenVerificationError(TokenVerificationErrorReason.NotActiveYet);
  }

  if (!hasValidIssuer(claims)) {
    throw new TokenVerificationError(TokenVerificationErrorReason.InvalidIssuer);
  }

  if (claims.azp && authorizedParties && authorizedParties.length > 0) {
    if (!hasValidAZP(claims, authorizedParties)) {
      throw new TokenVerificationError(TokenVerificationErrorReason.UnauthorizedParty);
    }
  }

  return claims;
}
