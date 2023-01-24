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
  } else if (apiKey || secretKey) {
    // TODO: Fetch JWKS from Frontend API instead of Backend API
    //
    // Currently JWKS are fetched from Backend API without using the JWT issuer. This should change
    // with the new Backend key format so that the API Key is not required for token verification and
    // the jwks retrieval is driven from the current JWT header.
    const opts = apiKey
      ? ({ apiUrl, apiKey, apiVersion, kid, jwksCacheTtlInMs, skipJwksCache } as LoadClerkJWKFromRemoteOptions)
      : ({ apiUrl, secretKey, apiVersion, kid, jwksCacheTtlInMs, skipJwksCache } as LoadClerkJWKFromRemoteOptions);
    key = await loadClerkJWKFromRemote(opts);
  } else {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.SetClerkJWTKey,
      message: 'Failed to resolve JWK during verification.',
      reason: TokenVerificationErrorReason.JWKFailedToResolve,
    });
  }

  const payload = await verifyJwt(token, {
    authorizedParties,
    clockSkewInSeconds,
    key,
    issuer,
  });

  return payload;
}
