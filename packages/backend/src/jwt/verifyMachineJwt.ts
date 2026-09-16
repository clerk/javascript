import type { Jwt, JwtPayload } from '@clerk/shared/types';

import { IdPOAuthAccessToken } from '../api/resources/IdPOAuthAccessToken';
import { M2MToken } from '../api/resources/M2MToken';
import {
  MachineTokenVerificationError,
  MachineTokenVerificationErrorCode,
  TokenVerificationErrorAction,
} from '../errors';
import type { MachineTokenReturnType } from '../jwt/types';
import type { VerifyJwtOptions } from '../jwt/verifyJwt';
import { verifyJwt } from '../jwt/verifyJwt';
import { JWT_CATEGORY_M2M_TOKEN } from '../tokens/jwtCategories';
import type { LoadClerkJWKFromRemoteOptions } from '../tokens/keys';
import { loadClerkJwkFromPem, loadClerkJWKFromRemote } from '../tokens/keys';
import { OAUTH_ACCESS_TOKEN_TYPES } from '../tokens/machine';
import { TokenType } from '../tokens/tokenTypes';

export type JwtMachineVerifyOptions = Pick<
  LoadClerkJWKFromRemoteOptions,
  'secretKey' | 'publishableKey' | 'apiUrl' | 'skipJwksCache'
> & {
  jwtKey?: string;
  clockSkewInMs?: number;
  audience?: VerifyJwtOptions['audience'];
};

/**
 * Resolves the signing key and verifies a machine JWT's signature and claims.
 *
 * Networkless when `jwtKey` (PEM) is provided; otherwise fetches the JWKS from the Backend API
 * (`secretKey`) or the Frontend API (`publishableKey`).
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
    } else if (options.secretKey || options.publishableKey) {
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
 */
export async function verifyM2MJwt(
  token: string,
  decoded: Jwt,
  options: JwtMachineVerifyOptions,
): Promise<MachineTokenReturnType<M2MToken, MachineTokenVerificationError>> {
  // Reject JWTs of another class (e.g. session, jwt-template) signed by the same
  // instance key. Absent `cat` is still accepted during the rollout window; tighten
  // to strict equality once pre-rollout M2M JWTs have expired (USER-5437).
  const cat = decoded.header.cat;
  if (cat !== undefined && cat !== JWT_CATEGORY_M2M_TOKEN) {
    return {
      data: undefined,
      tokenType: TokenType.M2MToken,
      errors: [
        new MachineTokenVerificationError({
          code: MachineTokenVerificationErrorCode.TokenInvalid,
          message: 'Invalid M2M JWT category.',
        }),
      ],
    };
  }

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
 */
export async function verifyOAuthJwt(
  token: string,
  decoded: Jwt,
  options: JwtMachineVerifyOptions,
): Promise<MachineTokenReturnType<IdPOAuthAccessToken, MachineTokenVerificationError>> {
  const { audience, ...jwtOptions } = options;
  const result = await resolveKeyAndVerifyJwt(token, decoded.header.kid, jwtOptions, OAUTH_ACCESS_TOKEN_TYPES);

  if ('error' in result) {
    return { data: undefined, tokenType: TokenType.OAuthToken, errors: [result.error] };
  }

  const data = IdPOAuthAccessToken.fromJwtPayload(result.payload, options.clockSkewInMs);
  const audienceError = verifyOAuthAudience(data.aud, audience);
  if (audienceError) {
    return { data: undefined, tokenType: TokenType.OAuthToken, errors: [audienceError] };
  }

  return { data, tokenType: TokenType.OAuthToken, errors: undefined };
}

export function verifyOAuthAudience(
  aud: string[],
  audience: VerifyJwtOptions['audience'],
): MachineTokenVerificationError | undefined {
  const expected = [audience].flat().filter((a): a is string => !!a);
  if (expected.length === 0 || aud.some(a => expected.includes(a))) {
    return undefined;
  }

  return new MachineTokenVerificationError({
    code: MachineTokenVerificationErrorCode.TokenVerificationFailed,
    message: `Invalid OAuth access token audience (aud) ${JSON.stringify(aud)}. Expected one of ${JSON.stringify(expected)}.`,
  });
}
