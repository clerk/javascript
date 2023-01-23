import type { JwtPayload } from '@clerk/types';

import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from './errors';
import { decodeJwt, verifyJwt, VerifyJwtOptions } from './jwt';
import { loadClerkJWKFromLocal, loadClerkJWKFromRemote, LoadClerkJWKFromRemoteOptions } from './keys';

/**
 *
 */
export type VerifyTokenOptions = Pick<
  VerifyJwtOptions,
  'authorizedParties' | 'audience' | 'issuer' | 'clockSkewInSeconds'
> & { jwtKey?: string } & Pick<
    LoadClerkJWKFromRemoteOptions,
    'apiKey' | 'secretKey' | 'apiUrl' | 'apiVersion' | 'jwksCacheTtlInMs' | 'skipJwksCache'
  >;

export async function verifyToken(token: string, options: VerifyTokenOptions): Promise<JwtPayload> {
  const {
    apiKey,
    secretKey,
    apiUrl,
    apiVersion,
    authorizedParties,
    clockSkewInSeconds,
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
  } else if (apiKey || secretKey) {
    // Fetch JWKS from Backend API using the key
    key = await loadClerkJWKFromRemote({ apiKey, secretKey, apiUrl, apiVersion, kid, jwksCacheTtlInMs, skipJwksCache });
  } else {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.SetClerkJWTKey,
      message: 'Failed to resolve JWK during verification.',
      reason: TokenVerificationErrorReason.JWKFailedToResolve,
    });
  }

  return await verifyJwt(token, {
    authorizedParties,
    clockSkewInSeconds,
    key,
    issuer,
  });
}
