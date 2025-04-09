import type { JwtPayload } from '@clerk/types';

import { createBackendApiClient } from '../api/factory';
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

/**
 * Verifies a machine token.
 *
 * NOTE: Currently, C1s need to provide their CLERK_SECRET_KEY in options for BAPI authorization.
 * In the future, this will be replaced with a dedicated Machine Secret that has limited privileges
 * specifically for M2M token operations.
 *
 * @param secret - The machine token secret (starts with "m2m_")
 * @param options - Options including secretKey for BAPI authorization (temporarily using SK, will support Machine Secret in future)
 */
export async function verifyMachineToken(
  secret: string,
  options: VerifyTokenOptions,
): Promise<JwtReturnType<{ id: string; subject: string }, TokenVerificationError>> {
  try {
    const client = createBackendApiClient(options);
    const verifiedToken = await client.machineTokens.verifyMachineToken(secret);
    return { data: verifiedToken, errors: undefined };
  } catch (err) {
    return { data: undefined, errors: [err as TokenVerificationError] };
  }
}
