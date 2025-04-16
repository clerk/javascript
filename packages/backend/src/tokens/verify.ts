import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { JwtPayload } from '@clerk/types';

import type { APIKey, MachineToken, OauthApplicationToken } from '../api';
import { createBackendApiClient } from '../api/factory';
import {
  MachineTokenVerificationError,
  MachineTokenVerificationErrorCode,
  TokenVerificationError,
  TokenVerificationErrorAction,
  TokenVerificationErrorReason,
} from '../errors';
import type { VerifyJwtOptions } from '../jwt';
import type { JwtReturnType, MachineTokenReturnType } from '../jwt/types';
import { decodeJwt, verifyJwt } from '../jwt/verifyJwt';
import type { TokenEntity } from '../tokens/types';
import type { LoadClerkJWKFromRemoteOptions } from './keys';
import { loadClerkJWKFromLocal, loadClerkJWKFromRemote } from './keys';
import { API_KEY_PREFIX, M2M_TOKEN_PREFIX, OAUTH_TOKEN_PREFIX } from './machine';

export type VerifyTokenOptions = Omit<VerifyJwtOptions, 'key'> &
  Omit<LoadClerkJWKFromRemoteOptions, 'kid'> & {
    /**
     * Used to verify the session token in a networkless manner. Supply the PEM public key from the **[**API keys**](https://dashboard.clerk.com/last-active?path=api-keys) page -> Show JWT public key -> PEM Public Key** section in the Clerk Dashboard. **It's recommended to use [the environment variable](https://clerk.com/docs/deployments/clerk-environment-variables) instead.** For more information, refer to [Manual JWT verification](https://clerk.com/docs/backend-requests/manual-jwt).
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

function handleUnexpectedMachineError(
  entity: Exclude<TokenEntity, 'user'>,
  err: any,
): MachineTokenReturnType<any, MachineTokenVerificationError> {
  return {
    data: undefined,
    entity,
    errors: [
      new MachineTokenVerificationError({
        message: 'Unexpected error',
        code: MachineTokenVerificationErrorCode.UnexpectedError,
        status: err.status,
      }),
    ],
  };
}

async function verifyMachineToken(
  secret: string,
  options: VerifyTokenOptions,
): Promise<MachineTokenReturnType<MachineToken, MachineTokenVerificationError>> {
  try {
    const client = createBackendApiClient(options);
    const verifiedToken = await client.machineTokens.verifySecret(secret);
    return { data: verifiedToken, entity: 'machine_token', errors: undefined };
  } catch (err: any) {
    if (isClerkAPIResponseError(err)) {
      let code: MachineTokenVerificationErrorCode;
      let message: string;

      switch (err.status) {
        case 401:
          code = MachineTokenVerificationErrorCode.InvalidSecretKey;
          message = err.errors[0].message;
          break;
        case 404:
          code = MachineTokenVerificationErrorCode.TokenInvalid;
          message = 'Machine token not found';
          break;
        default:
          code = MachineTokenVerificationErrorCode.UnexpectedError;
          message = 'Unexpected error';
      }

      return {
        data: undefined,
        entity: 'machine_token',
        errors: [
          new MachineTokenVerificationError({
            message,
            code,
            status: err.status,
          }),
        ],
      };
    }

    return handleUnexpectedMachineError('machine_token', err);
  }
}

async function verifyOAuthToken(
  secret: string,
  options: VerifyTokenOptions,
): Promise<MachineTokenReturnType<OauthApplicationToken, MachineTokenVerificationError>> {
  try {
    const client = createBackendApiClient(options);
    const verifiedToken = await client.oAuthApplicationTokens.verifySecret(secret);
    return { data: verifiedToken, entity: 'oauth_token', errors: undefined };
  } catch (err: any) {
    if (isClerkAPIResponseError(err)) {
      let code: MachineTokenVerificationErrorCode;
      let message: string;

      switch (err.status) {
        case 401:
          code = MachineTokenVerificationErrorCode.InvalidSecretKey;
          message = err.errors[0].message;
          break;
        case 404:
          code = MachineTokenVerificationErrorCode.TokenInvalid;
          message = 'OAuth token not found';
          break;
        default:
          code = MachineTokenVerificationErrorCode.UnexpectedError;
          message = 'Unexpected error';
      }

      return {
        data: undefined,
        entity: 'oauth_token',
        errors: [
          new MachineTokenVerificationError({
            message,
            code,
            status: err.status,
          }),
        ],
      };
    }

    return handleUnexpectedMachineError('oauth_token', err);
  }
}

async function verifyAPIKey(
  secret: string,
  options: VerifyTokenOptions,
): Promise<MachineTokenReturnType<APIKey, MachineTokenVerificationError>> {
  try {
    const client = createBackendApiClient(options);
    const verifiedToken = await client.apiKeys.verifySecret(secret);
    return { data: verifiedToken, entity: 'api_key', errors: undefined };
  } catch (err: any) {
    if (isClerkAPIResponseError(err)) {
      let code: MachineTokenVerificationErrorCode;
      let message: string;

      switch (err.status) {
        case 401:
          code = MachineTokenVerificationErrorCode.InvalidSecretKey;
          message = err.errors[0].message;
          break;
        case 404:
          code = MachineTokenVerificationErrorCode.TokenInvalid;
          message = 'API key not found';
          break;
        default:
          code = MachineTokenVerificationErrorCode.UnexpectedError;
          message = 'Unexpected error';
      }

      return {
        data: undefined,
        entity: 'api_key',
        errors: [
          new MachineTokenVerificationError({
            message,
            code,
            status: err.status,
          }),
        ],
      };
    }

    return handleUnexpectedMachineError('api_key', err);
  }
}

/**
 * Verifies any type of machine token by detecting its type from the prefix.
 *
 * @param token - The token to verify (e.g. starts with "m2m_", "oauth_", "api_key_", etc.)
 * @param options - Options including secretKey for BAPI authorization
 */
export async function verifyMachineAuthToken(token: string, options: VerifyTokenOptions) {
  if (token.startsWith(M2M_TOKEN_PREFIX)) {
    return verifyMachineToken(token, options);
  }
  if (token.startsWith(OAUTH_TOKEN_PREFIX)) {
    return verifyOAuthToken(token, options);
  }
  if (token.startsWith(API_KEY_PREFIX)) {
    return verifyAPIKey(token, options);
  }

  // TODO: Gracefully handle unknown machine token type
  throw new Error('Unknown machine token type');
}
