import { joinPaths } from '../../util/path';
import type { ClerkBackendApiRequestOptions } from '../request';
import type { MachineToken } from '../resources/MachineToken';
import { AbstractAPI } from './AbstractApi';

const basePath = '/m2m_tokens';

type WithMachineSecret<T> = T & { machineSecret?: string | null };

type CreateMachineTokenParams = WithMachineSecret<{
  claims?: Record<string, any> | null;
  secondsUntilExpiration?: number | null;
}>;

type UpdateMachineTokenParams = WithMachineSecret<
  {
    m2mTokenId: string;
    revocationReason?: string | null;
    revoked?: boolean;
  } & Pick<CreateMachineTokenParams, 'secondsUntilExpiration' | 'claims'>
>;

type RevokeMachineTokenParams = WithMachineSecret<{
  m2mTokenId: string;
  revocationReason?: string | null;
}>;

type VerifyMachineTokenParams = WithMachineSecret<{
  secret: string;
}>;

export class MachineTokensApi extends AbstractAPI {
  /**
   * Overrides the instance secret with a machine secret.
   */
  #withMachineSecretHeader(
    options: ClerkBackendApiRequestOptions,
    machineSecret?: string | null,
  ): ClerkBackendApiRequestOptions {
    if (machineSecret) {
      return {
        ...options,
        headerParams: {
          Authorization: `Bearer ${machineSecret}`,
        },
      };
    }
    return options;
  }

  async create(params: CreateMachineTokenParams) {
    const { machineSecret, ...bodyParams } = params;
    return this.request<MachineToken>(
      this.#withMachineSecretHeader(
        {
          method: 'POST',
          path: basePath,
          bodyParams,
        },
        machineSecret,
      ),
    );
  }

  async update(params: UpdateMachineTokenParams) {
    const { m2mTokenId, machineSecret, ...bodyParams } = params;
    this.requireId(m2mTokenId);
    return this.request<MachineToken>(
      this.#withMachineSecretHeader(
        {
          method: 'PATCH',
          path: joinPaths(basePath, m2mTokenId),
          bodyParams,
        },
        machineSecret,
      ),
    );
  }

  async revoke(params: RevokeMachineTokenParams) {
    const { m2mTokenId, machineSecret, ...bodyParams } = params;
    this.requireId(m2mTokenId);
    return this.request<MachineToken>(
      this.#withMachineSecretHeader(
        {
          method: 'POST',
          path: joinPaths(basePath, m2mTokenId, 'revoke'),
          bodyParams,
        },
        machineSecret,
      ),
    );
  }

  async verifySecret(params: VerifyMachineTokenParams) {
    const { secret, machineSecret } = params;
    return this.request<MachineToken>(
      this.#withMachineSecretHeader(
        {
          method: 'POST',
          path: joinPaths(basePath, 'verify'),
          bodyParams: { secret },
        },
        machineSecret,
      ),
    );
  }
}
