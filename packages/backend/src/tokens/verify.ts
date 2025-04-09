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

async function verifyM2MToken(
  secret: string,
  options: VerifyTokenOptions,
): Promise<JwtReturnType<{ id: string; subject: string }, TokenVerificationError>> {
  try {
    const client = createBackendApiClient(options);
    const verifiedToken = await client.m2mTokens.verifyToken(secret);
    return { data: verifiedToken, errors: undefined };
  } catch (err) {
    return { data: undefined, errors: [err as TokenVerificationError] };
  }
}

async function verifyOAuthToken(
  secret: string,
  options: VerifyTokenOptions,
): Promise<JwtReturnType<{ id: string; subject: string }, TokenVerificationError>> {
  try {
    const client = createBackendApiClient(options);
    const verifiedToken = await client.oauthAccessTokens.verifyToken(secret);
    return { data: verifiedToken, errors: undefined };
  } catch (err) {
    return { data: undefined, errors: [err as TokenVerificationError] };
  }
}

async function verifyAPIKeyToken(
  secret: string,
  options: VerifyTokenOptions,
): Promise<JwtReturnType<{ id: string; subject: string }, TokenVerificationError>> {
  try {
    const client = createBackendApiClient(options);
    const verifiedToken = await client.apiKeyTokens.verifyToken(secret);
    return { data: verifiedToken, errors: undefined };
  } catch (err) {
    return { data: undefined, errors: [err as TokenVerificationError] };
  }
}

/**
 * Verifies any type of machine token by detecting its type from the prefix.
 *
 * @param token - The token to verify (e.g. starts with "m2m_", "oaa_", "ak_", etc.)
 * @param options - Options including secretKey for BAPI authorization
 */
export async function verifyMachineToken(
  token: string,
  options: VerifyTokenOptions,
): Promise<JwtReturnType<{ id: string; subject: string }, TokenVerificationError>> {
  if (token.startsWith('m2m_')) {
    return verifyM2MToken(token, options);
  }
  if (token.startsWith('oaa_')) {
    return verifyOAuthToken(token, options);
  }
  if (token.startsWith('ak_')) {
    return verifyAPIKeyToken(token, options);
  }

  // TODO: Update error message
  throw new Error('Unknown token type');
}
