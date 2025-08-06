import type { ClerkBackendApiRequestOptions } from '../../api/request';
import { joinPaths } from '../../util/path';
import type { MachineToken } from '../resources/MachineToken';
import { AbstractAPI } from './AbstractApi';

const basePath = '/m2m_tokens';

type CreateMachineTokenParams = {
  /**
   * Custom machine secret key for authentication.
   */
  machineSecretKey?: string;
  secondsUntilExpiration?: number | null;
  claims?: Record<string, unknown> | null;
};

type RevokeMachineTokenParams = {
  /**
   * Custom machine secret key for authentication.
   */
  machineSecretKey?: string;
  m2mTokenId: string;
  revocationReason?: string | null;
};

type VerifyMachineTokenParams = {
  /**
   * Custom machine secret key for authentication.
   */
  machineSecretKey?: string;
  secret: string;
};

export class MachineTokenApi extends AbstractAPI {
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

  async create(params?: CreateMachineTokenParams) {
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

    return this.request<MachineToken>(requestOptions);
  }

  async revoke(params: RevokeMachineTokenParams) {
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

    return this.request<MachineToken>(requestOptions);
  }

  async verifySecret(params: VerifyMachineTokenParams) {
    const { secret, machineSecretKey } = params;

    const requestOptions = this.#createRequestOptions(
      {
        method: 'POST',
        path: joinPaths(basePath, 'verify'),
        bodyParams: { secret },
      },
      machineSecretKey,
    );

    return this.request<MachineToken>(requestOptions);
  }
}
