import { joinPaths } from '../../util/path';
import type { ClerkBackendApiRequestOptions } from '../request';
import type { MachineToken } from '../resources/MachineToken';
import { AbstractAPI } from './AbstractApi';

const basePath = '/m2m_tokens';

type CreateMachineTokenParams = {
  machineSecret: string;
  claims?: Record<string, any> | null;
  secondsUntilExpiration?: number | null;
};

type UpdateMachineTokenParams = {
  machineSecret: string;
  m2mTokenId: string;
  revocationReason?: string | null;
  revoked?: boolean;
} & Pick<CreateMachineTokenParams, 'secondsUntilExpiration' | 'claims'>;

type RevokeMachineTokenParams = {
  machineSecret?: string | null;
  m2mTokenId: string;
  revocationReason?: string | null;
};

type VerifyMachineTokenParams = {
  machineSecret?: string | null;
  secret: string;
};

export class MachineTokensApi extends AbstractAPI {
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
      headerParams: {
        Authorization: `Bearer ${machineSecret}`,
      },
    });
  }

  async update(params: UpdateMachineTokenParams) {
    const { m2mTokenId, machineSecret, ...bodyParams } = params;

    this.#requireMachineSecret(machineSecret);
    this.requireId(m2mTokenId);

    return this.request<MachineToken>({
      method: 'PATCH',
      path: joinPaths(basePath, m2mTokenId),
      bodyParams,
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
      requestOptions.headerParams = {
        Authorization: `Bearer ${machineSecret}`,
      };
    }

    return this.request<MachineToken>(requestOptions);
  }
}
