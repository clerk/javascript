import type { JwtPayload } from '@clerk/types';

import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from '../errors';
import type { VerifyJwtOptions } from '../jwt';
import type { JwtReturnType } from '../jwt/types';
import { decodeJwt, verifyJwt } from '../jwt/verifyJwt';
import type { LoadClerkJWKFromRemoteOptions } from './keys';
import { loadClerkJWKFromLocal, loadClerkJWKFromRemote } from './keys';

export type VerifyTokenOptions = Omit<VerifyJwtOptions, 'key'> &
  Omit<LoadClerkJWKFromRemoteOptions, 'kid'> & {
    /**
     * Used to verify the session token in a networkless manner. Supply the PEM public key from the **[**API keys**](https://dashboard.clerk.com/last-active?path=api-keys) page -> Show JWT public key -> PEM Public Key** section in the Clerk Dashboard. **It's recommended to use [the environment variable](https://clerk.com/docs/deployments/clerk-environment-variables) instead.** For more information, refer to [Manual JWT verification](https://clerk.com/docs/backend-requests/handling/manual-jwt).
     */
    jwtKey?: string;
  };

export async function verifyToken(
  token: string,
  options: VerifyTokenOptions,
): Promise<JwtReturnType<JwtPayload, TokenVerificationError>> {
  const { data: decodedResult, errors } = decodeJwt(token);
  if (errors) {
    return { errors };
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
        errors: [
          new TokenVerificationError({
            action: TokenVerificationErrorAction.SetClerkJWTKey,
            message: 'Failed to resolve JWK during verification.',
            reason: TokenVerificationErrorReason.JWKFailedToResolve,
          }),
        ],
      };
    }

    return await verifyJwt(token, { ...options, key });
  } catch (error) {
    return { errors: [error as TokenVerificationError] };
  }
}
