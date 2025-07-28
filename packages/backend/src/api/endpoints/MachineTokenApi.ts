import { joinPaths } from '../../util/path';
import type { ClerkBackendApiRequestOptions } from '../request';
import type { MachineToken } from '../resources/MachineToken';
import { AbstractAPI } from './AbstractApi';

const basePath = '/m2m_tokens';

type CreateMachineTokenParams = {
  machineSecret: string;
  secondsUntilExpiration?: number | null;
};

type RevokeMachineTokenParams = {
  machineSecret?: string | null;
  m2mTokenId: string;
  revocationReason?: string | null;
};

type VerifyMachineTokenParams = {
  machineSecret?: string | null;
  secret: string;
};

export class MachineTokenApi extends AbstractAPI {
  #requireMachineSecret(machineSecret?: string | null): asserts machineSecret is string {
    if (!machineSecret) {
      throw new Error('A machine secret is required.');
    }
  }

  async create(params: CreateMachineTokenParams) {
    const { machineSecret, ...bodyParams } = params;

    this.#requireMachineSecret(machineSecret);

    return this.request<MachineToken>({
      method: 'POST',
      path: basePath,
      bodyParams,
      options: {
        skipSecretKeyAuthorization: true,
      },
      headerParams: {
        Authorization: `Bearer ${machineSecret}`,
      },
    });
  }

  async revoke(params: RevokeMachineTokenParams) {
    const { m2mTokenId, machineSecret, ...bodyParams } = params;

    this.requireId(m2mTokenId);

    const requestOptions: ClerkBackendApiRequestOptions = {
      method: 'POST',
      path: joinPaths(basePath, m2mTokenId, 'revoke'),
      bodyParams,
    };

    if (machineSecret) {
      requestOptions.options = {
        skipSecretKeyAuthorization: true,
      };
      requestOptions.headerParams = {
        Authorization: `Bearer ${machineSecret}`,
      };
    }

    return this.request<MachineToken>(requestOptions);
  }

  async verifySecret(params: VerifyMachineTokenParams) {
    const { machineSecret, secret } = params;

    const requestOptions: ClerkBackendApiRequestOptions = {
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { secret },
    };

    if (machineSecret) {
      requestOptions.options = {
        skipSecretKeyAuthorization: true,
      };
      requestOptions.headerParams = {
        Authorization: `Bearer ${machineSecret}`,
      };
    }

    return this.request<MachineToken>(requestOptions);
  }
}
