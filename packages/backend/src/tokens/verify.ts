import type { JwtPayload } from '@clerk/types';

import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from './errors';
import type { VerifyJwtOptions } from './jwt';
import { decodeJwt, verifyJwt } from './jwt';
import type { LoadClerkJWKFromRemoteOptions } from './keys';
import { loadClerkJWKFromLocal, loadClerkJWKFromRemote } from './keys';

/**
 *
 */
export type VerifyTokenOptions = Pick<
  VerifyJwtOptions,
  'authorizedParties' | 'audience' | 'issuer' | 'clockSkewInMs'
> & { jwtKey?: string; proxyUrl?: string } & Pick<
    LoadClerkJWKFromRemoteOptions,
    'secretKey' | 'apiUrl' | 'apiVersion' | 'jwksCacheTtlInMs' | 'skipJwksCache'
  >;

export async function verifyToken(token: string, options: VerifyTokenOptions): Promise<JwtPayload> {
  const {
    secretKey,
    apiUrl,
    apiVersion,
    audience,
    authorizedParties,
    clockSkewInMs,
    issuer,
    jwksCacheTtlInMs,
    jwtKey,
    skipJwksCache,
  } = options;

  const { header } = decodeJwt(token);
  const { kid } = header;

  let key;

  if (jwtKey) {
    key = loadClerkJWKFromLocal(jwtKey);
  } else if (typeof issuer === 'string') {
    // Fetch JWKS from Frontend API if an issuer of type string has been provided
    key = await loadClerkJWKFromRemote({ issuer, kid, jwksCacheTtlInMs, skipJwksCache });
  } else if (secretKey) {
    // Fetch JWKS from Backend API using the key
    key = await loadClerkJWKFromRemote({ secretKey, apiUrl, apiVersion, kid, jwksCacheTtlInMs, skipJwksCache });
  } else {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.SetClerkJWTKey,
      message: 'Failed to resolve JWK during verification.',
      reason: TokenVerificationErrorReason.JWKFailedToResolve,
    });
  }

  return await verifyJwt(token, {
    audience,
    authorizedParties,
    clockSkewInMs,
    key,
    issuer,
  });
}
