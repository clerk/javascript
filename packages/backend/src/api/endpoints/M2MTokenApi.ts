import { joinPaths } from '../../util/path';
import { deprecated } from '../../util/shared';
import { MachineTokenVerificationError, MachineTokenVerificationErrorCode } from '../../errors';
import { decodeJwt } from '../../jwt/verifyJwt';
import type { JwtMachineVerifyOptions } from '../../jwt/verifyMachineJwt';
import { verifyDecodedJwtMachineToken } from '../../jwt/verifyMachineJwt';
import { isJwtFormat } from '../../tokens/machine';
import { TokenType } from '../../tokens/tokenTypes';
import type { ClerkBackendApiRequestOptions, RequestFunction } from '../request';
import { M2MToken } from '../resources/M2MToken';
import { AbstractAPI } from './AbstractApi';

const basePath = '/m2m_tokens';

/**
 * Format of the M2M token to create.
 * - 'opaque': Opaque token with mt_ prefix
 * - 'jwt': JWT signed with instance keys
 */
export type M2MTokenFormat = 'opaque' | 'jwt';

type CreateM2MTokenParams = {
  /**
   * Custom machine secret key for authentication.
   */
  machineSecretKey?: string;
  /**
   * Number of seconds until the token expires.
   *
   * @default null - Token does not expire
   */
  secondsUntilExpiration?: number | null;
  claims?: Record<string, unknown> | null;
  /**
   * @default 'opaque'
   */
  tokenFormat?: M2MTokenFormat;
};

type RevokeM2MTokenParams = {
  /**
   * Custom machine secret key for authentication.
   */
  machineSecretKey?: string;
  /**
   * Machine-to-machine token ID to revoke.
   */
  m2mTokenId: string;
  revocationReason?: string | null;
};

type VerifyM2MTokenParams = {
  /**
   * Custom machine secret key for authentication.
   */
  machineSecretKey?: string;
  /**
   * Machine-to-machine token to verify.
   */
  token: string;
};

export class M2MTokenApi extends AbstractAPI {
  #verifyOptions: JwtMachineVerifyOptions;

  constructor(request: RequestFunction, verifyOptions: JwtMachineVerifyOptions = {}) {
    super(request);
    this.#verifyOptions = verifyOptions;
  }

  #createRequestOptions(options: ClerkBackendApiRequestOptions, machineSecretKey?: string) {
    if (machineSecretKey) {
      return {
        ...options,
        headerParams: {
          ...options.headerParams,
          Authorization: `Bearer ${machineSecretKey}`,
        },
      };
    }

    return options;
  }

  async createToken(params?: CreateM2MTokenParams) {
    const { claims = null, machineSecretKey, secondsUntilExpiration = null, tokenFormat = 'opaque' } = params || {};

    const requestOptions = this.#createRequestOptions(
      {
        method: 'POST',
        path: basePath,
        bodyParams: {
          secondsUntilExpiration,
          claims,
          tokenFormat,
        },
      },
      machineSecretKey,
    );

    return this.request<M2MToken>(requestOptions);
  }

  async revokeToken(params: RevokeM2MTokenParams) {
    const { m2mTokenId, revocationReason = null, machineSecretKey } = params;

    this.requireId(m2mTokenId);

    const requestOptions = this.#createRequestOptions(
      {
        method: 'POST',
        path: joinPaths(basePath, m2mTokenId, 'revoke'),
        bodyParams: {
          revocationReason,
        },
      },
      machineSecretKey,
    );

    return this.request<M2MToken>(requestOptions);
  }

  async verify(params: VerifyM2MTokenParams) {
    const { token, machineSecretKey } = params;

    if (isJwtFormat(token)) {
      let decodedResult;
      try {
        const { data, errors } = decodeJwt(token);
        if (errors) throw errors[0];
        decodedResult = data!;
      } catch (e) {
        throw new MachineTokenVerificationError({
          code: MachineTokenVerificationErrorCode.TokenInvalid,
          message: (e as Error).message,
        });
      }

      const result = await verifyDecodedJwtMachineToken(
        token,
        decodedResult,
        this.#verifyOptions,
        TokenType.M2MToken,
        (payload, skew) => M2MToken.fromJwtPayload(payload, skew),
      );

      if (result.errors) {
        throw result.errors[0];
      }

      return result.data!;
    }

    const requestOptions = this.#createRequestOptions(
      {
        method: 'POST',
        path: joinPaths(basePath, 'verify'),
        bodyParams: { token },
      },
      machineSecretKey,
    );

    return this.request<M2MToken>(requestOptions);
  }

  /**
   * @deprecated Use `verify()` instead. This method will be removed in the next major release.
   */
  async verifyToken(params: VerifyM2MTokenParams) {
    deprecated('m2m.verifyToken()', 'Use `m2m.verify()` instead.');
    return this.verify(params);
  }
}
