import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { Simplify } from '@clerk/shared/types';
import type { JwtPayload } from '@clerk/types';

import type { APIKey, IdPOAuthAccessToken, M2MToken } from '../api';
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
import type { LoadClerkJWKFromRemoteOptions } from './keys';
import { loadClerkJwkFromPem, loadClerkJWKFromRemote } from './keys';
import { API_KEY_PREFIX, M2M_TOKEN_PREFIX, OAUTH_TOKEN_PREFIX } from './machine';
import type { MachineTokenType } from './tokenTypes';
import { TokenType } from './tokenTypes';

/**
 * @interface
 */
export type VerifyTokenOptions = Simplify<
  Omit<VerifyJwtOptions, 'key'> &
    Omit<LoadClerkJWKFromRemoteOptions, 'kid'> & {
      /**
       * Used to verify the session token in a networkless manner. Supply the PEM public key from the **[**API keys**](https://dashboard.clerk.com/last-active?path=api-keys) page -> Show JWT public key -> PEM Public Key** section in the Clerk Dashboard. **It's recommended to use [the environment variable](https://clerk.com/docs/guides/development/clerk-environment-variables) instead.** For more information, refer to [Manual JWT verification](https://clerk.com/docs/guides/sessions/manual-jwt-verification).
       */
      jwtKey?: string;
    }
>;

/**
 * > [!WARNING]
 * > This is a lower-level method intended for more advanced use-cases. It's recommended to use [`authenticateRequest()`](https://clerk.com/docs/reference/backend/authenticate-request), which fully authenticates a token passed from the `request` object.
 *
 * Verifies a Clerk-generated token signature. Networkless if the `jwtKey` is provided. Otherwise, performs a network call to retrieve the JWKS from the [Backend API](https://clerk.com/docs/reference/backend-api/tag/JWKS#operation/GetJWKS){{ target: '_blank' }}.
 *
 * @param token - The token to verify.
 * @param options - Options for verifying the token. It is recommended to set these options as [environment variables](/docs/guides/development/clerk-environment-variables#api-and-sdk-configuration) where possible, and then pass them to the function. For example, you can set the `secretKey` option using the `CLERK_SECRET_KEY` environment variable, and then pass it to the function like this: `verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })`.
 *
 * @displayFunctionSignature
 * @hideReturns
 *
 * @example
 *
 * The following example demonstrates how to use the [JavaScript Backend SDK](https://clerk.com/docs/reference/backend/overview) to verify the token signature.
 *
 * In the following example:
 *
 * 1. The **JWKS Public Key** from the Clerk Dashboard is set in the environment variable `CLERK_JWT_KEY`.
 * 1. The session token is retrieved from the `__session` cookie or the Authorization header.
 * 1. The token is verified in a networkless manner by passing the `jwtKey` prop.
 * 1. The `authorizedParties` prop is passed to verify that the session token is generated from the expected frontend application.
 * 1. If the token is valid, the response contains the verified token.
 *
 * ```ts
 * import { verifyToken } from '@clerk/backend'
 * import { cookies } from 'next/headers'
 *
 * export async function GET(request: Request) {
 *   const cookieStore = cookies()
 *   const sessToken = cookieStore.get('__session')?.value
 *   const bearerToken = request.headers.get('Authorization')?.replace('Bearer ', '')
 *   const token = sessToken || bearerToken
 *
 *   if (!token) {
 *     return Response.json({ error: 'Token not found. User must sign in.' }, { status: 401 })
 *   }
 *
 *   try {
 *     const verifiedToken = await verifyToken(token, {
 *       jwtKey: process.env.CLERK_JWT_KEY,
 *       authorizedParties: ['http://localhost:3001', 'api.example.com'], // Replace with your authorized parties
 *     })
 *
 *     return Response.json({ verifiedToken })
 *   } catch (error) {
 *     return Response.json({ error: 'Token not verified.' }, { status: 401 })
 *   }
 * }
 * ```
 *
 * If the token is valid, the response will contain a JSON object that looks something like this:
 *
 * ```json
 * {
 *   "verifiedToken": {
 *     "azp": "http://localhost:3000",
 *     "exp": 1687906422,
 *     "iat": 1687906362,
 *     "iss": "https://magical-marmoset-51.clerk.accounts.dev",
 *     "nbf": 1687906352,
 *     "sid": "sess_2Ro7e2IxrffdqBboq8KfB6eGbIy",
 *     "sub": "user_2RfWKJREkjKbHZy0Wqa5qrHeAnb"
 *   }
 * }
 * ```
 */
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
    let key: JsonWebKey;

    if (options.jwtKey) {
      key = loadClerkJwkFromPem({ kid, pem: options.jwtKey });
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
 * Handles errors from Clerk API responses for machine tokens
 * @param tokenType - The type of machine token
 * @param err - The error from the Clerk API
 * @param notFoundMessage - Custom message for 404 errors
 */
function handleClerkAPIError(
  tokenType: MachineTokenType,
  err: any,
  notFoundMessage: string,
): MachineTokenReturnType<any, MachineTokenVerificationError> {
  if (isClerkAPIResponseError(err)) {
    let code: MachineTokenVerificationErrorCode;
    let message: string;

    switch (err.status) {
      case 401:
        code = MachineTokenVerificationErrorCode.InvalidSecretKey;
        message = err.errors[0]?.message || 'Invalid secret key';
        break;
      case 404:
        code = MachineTokenVerificationErrorCode.TokenInvalid;
        message = notFoundMessage;
        break;
      default:
        code = MachineTokenVerificationErrorCode.UnexpectedError;
        message = 'Unexpected error';
    }

    return {
      data: undefined,
      tokenType,
      errors: [
        new MachineTokenVerificationError({
          message,
          code,
          status: err.status,
        }),
      ],
    };
  }

  return {
    data: undefined,
    tokenType,
    errors: [
      new MachineTokenVerificationError({
        message: 'Unexpected error',
        code: MachineTokenVerificationErrorCode.UnexpectedError,
        status: err.status,
      }),
    ],
  };
}

async function verifyM2MToken(
  token: string,
  options: VerifyTokenOptions & { machineSecretKey?: string },
): Promise<MachineTokenReturnType<M2MToken, MachineTokenVerificationError>> {
  try {
    const client = createBackendApiClient(options);
    const verifiedToken = await client.m2m.verify({ token });
    return { data: verifiedToken, tokenType: TokenType.M2MToken, errors: undefined };
  } catch (err: any) {
    return handleClerkAPIError(TokenType.M2MToken, err, 'Machine token not found');
  }
}

async function verifyOAuthToken(
  accessToken: string,
  options: VerifyTokenOptions,
): Promise<MachineTokenReturnType<IdPOAuthAccessToken, MachineTokenVerificationError>> {
  try {
    const client = createBackendApiClient(options);
    const verifiedToken = await client.idPOAuthAccessToken.verify(accessToken);
    return { data: verifiedToken, tokenType: TokenType.OAuthToken, errors: undefined };
  } catch (err: any) {
    return handleClerkAPIError(TokenType.OAuthToken, err, 'OAuth token not found');
  }
}

async function verifyAPIKey(
  secret: string,
  options: VerifyTokenOptions,
): Promise<MachineTokenReturnType<APIKey, MachineTokenVerificationError>> {
  try {
    const client = createBackendApiClient(options);
    const verifiedToken = await client.apiKeys.verify(secret);
    return { data: verifiedToken, tokenType: TokenType.ApiKey, errors: undefined };
  } catch (err: any) {
    return handleClerkAPIError(TokenType.ApiKey, err, 'API key not found');
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
    return verifyM2MToken(token, options);
  }
  if (token.startsWith(OAUTH_TOKEN_PREFIX)) {
    return verifyOAuthToken(token, options);
  }
  if (token.startsWith(API_KEY_PREFIX)) {
    return verifyAPIKey(token, options);
  }

  throw new Error('Unknown machine token type');
}
