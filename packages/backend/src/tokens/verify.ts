import type { JwtPayload, ReturnWithError } from '@clerk/types';

import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from '../errors';
import type { VerifyJwtOptions } from '../jwt';
import { decodeJwt, verifyJwt } from '../jwt';
import type { LoadClerkJWKFromRemoteOptions } from './keys';
import { loadClerkJWKFromLocal, loadClerkJWKFromRemote } from './keys';

/**
 *
 */
export type VerifyTokenOptions = Pick<VerifyJwtOptions, 'authorizedParties' | 'audience' | 'clockSkewInMs'> & {
  jwtKey?: string;
} & Pick<LoadClerkJWKFromRemoteOptions, 'secretKey' | 'apiUrl' | 'apiVersion' | 'jwksCacheTtlInMs' | 'skipJwksCache'>;

export async function verifyToken(
  token: string,
  options: VerifyTokenOptions,
): Promise<ReturnWithError<JwtPayload, TokenVerificationError>> {
  const {
    secretKey,
    apiUrl,
    apiVersion,
    audience,
    authorizedParties,
    clockSkewInMs,
    jwksCacheTtlInMs,
    jwtKey,
    skipJwksCache,
  } = options;

  const { header } = decodeJwt(token);
  const { kid } = header;

  try {
    let key;

    if (jwtKey) {
      key = loadClerkJWKFromLocal(jwtKey);
    } else if (secretKey) {
      // Fetch JWKS from Backend API using the key
      key = await loadClerkJWKFromRemote({ secretKey, apiUrl, apiVersion, kid, jwksCacheTtlInMs, skipJwksCache });
    } else {
      return {
        error: new TokenVerificationError({
          action: TokenVerificationErrorAction.SetClerkJWTKey,
          message: 'Failed to resolve JWK during verification.',
          reason: TokenVerificationErrorReason.JWKFailedToResolve,
        }),
      };
    }

    const data = await verifyJwt(token, {
      audience,
      authorizedParties,
      clockSkewInMs,
      key,
    });

    return { data };
  } catch (error) {
    return { error: error as TokenVerificationError };
  }
}
