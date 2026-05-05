import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { MachineTokenVerificationError, MachineTokenVerificationErrorCode } from '../../errors';
import { decodeJwt } from '../../jwt/verifyJwt';
import type { JwtMachineVerifyOptions } from '../../jwt/verifyMachineJwt';
import { verifyM2MJwt } from '../../jwt/verifyMachineJwt';
import { isM2MJwt } from '../../tokens/machine';
import { joinPaths } from '../../util/path';
import type { ClerkBackendApiRequestOptions, RequestFunction } from '../request';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { M2MToken } from '../resources/M2MToken';
import { AbstractAPI } from './AbstractApi';

const basePath = '/m2m_tokens';

/**
 * Format of the M2M token to create.
 * - 'opaque': Opaque token with mt_ prefix
 * - 'jwt': JWT signed with instance keys
 */
export type M2MTokenFormat = 'opaque' | 'jwt';

type GetM2MTokenListParams = ClerkPaginationRequest<{
  /**
   * Custom machine secret key for authentication.
   */
  machineSecretKey?: string;
  /**
   * The machine ID to query machine-to-machine tokens by
   */
  subject: string;
  /**
   * Whether to include revoked machine-to-machine tokens.
   *
   * @default false
   */
  revoked?: boolean;
  /**
   * Whether to include expired machine-to-machine tokens.
   *
   * @default false
   */
  expired?: boolean;
}>;

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

  /**
   * @param verifyOptions - JWT verification options (secretKey, apiUrl, etc.).
   * Passed explicitly because BuildRequestOptions are captured inside the buildRequest closure
   * and are not accessible from the RequestFunction itself.
   */
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

  async list(queryParams: GetM2MTokenListParams) {
    const { machineSecretKey, ...params } = queryParams;

    const requestOptions = this.#createRequestOptions(
      {
        method: 'GET',
        path: basePath,
        queryParams: params,
      },
      machineSecretKey,
    );

    return this.request<PaginatedResourceResponse<M2MToken[]>>(requestOptions);
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

  async #verifyJwtFormat(token: string): Promise<M2MToken> {
    let decoded;
    try {
      const { data, errors } = decodeJwt(token);
      if (errors) {
        throw errors[0];
      }
      decoded = data;
    } catch (e) {
      throw new MachineTokenVerificationError({
        code: MachineTokenVerificationErrorCode.TokenInvalid,
        message: (e as Error).message,
      });
    }

    const result = await verifyM2MJwt(token, decoded, this.#verifyOptions);
    if (result.errors) {
      throw result.errors[0];
    }
    return result.data;
  }

  async verify(params: VerifyM2MTokenParams) {
    const { token, machineSecretKey } = params;

    if (isM2MJwt(token)) {
      return this.#verifyJwtFormat(token);
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
}
