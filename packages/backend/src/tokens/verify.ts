import type { JwtPayload } from '@clerk/types';

import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from '../errors';
import type { VerifyJwtOptions } from '../jwt';
import { decodeJwt, verifyJwt } from '../jwt';
import type { JwtReturnType } from '../jwt/types';
import type { LoadClerkJWKFromRemoteOptions } from './keys';
import { loadClerkJWKFromLocal, loadClerkJWKFromRemote } from './keys';

export type VerifyTokenOptions = Omit<VerifyJwtOptions, 'key'> &
  Omit<LoadClerkJWKFromRemoteOptions, 'kid'> & { jwtKey?: string };

export async function verifyToken(
  token: string,
  options: VerifyTokenOptions,
): Promise<JwtReturnType<JwtPayload, TokenVerificationError>> {
  const { data: decodedResult, error: decodedError } = decodeJwt(token);
  if (decodedError) {
    return { error: decodedError };
  }

  const { header } = decodedResult;
  const { kid } = header;

  try {
    let key;

    if (options.jwtKey) {
      key = loadClerkJWKFromLocal(options.jwtKey);
    } else if (options.secretKey) {
      // Fetch JWKS from Backend API using the key
      key = await loadClerkJWKFromRemote({ ...options, kid });
    } else {
      return {
        error: new TokenVerificationError({
          action: TokenVerificationErrorAction.SetClerkJWTKey,
          message: 'Failed to resolve JWK during verification.',
          reason: TokenVerificationErrorReason.JWKFailedToResolve,
        }),
      };
    }

    return await verifyJwt(token, { ...options, key });
  } catch (error) {
    return { error: error as TokenVerificationError };
  }
}
