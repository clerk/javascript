import type { JwtPayload } from '@clerk/types';

import { API_KEY, API_URL, API_VERSION, JWT_KEY } from '../constants';
import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from './errors';
import { type VerifyJwtOptions, decodeJwt, verifyJwt } from './jwt';
import { loadClerkJWKFromLocal, loadClerkJWKFromRemote, LoadClerkJWKFromRemoteOptions } from './keys';

/**
 *
 */
export type VerifyTokenOptions = Pick<
  VerifyJwtOptions,
  'authorizedParties' | 'audience' | 'issuer' | 'clockSkewInSeconds'
> &
  Pick<LoadClerkJWKFromRemoteOptions, 'apiKey' | 'apiUrl' | 'apiVersion' | 'jwksCacheTtlInMs' | 'skipJwksCache'>;

export async function verifyToken(token: string, options: VerifyTokenOptions): Promise<JwtPayload> {
  const {
    apiKey = API_KEY,
    apiUrl = API_URL,
    apiVersion = API_VERSION,
    authorizedParties,
    clockSkewInSeconds,
    issuer,
    jwksCacheTtlInMs,
    skipJwksCache,
  } = options;

  const { header } = decodeJwt(token);
  const { kid } = header;

  let key;

  if (JWT_KEY) {
    key = await loadClerkJWKFromLocal(JWT_KEY);
  } else if (apiKey) {
    // TODO: Fetch JWKS from Frontend API instead of Backend API
    //
    // Currently JWKS are fetched from Backend API without using the JWT issuer. This should change
    // with the new Backend key format so that the API Key is not required for token verification and
    // the jwks retrieval is driven from the current JWT header.
    key = await loadClerkJWKFromRemote({
      apiUrl,
      apiKey,
      apiVersion,
      kid,
      jwksCacheTtlInMs,
      skipJwksCache,
    });
  } else {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.SetClerkJWTKey,
      message: 'Failed to resolve JWK during verification.',
      reason: TokenVerificationErrorReason.JWKFailedToResolve,
    });
  }

  const result = await verifyJwt(token, {
    authorizedParties,
    clockSkewInSeconds,
    key,
    issuer,
  });

  if (!result.valid) {
    throw new TokenVerificationError({
      // Not to be confused with TokenVerificationErrorReason. This text says why JWT verification failed.
      message: result.reason,
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
    });
  }

  return result.payload;
}
