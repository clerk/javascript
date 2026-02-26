import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { joinPaths } from '../../util/path';
import { deprecated } from '../../util/shared';
import type { ClerkBackendApiRequestOptions } from '../request';
import type { M2MToken } from '../resources/M2MToken';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import { AbstractAPI } from './AbstractApi';

const basePath = '/m2m_tokens';

/**
 * Response type for M2M token list endpoint.
 * Note: The Clerk Backend API returns m2m_tokens property which is converted to data by the deserializer.
 */
type M2MTokenListResponse = {
  /**
   * Array of machine-to-machine tokens
   */
  m2m_tokens: M2MToken[];
  /**
   * The total count of M2M tokens
   */
  total_count: number;
};

type GetM2MTokenListParams = ClerkPaginationRequest<{
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

  /**
   * Retrieves a list of M2M tokens for a given machine.
   * Note: The API returns m2m_tokens which is converted to data by the deserializer.
   */
  async list(queryParams: GetM2MTokenListParams) {
    return this.request<PaginatedResourceResponse<M2MToken[]>>({
      method: 'GET',
      path: basePath,
      queryParams,
    });
  }

  async createToken(params?: CreateM2MTokenParams) {
    const { claims = null, machineSecretKey, secondsUntilExpiration = null } = params || {};

    const requestOptions = this.#createRequestOptions(
      {
        method: 'POST',
        path: basePath,
        bodyParams: {
          secondsUntilExpiration,
          claims,
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
