import { joinPaths } from '../../util/path';
import { deprecated } from '../../util/shared';
import type { ClerkBackendApiRequestOptions } from '../request';
import type { M2MToken } from '../resources/M2MToken';
import { AbstractAPI } from './AbstractApi';

const basePath = '/m2m_tokens';

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
   * Format of the token to create.
   * - 'opaque': Opaque token with mt_ prefix
   * - 'jwt': JWT signed with instance keys
   *
   * @default 'opaque'
   */
  tokenFormat?: 'opaque' | 'jwt';
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
