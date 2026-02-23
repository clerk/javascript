import type { Jwt, JwtPayload } from '@clerk/shared/types';

import {
  MachineTokenVerificationError,
  MachineTokenVerificationErrorCode,
  TokenVerificationErrorAction,
} from '../errors';
import type { MachineTokenReturnType } from '../jwt/types';
import { verifyJwt } from '../jwt/verifyJwt';
import type { LoadClerkJWKFromRemoteOptions } from '../tokens/keys';
import { loadClerkJwkFromPem, loadClerkJWKFromRemote } from '../tokens/keys';
import type { MachineTokenType } from '../tokens/tokenTypes';

export type JwtMachineVerifyOptions = Pick<LoadClerkJWKFromRemoteOptions, 'secretKey' | 'apiUrl'> & {
  jwtKey?: string;
  clockSkewInMs?: number;
};

export async function verifyDecodedJwtMachineToken<T>(
  token: string,
  decodedResult: Jwt,
  options: JwtMachineVerifyOptions,
  tokenType: MachineTokenType,
  fromPayload: (payload: JwtPayload, clockSkewInMs?: number) => T,
  headerType?: string[],
): Promise<MachineTokenReturnType<T, MachineTokenVerificationError>> {
  const { kid } = decodedResult.header;
  let key: JsonWebKey;

  try {
    if (options.jwtKey) {
      key = loadClerkJwkFromPem({ kid, pem: options.jwtKey });
    } else if (options.secretKey) {
      key = await loadClerkJWKFromRemote({ ...options, kid });
    } else {
      return {
        data: undefined,
        tokenType,
        errors: [
          new MachineTokenVerificationError({
            action: TokenVerificationErrorAction.SetClerkJWTKey,
            message: 'Failed to resolve JWK during verification.',
            code: MachineTokenVerificationErrorCode.TokenVerificationFailed,
          }),
        ],
      };
    }

    const { data: payload, errors: verifyErrors } = await verifyJwt(token, {
      ...options,
      key,
      ...(headerType ? { headerType } : {}),
    });

    if (verifyErrors) {
      return {
        data: undefined,
        tokenType,
        errors: [
          new MachineTokenVerificationError({
            code: MachineTokenVerificationErrorCode.TokenVerificationFailed,
            message: verifyErrors[0].message,
          }),
        ],
      };
    }

    return { data: fromPayload(payload, options.clockSkewInMs), tokenType, errors: undefined };
  } catch (error) {
    return {
      data: undefined,
      tokenType,
      errors: [
        new MachineTokenVerificationError({
          code: MachineTokenVerificationErrorCode.TokenVerificationFailed,
          message: (error as Error).message,
        }),
      ],
    };
  }
}
