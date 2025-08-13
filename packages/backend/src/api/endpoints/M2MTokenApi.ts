import { deprecated } from '@clerk/shared/deprecated';

import { joinPaths } from '../../util/path';
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

type VerifyM2MTokenParamsDeprecated = {
  /**
   * Custom machine secret key for authentication.
   */
  machineSecretKey?: string;
  /**
   * Machine-to-machine token secret to verify.
   */
  secret: string;
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

  async create(params?: CreateM2MTokenParams) {
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

  async revoke(params: RevokeM2MTokenParams) {
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

  /**
   * Verify a machine-to-machine token.
   *
   * @deprecated Use {@link verifyToken} instead.
   */
  async verifySecret(params: VerifyM2MTokenParamsDeprecated) {
    const { secret, machineSecretKey } = params;

    deprecated('verifySecret', 'Use `verifyToken({ token: mt_xxx })` instead');

    const requestOptions = this.#createRequestOptions(
      {
        method: 'POST',
        path: joinPaths(basePath, 'verify'),
        bodyParams: { secret },
      },
      machineSecretKey,
    );

    return this.request<M2MToken>(requestOptions);
  }

  async verifyToken(params: VerifyM2MTokenParams) {
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
}
