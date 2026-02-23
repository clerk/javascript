import type { Jwt, JwtPayload } from '@clerk/shared/types';

import { IdPOAuthAccessToken } from '../api/resources/IdPOAuthAccessToken';
import { M2MToken } from '../api/resources/M2MToken';
import {
  MachineTokenVerificationError,
  MachineTokenVerificationErrorCode,
  TokenVerificationErrorAction,
} from '../errors';
import type { MachineTokenReturnType } from '../jwt/types';
import { verifyJwt } from '../jwt/verifyJwt';
import type { LoadClerkJWKFromRemoteOptions } from '../tokens/keys';
import { loadClerkJwkFromPem, loadClerkJWKFromRemote } from '../tokens/keys';
import { OAUTH_ACCESS_TOKEN_TYPES } from '../tokens/machine';
import { TokenType } from '../tokens/tokenTypes';

export type JwtMachineVerifyOptions = Pick<LoadClerkJWKFromRemoteOptions, 'secretKey' | 'apiUrl' | 'skipJwksCache'> & {
  jwtKey?: string;
  clockSkewInMs?: number;
};

/**
 * Resolves the signing key and verifies a machine JWT's signature and claims.
 *
 * Networkless when `jwtKey` (PEM) is provided; performs a JWKS fetch when only `secretKey` is set.
 * Returns a discriminated union so callers can branch on `'error' in result` without try/catch.
 *
 * Note: uses `MachineTokenVerificationError`, not `TokenVerificationError` — the two error types
 * are intentionally separate because session-token errors carry handshake metadata that machine
 * tokens don't need.
 */
async function resolveKeyAndVerifyJwt(
  token: string,
  kid: string,
  options: JwtMachineVerifyOptions,
  headerType?: string[],
): Promise<{ payload: JwtPayload } | { error: MachineTokenVerificationError }> {
  try {
    let key: JsonWebKey;

    if (options.jwtKey) {
      key = loadClerkJwkFromPem({ kid, pem: options.jwtKey });
    } else if (options.secretKey) {
      key = await loadClerkJWKFromRemote({ ...options, kid });
    } else {
      return {
        error: new MachineTokenVerificationError({
          action: TokenVerificationErrorAction.SetClerkJWTKey,
          message: 'Failed to resolve JWK during verification.',
          code: MachineTokenVerificationErrorCode.TokenVerificationFailed,
        }),
      };
    }

    const { data: payload, errors: verifyErrors } = await verifyJwt(token, {
      ...options,
      key,
      ...(headerType ? { headerType } : {}),
    });

    if (verifyErrors) {
      return {
        error: new MachineTokenVerificationError({
          code: MachineTokenVerificationErrorCode.TokenVerificationFailed,
          message: verifyErrors[0].message,
        }),
      };
    }

    return { payload };
  } catch (error) {
    return {
      error: new MachineTokenVerificationError({
        code: MachineTokenVerificationErrorCode.TokenVerificationFailed,
        message: (error as Error).message,
      }),
    };
  }
}

/**
 * Verifies a pre-decoded M2M JWT (identified by `sub` starting with `mch_`).
 * Delegates key resolution and signature verification to `resolveKeyAndVerifyJwt`,
 * then maps the verified payload to an `M2MToken` via `M2MToken.fromJwtPayload`.
 */
export async function verifyM2MJwt(
  token: string,
  decoded: Jwt,
  options: JwtMachineVerifyOptions,
): Promise<MachineTokenReturnType<M2MToken, MachineTokenVerificationError>> {
  const result = await resolveKeyAndVerifyJwt(token, decoded.header.kid, options);

  if ('error' in result) {
    return { data: undefined, tokenType: TokenType.M2MToken, errors: [result.error] };
  }

  return {
    data: M2MToken.fromJwtPayload(result.payload, options.clockSkewInMs),
    tokenType: TokenType.M2MToken,
    errors: undefined,
  };
}

/**
 * Verifies a pre-decoded OAuth access token JWT (identified by `typ: at+jwt` or `application/at+jwt`).
 * Delegates key resolution and signature verification to `resolveKeyAndVerifyJwt` with the
 * allowed OAuth header types, then maps the verified payload to an `IdPOAuthAccessToken`.
 */
export async function verifyOAuthJwt(
  token: string,
  decoded: Jwt,
  options: JwtMachineVerifyOptions,
): Promise<MachineTokenReturnType<IdPOAuthAccessToken, MachineTokenVerificationError>> {
  const result = await resolveKeyAndVerifyJwt(token, decoded.header.kid, options, OAUTH_ACCESS_TOKEN_TYPES);

  if ('error' in result) {
    return { data: undefined, tokenType: TokenType.OAuthToken, errors: [result.error] };
  }

  return {
    data: IdPOAuthAccessToken.fromJwtPayload(result.payload, options.clockSkewInMs),
    tokenType: TokenType.OAuthToken,
    errors: undefined,
  };
}
